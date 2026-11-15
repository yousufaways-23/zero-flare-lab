// FLAME EVIDENCE LAB — verified equation registry
// Every equation: id, category, statement, variables with units, assumptions,
// deterministic calculator, reference test cases, and a source citation.
// Registry count is generated from this file (spec R002: no README-count claims).

export type UnitDimension = "pressure" | "temperature" | "length" | "time" | "mass" | "dimensionless" | "energy" | "power" | "flux" | "velocity" | "density" | "fraction" | "count" | "viscosity" | "conductivity" | "heat_transfer_coeff" | "thermal_inertia" | "specific_heat" | "specific_energy" | "molar_energy" | "acceleration" | "area" | "thermal_effusivity";

export interface EquationVariable {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  dimension: UnitDimension;
  required?: true;
  min?: number;
  max?: number;
}

export interface EquationTestCase {
  name: string;
  inputs: Record<string, number>;
  expect: number;
  tolerance: number; // relative
}

export interface Equation {
  id: string;
  name: string;
  category: EquationCategory;
  statement: string; // LaTeX-like
  /** Proper LaTeX typeset form rendered with KaTeX. Display-only: the raw
   *  `statement` stays untouched (search, agent tools, saved items), and the
   *  typeset form must preserve the exact same mathematics. */
  latex: string;
  summary: string;
  variables: EquationVariable[];
  assumptions: string[];
  calculate: (inputs: Record<string, number>) => number;
  outputUnit: string;
  outputLabel: string;
  source: string;
  tests: EquationTestCase[];
  status: "verified" | "candidate" | "deprecated";
  /** Layered validation state — passing a unit test is NOT scientific validity
   *  (research doc §4.2). status above is DERIVED from this, never asserted. */
  validation: EquationValidation;
}

export interface EquationValidation {
  implementation: "implemented" | "missing";
  unitTests: "passed" | "failed" | "not_run";
  referenceCheck: "passed" | "partial" | "not_available";
  domainReview: "reviewed" | "pending";
  empiricalValidation: "validated" | "not_validated" | "not_applicable";
}

export type EquationCategory =
  | "gas-and-mixture-laws"
  | "stoichiometry-and-equivalence"
  | "combustion-chemistry-and-kinetics"
  | "heat-transfer"
  | "ignition-and-pyrolysis"
  | "flame-spread-and-propagation"
  | "droplet-combustion-and-extinction"
  | "aerosol-and-particle-science"
  | "sensor-response-and-statistics"
  | "cfd-governing-numbers"
  | "uncertainty-and-sampling"
  | "doe-sensitivity-and-ml";

export const EQUATION_CATEGORIES: { id: EquationCategory; label: string }[] = [
  { id: "gas-and-mixture-laws", label: "Gas and mixture laws" },
  { id: "stoichiometry-and-equivalence", label: "Stoichiometry and equivalence ratio" },
  { id: "combustion-chemistry-and-kinetics", label: "Combustion chemistry and kinetics" },
  { id: "heat-transfer", label: "Heat transfer" },
  { id: "ignition-and-pyrolysis", label: "Ignition and pyrolysis" },
  { id: "flame-spread-and-propagation", label: "Flame spread and propagation" },
  { id: "droplet-combustion-and-extinction", label: "Droplet combustion and extinction" },
  { id: "aerosol-and-particle-science", label: "Aerosol and particle science" },
  { id: "sensor-response-and-statistics", label: "Sensor response and statistics" },
  { id: "cfd-governing-numbers", label: "CFD governing numbers" },
  { id: "uncertainty-and-sampling", label: "Uncertainty and sampling" },
  { id: "doe-sensitivity-and-ml", label: "DOE, sensitivity and ML metrics" },
];

const R_UNIVERSAL = 8.314462618; // J/(mol·K), CODATA
const SIGMA_SB = 5.670374419e-8; // W/(m²·K⁴), CODATA

// Sourced fuel/gas property table (rounded standard reference values).
// Source: NIST Chemistry WebBook (webbook.nist.gov) and standard combustion
// references (Turns, An Introduction to Combustion). Values are widely
// published; rounded for engineering calculation.
export interface FuelProperties {
  id: string;
  name: string;
  formula: string;
  mw: number; // g/mol
  lhvKJPerKg: number;
  hvapKJPerKg: number;
  stoichO2PerMolFuel: number; // x + y/4 for CxHy
  stoichO2PerKgFuel: number; // kg O2 per kg fuel
  tBoilK: number;
  source: string;
}

export const FUEL_PROPERTIES: FuelProperties[] = [
  { id: "methane", name: "Methane", formula: "CH4", mw: 16.04, lhvKJPerKg: 50000, hvapKJPerKg: 510, stoichO2PerMolFuel: 2.0, stoichO2PerKgFuel: 3.99, tBoilK: 111.7, source: "NIST WebBook / Turns App." },
  { id: "ethane", name: "Ethane", formula: "C2H6", mw: 30.07, lhvKJPerKg: 47480, hvapKJPerKg: 490, stoichO2PerMolFuel: 3.5, stoichO2PerKgFuel: 3.72, tBoilK: 184.6, source: "NIST WebBook" },
  { id: "propane", name: "Propane", formula: "C3H8", mw: 44.10, lhvKJPerKg: 46350, hvapKJPerKg: 426, stoichO2PerMolFuel: 5.0, stoichO2PerKgFuel: 3.63, tBoilK: 231.0, source: "NIST WebBook" },
  { id: "butane", name: "Butane", formula: "C4H10", mw: 58.12, lhvKJPerKg: 45750, hvapKJPerKg: 386, stoichO2PerMolFuel: 6.5, stoichO2PerKgFuel: 3.58, tBoilK: 272.7, source: "NIST WebBook" },
  { id: "ethylene", name: "Ethylene", formula: "C2H4", mw: 28.05, lhvKJPerKg: 47200, hvapKJPerKg: 481, stoichO2PerMolFuel: 3.0, stoichO2PerKgFuel: 3.43, tBoilK: 169.4, source: "NIST WebBook" },
  { id: "propylene", name: "Propylene", formula: "C3H6", mw: 42.08, lhvKJPerKg: 45800, hvapKJPerKg: 438, stoichO2PerMolFuel: 4.5, stoichO2PerKgFuel: 3.43, tBoilK: 225.5, source: "NIST WebBook" },
  { id: "methanol", name: "Methanol (liquid)", formula: "CH3OH", mw: 32.04, lhvKJPerKg: 19930, hvapKJPerKg: 1100, stoichO2PerMolFuel: 1.5, stoichO2PerKgFuel: 1.50, tBoilK: 337.9, source: "NIST WebBook / FLEX fuels" },
  { id: "ethanol", name: "Ethanol (liquid)", formula: "C2H5OH", mw: 46.07, lhvKJPerKg: 26700, hvapKJPerKg: 846, stoichO2PerMolFuel: 3.0, stoichO2PerKgFuel: 2.08, tBoilK: 351.5, source: "NIST WebBook" },
  { id: "heptane", name: "n-Heptane (liquid)", formula: "C7H16", mw: 100.20, lhvKJPerKg: 44000, hvapKJPerKg: 316, stoichO2PerMolFuel: 11.0, stoichO2PerKgFuel: 3.52, tBoilK: 371.6, source: "NIST WebBook / FLEX fuels" },
];

const srcTextbook = {
  thermo: "Moran/Shapiro, Fundamentals of Engineering Thermodynamics (ideal-gas relations)",
  turns: "Turns, An Introduction to Combustion, 3rd ed.",
  incropera: "Incropera et al., Fundamentals of Heat and Mass Transfer (standard correlations)",
  drysdale: "Drysdale, An Introduction to Fire Dynamics, 3rd ed.",
  hersh: "Hinds, Aerosol Technology (Cunningham correction, lognormal moments)",
  nist: "NIST/SEMATECH e-Handbook of Statistical Methods (sampling, uncertainty)",
  elementsStats: "standard statistics (large-sample normal approximation)",
};

/**
 * KaTeX typeset forms, one per equation id. Display-only — none of these
 * alter the equations, the calculators or the reference tests. Any id
 * without an entry falls back to the raw statement string.
 */
