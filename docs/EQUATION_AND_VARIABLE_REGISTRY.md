# EQUATION AND VARIABLE REGISTRY — ZERO FLARE (M12)

## Equation registry: 63 equations, 68/68 reference tests pass

Canonical schema (from ORIGINAL_MAIN): every equation carries id, statement, summary, variables (key/label/symbol/unit/dimension/bounds), output unit+label, deterministic `calculate`, assumptions, source, and reference tests with tolerances. `runCalculation` refuses missing/invalid inputs — never guesses.

### Categories (12)
gas-and-mixture-laws · stoichiometry-and-equivalence · combustion-chemistry-and-kinetics · heat-transfer · ignition-and-pyrolysis · flame-spread-and-propagation · droplet-combustion-and-extinction · aerosol-and-particle-science · sensor-response-and-statistics · cfd-governing-numbers · uncertainty-and-sampling · doe-sensitivity-and-ml

### Merged additions (12 equations ported from THIRD_PRESENTATION into the canonical schema, each with test vectors)

| id | statement | source |
|---|---|---|
| richardson-number | Ri = g·β·ΔT·L / U² | White, Viscous Fluid Flow |
| nusselt-sphere | Nu = 2 + 0.6·Re^½·Pr^⅓ | Ranz & Marshall (1952) |
| thermal-effusivity | e = √(k·ρ·cₚ) | Torero / NASA flammability literature |
| schmidt-number | Sc = ν / D | Bird, Stewart & Lightfoot |
| knudsen-number | Kn = λ / L | rarefied-gas definition |
| brownian-diffusivity | D = k_B·T / (3π·μ·dₚ) | Stokes–Einstein (Hinds) |
| stokes-number | Stk = τₚ·U / L | aerosol mechanics |
| optical-extinction | I/I₀ = e^(−K·L) | Beer–Lambert |
| mae / rmse / f1-score / fpr | validation metrics | standard definitions |

Verification: `GET /api/selftest` → `63 equations · 68/68 tests pass` (also `runEquationTests()` directly).

### Intent-based selection
CIR-1 `search_equations` (natural-language over the registry) + `calculate_equation` (deterministic) + command palette (Ctrl+K) + per-investigation equation tabs. Alternatives are listed when multiple formulations match; out-of-domain inputs are refused with reasons.

## Variable dictionary

- `search_variables` tool enumerates canonical columns across all recovered tables (24 in the current merged build) with units parsed from NASA source headers, fill rates, min/max/mean.
- Fuels: 9-fuel property library (NIST-sourced: MW, LHV, latent heat, stoichiometric O₂, boiling point) pre-fills calculators; changing fuel prefills inputs only — historical data never modified.
- Atmospheres: 6 environments with gravity/pressure/O₂ + evidence status (flight-proven vs concept), recomputed pO₂ via the `p-o2-kpa` registry equation.
- Materials: screening library maps evidence classes to corpus accessions (BASS/SAFFIRE solid fuels, PMMA-class, Nomex-class, wiring, batteries flagged out-of-corpus).

## Numeric input contract (implemented)

Every calculator input: paired slider + numeric field (two-way synchronized), unit label, physical bounds, step, reset, validation messages; only mathematically dependent outputs recompute.
