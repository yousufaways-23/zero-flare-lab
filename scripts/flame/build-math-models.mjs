// Build the Mathematical Model Registry → src/data/generated/mathematical_models.json
//
// Curation policy (17A): only models supported by the verified equation registry
// (implemented), by captured validation runs (partially validated), by existing
// model cards (ML), or by knowledge-index citations (documented-only) are registered.
// Lifecycle statuses follow 17A.4-C. Missing information is null, never invented.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const eqSrc = readFileSync(path.join(ROOT, "src", "lib", "science", "equations.ts"), "utf8");
const equationIds = new Set([...eqSrc.matchAll(/eq\("([a-z0-9-]+)"/g)].map((m) => m[1]));
const kb = JSON.parse(readFileSync(path.join(ROOT, "knowledge", "index.json"), "utf8"));
const kbDocs = kb.docs ?? [];
const d2law = JSON.parse(readFileSync(path.join(ROOT, "data", "validation", "d2law_validation.json"), "utf8"));
const atmos = JSON.parse(readFileSync(path.join(ROOT, "src", "data", "generated", "atmospheres.json"), "utf8"));

// KB citation lookup: documents whose text contains the term
const kbCite = (termArg, limit = 3) => {
  const term = String(termArg);
  const hits = kbDocs.filter((d) => (d.text ?? "").toLowerCase().includes(term.toLowerCase()));
  return hits.slice(0, limit).map((d) => ({ source: d.source, location: d.location, batchId: d.batchId, snippet: (d.text ?? "").slice(0, 160) }));
};
const requireCitations = (id, term) => {
  const c = kbCite(term);
  if (c.length === 0) throw new Error(`documented-only model ${id} has no knowledge-index citation for "${term}"`);
  return c;
};

const allEq = (...ids) => {
  for (const id of ids) if (!equationIds.has(id)) throw new Error(`related equation id not in registry: ${id}`);
  return ids;
};

const ENV = Object.fromEntries(atmos.environments.map((e) => [e.id, e]));

// Environment compatibility values: "direct" | "modified" | "qualitative" | "not-applicable"
const envComp = (entries) => entries;

const models = [];

/* ------------------------------------------------------------------ 1 */
models.push({
  model_id: "ideal-atmosphere-state",
  name: "Ideal-gas habitat atmosphere state",
  model_class: "analytical-theoretical",
  phenomenon: ["atmosphere", "flammability-context", "oxygen-availability"],
  intended_applications: ["Habitat/cabin atmosphere characterisation for flammability and suppression analysis", "Oxygen partial pressure and density at any selected environment"],
  description: "Composes the ideal-gas law, Dalton partial pressures, mean molecular weight and ideal-gas density to fully characterise a pressurised atmosphere from (O2 fraction, total pressure, temperature). The flammability-relevant output is oxygen partial pressure, which the challenge documentation identifies as the primary flammability variable.",
  physical_principles: ["Ideal-gas equation of state", "Dalton's law of partial pressures", "Mixture molecular-weight averaging"],
  governing_equations: ["PV = nRT", "p_i = x_i * p", "rho = p*M/(R*T)"],
  related_equation_ids: allEq("p-o2-kpa", "partial-pressure", "ideal-gas-law", "gas-density", "mean-molecular-weight"),
  required_variables: ["o2_fraction", "total_pressure_kpa", "temperature_k (optional, default 293.15)"],
  input_schema: { o2: "0-1 mole fraction", pressureKpa: "kPa", temperatureK: "K (optional)" },
  output_variables: ["oxygen_partial_pressure_kpa", "density_kg_m3", "mean_molecular_weight_g_mol"],
  units: { pressure: "kPa", density: "kg/m^3", molar_mass: "g/mol" },
  assumptions: ["Ideal-gas behaviour (all habitat pressures are far above critical)", "Well-mixed atmosphere", "Binary O2/N2 approximation for density unless full composition given"],
  initial_conditions: null, boundary_conditions: null,
  material_properties: null,
  environmental_domain: { gravity: "any (atmospheric state is gravity-independent)", pressure: "40-110 kPa (habitat range)", o2_fraction: "0.10-1.00" },
  applicability_limits: { note: "Exact within ideal-gas assumptions; flammability interpretation still requires fuel-specific limits", exterior_moon_mars: "NOT applicable to exterior lunar/Martian near-vacuum surfaces (no pressurised oxidiser atmosphere)" },
  solution_method: "closed-form algebraic (equation registry)",
  solver_details: null,
  source_references: [{ source: "Moran/Shapiro, Fundamentals of Engineering Thermodynamics", type: "textbook" }, { source: "challenge brief — Moon-base ≥30% O2 at ≤10.2 psi", type: "challenge-documentation" }],
  experimental_validation: { status: "verified_against_reference_tests", note: "equation registry reference tests (p-o2-kpa: Earth 21.28 kPa, Moon 21.10 kPa)" },
  calibration_information: null,
  uncertainty_information: { type: "negligible (ideal-gas)", extras: "real-gas corrections <0.1% at habitat conditions" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (68/68 registry reference tests pass; re-run via /api/selftest)",
  validation_status: "validated_against_reference_tests (analytical identity, not experimental)",
  limitations: ["Ideal-gas assumption", "Does not model reaction chemistry or flow"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "direct", moon: "direct", mars: "direct", spacecraft: "direct", spacesuit: "direct" }),
  phenomenon_tags: ["atmosphere", "flammability-context"],
  executable: true,
});

/* ------------------------------------------------------------------ 2 */
models.push({
  model_id: "buoyancy-transport-regime",
  name: "Buoyancy-ventilation transport regime scaling",
  model_class: "analytical-theoretical",
  phenomenon: ["buoyancy", "transport", "ventilation", "microgravity-transition"],
  intended_applications: ["Classifying which transport mechanism (buoyancy / ventilation / diffusion) dominates a flame at a given gravity and flow", "Justifying why terrestrial data does or does not transfer to microgravity"],
  description: "Reduced-order scaling model: computes characteristic buoyant velocity (sqrt(g) scaling), Grashof/Rayleigh numbers, Richardson number and Froude number, then classifies the flame transport regime. In microgravity the buoyant velocity collapses and diffusion/ventilation dominates — the single most important environment distinction in the corpus.",
  physical_principles: ["Buoyant velocity scale u_b ~ sqrt(g*L*Δrho/rho)", "Gr/Ra natural-convection scaling", "Ri = buoyancy/inertia ratio", "Fr = inertia/gravity ratio"],
  governing_equations: ["Gr = g*beta*dT*L^3/nu^2", "Ra = Gr*Pr", "Ri = g*beta*dT*L/U^2", "Fr = U^2/(g*L)", "u_b = sqrt(2*g*L*density_ratio)"],
  related_equation_ids: allEq("rayleigh-number", "grashof-number", "froude-number", "richardson-number", "buoyant-velocity-scale"),
  required_variables: ["gravity_g", "ventilation_cm_s", "characteristic_length_m (default 0.01)", "delta_t_k (default 2000 K flame)"],
  input_schema: { g: "0-1 (g units)", ventilationCmS: "0-60 cm/s", lengthM: "m (default 0.01)", dT: "K (default 2000)" },
  output_variables: ["flow_regime_id", "buoyant_velocity_cm_s", "richardson_number", "grashof_number", "froude_number"],
  units: { velocity: "cm/s", dimensionless: "-" },
  assumptions: ["Boussinesq approximation", "Single characteristic length scale", "ΔT ≈ 2000 K flame-to-ambient (NASA illustrative values)"],
  initial_conditions: null, boundary_conditions: null, material_properties: null,
  environmental_domain: { gravity: "1e-6 to 1 g (the model's subject)", note: "regime classification changes across gravity: diffusion-limited (µg) → mixed (partial-g) → buoyancy-dominated (1g)" },
  applicability_limits: { note: "Scaling relations only — no flame geometry, chemistry or radiation; regime labels are qualitative guidance", cfd_boundary: "not a CFD substitute" },
  solution_method: "closed-form scaling relations",
  solver_details: null,
  source_references: [{ source: "NASA FLT lower-body negative pressure / flame-shape scaling discussion; Turns Ch. fluids (scaling laws)", type: "textbook" }, { source: "project physics module (ported from SECOND_EVIDENCE)", type: "implementation" }],
  experimental_validation: { status: "verified_against_reference_tests", note: "registry test vectors (Earth Ri 261.5; µg Ri → 2.6e-4)" },
  calibration_information: null,
  uncertainty_information: { type: "order-of-magnitude scaling", extras: "regime boundaries (factor-3 velocity comparisons) are heuristic" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (registry tests + /api/selftest physics-ri check)",
  validation_status: "not_experimentally_validated (scaling relations — qualitative guidance only)",
  limitations: ["Scaling relations cannot predict flame shape or spread rate", "Regime boundaries are heuristic factor comparisons"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "direct", moon: "direct", mars: "direct", spacecraft: "direct", spacesuit: "qualitative" }),
  phenomenon_tags: ["buoyancy", "transport", "ventilation"],
  executable: true,
});

/* ------------------------------------------------------------------ 3 */
const d2val = d2law;
models.push({
  model_id: "d2-law-droplet-combustion",
  name: "Classical d²-law droplet combustion (quasi-steady, spherically symmetric)",
  model_class: "analytical-theoretical",
  phenomenon: ["droplet-combustion", "extinction", "burning-rate"],
  intended_applications: ["Microgravity isolated-droplet burning (FLEX/CFI regime)", "Droplet lifetime estimation from d0 and burning rate K", "First-order extinction-diameter trajectory"],
  description: "Classical quasi-steady droplet-combustion model (Godsave 1953; Spalding 1953): in microgravity the flame is spherically symmetric and the droplet diameter decreases linearly in time, d² = d0² − K·t, until extinction (d_ext) or burnout. K is the burning-rate constant set by vaporisation-diffusion balance (Spalding B number). The model composes the registry's d2-law, burning-rate-constant, droplet-lifetime and spalding-b-number equations.",
  physical_principles: ["Quasi-steady vaporisation-diffusion balance", "Spherical symmetry (microgravity)", "d²-linear regression (K constant)", "Spalding transfer number B links burning rate to thermochemistry"],
  governing_equations: ["d²(t) = d0² − K·t", "K = (8·rho_v·D·ln(1+B)) / rho_l (dimensional form via B)", "t_life = d0²/K", "B = Y_O2,∞·ΔH_c/(ν·L_v) + c_p·ΔT/L_v"],
  related_equation_ids: allEq("d2-law", "burning-rate-constant", "droplet-lifetime", "spalding-b-number"),
  required_variables: ["d0_mm", "K_mm2_s", "(optional) d_ext_mm for extinction-time"],
  input_schema: { d0Mm: "mm (0.5-5)", kMm2S: "mm^2/s (0.2-2.5)", dExtMm: "mm (optional)" },
  output_variables: ["diameter_mm(t)", "lifetime_s = (d0^2 - d_ext^2)/K", "k_implied = (d0^2 - d_ext^2)/t_burn"],
  units: { diameter: "mm", K: "mm^2/s", time: "s" },
  assumptions: ["Quasi-steady gas phase", "Spherically symmetric diffusion flame (microgravity)", "Constant K (no time-varying transport, no disruptive burning)", "Single-step chemistry implicit in B", "No radiation correction (radiation matters for cool flames / large droplets)"],
  initial_conditions: { form: "d(0) = d0" },
  boundary_conditions: { far_field: "ambient O2 composition (datum)", droplet_surface: "saturation condition" },
  material_properties: ["fuel L_v, c_p, rho_l", "ambient O2/N2/He/CO composition (affects B and K)"],
  environmental_domain: { gravity: "≤0.02 g direct (spherical); partial-g qualitative (buoyant distortion); 1-g qualitative", pressure: "FLEX range 300-800 mmHg", o2_fraction: "0.10-0.5 with diluents" },
  applicability_limits: { flex_regime: "valid as first-order trajectory", cool_flames: "does NOT capture cool-flame two-stage burning (see cool-flame-two-stage model)", disruptions: "disruptive burning (FLEX-2 mixtures) violates d²-linearity" },
  solution_method: "closed-form algebraic (d² trajectory + lifetime)",
  solver_details: null,
  source_references: [{ source: "Godsave (1953); Spalding (1953) — classical droplet combustion", type: "primary-literature" }, { source: "Turns, An Introduction to Combustion, Ch. 10 (droplet burning)", type: "textbook" }, { source: "PSI-69 FLEX recovered table (K, d0, t_burn, d_ext)", type: "experimental-data" }],
  experimental_validation: {
    status: "PARTIALLY_VALIDATED",
    source: d2val.source,
    n_rows: d2val.usable_rows,
    internal_consistency: d2val.internal_consistency,
    burning_rate_by_fuel: d2val.burning_rate_by_fuel,
    lifetime_prediction: d2val.lifetime_prediction,
    interpretation: "Constant-K d²-law reproduces the recovered FLEX K values within literature order-of-magnitude (µg K medians 0.46-0.54 mm²/s, reduced vs 1g as expected from weaker convective transport) but FAILS to predict individual burn times quantitatively (MAE 7.9-10.3 s, RMSE 10.4-19.0 s) — constant-K idealisation does not hold per-test (time-varying K, disruption events, dilution-dependent extinction). Use as first-order trajectory only.",
    independent_campaign: false,
  },
  calibration_information: { note: "K is a measured input per test (recovered table), not a fitted global parameter; per-fuel medians quoted as calibration context only" },
  uncertainty_information: { type: "empirical residual statistics", extras: "per-test variability dominates; see lifetime_prediction MAE/RMSE" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (registry test vectors: d0=3, K=0.8 → d(4s)=5.8 mm; t_life=11.25 s)",
  validation_status: "PARTIALLY_VALIDATED (PSI-69, n=259; see experimental_validation)",
  limitations: ["Fails per-test quantitative prediction (MAE ~8-10 s)", "No cool-flame / two-stage physics", "No disruptive burning", "No radiation correction"],
  model_version: "1.0",
  environments: envComp({ earth: "qualitative", iss: "direct", moon: "qualitative", mars: "qualitative", spacecraft: "qualitative", spacesuit: "not-applicable" }),
  phenomenon_tags: ["droplet-combustion", "extinction"],
  executable: true,
  validation_evidence_file: "data/validation/d2law_validation.json",
});

/* ------------------------------------------------------------------ 4 */
models.push({
  model_id: "thermally-thick-ignition",
  name: "Thermally-thick solid ignition under constant radiant flux",
  model_class: "semi-empirical",
  phenomenon: ["ignition", "solid-fuel", "flammability"],
  intended_applications: ["1-g bench flammability screening (BASS-class radiant ignition)", "Ignition-time estimate from thermal inertia k*rho*c and incident flux"],
  description: "Semi-infinite solid heated by constant net flux ignites at t_ig = (pi/4)·(k*rho*c)·(T_ig − T_inf)²/q''² (thermally-thick regime). Composes the registry's ignition-time-thick, critical-heat-flux and thermal-inertia equations. The gravity term does not appear explicitly: ignition is conduction-limited into the solid, so the formulation transfers to other gravities qualitatively — but heat feedback from the flame (which DOES depend on gravity) is outside this model.",
  physical_principles: ["Semi-infinite conduction (thermally thick)", "Surface energy balance at ignition", "Thermal inertia k*rho*c as the ignition-resistance property"],
  governing_equations: ["t_ig = (pi/4)·(k*rho*c)·(T_ig − T_inf)²/q''²", "q''_crit = h·(T_ig − T_inf) + eps*sigma*(T_ig^4 − T_inf^4)"],
  related_equation_ids: allEq("ignition-time-thick", "critical-heat-flux", "thermal-inertia"),
  required_variables: ["thermal_inertia_krhoc", "ignition_temperature_c", "ambient_temperature_c", "incident_flux_w_m2"],
  input_schema: { krhoc: "(kW·s)^0.5/m² equivalent (SI: k*rho*c in SI units)", tIgC: "°C", tInfC: "°C", qflux: "W/m²" },
  output_variables: ["ignition_time_s", "critical_flux_w_m2"],
  units: { time: "s", flux: "W/m^2" },
  assumptions: ["Thermally thick (ignition before thermal penetration of the full sample thickness)", "Constant net flux (no flame feedback during preheat)", "Fixed ignition temperature criterion", "No pyrolysis-gas mixing physics"],
  initial_conditions: { form: "T(x,0) = T_inf" },
  boundary_conditions: { surface: "constant net flux", depth: "semi-infinite" },
  material_properties: ["k (conductivity)", "rho (density)", "c (specific heat)", "T_ig (ignition temperature)", "eps (emissivity)"],
  environmental_domain: { gravity: "gravity-independent formulation (conduction-limited); flame heat-feedback stage is gravity-dependent and NOT modelled", scale: "BASS/flat-sample bench scale" },
  applicability_limits: { microgravity: "preheat conduction transfers directly; the subsequent flame-spread stage requires spread models — ignition time alone is transferable qualitatively", thermally_thin: "invalid for thin fabrics where Biot/penetration covers the sample (use thermally-thin formulation)" },
  solution_method: "closed-form analytical",
  solver_details: null,
  source_references: [{ source: "Drysdale, An Introduction to Fire Dynamics 3rd ed. (thermally-thick ignition)", type: "textbook" }, { source: "BASS-II radiant ignition methodology (PSI-25)", type: "experimental-data" }],
  experimental_validation: { status: "not_independently_validated", note: "BASS-II table records ignition times per test — future work: fit k*rho*c per material and compare (input completeness: sample dimensions + flux recorded)" },
  calibration_information: null,
  uncertainty_information: { type: "formulation", extras: "T_ig criterion and constant-flux idealisation dominate" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (registry test vectors)",
  validation_status: "not_validated (independent experimental validation pending)",
  limitations: ["Thermally-thick only", "No flame feedback", "No pyrolysis modelling", "1g bench correlation — microgravity heat-feedback unrepresented"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "qualitative", moon: "qualitative", mars: "qualitative", spacecraft: "qualitative", spacesuit: "not-applicable" }),
  phenomenon_tags: ["ignition", "solid-fuel", "flammability"],
  executable: true,
});

/* ------------------------------------------------------------------ 5 */
models.push({
  model_id: "stokes-smoke-settling",
  name: "Aerosol settling / diffusion scaling (Stokes + Cunningham)",
  model_class: "analytical-theoretical",
  phenomenon: ["smoke", "detection", "aerosol-transport"],
  intended_applications: ["Contrast 1-g vs microgravity smoke transport for detector placement", "Settling velocity and Brownian-diffusion scaling per particle size"],
  description: "Combines Stokes settling velocity (with Cunningham slip correction) and Brownian diffusivity to characterise smoke-particle transport. In 1 g, settling dominates for >1 µm particles; in microgravity, settling vanishes and Brownian diffusion + ventilation dominate — the physical basis of the SAME/SAME-R finding that spacecraft smoke behaves differently and detectors must be validated in the flight regime.",
  physical_principles: ["Stokes drag settling (terminal velocity)", "Cunningham slip correction for sub-micron particles", "Stokes-Einstein Brownian diffusion"],
  governing_equations: ["v_s = rho_p*g*d_p^2/(18*mu) * C_c", "D = k_B*T/(3*pi*mu*d_p) * C_c"],
  related_equation_ids: allEq("stokes-settling", "cunningham-correction", "brownian-diffusivity"),
  required_variables: ["particle_diameter_m", "particle_density_kg_m3", "gravity_g", "air_temperature_k", "air_viscosity_pa_s (default 1.8e-5)"],
  input_schema: { dp: "m", rhoP: "kg/m^3", g: "g units", TK: "K", mu: "Pa·s" },
  output_variables: ["settling_velocity_m_s", "brownian_diffusivity_m2_s", "regime_note"],
  units: { velocity: "m/s", diffusivity: "m^2/s" },
  assumptions: ["Spherical particles", "Stokes regime (Re_p << 1)", "Continuum or slip-corrected", "Dilute aerosol (no coagulation)"],
  initial_conditions: null, boundary_conditions: null,
  material_properties: ["particle density"],
  environmental_domain: { gravity: "any (g is an explicit input; µg → v_s → 0 and diffusion dominates)", pressure: "habitat range" },
  applicability_limits: { note: "Single-particle scaling — no coagulation, agglomeration, electrostatics or ventilation transport", same_note: "SAME/SAME-R measured the actual size distributions (corpus PSI-101/102)" },
  solution_method: "closed-form scaling",
  solver_details: null,
  source_references: [{ source: "Hinds, Aerosol Technology (settling, Cunningham, diffusion)", type: "textbook" }, { source: "PSI-101/102 SAME corpus tables", type: "experimental-data" }],
  experimental_validation: { status: "verified_against_reference_tests", note: "registry test vectors; SAME/SAME-R provide the measured distributions the scaling operates on" },
  calibration_information: null,
  uncertainty_information: { type: "formulation", extras: "shape factor and size distribution spread dominate" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (registry test vectors)",
  validation_status: "validated_against_reference_tests (scaling identities; distribution data external to model)",
  limitations: ["Single-particle scaling only", "No coagulation/electrostatics", "Detection-time estimation requires ventilation field (not modelled)"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "direct", moon: "direct", mars: "direct", spacecraft: "direct", spacesuit: "qualitative" }),
  phenomenon_tags: ["smoke", "detection", "aerosol-transport"],
  executable: true,
});

/* ------------------------------------------------------------------ 6 */
models.push({
  model_id: "froude-spread-scaling",
  name: "Froude-scaling of opposed-flow flame spread",
  model_class: "semi-empirical",
  phenomenon: ["flame-spread", "solid-fuel"],
  intended_applications: ["Scaling spread-rate comparisons between gravity levels and flow speeds (qualitative)", "Explaining why 1-g spread data does not transfer directly to microgravity"],
  description: "Semi-empirical scaling: opposed-flow flame spread over thin fuels correlates with the flow Froude number Fr = U²/(gL) — as gravity decreases, buoyancy-induced mixing weakens and the spread rate departs from 1-g correlations. The registry's froude-number and froude-spread-scaling equations give the dimensionless spread rate V*. Quantitative prediction requires fuel-specific empirical constants; the scaling itself is qualitative across gravities.",
  physical_principles: ["Froude-number similarity of buoyant opposed-flow spread", "Buoyant velocity scale V ~ sqrt(g*L)"],
  governing_equations: ["Fr = U^2/(g*L)", "V* = V/sqrt(g*L)"],
  related_equation_ids: allEq("froude-number", "froude-spread-scaling", "buoyant-velocity-scale"),
  required_variables: ["flow_velocity_m_s", "gravity_g", "characteristic_length_m"],
  input_schema: { u: "m/s", g: "g units", lengthM: "m" },
  output_variables: ["froude_number", "dimensionless_spread_rate_V*"],
  units: { dimensionless: "-" },
  assumptions: ["Opposed-flow spread over thin fuel", "Buoyant-mixing-controlled spread regime", "Empirical constants per fuel/thickness not included"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["fuel-specific spread constants (not included)"],
  environmental_domain: { gravity: "1e-6 to 1 g (the scaling's subject); quantitative constants exist only for the tested 1-g/flow combinations" },
  applicability_limits: { microgravity: "in µg the buoyant scale collapses — spread is flow- or radiation-controlled, outside this correlation's calibrated domain", note: "SAFFIRE large-scale µg spread is the experimental reference, not this scaling" },
  solution_method: "scaling correlation",
  solver_details: null,
  source_references: [{ source: "Drysdale (flame-spread scaling); NASA microgravity spread literature", type: "textbook" }, { source: "PSI-99/100 SAFFIRE spread records (experimental reference)", type: "experimental-data" }],
  experimental_validation: { status: "not_validated_quantitatively", note: "SAFFIRE/1-g spread-rate columns in PSI-99 support future per-fuel fitting — recorded as future work" },
  calibration_information: null,
  uncertainty_information: { type: "order-of-magnitude" },
  computational_requirements: { runtime: "<1 ms", environment: "browser or server" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (registry test vectors)",
  validation_status: "not_validated (qualitative scaling only)",
  limitations: ["No quantitative prediction without fuel-specific constants", "Not valid in µg limit for absolute rates"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "qualitative", moon: "qualitative", mars: "qualitative", spacecraft: "qualitative", spacesuit: "not-applicable" }),
  phenomenon_tags: ["flame-spread", "solid-fuel"],
  executable: true,
});

/* ------------------------------------------------------------------ 7-8 (ML bridged) */
const flexCard = JSON.parse(readFileSync(path.join(ROOT, "models", "flex-extinction", "v2", "model_card.json"), "utf8"));
models.push({
  model_id: "flex-extinction-v2",
  name: "FLEX droplet-extinction classifier v2 (ML)",
  model_class: "machine-learning",
  phenomenon: ["droplet-combustion", "extinction", "suppression"],
  intended_applications: ["Extinction-outcome classification for isolated droplets under diluent atmospheres (FLEX regime)", "Suppression screening for CO2/He dilution of droplet flames"],
  description: "Six-feature logistic-regression classifier predicting visible-flame extinction for isolated methanol/heptane droplets from pre-test conditions (fuel, d0, pressure, O2/N2/CO/He). Registered here in the ML category to keep the model-type distinction explicit; scoring lives in src/lib/science/models.ts and the existing Model Studio playground.",
  physical_principles: ["Empirical statistical boundary learned from recovered FLEX tests", "Pre-test features only (no leakage of outcome columns)"],
  governing_equations: ["logistic(p) = sigma(w·x + b) on standardised features"],
  related_equation_ids: allEq("logistic-sigmoid", "roc-auc-pairs"),
  required_variables: ["xo2", "pressure_mmHg", "d0_mm", "fuel", "he_fraction", "co_fraction", "gravity_g (guard)"],
  input_schema: { xo2: "0.15-0.7", pressureMmHg: "400-1150", d0Mm: "1-5", fuel: "Methanol|Heptane", heFraction: "0-0.4", coFraction: "0-0.4", gravityG: "≤0.02 enforced" },
  output_variables: ["extinction_relative_score (UNCALIBRATED)", "applicability {inDomain, violations}"],
  units: { score: "dimensionless relative" },
  assumptions: ["Training distribution = recovered FLEX conditions", "Independent features", "Outcome = visible-flame extinction recorded in test end"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["methanol/heptane properties implicit in training"],
  environmental_domain: { gravity: "≤0.02 g (hard refusal above)", pressure: "400-1150 mmHg", o2: "0.15-0.7" },
  applicability_limits: { microgravity_only: true, no_partial_gravity: "lunar/Mars refuse (gap: partial-gravity droplet data)", uncalibrated: "score is relative, not a probability" },
  solution_method: "standardised logistic regression (in-browser coefficients)",
  solver_details: { training: "IRLS, grouped CV by condition", coefficients: "standardised, in model_card.json" },
  source_references: [{ source: "PSI-69 FLEX recovered table (training data, SHA-256)", type: "experimental-data" }, { source: "models/flex-extinction/v2/model_card.json", type: "model-card" }],
  experimental_validation: { status: "EXPERIMENTALLY_VALIDATED", grouped_cv_auc: 0.882, historical_auc: 0.875, o2_only_baseline: 0.818, ci: "0.832-0.917 (row bootstrap)", grouping: "110 experimental condition groups" },
  calibration_information: { note: "NOT probability-calibrated — output labelled UNCALIBRATED relative score" },
  uncertainty_information: { type: "bootstrap CI on AUC", extras: "no per-prediction intervals" },
  computational_requirements: { runtime: "<1 ms", environment: "browser" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (in-browser scoring reproduced in playground)",
  validation_status: "EXPERIMENTALLY_VALIDATED (grouped CV on recovered data)",
  limitations: ["Microgravity domain only", "Methanol/Heptane only", "Uncalibrated score", "No partial-gravity extrapolation"],
  model_version: "2.0",
  environments: envComp({ earth: "not-applicable", iss: "direct", moon: "not-applicable", mars: "not-applicable", spacecraft: "not-applicable", spacesuit: "not-applicable" }),
  phenomenon_tags: ["droplet-combustion", "extinction", "suppression"],
  executable: true,
  existing_card: "models/flex-extinction/v2/model_card.json",
});
const cfigCard = JSON.parse(readFileSync(path.join(ROOT, "models", "cfig-hot-ignition", "v1", "model_card.json"), "utf8"));
models.push({
  model_id: "cfig-hot-ignition",
  name: "CFI-G hot-ignition scorer (ML, exploratory)",
  model_class: "machine-learning",
  phenomenon: ["ignition", "cool-flames"],
  intended_applications: ["Exploratory hot-ignition scoring for CFI-G inverse-flame conditions", "Transparency example: honest negative/exploratory result retained"],
  description: "Spec-preserved logistic coefficients scoring hot-ignition outcome for CFI-G inverse-flame gaseous conditions. Registered as EXPLORATORY: it does NOT outperform the single-feature oxygen baseline under grouped validation (recorded AUC 0.682 vs 0.728) and is retained for transparency — not for decisions.",
  physical_principles: ["Empirical statistical boundary on gaseous cool/hot-flame transition features"],
  governing_equations: ["logistic(p) = sigma(w·x + b)"],
  related_equation_ids: allEq("logistic-sigmoid"),
  required_variables: ["xf_before", "p_bar", "xo2", "hc_burn_rate", "o2_flow", "tad_k", "zst", "fuel"],
  input_schema: { xfBefore: "mole fraction", pBar: "bar", xo2: "0.15-0.5", hcBurnRate: "mg/s", o2Flow: "mg/s", tadK: "K", zst: "-", fuel: "ethane|propane|butane" },
  output_variables: ["hot_ignition_relative_score"],
  units: { score: "dimensionless relative" },
  assumptions: ["CFI-G inverse-flame training distribution", "Ambiguous 'flash' rows excluded (never forced negative)"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["gaseous hydrocarbon fuels"],
  environmental_domain: { gravity: "µg (ISS/CIR)", pressure: "~1 bar", o2: "0.15-0.5" },
  applicability_limits: { exploratory: "below oxygen-only baseline — do not use for decisions" },
  solution_method: "fixed logistic coefficients (spec-preserved)",
  solver_details: { validation: "StratifiedGroupKFold by test day" },
  source_references: [{ source: "PSI-159 CFI-G recovered inverse-flame table", type: "experimental-data" }, { source: "models/cfig-hot-ignition/v1/model_card.json", type: "model-card" }],
  experimental_validation: { status: "EXPLORATORY_BELOW_BASELINE", logistic_auc: 0.682, gbm_auc: 0.701, o2_baseline: 0.728, grouping: "by test Day" },
  calibration_information: null,
  uncertainty_information: { type: "none", extras: "single in-sample evaluation recorded" },
  computational_requirements: { runtime: "<1 ms", environment: "browser" },
  implementation_status: "IMPLEMENTED",
  verification_status: "CODE_VERIFIED (validated against recovered rows: 146 usable / 131 positives exact match)",
  validation_status: "EXPLORATORY (below baseline — retained as honest negative result)",
  limitations: ["Not for decisions", "Small negative class (15 negatives)", "Single evaluation"],
  model_version: "1.0",
  environments: envComp({ earth: "not-applicable", iss: "direct", moon: "not-applicable", mars: "not-applicable", spacecraft: "not-applicable", spacesuit: "not-applicable" }),
  phenomenon_tags: ["ignition", "cool-flames"],
  executable: true,
  existing_card: "models/cfig-hot-ignition/v1/model_card.json",
});

/* ------------------------------------------------- documented-only (KB-cited) */
models.push({
  model_id: "cool-flame-two-stage-ignition",
  name: "Two-stage ignition / negative-temperature-coefficient cool-flame model (literature)",
  model_class: "mechanistic-physical",
  phenomenon: ["cool-flames", "ignition"],
  intended_applications: ["Explaining CFI-G two-stage ignition and cool-flame persistence", "Reference formulation for low-temperature kinetic modelling"],
  description: "Low-temperature kinetic model of two-stage ignition: first-stage (cool-flame) heat release from RO₂/QOOH branching chemistry followed by negative-temperature-coefficient behaviour and delayed hot ignition. DOCUMENTED ONLY: the governing kinetic scheme lives in the cited literature; no numerical solver is implemented in ZERO FLARE.",
  physical_principles: ["Low-temperature RO2/QOOH branching", "Negative temperature coefficient (NTC) region", "Two-stage heat-release separation"],
  governing_equations: ["elementary low-temperature kinetic steps (see sources; not re-registered here)"],
  related_equation_ids: [],
  required_variables: ["fuel chemistry mechanism", "initial T/p", "O2 fraction", "residence time"],
  input_schema: null, output_variables: ["first-stage ignition delay", "second-stage (hot) ignition delay"],
  units: { time: "s" },
  assumptions: ["Detailed/reduced low-temperature mechanism required", "0-D homogeneous or 1-D diffusion formulation per source"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["fuel-specific kinetic rates"],
  environmental_domain: { gravity: "microgravity diffusion (CFI-G spherical cool flames)", pressure: "CFI-G ~1 bar", o2: "up to 0.85 at burner (challenge-documented)" },
  applicability_limits: { note: "Quantitative use requires an implemented kinetic solver — out of ZERO FLARE scope" },
  solution_method: "documented (kinetic mechanism; no solver here)",
  solver_details: null,
  source_references: [{ source: "1-s2.0-S0016236115011758-am.pdf (Zhao et al., Initiation and Propagation of Laminar Premixed Cool Flames)", type: "primary-literature" }, { source: "PSI-159_Reports_FinalRpt_ACME.CFI-G.pdf (ACME/CFI-G Final Report 2022)", type: "nasa-report" }],
  experimental_validation: { status: "documented_in_sources", note: "source publications validate against their own experiments — not re-validated in ZERO FLARE" },
  calibration_information: null,
  uncertainty_information: null,
  computational_requirements: { runtime: null, environment: null },
  implementation_status: "DOCUMENTED_ONLY",
  verification_status: "not_verified (no implementation)",
  validation_status: "documented_in_sources",
  limitations: ["No executable solver in ZERO FLARE", "Requires fuel-specific kinetic mechanisms"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "direct", moon: "qualitative", mars: "qualitative", spacecraft: "qualitative", spacesuit: "not-applicable" }),
  phenomenon_tags: ["cool-flames", "ignition"],
  executable: false,
  kb_citations: requireCitations("cool-flame", 3).filter((c) => c.source.includes("S0016236") || c.source.includes("PSI-159")),
});

models.push({
  model_id: "fgm-concurrent-flame-spread",
  name: "Flamelet-Generated-Manifold concurrent flame-spread modelling (literature / PSI-62)",
  model_class: "numerical-simulation",
  phenomenon: ["flame-spread", "solid-fuel"],
  intended_applications: ["Reference numerical formulation for concurrent (opposed + cocurrent) flame spread over solid fuels", "PSI-62 investigation's own modelling approach"],
  description: "PSI-62 (Concurrent Flame Spread Modeling using Flamelet Generated Manifolds) applies FGM-reduced chemistry with CFD to model concurrent flame spread. DOCUMENTED ONLY: the modelling approach and its validation live in the investigation's publications; ZERO FLARE implements no FGM/CFD solver.",
  physical_principles: ["Flamelet-generated manifolds for turbulent/premixed-diffusion chemistry reduction", "Concurrent spread coupling of opposed and cocurrent flows"],
  governing_equations: ["reacting Navier-Stokes + FGM-manifold tabulation (per sources)"],
  related_equation_ids: [],
  required_variables: ["CFD domain, mesh, inlet conditions", "solid-fuel pyrolysis boundary model", "fuel properties"],
  input_schema: null, output_variables: ["spread rate", "flame structure fields"],
  units: { spread: "mm/s" },
  assumptions: ["FGM chemistry reduction validity", "Pyrolysis boundary closure", "Mesh/convergence per source"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["sample material properties"],
  environmental_domain: { gravity: "µg (ISS/CIR) and 1-g reference per source", scale: "CIR sample scale" },
  applicability_limits: { note: "Requires a full CFD stack — explicitly out of ZERO FLARE scope; never claim these charts/animations are CFD" },
  solution_method: "documented (CFD/FGM; no solver here)",
  solver_details: null,
  source_references: [{ source: "PSI-62 investigation record (Concurrent Flame Spread Modeling using FGM)", type: "nasa-investigation" }, ...kbCite("Flamelet Generated Manifold", 2).map((c) => ({ source: c.source, type: "knowledge-index-citation", location: c.location }))],
  experimental_validation: { status: "documented_in_sources", note: "PSI-62 publications carry their own validation" },
  calibration_information: null, uncertainty_information: null,
  computational_requirements: { runtime: null, environment: "CFD workstation (source)" },
  implementation_status: "DOCUMENTED_ONLY",
  verification_status: "not_verified (no implementation)",
  validation_status: "documented_in_sources",
  limitations: ["No solver in ZERO FLARE", "CFD-boundary: never label UI charts/3D as CFD"],
  model_version: "1.0",
  environments: envComp({ earth: "direct", iss: "direct", moon: "not-applicable", mars: "not-applicable", spacecraft: "not-applicable", spacesuit: "not-applicable" }),
  phenomenon_tags: ["flame-spread", "solid-fuel"],
  executable: false,
  kb_citations: requireCitations("Flamelet Generated Manifold", 2),
});

models.push({
  model_id: "iss-fine-water-mist-suppression",
  name: "ISS Fine Water Mist suppression (heat extraction / dilution mechanisms)",
  model_class: "mechanistic-physical",
  phenomenon: ["suppression", "extinction"],
  intended_applications: ["Explaining water-mist suppression mechanisms for spacecraft firefighting", "Qualitative suppression-system assessment (agent transport, heat extraction, dilution)"],
  description: "Mechanistic suppression model family for fine water mist: droplet evaporation heat extraction, oxygen dilution by steam, and radiative blocking, with microgravity transport differences (no buoyant delivery; mist travels by momentum only). DOCUMENTED ONLY: the AIAA/ESA sources document the ISS FWM system development and tests; no suppression solver is implemented here. Quantitative suppression-effectiveness ranking is refused by design (tests are not condition-matched).",
  physical_principles: ["Droplet evaporation heat absorption (L_v sink)", "Steam dilution of O2", "Radiative blocking by mist", "Momentum-only mist transport in µg"],
  governing_equations: ["droplet evaporation energy balance (q = m_dot*L_v)", "O2 dilution by steam", "extinction criterion via dilution/cooling (no closed form registered here)"],
  related_equation_ids: [],
  required_variables: ["mist droplet size distribution", "loading", "fire size/geometry", "compartment ventilation"],
  input_schema: null, output_variables: ["qualitative suppression assessment", "extinction-time reference (from sources)"],
  units: { time: "s" },
  assumptions: ["Spherical droplets, no coalescence (idealised)", "Source-specific test geometries"],
  initial_conditions: null, boundary_conditions: null, material_properties: ["water properties"],
  environmental_domain: { gravity: "µg (ISS) — transport differs fundamentally from 1g sprays" },
  applicability_limits: { note: "No suppressant ranking is offered (tests not condition-matched — see suppressant gap)", earth_transfer: "FWM spin-off to terrestrial firefighting documented in sources" },
  solution_method: "documented (mechanisms; no solver here)",
  solver_details: null,
  source_references: [{ source: "20130011664.pdf (AIAA — Development of the ISS Fine Water Mist extinguisher)", type: "primary-literature" }, { source: "2012ESASP.699E..41B.pdf (ESA — FWM test programme)", type: "primary-literature" }],
  experimental_validation: { status: "documented_in_sources", note: "source test programmes carry their own validation" },
  calibration_information: null, uncertainty_information: null,
  computational_requirements: { runtime: null, environment: null },
  implementation_status: "DOCUMENTED_ONLY",
  verification_status: "not_verified (no implementation)",
  validation_status: "documented_in_sources",
  limitations: ["No solver in ZERO FLARE", "No suppressant ranking", "Agent transport needs ventilation field"],
  model_version: "1.0",
  environments: envComp({ earth: "qualitative", iss: "direct", moon: "qualitative", mars: "qualitative", spacecraft: "qualitative", spacesuit: "not-applicable" }),
  phenomenon_tags: ["suppression", "extinction"],
  executable: false,
  kb_citations: requireCitations("water mist", 3),
});

// ---------------- integrity pass ----------------
for (const m of models) {
  for (const eqId of m.related_equation_ids ?? []) {
    if (!equationIds.has(eqId)) throw new Error(`model ${m.model_id}: equation id "${eqId}" not in registry`);
  }
}

const registry = {
  registry_version: "1.0",
  generatedAt: new Date().toISOString(),
  purpose: "Mathematical Model Registry (17A.4): structured representations of physical systems, distinct from — and linked to — the 63-equation registry. Lifecycle statuses distinguish documented-only references from executable, verified and validated models.",
  classification_notes: "model_class values: analytical-theoretical | semi-empirical | mechanistic-physical | numerical-simulation | machine-learning. Equations ≠ models: a model composes governing equations + assumptions + conditions + closure.",
  environment_profiles: atmos.environments.map((e) => ({ id: e.id, label: e.label, gravityG: e.gravityG, o2Fraction: e.o2Fraction, note: e.note ?? null, habitat_vs_exterior: e.id === "moon" || e.id === "mars" ? "PROFILE = pressurised inhabited habitat; the exterior lunar/Martian surface has no breathable oxidiser atmosphere and is NOT a combustion environment for these models" : null })),
  ranking_policy: "Candidate ranking uses documented policy tiers, no invented probabilities: (1) environment compatibility (direct > modified > qualitative; not-applicable excluded), (2) validation tier (EXPERIMENTALLY_VALIDATED > PARTIALLY_VALIDATED > CODE_VERIFIED > DOCUMENTED_ONLY), (3) output/phenomenon match, (4) executable before documented. Full breakdown shown per selection.",
  models,
  stats: {
    total: models.length,
    implemented: models.filter((m) => m.implementation_status === "IMPLEMENTED").length,
    code_verified: models.filter((m) => (m.verification_status ?? "").startsWith("CODE_VERIFIED")).length,
    experimentally_validated: models.filter((m) => (m.validation_status ?? "").startsWith("EXPERIMENTALLY_VALIDATED")).length,
    partially_validated: models.filter((m) => (m.validation_status ?? "").startsWith("PARTIALLY_VALIDATED")).length,
    documented_only: models.filter((m) => m.implementation_status === "DOCUMENTED_ONLY").length,
    machine_learning: models.filter((m) => m.model_class === "machine-learning").length,
    executable: models.filter((m) => m.executable).length,
  },
  cross_references: {
    equation_registry: "src/lib/science/equations.ts (63 equations, 68/68 tests)",
    model_cards: ["models/flex-extinction/v2/model_card.json", "models/cfig-hot-ignition/v1/model_card.json"],
    validation_evidence: ["data/validation/d2law_validation.json"],
    knowledge_graph_note: "MODEL_* relationships are carried in this registry (related_equation_ids, environments, phenomenon_tags); knowledge-graph node/edge extension is a documented follow-up (typeColors are data-driven in the viewer).",
  },
};

const OUT = path.join(ROOT, "src", "data", "generated", "mathematical_models.json");
writeFileSync(OUT, JSON.stringify(registry, null, 1), "utf8");
JSON.parse(readFileSync(OUT, "utf8"));
console.log(`registry written: ${OUT}`);
console.log(`models: ${models.length} | implemented: ${registry.stats.implemented} | code-verified: ${registry.stats.code_verified} | exp-validated: ${registry.stats.experimentally_validated} | partially-validated: ${registry.stats.partially_validated} | documented-only: ${registry.stats.documented_only} | ML: ${registry.stats.machine_learning}`);
