from fastapi import APIRouter
import pandas as pd
from pathlib import Path

from catalyst_api.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    CFOImpact,
    ConfidenceBand,
)
from catalyst_api.engines.kpi_engine import compute_baseline

router = APIRouter()

# --------------------------------------------------
# Load demo data
# --------------------------------------------------

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)


@router.post(
    "/intelligence/simulate",
    response_model=SimulationResponse,
)
def simulate(request: SimulationRequest):
    # --------------------------------------------------
    # 1. Baseline KPIs
    # --------------------------------------------------

    baseline_kpis = compute_baseline(df)

    baseline_risk_pct = baseline_kpis.attrition_risk.value
    baseline_cost = baseline_kpis.annual_attrition_cost_exposure.value

    # --------------------------------------------------
    # 2. Apply simulation lever
    # --------------------------------------------------

    risk_reduction_pct = request.risk_reduction_pct
    simulated_risk_pct = baseline_risk_pct * (1 - risk_reduction_pct / 100)

    simulated_cost = baseline_cost * (simulated_risk_pct / baseline_risk_pct)
    avoided_cost = baseline_cost - simulated_cost

    # --------------------------------------------------
    # 3. CFO impact calculations
    # --------------------------------------------------

    intervention_cost = request.intervention_cost
    net_roi = avoided_cost - intervention_cost

    roi_multiple = (
        round(avoided_cost / intervention_cost, 2)
        if intervention_cost > 0
        else None
    )

    cfo_impact = CFOImpact(
        intervention_cost=round(intervention_cost, 0),
        cost_avoided=round(avoided_cost, 0),
        net_roi=round(net_roi, 0),
        roi_multiple=roi_multiple,
    )

    # --------------------------------------------------
    # 4. Confidence band (demo-safe, explainable)
    # --------------------------------------------------

    confidence = ConfidenceBand(
        low=round(avoided_cost * 0.7, 0),
        high=round(avoided_cost * 1.15, 0),
        confidence_level=0.8,
    )

    # --------------------------------------------------
    # 5. Simulated KPIs (for overlay use)
    # --------------------------------------------------

    simulated_kpis = {
        "attrition_risk": {
            "value": round(simulated_risk_pct, 2),
            "unit": "%",
            "description": "Simulated attrition risk after intervention",
        },
        "annual_attrition_cost_exposure": {
            "value": round(simulated_cost, 0),
            "unit": "USD",
            "description": "Simulated annual attrition cost exposure",
        },
    }

    # --------------------------------------------------
    # 6. Assemble response
    # --------------------------------------------------

    return SimulationResponse(
        baseline_cost=round(baseline_cost, 0),
        simulated_cost=round(simulated_cost, 0),
        avoided_cost=round(avoided_cost, 0),
        risk_reduction_pct=risk_reduction_pct,
        cfo_impact=cfo_impact,
        confidence=confidence,
        simulated_kpis=simulated_kpis,
        diagnostics={},  # Phase I: reuse baseline diagnostics in UI
    )
