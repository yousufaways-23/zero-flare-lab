// Foreground reproduction test: parse the suspect engineering-report PDF with
// the REAL pdf-parse v2 API, logging memory at each stage.
import { readFileSync } from "node:fs";

const pdfPath = process.argv[2];
const bytes = readFileSync(pdfPath);
console.log(`file: ${pdfPath} (${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
const rss = () => `${(process.memoryUsage.rss() / 1024 / 1024).toFixed(0)} MB RSS`;
console.log("start:", rss());

const { PDFParse } = await import("pdf-parse");
const parser = new PDFParse({ data: new Uint8Array(bytes) });
console.log("constructed:", rss());

const t0 = Date.now();
const text = await parser.getText();
console.log(`getText: ${text.total} pages, ${text.text.length} chars, ${((Date.now() - t0) / 1000).toFixed(1)} s — ${rss()}`);

const t1 = Date.now();
let tableCount = 0;
try {
  const tables = await parser.getTable({ first: 20 });
  for (const p of tables.pages) tableCount += p.tables.length;
  console.log(`getTable(first:20): ${tableCount} tables, ${((Date.now() - t1) / 1000).toFixed(1)} s — ${rss()}`);
} catch (e) {
  console.log("getTable FAILED:", e instanceof Error ? e.message : e);
}

const t2 = Date.now();
let imgCount = 0;
try {
  const images = await parser.getImage({ first: 15, imageThreshold: 100, imageDataUrl: false, imageBuffer: true });
  for (const p of images.pages) imgCount += p.images.length;
  console.log(`getImage(first:15): ${imgCount} images, ${((Date.now() - t2) / 1000).toFixed(1)} s — ${rss()}`);
} catch (e) {
  console.log("getImage FAILED:", e instanceof Error ? e.message : e);
}

await parser.destroy().catch(() => undefined);
globalThis.gc?.();
console.log("after destroy:", rss());
