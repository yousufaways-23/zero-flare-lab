/**
 * File-kind identification by extension + magic bytes, and a first-pass
 * scientific-domain guess from filename + content keywords.
 * Both are recorded as observations, never as claims about file validity.
 */
import type { FileKind, ScientificDomain } from "./types";

const EXT_MAP: Record<string, FileKind> = {
  csv: "csv",
  tsv: "tsv",
  xlsx: "xlsx",
  xlsm: "xlsx",
  xls: "xlsx",
  json: "json",
  geojson: "json",
  pdf: "pdf",
  docx: "docx",
  doc: "docx",
  pptx: "pptx",
  ppt: "pptx",
  txt: "txt",
  text: "txt",
  log: "txt",
  dat: "txt",
  tex: "txt", // LaTeX source — plain text with markup
  bib: "txt", // BibTeX bibliography — plain text
  sty: "txt", // LaTeX style files — plain text
  cls: "txt", // LaTeX document class — plain text
  mjs: "txt", // source code — plain text registration
  cjs: "txt",
  js: "txt",
  jsx: "txt",
  ts: "txt",
  tsx: "txt",
  css: "txt",
  scss: "txt",
  sh: "txt",
  py: "txt",
  yml: "txt",
  yaml: "txt",
  toml: "txt",
  prisma: "txt",
  gitignore: "txt",
  editorconfig: "txt",
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
  html: "html",
  htm: "html",
  xml: "xml",
  ipynb: "notebook",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  bmp: "image",
  tif: "image",
  tiff: "image",
  svg: "image",
  mp4: "video",
  m4v: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  webm: "video",
  zip: "archive",
};

export function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

export function kindFromName(name: string): FileKind {
  return EXT_MAP[extOf(name)] ?? "unknown";
}

/** Magic-byte sniffing to confirm or override the extension. */
export function kindFromMagic(head: Buffer, name: string): FileKind {
  const byName = kindFromName(name);
  if (head.length >= 4) {
    if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return "pdf";
    if (head[0] === 0x50 && head[1] === 0x4b) {
      // ZIP container: xlsx / pptx / docx / zip — trust the extension for OOXML
      if (byName === "xlsx" || byName === "pptx" || byName === "docx") return byName;
      return "archive";
    }
    if (head[0] === 0xd0 && head[1] === 0xcf) {
      // legacy OLE: real .doc/.ppt/.xls vs misnamed csv
      if (byName === "csv" || byName === "tsv" || byName === "txt") {
        return "unsupported"; // OLE binary we cannot parse with the current stack
      }
      return byName === "unknown" ? "unsupported" : byName;
    }
    if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image";
    if (head[0] === 0xff && head[1] === 0xd8) return "image";
    if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image";
  }
  if (head.length >= 2 && head[0] === 0x42 && head[1] === 0x4d) return "image";
  return byName;
}

const DOMAIN_KEYWORDS: [ScientificDomain, string[]][] = [
  ["combustion", ["combustion", "flame", "burning", "ignition", "extinction", "droplet", "microgravity", "oxidizer", "cold flame", "cool flame", "premixed", "diffusion flame", "pyrolysis", "soot"]],
  ["fire-safety", ["fire safety", "fire detection", "suppression", "extinguish", "fire event", "fire emergency", "flammab", "fire spread", "firefight"]],
  ["aerosol-smoke", ["smoke", "aerosol", "particle size", "particulate", "soot aggregate", "detector", "scattering", "condensation nucleus", "ionization chamber"]],
  ["materials", ["pmma", "polymer", "composite", "sample material", "tensile", "thermal degradation", "char", "material flammability"]],
  ["fluid-physics", ["reynolds", "grashof", "rayleigh", "buoyancy", "convection", "viscosity", "capillary", "marangoni", "flow field"]],
];

export function guessDomain(name: string, textSample: string): ScientificDomain {
  const hay = `${name} ${textSample}`.toLowerCase();
  let best: { d: ScientificDomain; score: number } = { d: "other", score: 0 };
  for (const [domain, kws] of DOMAIN_KEYWORDS) {
    let score = 0;
    for (const kw of kws) {
      const hits = hay.split(kw).length - 1;
      score += hits;
    }
    if (score > best.score) best = { d: domain, score };
  }
  if (best.score === 0) {
    if (["csv", "tsv", "xlsx", "json"].includes(kindFromName(name))) return "data";
    if (["pdf", "docx", "pptx", "txt", "markdown", "html", "xml", "notebook"].includes(kindFromName(name)))
      return "documentation";
    return "other";
  }
  return best.d;
}
