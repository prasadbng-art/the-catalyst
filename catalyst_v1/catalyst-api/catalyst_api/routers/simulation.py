from fastapi import APIRouter
import pandas as pd
from pathlib import Path

from catalyst_api.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
)
from catalyst_api.engines.kpi_engine import compute_baseline

router = APIRouter()

# --------------------------------------------------
# Load demo data (explicit, same as baseline)
# --------------------------------------------------

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)


@router.post(
    "/intelligence/simulate",
    response_model=SimulationResponse,
)
def simulate(request: SimulationRequest):
    # --------------------------------------------------
    # 1. Compute baseline KPIs
    # --------------------------------------------------

    baseline_kpis = compute_baseline(df)

    # --------------------------------------------------
    # 2. Fixed demo assumptions
    # --------------------------------------------------

    headcount = int(df.shape[0])
    cost_per_exit = 1_500_000  # demo constant

    # --------------------------------------------------
    # 3. Run simulation math INLINE (simple + stable)
    # --------------------------------------------------

    baseline_risk_pct = baseline_kpis.attrition_risk.value
    baseline_cost = baseline_kpis.annual_attrition_cost_exposure.value

    risk_reduction_pct = request.risk_reduction_pct
    simulated_risk_pct = baseline_risk_pct * (1 - risk_reduction_pct / 100)

    simulated_cost = baseline_cost * (simulated_risk_pct / baseline_risk_pct)
    avoided_cost = baseline_cost - simulated_cost

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
    # 4. Return decision-grade response
    # --------------------------------------------------

    return SimulationResponse(
        baseline_cost=round(baseline_cost, 0),
        simulated_cost=round(simulated_cost, 0),
        avoided_cost=round(avoided_cost, 0),
        risk_reduction_pct=risk_reduction_pct,
        simulated_kpis=simulated_kpis,
        diagnostics={},  # Phase I: reuse baseline diagnostics on frontend
    )