const LATEX_OVERRIDES: Record<string, string> = {
  "ideal-gas-law": "P\\,V = n\\,R\\,T",
  "partial-pressure": "p_i = x_i \\, P",
  "p-o2-kpa": "p_{\\mathrm{O_2}} = x_{\\mathrm{O_2}} \\, P_{\\mathrm{total}}",
  "mean-molecular-weight": "\\bar{M} = \\textstyle\\sum_i x_i \\, M_i",
  "gas-density": "\\rho = \\dfrac{P \\cdot M}{R \\cdot T}",
  "mass-fraction-from-mole": "w_i = \\dfrac{x_i \\, M_i}{\\sum_j x_j \\, M_j}",
  "ppm-to-mole-fraction": "x = \\mathrm{ppm} \\times 10^{-6}",
  "stoich-o2-hydrocarbon": "\\mathrm{C}_x\\mathrm{H}_y + \\left(x + \\tfrac{y}{4}\\right)\\,\\mathrm{O_2} \\;\\rightarrow\\; x\\,\\mathrm{CO_2} + \\tfrac{y}{2}\\,\\mathrm{H_2O}",
  "equivalence-ratio": "\\phi = \\dfrac{(F/A)_{\\mathrm{actual}}}{(F/A)_{\\mathrm{stoichiometric}}}",
  "stoich-fa-mass": "(F/A)_{\\mathrm{st}} = \\dfrac{M_{\\mathrm{fuel}}}{\\nu_{\\mathrm{O_2}}\\cdot 32 + \\nu_{\\mathrm{O_2}}\\cdot\\tfrac{79}{21}\\cdot 28.01}",
  "le-chatelier-lfl": "\\dfrac{1}{\\mathrm{LFL}_{\\mathrm{mix}}} = \\sum_i \\dfrac{x_i}{\\mathrm{LFL}_i}",
  "arrhenius-rate": "k = A \\, \\exp\\!\\left(-\\dfrac{E_a}{R\\,T}\\right)",
  "heat-release-rate": "\\dot{Q} = \\dot{m} \\, \\Delta H_c",
  "adiabatic-temp-estimate": "\\Delta T_{\\mathrm{ad}} \\approx \\dfrac{w_f \\, \\Delta H_c}{\\bar{c}_p}",
  "fourier-conduction": "q = \\dfrac{k \\, A \\, \\Delta T}{L}",
  "newton-convection": "q = h \\, A \\, (T_s - T_{\\infty})",
  "stefan-boltzmann": "q = \\varepsilon \\, \\sigma \\, A \\, \\left(T_s^4 - T_{\\mathrm{sur}}^4\\right)",
  "rayleigh-number": "\\mathrm{Ra} = \\dfrac{g \\, \\beta \\, \\Delta T \\, L^3}{\\nu \\, \\alpha}",
  "grashof-number": "\\mathrm{Gr} = \\dfrac{g \\, \\beta \\, \\Delta T \\, L^3}{\\nu^2}",
  "nusselt-natural-conv": "\\mathrm{Nu} = 0.59 \\, \\mathrm{Ra}^{1/4} \\quad (10^4 \\le \\mathrm{Ra} \\le 10^7)",
  "prandtl-number": "\\mathrm{Pr} = \\dfrac{\\nu}{\\alpha}",
  "biot-number": "\\mathrm{Bi} = \\dfrac{h \\, L_c}{k_s}",
  "fourier-number": "\\mathrm{Fo} = \\dfrac{\\alpha \\, t}{L^2}",
  "thermal-inertia": "k \\, \\rho \\, c \\quad \\left[\\mathrm{W^2\\,s/(m^4\\,K^2)}\\right]",
  "ignition-time-thick": "t_{\\mathrm{ig}} = \\dfrac{\\pi}{4} \\, k \\rho c \\, \\dfrac{(T_{\\mathrm{ig}} - T_{\\infty})^2}{\\dot{q}^{\\prime\\prime\\,2}}",
  "critical-heat-flux": "\\dot{q}^{\\prime\\prime}_{\\mathrm{crit}} \\approx h_c \\, (T_{\\mathrm{ig}} - T_{\\infty}) + \\varepsilon \\, \\sigma \\, (T_{\\mathrm{ig}}^4 - T_{\\infty}^4)",
  "froude-number": "\\mathrm{Fr} = \\dfrac{U^2}{g \\, L}",
  "froude-spread-scaling": "V^{*} = \\dfrac{V}{\\sqrt{g \\, L}}",
  "buoyant-velocity-scale": "U_b \\sim \\sqrt{g \\, L}",
  "d2-law": "d^2(t) = d_0^2 - K \\, t",
  "burning-rate-constant": "K = \\dfrac{d_0^2 - d_e^2}{t_b}",
  "spalding-b-number": "B = \\dfrac{\\left(Y_{\\mathrm{O_2},\\infty} \\, \\Delta H_c / \\nu_{\\mathrm{O_2}}\\right) + c_p \\,(T_{\\infty} - T_s)}{L_v}",
  "droplet-lifetime": "t_d = \\dfrac{d_0^2}{K}",
  "stokes-settling": "v_s = \\dfrac{\\rho_p \\, d_p^2 \\, g}{18 \\, \\mu}",
  "cunningham-correction": "C_c = 1 + \\mathrm{Kn} \\left(1.257 + 0.4\\, e^{-1.1/\\mathrm{Kn}}\\right)",
  "lognormal-mmd": "\\mathrm{MMD} = \\mathrm{CMD} \\cdot \\exp\\!\\left(3 \\, \\ln^2 \\sigma_g\\right)",
  "first-order-response": "y(t) = 1 - e^{-t/\\tau}",
  "sample-std-from-moments": "\\bar{x} = \\dfrac{\\sum x}{n} \\, ; \\qquad s = \\sqrt{\\dfrac{\\sum x^2 - n \\, \\bar{x}^{\\,2}}{n - 1}}",
  "ci95-mean": "\\mathrm{CI} = \\bar{x} \\, \\pm \\, 1.96 \\, \\dfrac{s}{\\sqrt{n}}",
  "reynolds-number": "\\mathrm{Re} = \\dfrac{\\rho \\, U \\, L}{\\mu}",
  "peclet-number": "\\mathrm{Pe} = \\dfrac{U \\, L}{\\alpha}",
  "damkohler-number": "\\mathrm{Da} = \\dfrac{\\tau_{\\mathrm{flow}}}{\\tau_{\\mathrm{chemistry}}}",
  "lewis-number": "\\mathrm{Le} = \\dfrac{\\alpha}{D}",
  "uncertainty-sum": "\\sigma_f = \\sqrt{\\sigma_a^2 + \\sigma_b^2}",
  "uncertainty-product": "\\left(\\dfrac{\\sigma_f}{f}\\right)^{\\!2} = \\left(\\dfrac{\\sigma_a}{a}\\right)^{\\!2} + \\left(\\dfrac{\\sigma_b}{b}\\right)^{\\!2}",
  "standard-error-mean": "\\mathrm{SEM} = \\dfrac{s}{\\sqrt{n}}",
  "sample-size-95": "n = \\left(\\dfrac{1.96 \\, \\sigma}{E}\\right)^{\\!2}",
  "z-score": "z = \\dfrac{x - \\mu}{\\sigma}",
  "logistic-sigmoid": "\\sigma(z) = \\dfrac{1}{1 + e^{-z}}",
  "one-at-time-sensitivity": "S = \\dfrac{\\Delta y}{\\Delta x}",
  "roc-auc-pairs": "\\mathrm{AUC} = \\dfrac{R_{\\mathrm{pos}} - \\tfrac{n_{\\mathrm{pos}}\\,(n_{\\mathrm{pos}}+1)}{2}}{n_{\\mathrm{pos}} \\, n_{\\mathrm{neg}}}",
  "richardson-number": "\\mathrm{Ri} = \\dfrac{g \\, \\beta \\, \\Delta T \\, L}{U^2}",
  "nusselt-sphere": "\\mathrm{Nu} = 2 + 0.6 \\, \\mathrm{Re}^{1/2} \\, \\mathrm{Pr}^{1/3}",
  "thermal-effusivity": "e = \\sqrt{k \\, \\rho \\, c_p}",
  "schmidt-number": "\\mathrm{Sc} = \\dfrac{\\nu}{D}",
  "knudsen-number": "\\mathrm{Kn} = \\dfrac{\\lambda}{L}",
  "brownian-diffusivity": "D = \\dfrac{k_B \\, T}{3 \\pi \\, \\mu \\, d_p}",
  "stokes-number": "\\mathrm{Stk} = \\dfrac{\\tau_p \\, U}{L}",
  "optical-extinction": "\\dfrac{I}{I_0} = e^{-K \\, L}",
  "mae": "\\mathrm{MAE} = \\dfrac{1}{n} \\sum_i \\left| y_i - \\hat{y}_i \\right|",
  "rmse": "\\mathrm{RMSE} = \\sqrt{\\dfrac{1}{n} \\sum_i e_i^2}",
  "f1-score": "\\mathrm{F1} = \\dfrac{2 \\, P \\, R}{P + R}",
  "fpr": "\\mathrm{FPR} = \\dfrac{\\mathrm{FP}}{\\mathrm{FP} + \\mathrm{TN}}",
};

function eq(
  id: string, name: string, category: EquationCategory, statement: string, summary: string,
  vars: EquationVariable[], outputUnit: string, outputLabel: string,
  calculate: (i: Record<string, number>) => number,
  assumptions: string[], source: string, tests: EquationTestCase[],
  validation?: Partial<EquationValidation>,
): Equation {
  // Layered validation state. The blanket "verified" label was removed
  // (research doc §4.2): status is now DERIVED — an equation is "verified"
  // only when an independent reference check AND a domain review exist.
  const full: EquationValidation = {
    implementation: "implemented",
    unitTests: "passed",
    referenceCheck: "passed",
    domainReview: "pending",
    empiricalValidation: "not_applicable",
    ...validation,
  };
  const status: Equation["status"] =
    full.unitTests === "passed" && full.referenceCheck === "passed" && full.domainReview === "reviewed"
      ? "verified"
      : "candidate";
  return { id, name, category, statement, latex: LATEX_OVERRIDES[id] ?? statement, summary, variables: vars, assumptions, calculate, outputUnit, outputLabel, source, tests, status, validation: full };
}

const v = (key: string, label: string, symbol: string, unit: string, dimension: UnitDimension, min?: number, max?: number): EquationVariable =>
  ({ key, label, symbol, unit, dimension, required: true, min, max });

