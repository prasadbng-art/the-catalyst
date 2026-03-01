import math
from catalyst_api.schemas.catalyst_simulation import (
    CatalystSimulationRequest,
    CatalystSimulationResponse,
    AnchorPoints,
    FinancialBand,
)


# ------------------------------------------------------------
# Utility: Logistic Stress Function
# ------------------------------------------------------------

def logistic(x: float, k: float = 6.0):
    return 1 / (1 + math.exp(-k * (x - 1)))


# ------------------------------------------------------------
# Deterministic Catalyst Engine (Phase 1)
# ------------------------------------------------------------

def run_catalyst_simulation(request: CatalystSimulationRequest, config):

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

    psi_peak = logistic(load / max(capacity, 0.01))

    # ----------------------------------------
    # Capital Stress (Trough Proxy)
    # ----------------------------------------

    capital_ratio = exposure / max(request.capital_buffer, 0.01)
    capital_trough = 1 - logistic(capital_ratio)

    # ----------------------------------------
    # Financial Impact
    # ----------------------------------------

    savings = workforce_reduction * request.avg_cost_per_employee
    productivity_lift = request.revenue_base * (exposure * 0.05)

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