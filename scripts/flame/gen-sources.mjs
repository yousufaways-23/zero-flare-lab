#!/usr/bin/env node
/** Generates src/lib/sources-registry.ts from the master context JSON — no hand transcription. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const master = JSON.parse(readFileSync(join(here, "..", "..", "upload", "FLAME_EVIDENCE_LAB_MANUS_ULTIMATE_MASTER_CONTEXT_v4.json"), "utf8"));

const reg = master.source_registry;
const seen = new Set();
const sources = [];
function add(s, group) {
  if (!s?.url || seen.has(s.url)) return;
  seen.add(s.url);
  sources.push({
    id: s.id || `SRC-${sources.length + 1}`,
    title: s.title || s.url,
    url: s.url,
    group,
    type: s.type || "reference",
    priority: s.priority || "medium",
    use: s.use || s.description || "",
    notes: s.notes || s.version_reference || "",
  });
}
for (const s of reg.official_challenge_and_awards || []) add(s, "Challenge & Awards");
for (const s of reg.nasa_data_and_repositories || []) add(s, "Data Repositories");
for (const s of reg.nasa_combustion_and_investigations || []) add(s, "Investigations & Science");
for (const s of reg.standards_and_requirements || []) add(s, "Standards & Requirements");
for (const s of reg.lunar_and_physical_science_context || []) add(s, "Lunar & Physical Science");
const usa = reg.user_supplied_links_to_append || {};
for (const s of usa.nasa_challenge_and_brief || []) add(s, "Challenge & Awards");
for (const s of usa.psi_investigation_and_download_links || []) add(s, "PSI Investigation Records");
for (const s of usa.official_images_and_videos || []) add(s, "Facilities & Media");
for (const s of usa.other_tools_or_reference_projects || []) add(s, "Investigations & Science");
for (const s of reg.scientific_engines_and_external_tool_benchmarks || []) add(s, "Scientific Engines & Benchmarks");

const ts = `/* AUTO-GENERATED from FLAME_EVIDENCE_LAB_MANUS_ULTIMATE_MASTER_CONTEXT_v4.json — do not hand-edit.
 * ${sources.length} unique NASA/official source URLs, deduplicated. Sync status is fetched live. */
export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  group: string;
  type: string;
  priority: "critical" | "high" | "medium" | string;
  use: string;
  notes: string;
}

export const SOURCES_REGISTRY: SourceRecord[] = ${JSON.stringify(sources, null, 2)};
`;

writeFileSync(join(here, "..", "..", "src", "lib", "sources-registry.ts"), ts);
console.log(`Wrote ${sources.length} unique source URLs to src/lib/sources-registry.ts`);
