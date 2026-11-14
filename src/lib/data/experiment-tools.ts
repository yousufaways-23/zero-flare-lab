// ZERO FLARE — CIR-1 experiment dataset tools (CODEX Phase 1/4).
// Query the team's cleaned experiment files with exact column resolution.
import { listExperimentDatasets, resolveExperiment, queryExperimentDataset } from "@/lib/data/experiments";

export interface ExperimentToolResult {
  experiment_id: string;
  psi_accession: string | null;
  psi_name: string | null;
  rows: number;
  columns: number;
  more_rows_in_team_package?: boolean;
}

export function listExperimentDatasetsTool(): { count: number; experiments: ExperimentToolResult[] } {
  const all = listExperimentDatasets();
  return {
    count: all.length,
    experiments: all.map((e) => ({
      experiment_id: e.experiment_id,
      psi_accession: e.psi_accession,
      psi_name: e.psi_name,
      rows: e.rows,
      columns: e.columns,
      more_rows_in_team_package: e.vs_canonical?.more_rows_in_team_package ?? undefined,
    })),
  };
}

export function resolveExperimentTool(query: string): { query: string; resolved: ExperimentToolResult[]; note: string } {
  const hits = resolveExperiment(query);
  return {
    query,
    resolved: hits.map((e) => ({
      experiment_id: e.experiment_id,
      psi_accession: e.psi_accession,
      psi_name: e.psi_name,
      rows: e.rows,
      columns: e.columns,
    })),
    note: hits.length
      ? hits.length === 1
        ? "resolved uniquely"
        : `${hits.length} candidates — disambiguate by accession (SAME vs SAME-R and FLEX vs FLEX-2 are distinct experiments)`
      : `no experiment matched "${query}" — never fabricate an experiment`,
  };
}

export {
  queryExperimentDataset,
};
