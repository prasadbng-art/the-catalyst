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

@router.post("/intelligence/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    baseline_kpis = compute_baseline(df)

    headcount = int(df.shape[0])
    cost_per_exit = 1_500_000  # v1 assumption (₹ or $ — label later)

    return run_simulation(
        baseline_kpis=baseline_kpis,
        levers=request.dict(),
        headcount=headcount,
        cost_per_exit=cost_per_exit,
    )
