/**
 * Scenario model (ported from SECOND_EVIDENCE): the small, explicit set of
 * assumptions the Scenarios module reasons from. Gravity presets are physical
 * constants; the atmosphere is a user knob, not a claim about any real habitat.
 */

export const GRAVITY_PRESETS = [
  { id: "microgravity", label: "Microgravity", sub: "ISS / transit", g: 0 },
  { id: "lunar", label: "Lunar surface", sub: "1/6 g", g: 1 / 6 },
  { id: "mars", label: "Mars surface", sub: "0.38 g", g: 0.38 },
  { id: "earth", label: "Earth", sub: "1 g", g: 1 },
] as const;

export type GravityPresetId = (typeof GRAVITY_PRESETS)[number]["id"];

export const MATERIALS = [
  {
    id: "solid",
    label: "Fabric / polymer",
    sub: "solid surface",
    note: "BASS, BASS-II, SAFFIRE, FM²",
  },
  {
    id: "droplet",
    label: "Liquid fuel",
    sub: "isolated droplets",
    note: "FLEX, FLEX-2, CFI",
  },
  {
    id: "gas",
    label: "Gaseous fuel",
    sub: "jet or coflow",
    note: "ACME, SPICE, SLICE",
  },
] as const;

export interface ScenarioState {
  gravityId: string;
  gravity: number;
  o2: number;
  pressureKpa: number;
  ventilation: number; // cm/s
  material: string;
}

export const DEFAULT_SCENARIO: ScenarioState = {
  gravityId: "microgravity",
  gravity: 0,
  o2: 0.21,
  pressureKpa: 101.3,
  ventilation: 5, // cm/s
  material: "solid",
};

export function gravityLabel(g: number): string {
  if (g < 0.02) return "microgravity";
  if (g < 0.26) return "lunar";
  if (g < 0.65) return "reduced";
  return "terrestrial";
}

export function scenarioSummary(s: ScenarioState): string {
  return `${gravityLabel(s.gravity)} · ${(s.o2 * 100).toFixed(0)}% O₂ · ${s.pressureKpa.toFixed(
    1,
  )} kPa · ${s.ventilation.toFixed(0)} cm/s`;
}
