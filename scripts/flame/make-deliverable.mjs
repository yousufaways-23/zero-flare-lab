// ZERO FLARE — deliverable ZIP staging (M13 handover).
// Stages a clean source+docs tree (NO .env*, NO .zcode-site, NO node_modules,
// NO heavy raw data) into <repo>/../zcode-tmp-deliverable/zero-flare for zipping.
// A key-scan runs after staging; the ZIP is only created if the scan is clean.
import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const STAGE = path.resolve(ROOT, "..", "zcode-tmp-deliverable");
const OUT = path.join(STAGE, "zero-flare");

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const cp = (src, dst) => cpSync(path.join(ROOT, src), path.join(OUT, dst), { recursive: true });

// source + config (NO .env* — .env.example only, variable names only)
cp("src", "src");
cp("public", "public");
cp("scripts", "scripts");
cp("docs", "docs");
cp("prisma", "prisma");
cp("models", "models");
cp("knowledge", "knowledge");
cp("tests", "tests");
for (const f of [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "eslint.config.mjs",
  "components.json",
  ".env.example",
  "README.md",
]) {
  if (existsSync(path.join(ROOT, f))) copyFileSync(path.join(ROOT, f), path.join(OUT, f));
}
// data subsets (canonical corpus + ingest manifests + ML experiments + validation JSON)
mkdirSync(path.join(OUT, "data"), { recursive: true });
for (const d of ["experiments", "ingest", "ml"]) cp(path.join("data", d), path.join("data", d));
const d2 = path.join(ROOT, "data", "validation", "d2law_validation.json");
if (existsSync(d2)) copyFileSync(d2, path.join(OUT, "data", "d2law_validation.json"));

console.log("deliverable staged at", OUT);
