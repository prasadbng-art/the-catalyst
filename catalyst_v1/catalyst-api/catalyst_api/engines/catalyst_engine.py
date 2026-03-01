from catalyst_api.schemas.catalyst_simulation import (
    CatalystSimulationRequest,
    CatalystSimulationResponse,
    AnchorPoints,
    FinancialBand,
)


def run_catalyst_simulation(request: CatalystSimulationRequest, config):

    # Placeholder deterministic output (we will replace with real engine next)

    anchors = AnchorPoints(
        peak_psi_quarter=3,
        capital_trough_quarter=2,
        cost_stabilization_quarter=4,
    )

    dummy_band = FinancialBand(
        mean=0.034,
        p10=0.028,
        p90=0.041,
        p2_5=0.021,
        p97_5=0.052,
    )

    return CatalystSimulationResponse(
        anchors=anchors,
        margin_band=dummy_band,
        ebitda_band=dummy_band,
        peak_psi_band=dummy_band,
        capital_trough_band=dummy_band,
        steady_state_workforce=int(request.workforce_size * 0.85),
    )