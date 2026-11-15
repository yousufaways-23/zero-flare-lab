/**
 * Reduced-order physics used by the Flame Lab (ported from SECOND_EVIDENCE).
 *
 * These are scaling relations, clearly labelled as such in the interface. They
 * exist to make a single point legible — that buoyant flow is a function of
 * gravity and usually swamps ventilation — not to predict a flame.
 */

const G_EARTH = 9.80665;
const L_SCALE = 0.01; // 1 cm, NASA's own scale for the density-gradient picture
const DENSITY_RATIO = 6.67; // (2300 K / 300 K) - 1, using NASA's illustrative values

/** Characteristic buoyant velocity in m/s. Goes as sqrt(g). */
export function buoyantVelocity(g: number): number {
  if (g <= 0) return 0;
  return Math.sqrt(2 * g * G_EARTH * L_SCALE * DENSITY_RATIO);
}

/** Buoyant velocity in cm/s, the unit the PSI tables use for air flow. */
export function buoyantVelocityCm(g: number): number {
  return buoyantVelocity(g) * 100;
}

/** Flame aspect ratio (height / width). 1 = spherical at zero g. */
export function flameAspect(g: number): number {
  return 1 + 3.2 * Math.sqrt(Math.max(g, 0));
}

export interface FlowRegime {
  id: "forced_flow_dominated" | "diffusion_dominated" | "mixed" | "not_classifiable";
  label: string;
  detail: string;
}

/** Buoyancy state is a property of gravity alone — distinct from the
 *  transport regime, which also depends on forced ventilation. Low gravity
 *  suppresses buoyancy; it does NOT by itself make the flow diffusion-only
 *  (spacecraft ventilation still supplies oxidizer by advection). */
export type BuoyancyState = "buoyancy_suppressed" | "buoyancy_relevant" | "unknown";

export function buoyancyState(g: number | null | undefined): BuoyancyState {
  if (g === null || g === undefined || !Number.isFinite(g) || g < 0) return "unknown";
  return g <= 0.02 ? "buoyancy_suppressed" : "buoyancy_relevant";
}

/**
 * Which transport mechanism sets the flow at the flame.
 * Requires BOTH gravity and ventilation to classify; with either missing the
 * result is honestly "not_classifiable" — never a guessed regime.
 */
export function flowRegime(g: number | null | undefined, ventilationCmS: number | null | undefined): FlowRegime {
  if (g === null || g === undefined || !Number.isFinite(g) || g < 0 ||
      ventilationCmS === null || ventilationCmS === undefined || !Number.isFinite(ventilationCmS) || ventilationCmS < 0) {
    return {
      id: "not_classifiable",
      label: "Not classifiable",
      detail:
        "Gravity or ventilation input is missing or invalid, so the transport regime cannot be classified from evidence. Provide both values to obtain a regime.",
    };
  }
  const ub = buoyantVelocityCm(g);
  if (ub * 3 < ventilationCmS) {
    return {
      id: "forced_flow_dominated",
      label: "Forced-flow-dominated",
      detail:
        "The fan outruns buoyancy: forced flow sets the residence time, and flame behaviour tracks ventilation rather than gravity. This remains true in microgravity — suppressed buoyancy does not imply a diffusion-only flame when ventilation is present.",
    };
  }
  if (ub > ventilationCmS * 3) {
    return {
      id: "diffusion_dominated",
      label: "Diffusion-limited",
      detail:
        "The buoyant plume is several times faster than the imposed flow, so advection barely changes the flame's transport and oxidizer arrival is diffusion/buoyancy-limited. (Terrestrial quiescent conditions.)",
    };
  }
  return {
    id: "mixed",
    label: "Mixed",
    detail:
      "Buoyancy and forced flow are the same order of magnitude, so both matter and neither can be neglected. This is the regime where a single-gravity flammability result transfers least reliably.",
  };
}

/** Gravity at which buoyant velocity equals the given ventilation speed. */
export function crossoverGravity(ventilationCmS: number): number {
  const u = ventilationCmS / 100;
  if (u <= 0) return 0;
  return (u * u) / (2 * G_EARTH * L_SCALE * DENSITY_RATIO);
}

