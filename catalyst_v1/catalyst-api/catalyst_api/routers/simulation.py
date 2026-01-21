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

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)


@router.post(
    "/intelligence/simulate",
    response_model=SimulationResponse,
)
def simulate(request: SimulationRequest):
    # 1. Baseline KPIs
    baseline_kpis = compute_baseline(df)

    # 2. Fixed demo assumptions
    headcount = int(df.shape[0])
    cost_per_exit = 1_500_000  # demo constant

    # 3. Run simulation engine
    result = run_simulation(
        baseline_kpis=baseline_kpis,
        levers={"risk_reduction_pct": request.risk_reduction_pct},
        headcount=headcount,
        cost_per_exit=cost_per_exit,
    )

    # 4. Explicitly construct response (CRITICAL)
    return SimulationResponse(
        baseline_cost=result["baseline_cost"],
        simulated_cost=result["simulated_cost"],
        avoided_cost=result["avoided_cost"],
        risk_reduction_pct=request.risk_reduction_pct,
        simulated_kpis=result["simulated_kpis"],
        diagnostics=result["diagnostics"],
    )
