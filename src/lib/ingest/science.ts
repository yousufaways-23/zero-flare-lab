/**
 * Scientific extraction: entity recognition, equation/variable detection and
 * publication metadata — all evidence-backed with source snippets.
 *
 * Entity recognition is dictionary-based over the project's own curated
 * taxonomy (investigations, facilities, apparatus, sensors, materials, fuels,
 * suppressants, equations). A hit is recorded with its surrounding text so a
 * human can verify it. No probabilistic NER claims are made.
 */
import type {
  EntityMention,
  EntityType,
  EquationExtraction,
  PublicationMetadata,
} from "./types";
import { EQUATIONS } from "@/lib/science/equations";

interface DictEntry {
  id: string;
  label: string;
  type: EntityType;
  patterns: RegExp[];
}

function re(words: string[]): RegExp[] {
  return words.map((w) => new RegExp(`(^|[^A-Za-z0-9])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![A-Za-z0-9])`, "i"));
}

// ---------------------------------------------------------------------------
// Dictionary — mirrors the curated taxonomy in src/data/science and the
// master dossier's facility rules (never merge facility lineages).
// ---------------------------------------------------------------------------

const DICT: DictEntry[] = [
  // Investigations (bundled + documented gaps)
  { id: "inv-flex", label: "FLEX", type: "investigation", patterns: re(["FLEX", "Flame Extinguishment Experiment"]) },
  { id: "inv-flex2", label: "FLEX-2", type: "investigation", patterns: re(["FLEX-2", "FLEX2", "FLEX II"]) },
  { id: "inv-cfi", label: "CFI", type: "investigation", patterns: re(["CFI(?!-G)", "Cool Flame Investigation"]) },
  { id: "inv-cfig", label: "CFI-G", type: "investigation", patterns: re(["CFI-G"]) },
  { id: "inv-bass", label: "BASS", type: "investigation", patterns: re(["BASS(?!-II)", "Burning and Suppression of Solids"]) },
  { id: "inv-bass2", label: "BASS-II", type: "investigation", patterns: re(["BASS-2", "BASS-II", "BASS2"]) },
  { id: "inv-spice", label: "SPICE", type: "investigation", patterns: re(["SPICE", "Smoke Point in Co-flow Experiment"]) },
  { id: "inv-slice", label: "SLICE", type: "investigation", patterns: re(["SLICE", "Structure and Liftoff in Combustion Experiment"]) },
  { id: "inv-acme-bre", label: "ACME / BRE", type: "investigation", patterns: re(["ACME", "BRE", "Burning Rate Emulator"]) },
  { id: "inv-sflame", label: "s-Flame", type: "investigation", patterns: re(["s-Flame", "sFlame", "spherical flame"]) },
  { id: "inv-cldflame", label: "CLD-Flame", type: "investigation", patterns: re(["CLD-Flame", "CLD Flame", "Cool Flames"]) },
  { id: "inv-efield", label: "E-FIELD Flames", type: "investigation", patterns: re(["E-FIELD", "EFIELD", "electric field flame"]) },
  { id: "inv-flamedesign", label: "Flame Design", type: "investigation", patterns: re(["Flame Design"]) },
  { id: "inv-saffire", label: "SAFFIRE", type: "investigation", patterns: re(["SAFFIRE", "Spacecraft Fire Safety Demonstration", "Saffire"]) },
  { id: "inv-same", label: "SAME", type: "investigation", patterns: re(["SAME(?!-R)", "Smoke Aerosol Measurement Experiment"]) },
  { id: "inv-samer", label: "SAME-R", type: "investigation", patterns: re(["SAME-R"]) },
  { id: "inv-sofie", label: "SoFIE", type: "investigation", patterns: re(["SoFIE", "Solid Fuel Ignition and Extinction"]) },
  { id: "inv-daft", label: "DAFT", type: "investigation", patterns: re(["DAFT", "Dust and Aerosol"]) },
  { id: "inv-flare", label: "FLARE", type: "investigation", patterns: re(["FLARE"]) },
  { id: "inv-fm2", label: "FM²", type: "investigation", patterns: re(["FM2", "FM²", "Fuel and Mineral Management"]) },
  { id: "inv-fgm", label: "FGM", type: "investigation", patterns: re(["FGM", "Fiber Growth in Microgravity"]) },
  { id: "inv-merlin", label: "MERLIN", type: "investigation", patterns: re(["MERLIN"]) },

  // Facilities & platforms
  { id: "fac-iss", label: "International Space Station", type: "facility", patterns: re(["International Space Station", "ISS"]) },
  { id: "fac-cir", label: "Combustion Integrated Rack (CIR)", type: "facility", patterns: re(["Combustion Integrated Rack", "CIR"]) },
  { id: "fac-msg", label: "Microgravity Science Glovebox (MSG)", type: "facility", patterns: re(["Microgravity Science Glovebox", "MSG"]) },
  { id: "fac-mdca", label: "MDCA", type: "apparatus", patterns: re(["MDCA", "Multi-user Droplet Combustion Apparatus"]) },
  { id: "fac-cygnus", label: "Cygnus cargo vehicle", type: "facility", patterns: re(["Cygnus"]) },
  { id: "fac-kibo", label: "Kibo module", type: "facility", patterns: re(["Kibo", "JEM"]) },
  { id: "fac-destiny", label: "Destiny module", type: "facility", patterns: re(["Destiny"]) },
  { id: "fac-tiangong", label: "Tiangong space station", type: "facility", patterns: re(["Tiangong", "Chinese Space Station", "CSS"]) },
  { id: "fac-artemis", label: "Artemis program", type: "facility", patterns: re(["Artemis"]) },
  { id: "env-microgravity", label: "Microgravity environment", type: "mission-environment", patterns: re(["microgravity", "zero gravity", "zero-g", "µg", "reduced gravity"]) },
  { id: "env-lunar", label: "Lunar / Moon environment", type: "mission-environment", patterns: re(["lunar", "moon", "0\\.1667 g", "1/6 g"]) },
  { id: "env-mars", label: "Mars environment", type: "mission-environment", patterns: re(["Martian", "Mars"]) },
  { id: "env-exploration", label: "Exploration vehicle / habitat", type: "mission-environment", patterns: re(["exploration vehicle", "deep space habitat", "lunar habitat", "Mars habitat", "pressurized rover", "pressurised rover"]) },

  // Apparatus & sensors
  { id: "app-droplet-burner", label: "Droplet deployment/igniter apparatus", type: "apparatus", patterns: re(["droplet deploy", "igniter wire", "hot wire igniter", "silicon carbide fiber", "silicon carbide fibre"]) },
  { id: "sen-thermocouple", label: "Thermocouple", type: "sensor", patterns: re(["thermocouple"]) },
  { id: "sen-radiometer", label: "Radiometer", type: "sensor", patterns: re(["radiometer", "radiant flux gauge", "heat flux gauge"]) },
  { id: "sen-camera", label: "Camera imaging", type: "sensor", patterns: re(["camera", "imaging", "photodiode array", "CCD", "CMOS sensor"]) },
  { id: "sen-ir", label: "Infrared imaging", type: "sensor", patterns: re(["infrared", "IR camera", "IR imaging"]) },
  { id: "sen-o2", label: "Oxygen sensor", type: "sensor", patterns: re(["oxygen sensor", "O2 sensor", "paramagnetic oxygen", "zirconia oxygen"]) },
  { id: "sen-gasanalyzer", label: "Gas analyser", type: "sensor", patterns: re(["gas analy", "CO2 analyzer", "CO2 analyser", "NDIR"]) },
  { id: "sen-flow", label: "Flow controller / anemometer", type: "sensor", patterns: re(["flow controller", "mass flow controller", "anemometer", "hot-wire probe", "flow meter"]) },
  { id: "sen-pressure", label: "Pressure transducer", type: "sensor", patterns: re(["pressure transducer", "barometer", "pressure gauge"]) },
  { id: "sen-pmt", label: "Photomultiplier tube", type: "sensor", patterns: re(["photomultiplier", "PMT"]) },
  { id: "sen-laser", label: "Laser diagnostics", type: "sensor", patterns: re(["laser", "He-Ne", "Nd:YAG", "laser sheet", " Mie scatter"]) },
  { id: "sen-smoke-detector", label: "Smoke detector", type: "sensor", patterns: re(["smoke detector", "ionization detector", "ionisation detector", "photoelectric detector", "PARTACS"]) },
  { id: "sen-aps", label: "Aerosol particle sizer", type: "sensor", patterns: re(["particle sizer", "aerosol spectrometer", "SMPS", "APS", "condensation particle counter", "CPC"]) },
  { id: "sen-gravimetric", label: "Gravimetric sampling", type: "sensor", patterns: re(["gravimetric", "filter sample", "quartz filter", "Teflon filter"]) },

  // Materials & fuels
  { id: "mat-pmma", label: "PMMA", type: "material", patterns: re(["PMMA", "poly\\(methyl methacrylate\\)", "acrylic", "plexiglass", "Perspex"]) },
  { id: "mat-cotton", label: "Cotton fabric", type: "material", patterns: re(["cotton", "SIBAL"]) },
  { id: "mat-fiberglass", label: "Fiberglass", type: "material", patterns: re(["fiberglass", "fibreglass", "glass fibre", "glass fiber"]) },
  { id: "mat-nomex", label: "Nomex", type: "material", patterns: re(["Nomex"]) },
  { id: "mat-velcro", label: "Velcro", type: "material", patterns: re(["Velcro", "hook and loop"]) },
  { id: "mat-delrin", label: "Delrin / POM", type: "material", patterns: re(["Delrin", "POM", "polyoxymethylene"]) },
  { id: "mat-peek", label: "PEEK", type: "material", patterns: re(["PEEK", "polyetheretherketone"]) },
  { id: "fuel-ethanol", label: "Ethanol", type: "fuel", patterns: re(["ethanol", "ethyl alcohol", "C2H5OH"]) },
  { id: "fuel-methanol", label: "Methanol", type: "fuel", patterns: re(["methanol", "methyl alcohol", "CH3OH"]) },
  { id: "fuel-heptane", label: "n-Heptane", type: "fuel", patterns: re(["heptane", "C7H16"]) },
  { id: "fuel-octane", label: "n-Octane", type: "fuel", patterns: re(["octane", "C8H18"]) },
  { id: "fuel-decane", label: "n-Decane", type: "fuel", patterns: re(["decane", "C10H22"]) },
  { id: "fuel-propane", label: "Propane", type: "fuel", patterns: re(["propane", "C3H8"]) },
  { id: "fuel-methane", label: "Methane", type: "fuel", patterns: re(["methane", "CH4"]) },
  { id: "fuel-hydrogen", label: "Hydrogen", type: "fuel", patterns: re(["hydrogen", "H2 fuel"]) },
  { id: "fuel-jp", label: "JP fuel", type: "fuel", patterns: re(["JP-8", "JP-10", "jet fuel", "kerosene"]) },

  // Suppressants
  { id: "sup-co2", label: "Carbon dioxide (suppressant)", type: "suppressant", patterns: re(["carbon dioxide", "CO2 suppress", "CO2 extinguish"]) },
  { id: "sup-n2", label: "Nitrogen (diluent)", type: "suppressant", patterns: re(["nitrogen dilut", "N2 dilut"]) },
  { id: "sup-he", label: "Helium (diluent)", type: "suppressant", patterns: re(["helium"]) },
  { id: "sup-water", label: "Water mist", type: "suppressant", patterns: re(["water mist", "water spray", "fine water mist"]) },
  { id: "sup-fm200", label: "HFC-227ea / FM-200", type: "suppressant", patterns: re(["FM-200", "FM200", "HFC-227ea", "heptafluoropropane"]) },
  { id: "sup-co2-gen", label: "CO2 cartridge suppression", type: "suppressant", patterns: re(["PFE", "portable fire extinguisher", "fire extinguisher"]) },

  // Standards & protocols
  { id: "std-nasa-std", label: "NASA standard", type: "standard", patterns: re(["NASA-STD", "NASA standard"]) },
  { id: "std-iss-proc", label: "ISS emergency procedure", type: "standard", patterns: re(["emergency procedure", "contingency procedure", "INPROC", "expediter"]) },
];

