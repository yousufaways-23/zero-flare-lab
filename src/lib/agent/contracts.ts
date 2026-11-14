// ZERO FLARE — Agent API contracts (CODEX Phase 2).
// Zod schemas for every cross-boundary payload: request, response, tool args,
// dataset query results, comparison, evidence, warnings, navigation, errors.
// Request-scoped context replaces module-global state (isolation guarantee).

import { z } from "zod";

/** Client context sent with each copilot request — validated, then passed
 *  immutably into the agent run (never stored on a module). */
export const CopilotContextSchema = z.object({
  view: z.string().max(40).optional(),
  environment: z.string().max(20).optional(),
  environmentLabel: z.string().max(80).optional(),
  investigation: z.string().max(16).optional(),
  investigationTab: z.string().max(20).optional(),
  selection: z.string().max(200).optional(),
  role: z.enum(["fire-safety"]).optional(),
  equipment: z.string().max(120).optional(),
  scenarioPillar: z.string().max(20).optional(),
  facility: z
    .object({
      name: z.string().max(120),
      layoutImageAttached: z.boolean().optional(),
      compartments: z
        .array(
          z.object({
            name: z.string().max(80),
            areaM2: z.number(),
            heightM: z.number(),
            volumeM3: z.number(),
            materials: z.array(z.string().max(40)).max(8),
            ignitionSources: z.number(),
            ventilation: z.string().max(20),
            detection: z.string().max(20),
            screeningScore: z.number().optional(),
          }),
        )
        .max(12)
        .optional(),
      screeningScores: z
        .array(z.object({ name: z.string().max(80), score: z.number(), label: z.string().max(20) }))
        .max(12)
        .optional(),
    })
    .optional(),
});
export type CopilotContext = z.infer<typeof CopilotContextSchema>;

export const ChatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(6000),
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;

export const CopilotRequestSchema = z.object({
  messages: z.array(ChatTurnSchema).min(1).max(12),
  context: CopilotContextSchema.optional(),
});
export type CopilotRequest = z.infer<typeof CopilotRequestSchema>;

export const CitationSchema = z.object({
  source: z.string().max(300),
  location: z.string().max(80).optional(),
  url: z.string().max(400).optional(),
  type: z.string().max(40).optional(),
});

export const ToolTraceSchema = z.object({
  name: z.string().max(60),
  args: z.record(z.string(), z.unknown()).optional(),
  summary: z.string().max(2000),
  provenance: z.string().max(600).optional(),
  ok: z.boolean(),
});

export const ChartSpecSchema = z.object({
  title: z.string().max(200),
  subtitle: z.string().max(300).optional(),
  xLabel: z.string().max(120).optional(),
  yLabel: z.string().max(120).optional(),
  points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().max(80).optional(), group: z.string().max(40).optional() })).max(500).optional(),
  series: z.array(z.object({ name: z.string().max(80), points: z.array(z.object({ x: z.number(), y: z.number() })).max(500), color: z.string().max(20).optional() })).max(6).optional(),
  histogram: z.object({ binStart: z.array(z.number()), binEnd: z.array(z.number()), counts: z.array(z.number()), label: z.string().max(80).optional() }).optional(),
  source: z.string().max(300),
});

export const CopilotResponseSchema = z.object({
  reply: z.string(),
  toolTrace: z.array(ToolTraceSchema),
  charts: z.array(ChartSpecSchema),
  uiActions: z.array(z.object({ action: z.string().max(40) }).passthrough()),
  sources: z.array(z.string().max(400)),
  mode: z.enum(["natural", "tool-driven"]),
  llm: z.enum(["live", "unavailable"]),
});
export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;

/** Navigation actions must be click-confirmed (Phase 8): the agent returns the
 *  intent; the UI renders a button; navigation happens only on click. */
export const NavigationActionSchema = z.object({
  action: z.literal("navigate"),
  view: z.enum(["mission", "investigations", "compare", "scenarios", "lab3d", "data-sources", "my-work", "tools"]),
  investigation: z.string().regex(/^PSI-\d+$/i).optional(),
  investigationTab: z.string().max(20).optional(),
  environment: z.string().max(20).optional(),
});
export type NavigationAction = z.infer<typeof NavigationActionSchema>;

/** Dataset query contract (Phase 1 layer, exposed to tools + /api/experiments). */
export const DatasetFilterSchema = z.object({
  column: z.string().min(1).max(120),
  op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "contains"]),
  value: z.string().max(200),
});

export const DatasetQuerySchema = z.object({
  experimentId: z.string().min(3).max(40),
  columns: z.array(z.string().max(120)).max(20).optional(),
  filters: z.array(DatasetFilterSchema).max(8).optional(),
  statsColumns: z.array(z.string().max(120)).max(10).optional(),
  groupBy: z.string().max(240).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export type DatasetQueryRequest = z.infer<typeof DatasetQuerySchema>;

/** Scenario context — request-scoped replacement for the former module-global
 *  setScenarioToolContext (Phase 2 isolation requirement). */
export const ScenarioContextSchema = z.object({
  stationType: z.string().max(40).optional(),
  gravity: z.number().min(0).max(2).optional(),
  o2: z.number().min(0).max(1).optional(),
  pressureKpa: z.number().min(10).max(200).optional(),
  ventilationCmS: z.number().min(0).max(100).optional(),
  compartments: z
    .array(
      z.object({
        id: z.string().max(40),
        name: z.string().max(80),
        lengthM: z.number(),
        widthM: z.number(),
        heightM: z.number(),
        materials: z.array(z.string().max(40)),
        ventilationCmS: z.number(),
        ignitionSources: z.array(z.string().max(40)),
        detection: z.array(z.string().max(40)),
        suppression: z.array(z.string().max(40)),
      }),
    )
    .max(12)
    .optional(),
});
export type ScenarioContextInput = z.infer<typeof ScenarioContextSchema>;
