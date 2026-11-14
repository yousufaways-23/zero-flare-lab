#!/usr/bin/env bun
/**
 * Final source-data reconciliation (Milestone 1 gate):
 * 1. markUserConfirmed() — the user declared all uploads complete.
 * 2. runGlobalAudit() — batch reconciliation, cross-batch dedup, dataset
 *    inventory, ML eligibility pre-assessment, knowledge-graph counts.
 */
import { markUserConfirmed, runGlobalAudit } from "../../src/lib/ingest/pipeline.ts";

const c = await markUserConfirmed();
console.log("userConfirmedAllUploads:", c.userConfirmedAllUploads, "| lastBatchId:", c.lastBatchId);

const audit = await runGlobalAudit();
if (!audit.ok) {
  console.error("AUDIT BLOCKED:", audit.reason);
  process.exit(1);
}
console.log("GLOBAL AUDIT COMPLETE — report:", audit.reportPath);
