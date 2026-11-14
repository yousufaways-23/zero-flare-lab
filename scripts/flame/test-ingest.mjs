/** Direct pipeline test outside Next.js to isolate the crash. */
import { runBatch } from "../../src/lib/ingest/pipeline";
import { promises as fs } from "node:fs";

async function main() {
  const dir = "/tmp/ingest-test";
  const names = process.argv.slice(2).length
    ? process.argv.slice(2)
    : ["test-flex-notes.csv"];
  const files = [];
  for (const n of names) {
    files.push({ name: n, bytes: await fs.readFile(`${dir}/${n}`) });
  }
  const receipt = await runBatch(files);
  console.log("BATCH:", receipt.batchId);
  console.log("totals:", JSON.stringify(receipt.totals));
  for (const f of receipt.files) {
    console.log(
      `  ${f.id} ${f.name} ${f.kind} ${f.status} tables=${f.tables.length} ents=${f.entities.length} media=${f.media.length} err=${f.errors.length}`,
    );
    for (const e of f.errors) console.log("    ERR:", e);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