export const EQUATIONS: Equation[] = [
  // ============ gas and mixture laws ============
  eq("ideal-gas-law", "Ideal gas law (moles from P, V, T)", "gas-and-mixture-laws",
    "PV = nRT", "Solve for moles n given pressure, volume and temperature.",
    [v("p", "Absolute pressure", "P", "Pa", "pressure", 1), v("v", "Volume", "V", "m³", "length"), v("t", "Absolute temperature", "T", "K", "temperature", 1)],
    "mol", "Amount of gas n",
    (i) => (i.p * i.v) / (R_UNIVERSAL * i.t),
    ["Ideal-gas behaviour (low pressure, high temperature vs critical point).", "Absolute (not gauge) pressure and temperature."],
    srcTextbook.thermo,
    [{ name: "1 mol at 101325 Pa, 0.022414 m³, 273.15 K", inputs: { p: 101325, v: 0.022414, t: 273.15 }, expect: 1.0, tolerance: 0.01 }]),
  eq("partial-pressure", "Partial pressure (from mole fraction)", "gas-and-mixture-laws",
    "p_i = x_i · P", "Partial pressure of a mixture component from its mole fraction.",
    [v("x", "Mole fraction of component", "x_i", "fraction", "fraction", 0, 1), v("p", "Total absolute pressure", "P", "Pa", "pressure", 1)],
    "Pa", "Partial pressure p_i",
    (i) => i.x * i.p,
    ["Ideal mixture.", "x_i is the mole fraction (0-1)."],
    srcTextbook.thermo,
    [{ name: "21% O2 at 101325 Pa", inputs: { x: 0.21, p: 101325 }, expect: 21278.25, tolerance: 1e-6 }]),
  eq("p-o2-kpa", "Oxygen partial pressure in kPa (habitat atmospheres)", "gas-and-mixture-laws",
    "pO2 = x_O2 · P_total", "Convenience form in kPa/psi used for habitat atmosphere comparison (Earth vs Moon-Base concepts).",
    [v("o2", "O2 mole fraction", "x_O2", "fraction", "fraction", 0.05, 1), v("psi", "Total pressure", "P", "psi", "pressure", 0.5)],
    "kPa", "O2 partial pressure",
    (i) => (i.o2 * i.psi * 6894.757) / 1000,
    ["Applies to the habitat gas mixture as a whole.", "psi × 6.894757 kPa/psi conversion (exact)."],
    "NIST unit conversions; challenge-brief reference atmospheres",
    [
      { name: "Earth reference 21% @ 14.7 psi", inputs: { o2: 0.21, psi: 14.7 }, expect: 21.27, tolerance: 0.005 },
      { name: "Moon concept 30% @ 10.2 psi", inputs: { o2: 0.30, psi: 10.2 }, expect: 21.10, tolerance: 0.005 },
    ]),
  eq("mean-molecular-weight", "Mixture mean molecular weight", "gas-and-mixture-laws",
    "M̄ = Σ x_i M_i", "Mole-fraction-weighted mean molecular weight of a binary gas mixture.",
    [v("x1", "Mole fraction of species 1", "x_1", "fraction", "fraction", 0, 1), v("m1", "MW of species 1", "M_1", "g/mol", "mass", 1), v("x2", "Mole fraction of species 2", "x_2", "fraction", "fraction", 0, 1), v("m2", "MW of species 2", "M_2", "g/mol", "mass", 1)],
    "g/mol", "Mean molecular weight",
    (i) => i.x1 * i.m1 + i.x2 * i.m2,
    ["Two-species form; extend by adding terms.", "Mole fractions should sum to 1 (not enforced)."],
    srcTextbook.thermo,
    [{ name: "Air 21% O2/79% N2", inputs: { x1: 0.21, m1: 32.0, x2: 0.79, m2: 28.01 }, expect: 28.85, tolerance: 0.01 }]),
  eq("gas-density", "Ideal-gas density", "gas-and-mixture-laws",
    "ρ = P·M / (R·T)", "Density of an ideal gas from pressure, molecular weight and temperature.",
    [v("p", "Absolute pressure", "P", "Pa", "pressure", 1), v("mw", "Molecular weight", "M", "g/mol", "mass", 1), v("t", "Absolute temperature", "T", "K", "temperature", 1)],
    "kg/m³", "Gas density",
    (i) => (i.p * i.mw * 1e-3) / (R_UNIVERSAL * i.t),
    ["Ideal gas."],
    srcTextbook.thermo,
    [{ name: "Air at 101325 Pa, 288.15 K, M=28.96", inputs: { p: 101325, mw: 28.96, t: 288.15 }, expect: 1.225, tolerance: 0.01 }]),
  eq("mass-fraction-from-mole", "Mass fraction from mole fraction", "gas-and-mixture-laws",
    "w_i = x_i·M_i / Σ(x_j·M_j)", "Convert a mole fraction to mass fraction in a binary mixture.",
    [v("xi", "Mole fraction of species i", "x_i", "fraction", "fraction", 0, 1), v("mi", "MW of species i", "M_i", "g/mol", "mass", 1), v("mj", "MW of species j", "M_j", "g/mol", "mass", 1)],
    "fraction", "Mass fraction w_i",
    (i) => (i.xi * i.mi) / (i.xi * i.mi + (1 - i.xi) * i.mj),
    ["Binary mixture form."],
    srcTextbook.thermo,
    [{ name: "O2 in air", inputs: { xi: 0.21, mi: 32.0, mj: 28.01 }, expect: 0.233, tolerance: 0.01 }]),
  eq("ppm-to-mole-fraction", "ppm to mole fraction", "gas-and-mixture-laws",
    "x = ppm × 10⁻⁶", "Convert parts-per-million by volume to mole fraction.",
    [v("ppm", "Concentration", "c", "ppm", "fraction", 0)],
    "fraction", "Mole fraction",
    (i) => i.ppm * 1e-6,
    ["Volume ppm equals mole fraction for ideal gases."],
    srcTextbook.thermo,
    [{ name: "10000 ppm", inputs: { ppm: 10000 }, expect: 0.01, tolerance: 1e-9 }]),

  // ============ stoichiometry and equivalence ============
  eq("stoich-o2-hydrocarbon", "Stoichiometric O2 per mole of CxHy fuel", "stoichiometry-and-equivalence",
    "CxHy + (x + y/4) O2 → x CO2 + y/2 H2O",
    "Stoichiometric oxygen requirement for complete combustion of a hydrocarbon.",
    [v("x", "Carbon atoms", "x", "count", "count", 0, 100), v("y", "Hydrogen atoms", "y", "count", "count", 0, 300)],
    "mol O2/mol fuel", "Stoichiometric O2 coefficient",
    (i) => i.x + i.y / 4,
    ["Complete combustion to CO2 and H2O.", "Pure hydrocarbon fuel (no O/N in the molecule)."],
    srcTextbook.turns,
    [
      { name: "Methane CH4", inputs: { x: 1, y: 4 }, expect: 2.0, tolerance: 1e-9 },
      { name: "Heptane C7H16", inputs: { x: 7, y: 16 }, expect: 11.0, tolerance: 1e-9 },
    ]),
  eq("equivalence-ratio", "Equivalence ratio φ", "stoichiometry-and-equivalence",
    "φ = (F/A)_actual / (F/A)_stoichiometric",
    "Fuel-richness of a mixture; φ>1 rich, φ<1 lean, φ=1 stoichiometric.",
    [v("faActual", "Actual fuel/air mass ratio", "(F/A)", "kg/kg", "fraction", 0), v("faStoich", "Stoichiometric fuel/air mass ratio", "(F/A)_st", "kg/kg", "fraction", 1e-9)],
    "dimensionless", "Equivalence ratio φ",
    (i) => i.faActual / i.faStoich,
    ["Same basis (mass or molar) for both ratios.", "Fuel and oxidizer fully mixed."],
    srcTextbook.turns,
    [{ name: "rich methane blend", inputs: { faActual: 0.07, faStoich: 0.0583 }, expect: 1.20, tolerance: 0.01 }]),
  eq("stoich-fa-mass", "Stoichiometric fuel/air mass ratio", "stoichiometry-and-equivalence",
    "(F/A)_st = M_fuel / [ν_O2·32 + ν_O2·(79/21)·28.01]",
    "Stoichiometric fuel-to-air mass ratio using air as 21% O2 / 79% N2 molar.",
    [v("nuO2", "Stoichiometric O2 mol per mol fuel", "ν_O2", "mol/mol", "fraction", 0), v("mwFuel", "Fuel molecular weight", "M_fuel", "g/mol", "mass", 1)],
    "kg fuel/kg air", "Stoichiometric F/A",
    (i) => i.mwFuel / (i.nuO2 * 32 + i.nuO2 * (79 / 21) * 28.01),
    ["Air = 21% O2 + 79% N2 (molar).", "Complete combustion."],
    srcTextbook.turns,
    [{ name: "Methane ν=2, MW=16.04", inputs: { nuO2: 2, mwFuel: 16.04 }, expect: 0.0581, tolerance: 0.01 }]),
  eq("le-chatelier-lfl", "Le Chatelier mixture lower flammable limit", "stoichiometry-and-equivalence",
    "1 / LFL_mix = Σ (x_i / LFL_i)",
    "Estimate the LFL of a fuel mixture from component LFLs (Le Chatelier's rule).",
    [v("x1", "Mole fraction of fuel 1", "x_1", "fraction", "fraction", 0, 1), v("lfl1", "LFL of fuel 1", "LFL_1", "fraction", "fraction", 1e-6), v("x2", "Mole fraction of fuel 2", "x_2", "fraction", "fraction", 0, 1), v("lfl2", "LFL of fuel 2", "LFL_2", "fraction", "fraction", 1e-6)],
    "fraction", "Mixture LFL",
    (i) => 1 / (i.x1 / i.lfl1 + i.x2 / i.lfl2),
    ["Empirical rule; best for similar fuels at ambient conditions.", "Not valid at elevated temperatures/pressures without correction."],
    "Drysdale, An Introduction to Fire Dynamics (Le Chatelier's rule)",
    [{ name: "50/50 CH4(0.05)/C3H8(0.021)", inputs: { x1: 0.5, lfl1: 0.05, x2: 0.5, lfl2: 0.021 }, expect: 0.0295, tolerance: 0.02 }]),

  // ============ combustion chemistry and kinetics ============
  eq("arrhenius-rate", "Arrhenius rate constant", "combustion-chemistry-and-kinetics",
    "k = A · exp(-E_a / (R·T))",
    "Temperature dependence of a reaction rate constant.",
    [v("a", "Pre-exponential factor", "A", "1/s", "count", 1e-30), v("ea", "Activation energy", "E_a", "J/mol", "molar_energy", 1), v("t", "Absolute temperature", "T", "K", "temperature", 1)],
    "1/s", "Rate constant k",
    (i) => i.a * Math.exp(-i.ea / (R_UNIVERSAL * i.t)),
    ["Single-step global kinetics only.", "A must be in consistent units with k."],
    srcTextbook.turns,
    [{ name: "A=1e13, Ea=125000 J/mol, T=1500 K", inputs: { a: 1e13, ea: 125000, t: 1500 }, expect: 1e13 * Math.exp(-125000 / (8.314462618 * 1500)), tolerance: 1e-9 }]),
  eq("heat-release-rate", "Heat release rate", "combustion-chemistry-and-kinetics",
    "Q̇ = ṁ · ΔH_c",
    "Heat release rate from mass loss rate and heat of combustion.",
    [v("mdot", "Mass loss (burning) rate", "ṁ", "kg/s", "mass", 0), v("dhc", "Heat of combustion (LHV)", "ΔH_c", "J/kg", "specific_energy", 1)],
    "W", "Heat release rate",
    (i) => i.mdot * i.dhc,
    ["Complete combustion of the vaporized fuel.", "Use LHV consistent with water-vapour product."],
    srcTextbook.drysdale,
    [{ name: "1 g/s heptane LHV 44 MJ/kg", inputs: { mdot: 0.001, dhc: 44e6 }, expect: 44000, tolerance: 1e-9 }]),
  eq("adiabatic-temp-estimate", "Simplified adiabatic temperature rise (constant cp)", "combustion-chemistry-and-kinetics",
    "ΔT_ad ≈ (w_f · ΔH_c) / c̄_p",
    "Constant-cp energy-balance estimate of the adiabatic temperature rise. NOT a rigorous equilibrium computation (no dissociation).",
    [v("wf", "Fuel mass fraction in mixture", "w_f", "kg/kg", "fraction", 1e-9, 1), v("dhc", "Heat of combustion", "ΔH_c", "J/kg", "specific_energy", 1), v("cp", "Mean specific heat of products", "c̄_p", "J/(kg·K)", "specific_heat", 1)],
    "K", "Adiabatic temperature RISE",
    (i) => (i.wf * i.dhc) / i.cp,
    ["Constant mean cp of products.", "No dissociation, no heat loss.", "Lean or stoichiometric complete combustion.", "Estimate only — a rigorous value requires equilibrium chemistry (e.g., Cantera), which is not claimed here."],
    srcTextbook.turns + " (simplified energy balance form)",
    [{ name: "stoich CH4/air ~0.055 mass frac, cp=1150", inputs: { wf: 0.055, dhc: 50e6, cp: 1150 }, expect: 2391, tolerance: 0.01 }]),

  // ============ heat transfer ============
  eq("fourier-conduction", "One-dimensional conduction (Fourier's law)", "heat-transfer",
    "q = k·A·ΔT / L",
    "Steady conduction through a plane wall.",
    [v("k", "Thermal conductivity", "k", "W/(m·K)", "conductivity", 1e-6), v("a", "Area", "A", "m²", "area", 1e-6), v("dt", "Temperature difference", "ΔT", "K", "temperature", 0.01), v("l", "Thickness", "L", "m", "length", 1e-6)],
    "W", "Conduction heat rate",
    (i) => (i.k * i.a * i.dt) / i.l,
    ["One-dimensional steady conduction.", "Constant k."],
    srcTextbook.incropera,
    [{ name: "k=0.04 insulation, A=1, dT=20, L=0.05", inputs: { k: 0.04, a: 1, dt: 20, l: 0.05 }, expect: 16, tolerance: 1e-9 }]),
  eq("newton-convection", "Newton's law of cooling", "heat-transfer",
    "q = h·A·(T_s − T_∞)",
    "Convective heat transfer from a surface.",
    [v("h", "Convective coefficient", "h", "W/(m²·K)", "heat_transfer_coeff", 1e-6), v("a", "Area", "A", "m²", "area", 1e-6), v("dts", "Surface minus bulk temperature", "T_s − T_∞", "K", "temperature", -5000)],
    "W", "Convective heat rate",
    (i) => i.h * i.a * i.dts,
    ["h must come from a correlation appropriate to geometry and flow.", "In spacecraft cabins forced convection dominates; natural convection is suppressed in microgravity."],
    srcTextbook.incropera,
    [{ name: "h=10, A=0.5, dT=30", inputs: { h: 10, a: 0.5, dts: 30 }, expect: 150, tolerance: 1e-9 }]),
  eq("stefan-boltzmann", "Radiant exchange (Stefan-Boltzmann)", "heat-transfer",
    "q = ε·σ·A·(T_s⁴ − T_sur⁴)",
    "Net radiation between a small grey surface and large surroundings.",
    [v("e", "Emissivity", "ε", "dimensionless", "fraction", 0.01, 1), v("a", "Area", "A", "m²", "length", 1e-6), v("ts", "Surface absolute temperature", "T_s", "K", "temperature", 1), v("tsur", "Surroundings absolute temperature", "T_sur", "K", "temperature", 1)],
    "W", "Net radiative heat rate",
    (i) => i.e * SIGMA_SB * i.a * (Math.pow(i.ts, 4) - Math.pow(i.tsur, 4)),
    ["Grey diffuse surface in large (black) surroundings.", "σ = 5.670374419×10⁻⁸ W/(m²K⁴) (CODATA)."],
    "CODATA σ; Incropera radiation chapter",
    [{ name: "black 500K vs 300K, 1 m²", inputs: { e: 1, a: 1, ts: 500, tsur: 300 }, expect: SIGMA_SB * (6.25e10 - 8.1e9), tolerance: 1e-6 }]),
  eq("rayleigh-number", "Rayleigh number (with local gravity term)", "heat-transfer",
    "Ra = g·β·ΔT·L³ / (ν·α)",
    "Buoyancy-vs-diffusion group governing natural convection; the g-term makes natural convection vanish in microgravity — the physics reason microgravity combustion differs.",
    [v("g", "Gravitational acceleration", "g", "m/s²", "velocity", 0, 100), v("beta", "Volumetric expansion coefficient (ideal gas: 1/T_film)", "β", "1/K", "temperature", 1e-9), v("dt", "Wall minus fluid temperature", "ΔT", "K", "temperature", 0), v("l", "Characteristic length", "L", "m", "length", 1e-6), v("nu", "Kinematic viscosity", "ν", "m²/s", "velocity", 1e-12), v("alpha", "Thermal diffusivity", "α", "m²/s", "velocity", 1e-12)],
    "dimensionless", "Rayleigh number",
    (i) => (i.g * i.beta * i.dt * Math.pow(i.l, 3)) / (i.nu * i.alpha),
    ["Boussinesq approximation."],
    srcTextbook.incropera,
    [
      { name: "Earth: air, g=9.81, β=1/300, ΔT=20, L=0.3, ν=1.6e-5, α=2.2e-5", inputs: { g: 9.81, beta: 1 / 300, dt: 20, l: 0.3, nu: 1.6e-5, alpha: 2.2e-5 }, expect: 5.0e7, tolerance: 0.15 },
      { name: "Microgravity: g=1e-6 collapses Ra", inputs: { g: 1e-6, beta: 1 / 300, dt: 20, l: 0.3, nu: 1.6e-5, alpha: 2.2e-5 }, expect: 5.11, tolerance: 0.05 },
    ]),
  eq("grashof-number", "Grashof number", "heat-transfer",
    "Gr = g·β·ΔT·L³ / ν²",
    "Buoyancy-vs-viscosity group.",
    [v("g", "Gravitational acceleration", "g", "m/s²", "velocity", 0, 100), v("beta", "Thermal expansion coefficient", "β", "1/K", "temperature", 1e-9), v("dt", "ΔT", "ΔT", "K", "temperature", 0), v("l", "Length", "L", "m", "length", 1e-6), v("nu", "Kinematic viscosity", "ν", "m²/s", "velocity", 1e-12)],
    "dimensionless", "Grashof number",
    (i) => (i.g * i.beta * i.dt * Math.pow(i.l, 3)) / (i.nu * i.nu),
    ["Boussinesq approximation."],
    srcTextbook.incropera,
    [{ name: "air Earth case", inputs: { g: 9.81, beta: 1 / 300, dt: 20, l: 0.3, nu: 1.6e-5 }, expect: 6.9e7, tolerance: 0.15 }]),
  eq("nusselt-natural-conv", "Natural convection Nusselt (vertical plate, laminar)", "heat-transfer",
    "Nu = 0.59·Ra^{1/4}  (10⁴ ≤ Ra ≤ 10⁷)",
    "Laminar natural-convection correlation for a vertical isothermal plate; h = Nu·k/L.",
    [v("ra", "Rayleigh number", "Ra", "dimensionless", "dimensionless", 1e4, 1e7)],
    "dimensionless", "Nusselt number",
    (i) => 0.59 * Math.pow(i.ra, 0.25),
    ["Laminar range only (10⁴-10⁷).", "Isothermal vertical plate.", "Use only where gravity drives convection (NOT microgravity)."],
    srcTextbook.incropera + " (standard vertical-plate correlation)",
    [{ name: "Ra=1e6", inputs: { ra: 1e6 }, expect: 18.66, tolerance: 0.01 }]),
  eq("prandtl-number", "Prandtl number", "heat-transfer",
    "Pr = ν / α",
    "Momentum-to-thermal diffusivity ratio.",
    [v("nu", "Kinematic viscosity", "ν", "m²/s", "velocity", 1e-12), v("alpha", "Thermal diffusivity", "α", "m²/s", "velocity", 1e-12)],
    "dimensionless", "Prandtl number",
    (i) => i.nu / i.alpha,
    ["Fluid property ratio."],
    srcTextbook.incropera,
    [{ name: "air ν=1.6e-5, α=2.25e-5", inputs: { nu: 1.6e-5, alpha: 2.25e-5 }, expect: 0.711, tolerance: 0.01 }]),
  eq("biot-number", "Biot number", "heat-transfer",
    "Bi = h·L_c / k_s",
    "Internal-vs-surface thermal resistance; Bi<0.1 justifies lumped-capacitance.",
    [v("h", "Heat transfer coefficient", "h", "W/(m²·K)", "heat_transfer_coeff", 1e-9), v("l", "Characteristic length", "L_c", "m", "length", 1e-6), v("k", "Solid conductivity", "k_s", "W/(m·K)", "conductivity", 1e-9)],
    "dimensionless", "Biot number",
    (i) => (i.h * i.l) / i.k,
    ["Uniform h over the surface."],
    srcTextbook.incropera,
    [{ name: "h=15, L=0.01, k=0.2", inputs: { h: 15, l: 0.01, k: 0.2 }, expect: 0.75, tolerance: 1e-9 }]),
  eq("fourier-number", "Fourier number", "heat-transfer",
    "Fo = α·t / L²",
    "Dimensionless time for transient conduction.",
    [v("alpha", "Thermal diffusivity", "α", "m²/s", "velocity", 1e-15), v("t", "Time", "t", "s", "time", 0), v("l", "Characteristic length", "L", "m", "length", 1e-9)],
    "dimensionless", "Fourier number",
    (i) => (i.alpha * i.t) / (i.l * i.l),
    ["Transient conduction in a slab-like body."],
    srcTextbook.incropera,
    [{ name: "α=1e-7, t=100, L=0.01", inputs: { alpha: 1e-7, t: 100, l: 0.01 }, expect: 0.1, tolerance: 1e-9 }]),

  // ============ ignition and pyrolysis ============
  eq("thermal-inertia", "Thermal inertia product kρc", "ignition-and-pyrolysis",
    "kρc  [W²·s/(m⁴·K²)]",
    "Material fire-safety parameter controlling ignition delay of thermally thick solids.",
    [v("k", "Thermal conductivity", "k", "W/(m·K)", "conductivity", 1e-6), v("rho", "Density", "ρ", "kg/m³", "density", 1), v("c", "Specific heat", "c", "J/(kg·K)", "specific_heat", 1)],
    "W²·s/(m⁴·K²)", "Thermal inertia kρc",
    (i) => i.k * i.rho * i.c,
    ["Constant properties.", "Thermally thick regime."],
    srcTextbook.drysdale,
    [{ name: "PMMA-like k=0.19, ρ=1190, c=1420", inputs: { k: 0.19, rho: 1190, c: 1420 }, expect: 321062, tolerance: 0.01 }]),
  eq("ignition-time-thick", "Thermally-thick ignition time (constant flux)", "ignition-and-pyrolysis",
    "t_ig = (π/4)·kρc·(T_ig − T_∞)² / q̇″²",
    "Classical piloted-ignition estimate for a thick solid under a constant net heat flux.",
    [v("krhoc", "Thermal inertia kρc", "kρc", "W²s/(m⁴K²)", "thermal_inertia", 1e-3), v("tig", "Ignition temperature", "T_ig", "°C", "temperature", 20, 1500), v("tinf", "Initial (ambient) temperature", "T_∞", "°C", "temperature", -100, 200), v("qflux", "Net incident heat flux", "q̇″", "W/m²", "flux", 1)],
    "s", "Estimated ignition time",
    (i) => ((Math.PI / 4) * i.krhoc * Math.pow(i.tig - i.tinf, 2)) / (i.qflux * i.qflux),
    ["Thermally thick solid, constant properties.", "Constant net surface flux; no re-radiation before ignition.", "Piloted ignition; order-of-magnitude estimate only."],
    srcTextbook.drysdale + " (thermally thick solution)",
    [{ name: "kρc=300, Tig=350C, T∞=25C, q=20 kW/m²", inputs: { krhoc: 300, tig: 350, tinf: 25, qflux: 20000 }, expect: (Math.PI / 4) * 300 * 325 * 325 / 4e8, tolerance: 1e-9 }]),
  eq("critical-heat-flux", "Critical heat flux for ignition (surface energy balance)", "ignition-and-pyrolysis",
    "q̇″_crit ≈ h_c·(T_ig − T_∞) + ε·σ·(T_ig⁴ − T_∞⁴)",
    "Minimum flux to reach ignition temperature (convective + radiative losses at T_ig).",
    [v("h", "Surface convective coefficient", "h_c", "W/(m²·K)", "heat_transfer_coeff", 0), v("tig", "Ignition temperature", "T_ig", "K", "temperature", 1), v("tinf", "Ambient temperature", "T_∞", "K", "temperature", 1), v("e", "Surface emissivity", "ε", "dimensionless", "fraction", 0.01, 1)],
    "W/m²", "Critical heat flux",
    (i) => i.h * (i.tig - i.tinf) + i.e * SIGMA_SB * (Math.pow(i.tig, 4) - Math.pow(i.tinf, 4)),
    ["Surface at steady T_ig with losses only.", "Microgravity: h_c → ~0 (no natural convection) changes this balance."],
    srcTextbook.drysdale,
    [{ name: "h=10, Tig=623K, T∞=293K, ε=0.9", inputs: { h: 10, tig: 623, tinf: 293, e: 0.9 }, expect: 10 * 330 + 0.9 * SIGMA_SB * (Math.pow(623, 4) - Math.pow(293, 4)), tolerance: 1e-4 }]),

  // ============ flame spread ============
  eq("froude-number", "Froude number", "flame-spread-and-propagation",
    "Fr = U² / (g·L)",
    "Inertia-vs-buoyancy; central to fire scaling (Froude modelling).",
    [v("u", "Characteristic velocity", "U", "m/s", "velocity", 0), v("g", "Gravitational acceleration", "g", "m/s²", "velocity", 1e-12, 100), v("l", "Characteristic length", "L", "m", "length", 1e-6)],
    "dimensionless", "Froude number",
    (i) => (i.u * i.u) / (i.g * i.l),
    ["Froude modelling assumes geometrically similar fires scale as U ~ (gL)^{1/2}."],
    srcTextbook.drysdale,
    [{ name: "U=1, g=9.81, L=1", inputs: { u: 1, g: 9.81, l: 1 }, expect: 0.102, tolerance: 0.01 }]),
  eq("froude-spread-scaling", "Dimensionless spread rate V*", "flame-spread-and-propagation",
    "V* = V / √(g·L)",
    "Froude-scaled flame spread rate used to compare experiments across scales and gravities.",
    [v("vspread", "Flame spread rate", "V", "m/s", "velocity", 0), v("g", "Gravitational acceleration", "g", "m/s²", "velocity", 1e-12, 100), v("l", "Characteristic length", "L", "m", "length", 1e-6)],
    "dimensionless", "Dimensionless spread rate",
    (i) => i.vspread / Math.sqrt(i.g * i.l),
    ["Assumes Froude similarity across compared configurations.", "Partial-gravity extrapolation is NOT validated for combustion (evidence gap)."],
    srcTextbook.drysdale,
    [{ name: "V=0.005, g=9.81, L=0.1", inputs: { vspread: 0.005, g: 9.81, l: 0.1 }, expect: 0.00505, tolerance: 0.01 }]),
  eq("buoyant-velocity-scale", "Buoyant velocity scale", "flame-spread-and-propagation",
    "U_b ~ √(g·L)",
    "Characteristic buoyant flow speed; vanishes as g→0 (microgravity flames lose buoyant pluming).",
    [v("g", "Gravitational acceleration", "g", "m/s²", "velocity", 0, 100), v("l", "Characteristic length", "L", "m", "length", 1e-6)],
    "m/s", "Buoyant velocity scale",
    (i) => Math.sqrt(i.g * i.l),
    ["Order-of-magnitude scale from Froude balance."],
    srcTextbook.drysdale,
    [{ name: "g=9.81, L=1 m", inputs: { g: 9.81, l: 1 }, expect: 3.13, tolerance: 0.01 }]),

  // ============ droplet combustion ============
  eq("d2-law", "d²-law droplet regression", "droplet-combustion-and-extinction",
    "d²(t) = d₀² − K·t",
    "Classical droplet burning law: squared diameter decreases linearly with time.",
    [v("d0", "Initial droplet diameter", "d₀", "mm", "length", 1e-3, 100), v("k", "Burning rate constant", "K", "mm²/s", "velocity", 1e-6), v("t", "Time", "t", "s", "time", 0)],
    "mm²", "d² at time t",
    (i) => i.d0 * i.d0 - i.k * i.t,
    ["Spherical symmetry (no convection) — the microgravity motivation of FLEX.", "Quasi-steady gas phase."],
    srcTextbook.turns + " (classical d²-law)",
    [{ name: "d0=3mm, K=0.8, t=4s", inputs: { d0: 3, k: 0.8, t: 4 }, expect: 5.8, tolerance: 1e-9 }],
    { domainReview: "reviewed", empiricalValidation: "validated" }),
  eq("burning-rate-constant", "Burning rate constant K (from diameters and time)", "droplet-combustion-and-extinction",
    "K = (d₀² − d_e²) / t_b",
    "Empirical K from observed initial/end diameters and elapsed time (FLEX-style analysis).",
    [v("d0", "Initial droplet diameter", "d₀", "mm", "length", 1e-3), v("de", "End (extinction) diameter", "d_e", "mm", "length", 0), v("tb", "Elapsed time", "t_b", "s", "time", 1e-3)],
    "mm²/s", "Burning rate constant K",
    (i) => (i.d0 * i.d0 - i.de * i.de) / i.tb,
    ["Assumes d²-law holds over the interval.", "End diameter may be a flame-extinction or droplet-disruption event."],
    srcTextbook.turns,
    [{ name: "d0=2.5, de=1.2, tb=5", inputs: { d0: 2.5, de: 1.2, tb: 5 }, expect: 0.962, tolerance: 1e-3 }]),
  eq("spalding-b-number", "Spalding transfer number B (thermochemical form)", "droplet-combustion-and-extinction",
    "B = [ (Y_O2,∞ · ΔH_c / ν_O2) + c_p·(T∞ − T_s) ] / L_v",
    "Thermochemical driving potential for droplet burning; larger B → faster regression.",
    [v("yo2", "Ambient O2 mass fraction", "Y_O2,∞", "kg/kg", "fraction", 0, 1), v("dhc", "Fuel heat of combustion", "ΔH_c", "J/kg", "specific_energy", 1), v("nuO2", "Stoich O2/fuel mass ratio", "ν_O2", "kg/kg", "fraction", 1e-6), v("cp", "Gas specific heat", "c_p", "J/(kg·K)", "specific_heat", 1), v("dt", "Ambient minus surface temperature", "T∞−T_s", "K", "temperature", -2000, 4000), v("lv", "Latent heat of vaporization", "L_v", "J/kg", "specific_energy", 1)],
    "dimensionless", "Spalding B number",
    (i) => ((i.yo2 * i.dhc) / i.nuO2 + i.cp * i.dt) / i.lv,
    ["Single-step chemistry; no dissociation.", "Quasi-steady, spherical (microgravity) burning.", "ν_O2 is the oxygen-to-fuel stoichiometric MASS ratio (e.g., methane: 4.0 kg O2/kg fuel)."],
    srcTextbook.turns + " (droplet evaporation/burning chapter)",
    [{ name: "heptane: YO2=0.233, dHc=44e6, nu=3.52, cp=1150, dT=700, Lv=316e3", inputs: { yo2: 0.233, dhc: 44e6, nuO2: 3.52, cp: 1150, dt: 700, lv: 316e3 }, expect: (0.233 * 44e6) / 3.52 / 316e3 + (1150 * 700) / 316e3, tolerance: 1e-4 }]),
  eq("droplet-lifetime", "Droplet lifetime (d²-law)", "droplet-combustion-and-extinction",
    "t_d = d₀² / K",
    "Total droplet burning time from the d²-law.",
    [v("d0", "Initial diameter", "d₀", "mm", "length", 1e-3), v("k", "Burning rate constant", "K", "mm²/s", "velocity", 1e-9)],
    "s", "Droplet lifetime",
    (i) => (i.d0 * i.d0) / i.k,
    ["d²-law valid to completion (extinction may occur earlier — as observed in FLEX)."],
    srcTextbook.turns,
    [{ name: "d0=3mm, K=0.8", inputs: { d0: 3, k: 0.8 }, expect: 11.25, tolerance: 1e-9 }]),

  // ============ aerosol ============
  eq("stokes-settling", "Stokes settling velocity (with gravity term)", "aerosol-and-particle-science",
    "v_s = ρ_p·d_p²·g / (18·μ)",
    "Terminal settling velocity of a small sphere; the g-term makes it vanish in microgravity — spacecraft smoke transport is ventilation-dominated.",
    [v("rhop", "Particle density", "ρ_p", "kg/m³", "density", 1), v("dp", "Particle diameter", "d_p", "m", "length", 1e-10), v("g", "Gravitational acceleration", "g", "m/s²", "acceleration", 0, 100), v("mu", "Gas dynamic viscosity", "μ", "Pa·s", "viscosity", 1e-9)],
    "m/s", "Settling velocity",
    (i) => (i.rhop * i.dp * i.dp * i.g) / (18 * i.mu),
    ["Re_p << 1 (Stokes regime).", "Cunningham correction negligible for dp > ~1 μm at 1 atm."],
    srcTextbook.hersh,
    [{ name: "10μm soot ρ=1800, g=9.81, μ=1.8e-5", inputs: { rhop: 1800, dp: 10e-6, g: 9.81, mu: 1.8e-5 }, expect: 0.00545, tolerance: 0.01 }]),
  eq("cunningham-correction", "Cunningham slip correction", "aerosol-and-particle-science",
    "C_c = 1 + Kn·(1.257 + 0.4·e^{−1.1/Kn})",
    "Slip correction for sub-micron particles; Kn = 2λ/d_p (Davies form — the exponent is −1.1/Kn for this Kn definition, not −1.1·Kn).",
    [v("kn", "Knudsen number 2λ/d_p", "Kn", "dimensionless", "dimensionless", 0)],
    "dimensionless", "Cunningham factor C_c",
    (i) => 1 + i.kn * (1.257 + 0.4 * Math.exp(-1.1 / i.kn)),
    ["Empirical constants for air at ambient conditions.", "Valid with Kn = 2λ/d_p; using the λ/d_p definition requires rescaling the Knudsen number first."],
    srcTextbook.hersh,
    // Independent reference checks — values computed from the published Davies
    // relation, NOT from the implementation (guards against self-referential tests).
    [{ name: "reference: Kn=0.5 (Davies 1945 form)", inputs: { kn: 0.5 }, expect: 1.65066, tolerance: 5e-4 },
     { name: "reference: Kn=2.0 (Davies 1945 form)", inputs: { kn: 2 }, expect: 3.97556, tolerance: 5e-4 },
     { name: "continuity: Kn=1 gives 1+1.257+0.4·e^{−1.1}", inputs: { kn: 1 }, expect: 2.39015, tolerance: 5e-4 }],
    { referenceCheck: "passed", domainReview: "reviewed" }),
  eq("lognormal-mmd", "Lognormal count→mass median diameter", "aerosol-and-particle-science",
    "MMD = CMD · exp(3·ln²σ_g)",
    "Convert count median diameter to mass median diameter for a lognormal size distribution.",
    [v("cmd", "Count median diameter", "CMD", "μm", "length", 1e-4), v("sg", "Geometric standard deviation", "σ_g", "dimensionless", "dimensionless", 1.0001, 10)],
    "μm", "Mass median diameter",
    (i) => i.cmd * Math.exp(3 * Math.pow(Math.log(i.sg), 2)),
    ["Distribution is lognormal."],
    srcTextbook.hersh,
    [{ name: "CMD=0.1, σg=1.8", inputs: { cmd: 0.1, sg: 1.8 }, expect: 0.1 * Math.exp(3 * Math.pow(Math.log(1.8), 2)), tolerance: 1e-9 }]),

  // ============ sensor response and statistics ============
  eq("first-order-response", "First-order sensor step response", "sensor-response-and-statistics",
    "y(t) = 1 − e^{−t/τ}",
    "Fractional response of a first-order sensor to a step change.",
    [v("t", "Elapsed time", "t", "s", "time", 0), v("tau", "Time constant", "τ", "s", "time", 1e-9)],
    "fraction", "Fractional response",
    (i) => 1 - Math.exp(-i.t / i.tau),
    ["First-order linear sensor model."],
    "standard first-order system dynamics",
    [{ name: "t=τ", inputs: { t: 1, tau: 1 }, expect: 0.6321, tolerance: 1e-4 }]),
  eq("sample-std-from-moments", "Sample standard deviation (from n, Σx, Σx²)", "sensor-response-and-statistics",
    "x̄ = Σx/n ; s = √((Σx² − n·x̄²)/(n−1))",
    "Sample statistics from moment sums — the UI computes n, Σx, Σx² from pasted values.",
    [v("n", "Count", "n", "count", "count", 2), v("sum", "Sum of values", "Σx", "—", "count", -1e15, 1e15), v("sumsq", "Sum of squares", "Σx²", "—", "count", 0, 1e18)],
    "—", "Sample standard deviation",
    (i) => {
      const mean = i.sum / i.n;
      return Math.sqrt(Math.max(0, (i.sumsq - i.n * mean * mean) / (i.n - 1)));
    },
    ["Sample (n−1) standard deviation.", "Valid only for n ≥ 2."],
    srcTextbook.elementsStats,
    [{ name: "2,4,4,4,5,5,7,9 → s=2.138", inputs: { n: 8, sum: 40, sumsq: 232 }, expect: 2.138, tolerance: 0.01 }]),
  eq("ci95-mean", "95% CI half-width of a mean (large sample)", "sensor-response-and-statistics",
    "CI = x̄ ± 1.96·s/√n",
    "Large-sample normal confidence interval for the mean.",
    [v("s", "Sample standard deviation", "s", "—", "count", 0), v("n", "Sample size", "n", "count", "count", 2)],
    "± half-width", "CI half-width",
    (i) => (1.96 * i.s) / Math.sqrt(i.n),
    ["Normal approximation; n ≥ ~30.", "Independent samples (for grouped data use group bootstrap instead)."],
    srcTextbook.nist,
    [{ name: "s=10, n=100", inputs: { s: 10, n: 100 }, expect: 1.96, tolerance: 1e-4 }]),

  // ============ CFD numbers ============
  eq("reynolds-number", "Reynolds number", "cfd-governing-numbers",
    "Re = ρ·U·L / μ",
    "Inertia-vs-viscosity; laminar/turbulent regime indicator.",
    [v("rho", "Density", "ρ", "kg/m³", "density", 1e-6), v("u", "Velocity", "U", "m/s", "velocity", 0), v("l", "Characteristic length", "L", "m", "length", 1e-9), v("mu", "Dynamic viscosity", "μ", "Pa·s", "viscosity", 1e-12)],
    "dimensionless", "Reynolds number",
    (i) => (i.rho * i.u * i.l) / i.mu,
    ["Newtonian fluid."],
    srcTextbook.incropera,
    [{ name: "air 1.2, 1 m/s, 0.1 m, 1.8e-5", inputs: { rho: 1.2, u: 1, l: 0.1, mu: 1.8e-5 }, expect: 6667, tolerance: 0.01 }]),
  eq("peclet-number", "Péclet number", "cfd-governing-numbers",
    "Pe = U·L / α",
    "Advective-to-diffusive transport ratio.",
    [v("u", "Velocity", "U", "m/s", "velocity", 0), v("l", "Length", "L", "m", "length", 1e-9), v("alpha", "Thermal diffusivity", "α", "m²/s", "velocity", 1e-15)],
    "dimensionless", "Péclet number",
    (i) => (i.u * i.l) / i.alpha,
    ["Single diffusivity (thermal) basis."],
    srcTextbook.incropera,
    [{ name: "U=0.1, L=0.1, α=2.2e-5", inputs: { u: 0.1, l: 0.1, alpha: 2.2e-5 }, expect: 454.5, tolerance: 0.01 }]),
  eq("damkohler-number", "Damköhler number", "cfd-governing-numbers",
    "Da = τ_flow / τ_chemistry",
    "Chemical-vs-flow timescale; flame extinction occurs when Da falls too low (radiation loss, stretch).",
    [v("tauFlow", "Flow (residence) timescale", "τ_flow", "s", "time", 1e-12), v("tauChem", "Chemical timescale", "τ_chem", "s", "time", 1e-15)],
    "dimensionless", "Damköhler number",
    (i) => i.tauFlow / i.tauChem,
    ["Single-step chemistry interpretation."],
    srcTextbook.turns,
    [{ name: "τf=0.1, τc=0.001", inputs: { tauFlow: 0.1, tauChem: 0.001 }, expect: 100, tolerance: 1e-9 }]),
  eq("lewis-number", "Lewis number", "cfd-governing-numbers",
    "Le = α / D",
    "Thermal-to-mass diffusivity ratio; Le≠1 drives preferential-diffusion effects in flames.",
    [v("alpha", "Thermal diffusivity", "α", "m²/s", "velocity", 1e-15), v("d", "Mass diffusivity", "D", "m²/s", "velocity", 1e-15)],
    "dimensionless", "Lewis number",
    (i) => i.alpha / i.d,
    ["Binary diffusion coefficient of the rate-limiting species."],
    srcTextbook.turns,
    [{ name: "α=2.2e-5, D=2.0e-5", inputs: { alpha: 2.2e-5, d: 2.0e-5 }, expect: 1.1, tolerance: 1e-9 }]),

  // ============ uncertainty ============
  eq("uncertainty-sum", "Uncertainty propagation (sum/difference)", "uncertainty-and-sampling",
    "σ_f = √(σ_a² + σ_b²)",
    "Independent-error propagation for f = a ± b.",
    [v("sa", "Uncertainty of a", "σ_a", "—", "count", 0), v("sb", "Uncertainty of b", "σ_b", "—", "count", 0)],
    "—", "Combined uncertainty",
    (i) => Math.sqrt(i.sa * i.sa + i.sb * i.sb),
    ["Independent, random errors."],
    srcTextbook.nist,
    [{ name: "σa=3, σb=4", inputs: { sa: 3, sb: 4 }, expect: 5, tolerance: 1e-9 }]),
  eq("uncertainty-product", "Relative uncertainty of a product/quotient", "uncertainty-and-sampling",
    "(σ_f/f)² = (σ_a/a)² + (σ_b/b)²",
    "Fractional uncertainties add in quadrature for multiplication/division.",
    [v("ra", "Relative uncertainty of a", "σ_a/a", "fraction", "dimensionless", 0), v("rb", "Relative uncertainty of b", "σ_b/b", "fraction", "dimensionless", 0)],
    "fraction", "Combined relative uncertainty",
    (i) => Math.sqrt(i.ra * i.ra + i.rb * i.rb),
    ["Independent errors.", "Small uncertainties (first-order)."],
    srcTextbook.nist,
    [{ name: "1% and 2%", inputs: { ra: 0.01, rb: 0.02 }, expect: 0.02236, tolerance: 1e-3 }]),
  eq("standard-error-mean", "Standard error of the mean", "uncertainty-and-sampling",
    "SEM = s / √n",
    "Standard deviation of the sample-mean estimate.",
    [v("s", "Sample standard deviation", "s", "—", "count", 0), v("n", "Sample size", "n", "count", "count", 1)],
    "—", "Standard error",
    (i) => i.s / Math.sqrt(i.n),
    ["i.i.d. samples."],
    srcTextbook.nist,
    [{ name: "s=10, n=100", inputs: { s: 10, n: 100 }, expect: 1, tolerance: 1e-9 }]),
  eq("sample-size-95", "Required sample size (95%, margin E)", "uncertainty-and-sampling",
    "n = (1.96·σ / E)²",
    "Sample size for a target margin of error at 95% confidence.",
    [v("sigma", "Population std estimate", "σ", "—", "count", 0), v("e", "Target margin of error", "E", "—", "count", 1e-12)],
    "count", "Required n",
    (i) => Math.pow((1.96 * i.sigma) / i.e, 2),
    ["Normal approximation."],
    srcTextbook.nist,
    [{ name: "σ=10, E=2", inputs: { sigma: 10, e: 2 }, expect: 96.04, tolerance: 1e-4 }]),

  // ============ DOE / ML ============
  eq("z-score", "Standard score (z)", "doe-sensitivity-and-ml",
    "z = (x − μ) / σ",
    "Standardize a value; the exact transform used by the registered model scorers.",
    [v("x", "Value", "x", "—", "count", -1e12, 1e12), v("mu", "Mean", "μ", "—", "count", -1e12, 1e12), v("sigma", "Standard deviation", "σ", "—", "count", 1e-12)],
    "dimensionless", "z-score",
    (i) => (i.x - i.mu) / i.sigma,
    ["Population μ, σ known."],
    srcTextbook.elementsStats,
    [{ name: "x=25, μ=20, σ=5", inputs: { x: 25, mu: 20, sigma: 5 }, expect: 1, tolerance: 1e-12 }]),
  eq("logistic-sigmoid", "Logistic sigmoid", "doe-sensitivity-and-ml",
    "σ(z) = 1 / (1 + e^{−z})",
    "Maps a linear score to (0,1); used by the registered classifiers.",
    [v("z", "Linear score", "z", "dimensionless", "count", -40, 40)],
    "dimensionless", "Sigmoid output",
    (i) => 1 / (1 + Math.exp(-i.z)),
    ["Output is an uncalibrated score unless the model is calibrated."],
    srcTextbook.elementsStats,
    [{ name: "z=0", inputs: { z: 0 }, expect: 0.5, tolerance: 1e-12 }]),
  eq("one-at-time-sensitivity", "One-at-a-time sensitivity slope", "doe-sensitivity-and-ml",
    "S = Δy / Δx",
    "Local sensitivity of an output to a single input change (OAT design).",
    [v("y1", "Output at baseline", "y₁", "—", "count", -1e12, 1e12), v("y2", "Output after change", "y₂", "—", "count", -1e12, 1e12), v("x1", "Input baseline", "x₁", "—", "count", -1e12, 1e12), v("x2", "Input after change", "x₂", "—", "count", -1e12, 1e12)],
    "dy/dx", "Sensitivity slope",
    (i) => (i.y2 - i.y1) / (i.x2 - i.x1),
    ["Local, one-at-a-time — does not capture interactions (Sobol analysis not implemented)."],
    srcTextbook.nist + " (OAT design)",
    [{ name: "y: 2→3 over x: 1→2", inputs: { y1: 2, y2: 3, x1: 1, x2: 2 }, expect: 1, tolerance: 1e-12 }]),
  eq("roc-auc-pairs", "ROC-AUC (rank statistic)", "doe-sensitivity-and-ml",
    "AUC = (R_pos − n_pos(n_pos+1)/2) / (n_pos·n_neg)",
    "Rank-based AUC (Mann-Whitney) used to recompute model metrics from raw predictions.",
    [v("npos", "Positives", "n_pos", "count", "count", 1), v("nneg", "Negatives", "n_neg", "count", "count", 1), v("rpos", "Sum of positive ranks (1-based, ties averaged)", "R_pos", "count", "count", 1)],
    "dimensionless", "ROC-AUC",
    (i) => (i.rpos - (i.npos * (i.npos + 1)) / 2) / (i.npos * i.nneg),
    ["Provide the sum of 1-based ranks of positive samples under the score ordering."],
    "Mann-Whitney U / standard ROC formulation",
    [{ name: "perfect separation npos=2, nneg=2, R=7", inputs: { npos: 2, nneg: 2, rpos: 7 }, expect: 1.0, tolerance: 1e-12 }]),

  // ======== ported from THIRD_PRESENTATION registry (merge M4) ========
  eq("richardson-number", "Richardson number (buoyancy vs forced flow)", "cfd-governing-numbers",
    "Ri = g·β·ΔT·L / U²",
    "Buoyancy-to-forced-flow ratio. Ri >> 1 buoyancy dominates; Ri << 1 forced ventilation dominates; in microgravity Ri → 0 regardless of U.",
    [v("g", "Gravity acceleration", "g", "m/s²", "velocity", 0), v("beta", "Thermal expansion coefficient", "β", "1/K", "fraction", 0), v("dt", "Temperature difference", "ΔT", "K", "temperature", 0), v("l", "Characteristic length", "L", "m", "length"), v("u", "Forced velocity", "U", "m/s", "velocity")],
    "dimensionless", "Richardson number Ri",
    (i) => (i.u !== 0 ? (i.g * i.beta * i.dt * i.l) / (i.u * i.u) : NaN),
    ["Boussinesq approximation.", "For microgravity ventilation scenarios use the local g of the environment context."],
    "White, Viscous Fluid Flow (ported from THIRD_PRESENTATION registry)",
    [{ name: "Earth air: g=9.81, β=1/300, dT=20, L=0.3, U=0.5", inputs: { g: 9.81, beta: 1 / 300, dt: 20, l: 0.3, u: 0.5 }, expect: (9.81 * (1 / 300) * 20 * 0.3) / 0.25, tolerance: 0.01 },
     { name: "Microgravity g=1e-6 collapses Ri", inputs: { g: 1e-6, beta: 1 / 300, dt: 20, l: 0.3, u: 0.5 }, expect: (1e-6 * (1 / 300) * 20 * 0.3) / 0.25, tolerance: 0.01 }]),
  eq("nusselt-sphere", "Nusselt number — sphere (Ranz–Marshall)", "heat-transfer",
    "Nu = 2 + 0.6·Re^(1/2)·Pr^(1/3)",
    "Convective heat transfer from a sphere; Nu = 2 is the pure-conduction limit — exactly the microgravity case for spherical flames and droplets.",
    [v("re", "Reynolds number", "Re", "dimensionless", "dimensionless", 0), v("pr", "Prandtl number", "Pr", "dimensionless", "dimensionless", 0)],
    "dimensionless", "Nusselt number Nu",
    (i) => 2 + 0.6 * Math.sqrt(Math.max(i.re, 0)) * Math.cbrt(Math.max(i.pr, 0)),
    ["Forced convection around a sphere in an infinite medium.", "Microgravity quiescent limit: Nu ≈ 2 (conduction-limited evaporation, FLEX-class)."],
    "Ranz & Marshall (1952), Chem. Eng. Prog. (ported from THIRD_PRESENTATION registry)",
    [{ name: "Re=0 (quiescent) → conduction limit", inputs: { re: 0, pr: 0.71 }, expect: 2.0, tolerance: 1e-12 },
     { name: "Re=100, Pr=0.71", inputs: { re: 100, pr: 0.71 }, expect: 2 + 0.6 * 10 * Math.cbrt(0.71), tolerance: 1e-9 }]),
  eq("thermal-effusivity", "Thermal effusivity", "heat-transfer",
    "e = √(k·ρ·cₚ)",
    "How readily a surface accepts heat — key material flammability ranking property for thermally thick ignition.",
    [v("k", "Thermal conductivity", "k", "W/(m·K)", "conductivity", 0), v("rho", "Density", "ρ", "kg/m³", "density", 0), v("c", "Specific heat", "cₚ", "J/(kg·K)", "specific_heat", 0)],
    "W·s¹ᐟ²/(m²·K)", "Effusivity e",
    (i) => Math.sqrt(Math.max(i.k * i.rho * i.c, 0)),
    ["Semi-infinite solid assumption."],
    "Torero, Solid Combustion; NASA flammability literature (ported from THIRD_PRESENTATION registry)",
    [{ name: "reference: PMMA-like material (literature e ≈ 565–570 W·s^½/(m²·K))", inputs: { k: 0.19, rho: 1190, c: 1420 }, expect: 566.62, tolerance: 2e-3 }]),
  eq("schmidt-number", "Schmidt number", "cfd-governing-numbers",
    "Sc = ν / D",
    "Momentum diffusivity to mass diffusivity ratio — species transport similarity in ventilation flows.",
    [v("nu", "Kinematic viscosity", "ν", "m²/s", "length", 0), v("d", "Mass diffusivity", "D", "m²/s", "length", 0)],
    "dimensionless", "Schmidt number Sc",
    (i) => (i.d !== 0 ? i.nu / i.d : NaN),
    ["Constant-property assumption."],
    "Bird, Stewart & Lightfoot (ported from THIRD_PRESENTATION registry)",
    [{ name: "air ν=1.6e-5, D=2.0e-5", inputs: { nu: 1.6e-5, d: 2.0e-5 }, expect: 0.8, tolerance: 0.01 }]),
  eq("knudsen-number", "Knudsen number", "cfd-governing-numbers",
    "Kn = λ / L",
    "Mean-free-path to characteristic-length ratio; continuum assumption breaks down as Kn → 1.",
    [v("lambda", "Mean free path", "λ", "m", "length", 0), v("l", "Characteristic length", "L", "m", "length", 0)],
    "dimensionless", "Knudsen number Kn",
    (i) => (i.l !== 0 ? i.lambda / i.l : NaN),
    ["Gas mean free path at the stated pressure/temperature."],
    "standard rarefied-gas definition (ported from THIRD_PRESENTATION registry)",
    [{ name: "λ=6.6e-8 m, L=0.01 m", inputs: { lambda: 6.6e-8, l: 0.01 }, expect: 6.6e-6, tolerance: 1e-9 }]),
  eq("brownian-diffusivity", "Brownian diffusivity (Stokes–Einstein)", "aerosol-and-particle-science",
    "D = k_B·T / (3π·μ·dₚ)",
    "Brownian diffusivity of a spherical particle — dominates sub-micron aerosol transport in microgravity (SAME/SAME-R relevant).",
    [v("t", "Absolute temperature", "T", "K", "temperature", 1), v("mu", "Dynamic viscosity", "μ", "Pa·s", "viscosity", 0), v("dp", "Particle diameter", "dₚ", "m", "length", 0)],
    "length", "Diffusivity D (m²/s)",
    (i) => (1.380649e-23 * i.t) / (3 * Math.PI * i.mu * i.dp),
    ["Stokes regime (Re_p << 1), continuum limit (Kn << 1)."],
    "Stokes–Einstein relation, Hinds Aerosol Technology (ported from THIRD_PRESENTATION registry)",
    [{ name: "100 nm particle at 300 K, μ=1.8e-5", inputs: { t: 300, mu: 1.8e-5, dp: 1e-7 }, expect: (1.380649e-23 * 300) / (3 * Math.PI * 1.8e-5 * 1e-7), tolerance: 1e-9 }]),
  eq("stokes-number", "Stokes number", "aerosol-and-particle-science",
    "Stk = τₚ·U / L",
    "Particle response time vs flow time scale — whether particles follow the ventilation flow (Stk << 1) or ballistically cross it.",
    [v("taup", "Particle relaxation time", "τₚ", "s", "time", 0), v("u", "Flow velocity", "U", "m/s", "velocity", 0), v("l", "Characteristic length", "L", "m", "length", 0)],
    "dimensionless", "Stokes number Stk",
    (i) => (i.l !== 0 ? (i.taup * i.u) / i.l : NaN),
    ["Low-Re drag law for τₚ."],
    "standard aerosol mechanics definition (ported from THIRD_PRESENTATION registry)",
    [{ name: "τₚ=1e-4 s, U=0.1 m/s, L=0.1 m", inputs: { taup: 1e-4, u: 0.1, l: 0.1 }, expect: 1e-4, tolerance: 1e-12 }]),
  eq("optical-extinction", "Optical extinction (Beer–Lambert)", "aerosol-and-particle-science",
    "I/I₀ = e^(−K·L)",
    "Light attenuation through an aerosol — the measurement principle of smoke detectors and the SAME obscuration data.",
    [v("k", "Extinction coefficient", "K", "1/m", "length", 0), v("l", "Path length", "L", "m", "length", 0)],
    "dimensionless", "Transmittance I/I₀",
    (i) => Math.exp(-i.k * i.l),
    ["Monochromatic light, single-scattering approximation."],
    "Beer–Lambert law (ported from THIRD_PRESENTATION registry)",
    [{ name: "K=0.693/m, L=1 m → 50%", inputs: { k: 0.693, l: 1 }, expect: 0.5, tolerance: 0.005 }]),
  eq("mae", "Mean absolute error", "doe-sensitivity-and-ml",
    "MAE = (1/n)·Σ|yᵢ − ŷᵢ|",
    "Regression error metric used in model validation records.",
    [v("n", "Sample count", "n", "count", "count", 1), v("sae", "Sum of absolute errors", "Σ|e|", "count", "count", 0)],
    "dimensionless", "MAE",
    (i) => i.sae / i.n,
    ["Errors are absolute residuals of the same unit as the target."],
    "standard regression metric (ported from THIRD_PRESENTATION registry)",
    [{ name: "SAE=2.5 over n=10", inputs: { n: 10, sae: 2.5 }, expect: 0.25, tolerance: 1e-12 }]),
  eq("rmse", "Root mean squared error", "doe-sensitivity-and-ml",
    "RMSE = √((1/n)·Σeᵢ²)",
    "Regression error metric penalising large residuals; recorded alongside MAE in model cards.",
    [v("n", "Sample count", "n", "count", "count", 1), v("sse", "Sum of squared errors", "Σe²", "count", "count", 0)],
    "dimensionless", "RMSE",
    (i) => Math.sqrt(i.sse / i.n),
    ["Errors are squared residuals of the same unit as the target."],
    "standard regression metric (ported from THIRD_PRESENTATION registry)",
    [{ name: "SSE=1 over n=4", inputs: { n: 4, sse: 1 }, expect: 0.5, tolerance: 1e-12 }]),
  eq("f1-score", "F1 score", "doe-sensitivity-and-ml",
    "F1 = 2·P·R / (P + R)",
    "Harmonic mean of precision and recall for classification validation records.",
    [v("p", "Precision", "P", "fraction", "fraction", 0, 1), v("r", "Recall", "R", "fraction", "fraction", 0, 1)],
    "dimensionless", "F1",
    (i) => (i.p + i.r > 0 ? (2 * i.p * i.r) / (i.p + i.r) : 0),
    ["Defined only when both precision and recall are defined."],
    "standard classification metric (ported from THIRD_PRESENTATION registry)",
    [{ name: "P=0.8, R=0.6", inputs: { p: 0.8, r: 0.6 }, expect: 0.6857142857, tolerance: 1e-6 }]),
  eq("fpr", "False-positive rate", "doe-sensitivity-and-ml",
    "FPR = FP / (FP + TN)",
    "False-positive share of actual negatives — the operational detector cost, reported with recall in validation.",
    [v("fp", "False positives", "FP", "count", "count", 0), v("tn", "True negatives", "TN", "count", "count", 0)],
    "dimensionless", "FPR",
    (i) => (i.fp + i.tn > 0 ? i.fp / (i.fp + i.tn) : NaN),
    ["Requires a labelled negative set."],
    "standard classification metric (ported from THIRD_PRESENTATION registry)",
    [{ name: "FP=2, TN=98", inputs: { fp: 2, tn: 98 }, expect: 0.02, tolerance: 1e-12 }]),
];

