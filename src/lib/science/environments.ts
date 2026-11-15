/**
 * ZERO FLARE — canonical mission-environment registry (research doc §4.7).
 *
 * SINGLE SOURCE OF TRUTH for environment profiles consumed by the scenario
 * engine (core.ts), CIR-1 prompts, the UI atmosphere readouts and tests.
 *
 * The former ambiguity — one "Mars atmosphere" label covering different
 * pressures in different surfaces — is resolved by explicit environmentKind:
 *   ambient               the planet itself (NASA measured reference)
 *   pressurized_habitat   design assumption for a crewed surface habitat
 *   pressurized_rover     design assumption for a pressurized rover cabin
 *
 * A value chosen for a pressurized habitat must never be presented as "the
 * Mars atmosphere". Legacy ids map to their historical profiles below.
 */

export type EnvironmentKind = "ambient" | "pressurized_habitat" | "pressurized_rover" | "orbital" | "suit";
export type SourceType = "measured_reference" | "standard_reference" | "design_assumption";

export interface EnvironmentProfile {
  id: string;
  label: string;
  environmentKind: EnvironmentKind;
  gravityG: number;
  /** Total ABSOLUTE pressure in kPa (null when not applicable). */
  totalPressureKpa: number | null;
  /** O2 mole fraction in the breathable mixture (null for ambient Mars CO2). */
  oxygenMoleFraction: number | null;
  stationType: string;
  sourceType: SourceType;
  assumptions: string[];
  version: string;
}

export const MISSION_ENVIRONMENTS: Record<string, EnvironmentProfile> = {
  earth: {
    id: "earth",
    label: "Earth reference",
    environmentKind: "ambient",
    gravityG: 1.0,
    totalPressureKpa: 101.3,
    oxygenMoleFraction: 0.21,
    stationType: "spacecraft-cabin",
    sourceType: "measured_reference",
    assumptions: ["Sea-level standard atmosphere; absolute pressure."],
    version: "2026-11-15",
  },
  iss: {
    id: "iss",
    label: "ISS (CIR/ACME era)",
    environmentKind: "orbital",
    gravityG: 1e-6,
    totalPressureKpa: 101.3,
    oxygenMoleFraction: 0.21,
    stationType: "iss-module",
    sourceType: "measured_reference",
    assumptions: [
      "14.7 psi cabin, 21% O2, N2 79% — the atmosphere the PSI combustion experiments actually operated in.",
      "Microgravity residual-g jitter is neglected for regime classification.",
    ],
    version: "2026-11-15",
  },
  moon_habitat: {
    id: "moon_habitat",
    label: "Lunar habitat (concept)",
    environmentKind: "pressurized_habitat",
    gravityG: 0.166,
    totalPressureKpa: 70.3,
    oxygenMoleFraction: 0.3,
    stationType: "lunar-habitat",
    sourceType: "design_assumption",
    assumptions: [
      "Challenge-brief concept: 10.2 psi total, 30% O2 (pO2 ≈ 21.1 kPa).",
      "NO validated partial-gravity combustion data exists at 0.166 g — every scenario output is decision-support, not prediction.",
    ],
    version: "2026-11-15",
  },
  mars_ambient: {
    id: "mars_ambient",
    label: "Mars ambient (NASA measured reference)",
    environmentKind: "ambient",
    gravityG: 0.376,
    totalPressureKpa: 0.6,
    oxygenMoleFraction: null,
    stationType: "planetary-surface",
    sourceType: "measured_reference",
    assumptions: [
      "~6 mbar CO2-dominated atmosphere (NASA Pathfinder/ Curiosity measured range 6.0–7.0 mbar); not breathable and not a habitat condition.",
      "O2 mole fraction is ~0.13% — recorded as null here because it cannot sustain the combustion scenarios in this platform.",
    ],
    version: "2026-11-15",
  },
  mars_habitat: {
    id: "mars_habitat",
    label: "Mars habitat (concept — pressurized, Earth-like interior)",
    environmentKind: "pressurized_habitat",
    gravityG: 0.38,
    totalPressureKpa: 101.3,
    oxygenMoleFraction: 0.21,
    stationType: "mars-habitat",
    sourceType: "design_assumption",
    assumptions: [
      "Design assumption only: 14.7 psi Earth-like interior at 0.38 g — NOT the Mars atmosphere.",
      "Concept-study default with no fixed NASA standard; no validated partial-g combustion data exists.",
    ],
    version: "2026-11-15",
  },
  mars_rover: {
    id: "mars_rover",
    label: "Mars pressurized rover (concept)",
    environmentKind: "pressurized_rover",
    gravityG: 0.38,
    totalPressureKpa: 70.3,
    oxygenMoleFraction: 0.21,
    stationType: "pressurized-rover",
    sourceType: "design_assumption",
    assumptions: [
      "Design assumption only: 10.2 psi / 21% O2 cabin at 0.38 g — NOT the Mars atmosphere.",
      "Lower total pressure lowers pO2 (≈14.8 kPa) relative to the habitat assumption; scenarios must state which profile they use.",
    ],
    version: "2026-11-15",
  },
  spacecraft: {
    id: "spacecraft",
    label: "Spacecraft cabin (concept)",
    environmentKind: "orbital",
    gravityG: 0.0,
    totalPressureKpa: 101.3,
    oxygenMoleFraction: 0.21,
    stationType: "spacecraft-cabin",
    sourceType: "design_assumption",
    assumptions: ["Free-flyer post-ISS-departure concept (SAFFIRE flew here); sea-level cabin mix."],
    version: "2026-11-15",
  },
  spacesuit: {
    id: "spacesuit",
    label: "Spacesuit (concept)",
    environmentKind: "suit",
    gravityG: 0.0,
    totalPressureKpa: 29.6,
    oxygenMoleFraction: 1.0,
    stationType: "spacecraft-cabin",
    sourceType: "design_assumption",
    assumptions: ["4.3 psi pure O2 suit loop; outside all model applicability domains in this platform."],
    version: "2026-11-15",
  },
};

/** Legacy id → canonical profile (keeps old callers stable). */
export const LEGACY_ENV_MAP: Record<string, string> = {
  earth: "earth",
  iss: "iss",
  moon: "moon_habitat",
  mars: "mars_rover", // historical copilot seed used 70.3 kPa / pressurized rover
  spacecraft: "spacecraft",
  spacesuit: "spacesuit",
};

export function getEnvironmentProfile(id: string | null | undefined): EnvironmentProfile | null {
  if (!id) return null;
  const canonical = LEGACY_ENV_MAP[id] ?? id;
  return MISSION_ENVIRONMENTS[canonical] ?? null;
}