// Equation name patterns from the live equations registry (44 equations).
for (const eq of EQUATIONS) {
  DICT.push({
    id: `eq-${eq.id}`,
    label: eq.name,
    type: "equation",
    patterns: re([eq.name]),
  });
}

export const DICTIONARY_SIZE = DICT.length;

// ---------------------------------------------------------------------------
// Entity recognition over page text
// ---------------------------------------------------------------------------

export function findEntities(
  pageTexts: string[],
  source: string,
): EntityMention[] {
  const mentions: EntityMention[] = [];
  const seen = new Set<string>();
  for (let p = 0; p < pageTexts.length; p++) {
    const text = pageTexts[p];
    if (!text) continue;
    const location = pageTexts.length > 1 ? `page/slide ${p + 1}` : "document body";
    for (const entry of DICT) {
      for (const pat of entry.patterns) {
        const m = pat.exec(text);
        if (m) {
          const key = `${entry.id}@${source}@${location}`;
          if (seen.has(key)) break;
          seen.add(key);
          const start = Math.max(0, m.index - 60);
          const context = text
            .slice(start, Math.min(text.length, m.index + 100))
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);
          mentions.push({
            entityId: entry.id,
            entityLabel: entry.label,
            entityType: entry.type,
            source,
            location,
            context,
            evidence: "dictionary-match",
          });
          break; // one hit per entry per page is enough
        }
      }
    }
  }
  return mentions;
}

