from fastapi import APIRouter
import pandas as pd
from pathlib import Path

from catalyst_api.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
)
from catalyst_api.engines.kpi_engine import compute_baseline
from catalyst_api.engines.simulation_engine import run_simulation

router = APIRouter()

# ---------------------------------------------------------------------
# Data loading (demo-only, deterministic)
# ---------------------------------------------------------------------
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)


@router.post(
    "/intelligence/simulate",
    response_model=SimulationResponse,
)
def simulate(request: SimulationRequest):
    """
    Run a what-if workforce simulation and return
    decision-ready impact metrics for demo purposes.
    """

    # -----------------------------------------------------------------
    # 1. Compute baseline KPIs (authoritative reference)
    # -----------------------------------------------------------------
    baseline_kpis = compute_baseline(df)

    baseline_cost = baseline_kpis["annual_attrition_cost_exposure"]["value"]

    # -----------------------------------------------------------------
    # 2. Demo assumptions (explicit, explainable)
    # -----------------------------------------------------------------
    headcount = int(df.shape[0])
    cost_per_exit = 1_500_000  # demo assumption (currency-agnostic for now)

    # -----------------------------------------------------------------
    # 3. Run simulation engine (no ROI logic inside engine)
    # -----------------------------------------------------------------
    simulation_result = run_simulation(
        baseline_kpis=baseline_kpis,
        levers=request.dict(),
        headcount=headcount,
        cost_per_exit=cost_per_exit,
    )

    # -----------------------------------------------------------------
    # 4. Intelligence layer (THIS is the differentiation)
    # -----------------------------------------------------------------
    risk_reduction_pct = request.risk_reduction_pct / 100

    simulated_cost = baseline_cost * (1 - risk_reduction_pct)
    avoided_cost = baseline_cost - simulated_cost

    # -----------------------------------------------------------------
    # 5. Return decision-ready response (not raw math)
    # -----------------------------------------------------------------
    return {
        "baseline_cost": round(baseline_cost, 0),
        "simulated_cost": round(simulated_cost, 0),
        "avoided_cost": round(avoided_cost, 0),
        "risk_reduction_pct": request.risk_reduction_pct,

        # Preserve existing simulation outputs for transparency
        "simulated_kpis": simulation_result.get("kpis"),
        "diagnostics": simulation_result.get("diagnostics"),
    }