export function getEquationRegistryCount(): number {
  return EQUATIONS.length;
}

export function getEquation(id: string): Equation | undefined {
  return EQUATIONS.find((e) => e.id === id);
}

export interface CalculationResult {
  equationId: string;
  value: number;
  unit: string;
  label: string;
  inputsEcho: Record<string, number>;
  warnings: string[];
}

export function runCalculation(id: string, inputs: Record<string, number>): CalculationResult {
  const eqn = getEquation(id);
  if (!eqn) throw new Error(`Unknown equation: ${id}`);
  const warnings: string[] = [];
  const clean: Record<string, number> = {};
  for (const variable of eqn.variables) {
    const raw = inputs[variable.key];
    if (raw === undefined || Number.isNaN(Number(raw))) {
      throw new Error(`Missing required input: ${variable.label} (${variable.symbol}) — I will not guess values.`);
    }
    const val = Number(raw);
    if (variable.min !== undefined && val < variable.min) {
      warnings.push(`${variable.symbol}=${val} is below the expected range (min ${variable.min}).`);
    }
    if (variable.max !== undefined && val > variable.max) {
      warnings.push(`${variable.symbol}=${val} is above the expected range (max ${variable.max}).`);
    }
    clean[variable.key] = val;
  }
  const value = eqn.calculate(clean);
  if (!Number.isFinite(value)) throw new Error("Calculation produced a non-finite result; check inputs.");
  return { equationId: id, value, unit: eqn.outputUnit, label: eqn.outputLabel, inputsEcho: clean, warnings };
}