// ---------------------------------------------------------------------------
// Equation extraction
// ---------------------------------------------------------------------------

const DOI_RE = /\b(10\.\d{4,9}\/[^\s"<>)\]]+)\b/g;

export function extractEquations(
  pageTexts: string[],
  source: string,
): EquationExtraction {
  const matchedKnown: { id: string; name: string; where: string }[] = [];
  const heuristicFormulas: { formula: string; where: string }[] = [];
  const dois = new Set<string>();
  const full = pageTexts.join("\n");

  for (const eq of EQUATIONS) {
    const pat = new RegExp(`(^|[^A-Za-z0-9])(${eq.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![A-Za-z0-9])`, "i");
    const pages = pageTexts
      .map((t, i) => (t && pat.test(t) ? i + 1 : -1))
      .filter((i) => i > 0)
      .slice(0, 5);
    if (pages.length) {
      matchedKnown.push({ id: eq.id, name: eq.name, where: `page/slide ${pages.join(", ")}` });
    }
  }

  // Heuristic formula detection: short "x = expression" lines with math chars.
  for (let p = 0; p < pageTexts.length && heuristicFormulas.length < 40; p++) {
    const lines = pageTexts[p].split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (
        line.length >= 6 &&
        line.length <= 120 &&
        /=/.test(line) &&
        !/[<>]=/.test(line) &&
        /^[\w\s().,+\-*/^·×÷√π∂∆Σ%₀-₉₀-₉=?[\]]+$/i.test(line) &&
        /\d|π|∆|Σ/.test(line)
      ) {
        heuristicFormulas.push({
          formula: line,
          where: pageTexts.length > 1 ? `page/slide ${p + 1}` : source,
        });
        if (heuristicFormulas.length >= 40) break;
      }
    }
  }

  for (const m of full.matchAll(DOI_RE)) dois.add(m[1].replace(/[.,;]$/, ""));
  const doiArr = [...dois].slice(0, 30);
  if (dois.size > 30) doiArr.push(`…and ${dois.size - 30} more (see extraction JSON)`);

  return { matchedKnown, heuristicFormulas, doiLike: doiArr };
}

// ---------------------------------------------------------------------------
// Publication metadata — only what a pattern actually found.
// ---------------------------------------------------------------------------

export function extractPublicationMeta(
  pageTexts: string[],
  source: string,
  htmlTitle?: string,
): PublicationMetadata {
  const full = pageTexts.join("\n");
  const noteParts: string[] = [];

  let title: string | undefined;
  let titleConfidence: "high" | "medium" = "medium";
  if (htmlTitle) {
    title = htmlTitle.trim().slice(0, 200);
    titleConfidence = "high";
  } else {
    const firstLines = full.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const candidate = firstLines.find((l) => l.length >= 12 && l.length <= 200 && !/^(abstract|introduction|table of contents)/i.test(l));
    if (candidate) {
      title = candidate.slice(0, 200);
      titleConfidence = "medium";
      noteParts.push("title taken from the first substantial line of the text layer (medium confidence)");
    } else {
      noteParts.push("no title pattern found — none recorded");
    }
  }

  const years = [...new Set([...full.matchAll(/\b(19[6-9]\d|20[0-2]\d)\b/g)].map((m) => Number(m[1])))].sort();

  const doiMatch = full.match(DOI_RE);
  if (!doiMatch) noteParts.push("no DOI pattern found");

  let authorPattern: string | undefined;
  let authorConfidence: "low" | "medium" = "low";
  const etAl = full.match(/([A-Z][a-zA-Z'-]+),?\s+(?:[A-Z]\.\s*){1,3}(?:,\s*(?:[A-Z][a-zA-Z'-]+),?\s+(?:[A-Z]\.\s*){1,3})*\s*(?:and|&)\s*[A-Z][a-zA-Z'-]+/);
  if (etAl) {
    authorPattern = etAl[0].slice(0, 160);
    authorConfidence = "medium";
  } else {
    const etAlSimple = full.match(/[A-Z][a-zA-Z'-]+\s+et\s+al\./);
    if (etAlSimple) {
      authorPattern = `${etAlSimple[0]} (first author + et al.)`;
      authorConfidence = "low";
    }
  }
  if (!authorPattern) noteParts.push("no clear author pattern — authors not recorded rather than guessed");

  let referencesCount: number | undefined;
  const refSection = full.match(/references\s*([\s\S]{50,6000})$/i);
  if (refSection) {
    const numbered = [...refSection[1].matchAll(/^\s*\[\d+\]/gm)].length;
    if (numbered >= 2) referencesCount = numbered;
  }
  if (referencesCount == null) noteParts.push("no numbered references section detected");

  return {
    title,
    titleConfidence,
    doi: doiMatch ? doiMatch[0].replace(/[.,;]$/, "") : undefined,
    years,
    authorPattern,
    authorConfidence,
    referencesCount,
    note: noteParts.join("; ") || "patterns found: title, DOI, authors, references (see fields)",
  };
}
