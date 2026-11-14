# AI AGENT AND RAG REPORT — ZERO FLARE (M12)

## CIR-1 — identity and contract

CIR-1 (named for the Combustion Integrated Rack) is the platform's research copilot: a persistent floating dock on every view, resizable drawer, context indicator, streaming of tool traces, citations, limitations, suggested follow-ups, optional browser-TTS voice with disclosure.

## Agent loop (implemented)

1. intent classification — small talk answers naturally with NO tools (verified behaviour);
2. typed tool plan from the 26-tool catalogue (bounded: ≤4 calls/round, ≤6/turn, 2 rounds with self-correction on failed args);
3. deterministic execution — tools compute/query, the LLM never measures;
4. grounded summarization — reply restricted to tool outputs; provenance cited inline; refusals explained; residual protocol fences stripped;
5. context awareness — current view, environment (gravity/atmosphere seed), investigation + tab, facility screening state, equipment, scenario pillar injected server-side per request.

## Tool namespaces (26 tools)

- **evidence**: search_evidence (BM25), list/get_investigation, get_table_schema, list_tables, query_dataset, eda_statistics, search_variables, get_findings, get_graph, get_atmospheres, get_equipment, search_media, get_source_registry
- **science**: search_equations, calculate_equation, run_flex_model, run_cfig_model, model_validation_metrics, get_model_registry, analyze_fire_safety_scenario (NEW — deterministic facility engine with live context seeding), compare_comparability_gate (NEW)
- **external**: search_external_literature (NTRS live), check_gap_externally, probe_psi_data, get_external_integrations
- **ui/workspace**: navigate, save_session, save_gap, compare_investigations, generate_chart

Classifications: deterministic tools never produce unverifiable claims; networked tools have timeouts + honest failure taxonomy; state-changing actions return explicit UI-action payloads.

## Retrieval (RAG) status

- **Implemented**: BM25 lexical retrieval (stemmed) over investigation metadata, findings, gaps and tables with snippet + source links; relevance floor with abstention; investigation-aware search.
- **Honest absence**: dense/hybrid retrieval NOT configured (no embedding credentials/eval set in this environment) — labelled in-product; Second's 317-document knowledge index is ported as a reference artifact for the future vector layer. Start-with-baseline policy: dense retrieval adopted only if held-out evaluation (P@K/R@K/nDCG) proves improvement.

## External-source boundary

NTRS results are labelled external leads — never mixed with corpus evidence; a network failure is reported as unavailable (never "no evidence"); PSI probes distinguish inaccessible from not-indexed; domain allowlist + timeouts + no fabricated results.

## Verification performed (this environment)

- LLM provider unconfigured in sandbox → degradation path verified (honest deterministic notice; no fabricated answer) — the exact behaviour the honesty contract requires.
- Deterministic tool layer verified directly: comparability gate verdicts, facility engine, physics relations, 68/68 equation tests (see /api/selftest).
- E2E: dock opens, CIR-1 identity renders, context flows.