/** Oxygen partial pressure in kPa. */
export function oxygenPartialPressure(o2: number, pressureKpa: number): number {
  return o2 * pressureKpa;
}

/**
 * Air properties used by the dimensionless groups. Stated here so the
 * assumptions travel with the numbers instead of hiding in the view.
 *   beta = 1/T with T = 300 K, dT = 2000 K, nu = 1.6e-5 m^2/s, Pr = 0.71
 */
export const AIR = { beta: 1 / 300, dT: 2000, nu: 1.6e-5, pr: 0.71 };

/**
 * Grashof number: natural convection strength. Scales linearly with gravity.
 * `g` is the gravity level (1 = Earth), so it is converted to m/s^2 here — the
 * Gr = g*beta*dT*L^3/nu^2 relation expects an acceleration.
 */
export function grashof(g: number, L = L_SCALE): number {
  if (g <= 0) return 0;
  return (g * G_EARTH * AIR.beta * AIR.dT * L ** 3) / AIR.nu ** 2;
}

/** Rayleigh number: Gr x Pr. */
export function rayleigh(g: number, L = L_SCALE): number {
  return grashof(g, L) * AIR.pr;
}

/**
 * Richardson number, Ri = Gr / Re^2 = g*beta*dT*L / U^2, with g in m/s^2.
 * Ri >> 1 means buoyancy dominates; Ri << 1 means the forced flow does.
 * This is the standard buoyancy-versus-inertia criterion.
 */
export function richardson(g: number, ventilationCmS: number, L = L_SCALE): number {
  if (g <= 0) return 0;
  const u = ventilationCmS / 100;
  if (u <= 0) return Infinity;
  return (g * G_EARTH * AIR.beta * AIR.dT * L) / (u * u);
}

/** Ventilation speed at which Ri = 1, in cm/s (Ri = 1 boundary). */
export function riCrossoverVelocity(g: number, L = L_SCALE): number {
  if (g <= 0) return 0;
  return Math.sqrt(g * G_EARTH * AIR.beta * AIR.dT * L) * 100;
}

/**
 * Froude number of the imposed flow, Fr = u^2 / (g L), with g in m/s^2.
 * Large Fr means the fan dominates gravity; undefined when g = 0.
 */
export function froude(ventilationCmS: number, g: number, L = L_SCALE): number | null {
  if (g <= 0) return null;
  const u = ventilationCmS / 100;
  return (u * u) / (g * G_EARTH * L);
}

export interface FlexRow {
  pressure: number;
  o2: number;
  diameter: number;
  he: number;
  fuel?: string;
}

/**
 * Normalised squared distance between a query condition and a FLEX test, using
 * only the pre-test variables. Used to show "nearest measured condition".
 */
export function nearestFlex(rows: FlexRow[], q: Partial<FlexRow>, k = 3): { row: FlexRow; d: number }[] {
  if (!rows?.length) return [];
  const ranges = {
    pressure: [300, 800],
    o2: [0.1, 0.4],
    diameter: [0.5, 3],
    he: [0, 0.4],
  };
  const dist = (r: FlexRow) => {
    const terms: number[] = [];
    if (q.pressure !== undefined) terms.push(((r.pressure - q.pressure) / (ranges.pressure[1] - ranges.pressure[0])) ** 2);
    if (q.o2 !== undefined) terms.push(((r.o2 - q.o2) / (ranges.o2[1] - ranges.o2[0])) ** 2);
    if (q.diameter !== undefined) terms.push(((r.diameter - q.diameter) / (ranges.diameter[1] - ranges.diameter[0])) ** 2);
    if (q.he !== undefined) terms.push(((r.he - q.he) / (ranges.he[1] - ranges.he[0])) ** 2);
    if (q.fuel) terms.push(/heptane/i.test(r.fuel ?? "") === /heptane/i.test(q.fuel) ? 0 : 0.35);
    return Math.sqrt(terms.reduce((s, v) => s + v, 0));
  };
  return [...rows]
    .map((r) => ({ row: r, d: dist(r) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
}
