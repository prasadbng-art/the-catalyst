import numpy as np
import math
from catalyst_api.schemas.catalyst_simulation import (
    CatalystSimulationRequest,
    CatalystSimulationResponse,
    AnchorPoints,
    FinancialBand,
)
# ------------------------------------------------------------
# Governance Mode Multipliers
# ------------------------------------------------------------

MODE_CONFIG = {
    "DEFENSIVE": {
        "displacement": 0.7,
        "stress": 0.8,
        "capital": 0.8,
    },
    "BALANCED": {
        "displacement": 1.0,
        "stress": 1.0,
        "capital": 1.0,
    },
    "AGGRESSIVE": {
        "displacement": 1.4,
        "stress": 1.3,
        "capital": 1.3,
    },
}

# ------------------------------------------------------------
# Utility: Logistic Stress Function
# ------------------------------------------------------------

def logistic(x: float, k: float = 6.0):
    return 1 / (1 + math.exp(-k * (x - 1)))


# ------------------------------------------------------------
# Deterministic Catalyst Engine (Phase 1)
# ------------------------------------------------------------

def run_single_scenario(request: CatalystSimulationRequest):
    mode = MODE_CONFIG[request.governance_mode]

    # ----------------------------------------
    # Workforce Glidepath (Deterministic)
    # ----------------------------------------

    exposure = request.ai_exposure
    workforce_reduction = request.workforce_size * exposure
    steady_state_workforce = int(request.workforce_size - workforce_reduction)

    # ----------------------------------------
    # People Stress (PSI)
    # ----------------------------------------

    load = exposure + (1 - request.leadership_readiness)
    capacity = request.leadership_readiness
    base_psi = logistic(load / max(capacity, 0.01))
    psi_peak = base_psi * mode["stress"]
    psi_peak = min(psi_peak, 1.0)

    # ----------------------------------------
    # Capital Stress (Trough Proxy)
    # ----------------------------------------

    capital_ratio = exposure / max(request.capital_buffer, 0.01)
    base_capital = 1 - logistic(capital_ratio)
    capital_trough = base_capital * mode["capital"]
    capital_trough = min(capital_trough, 1.0)

    # ----------------------------------------
    # Financial Impact
    # ----------------------------------------

    savings = workforce_reduction * request.avg_cost_per_employee
    productivity_lift = request.revenue_base * (exposure * 0.05 * mode["displacement"])

    net_impact = savings + productivity_lift
    margin_delta = net_impact / request.revenue_base

    # ----------------------------------------
    # Anchor Quarters (Simple Fixed Logic for Phase 1)
    # ----------------------------------------

    anchors = AnchorPoints(
        peak_psi_quarter=3,
        capital_trough_quarter=2,
        cost_stabilization_quarter=4,
    )

    # ----------------------------------------
    # Wrap Deterministic Values as Narrow Bands
    # (Temporary until Monte Carlo added)
    # ----------------------------------------

    def make_band(value: float):
        return FinancialBand(
            mean=value,
            p10=value * 0.95,
            p90=value * 1.05,
            p2_5=value * 0.90,
            p97_5=value * 1.10,
        )

    return CatalystSimulationResponse(
        anchors=anchors,
        margin_band=make_band(margin_delta),
        ebitda_band=make_band(net_impact),
        peak_psi_band=make_band(psi_peak),
        capital_trough_band=make_band(capital_trough),
        steady_state_workforce=steady_state_workforce,
    )

def run_catalyst_simulation(request: CatalystSimulationRequest, config):

    iterations = config.iterations

    margin_results = []
    ebitda_results = []
    psi_results = []
    capital_results = []
    workforce_results = []

    for _ in range(iterations):

        # -------------------------------
        # Inject Controlled Variance
        # -------------------------------

        exposure_variation = np.random.normal(1.0, 0.08)
        leadership_variation = np.random.normal(1.0, 0.05)
        capital_variation = np.random.normal(1.0, 0.06)

        varied_request = request.copy()

        varied_request.ai_exposure = min(
            max(request.ai_exposure * exposure_variation, 0), 1
        )

        varied_request.leadership_readiness = min(
            max(request.leadership_readiness * leadership_variation, 0.01), 1
        )

        varied_request.capital_buffer = min(
            max(request.capital_buffer * capital_variation, 0.01), 1
        )

        # -------------------------------
        # Run Deterministic Scenario
        # -------------------------------

        result = run_single_scenario(varied_request)

        margin_results.append(result.margin_band.mean)
        ebitda_results.append(result.ebitda_band.mean)
        psi_results.append(result.peak_psi_band.mean)
        capital_results.append(result.capital_trough_band.mean)
        workforce_results.append(result.steady_state_workforce)

    # ---------------------------------------
    # Aggregate Percentiles
    # ---------------------------------------

    def build_band(values):
        return {
            "mean": float(np.mean(values)),
            "p10": float(np.percentile(values, 10)),
            "p90": float(np.percentile(values, 90)),
            "p2_5": float(np.percentile(values, 2.5)),
            "p97_5": float(np.percentile(values, 97.5)),
        }

    anchors = result.anchors  # deterministic anchor logic for now

    from catalyst_api.schemas.catalyst_simulation import (
        CatalystSimulationResponse,
        FinancialBand,
    )

    return CatalystSimulationResponse(
        anchors=anchors,
        margin_band=FinancialBand(**build_band(margin_results)),
        ebitda_band=FinancialBand(**build_band(ebitda_results)),
        peak_psi_band=FinancialBand(**build_band(psi_results)),
        capital_trough_band=FinancialBand(**build_band(capital_results)),
        steady_state_workforce=int(np.mean(workforce_results)),
    )