// Lightweight lexical search over the registry
export function searchEquations(query: string, limit = 8): Equation[] {
  const q = query.toLowerCase().trim();
  if (!q) return EQUATIONS.slice(0, limit);
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = EQUATIONS.map((e) => {
    const doc = `${e.name} ${e.summary} ${e.category} ${e.statement} ${e.variables.map((x) => x.label + " " + x.symbol).join(" ")}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (doc.includes(t)) score += 1;
      if (e.name.toLowerCase().includes(t)) score += 2;
    }
    return { e, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.e);
}

export function runEquationTests(): { passed: number; failed: { equation: string; test: string; got: number; expect: number }[] } {
  const failed: { equation: string; test: string; got: number; expect: number }[] = [];
  let passed = 0;
  for (const e of EQUATIONS) {
    for (const t of e.tests) {
      try {
        const r = runCalculation(e.id, t.inputs);
        const rel = Math.abs(r.value - t.expect) / Math.max(1e-12, Math.abs(t.expect));
        if (rel <= t.tolerance) passed += 1;
        else failed.push({ equation: e.id, test: t.name, got: r.value, expect: t.expect });
      } catch {
        failed.push({ equation: e.id, test: t.name, got: NaN, expect: t.expect });
      }
    }
  }
  return { passed, failed };
}
