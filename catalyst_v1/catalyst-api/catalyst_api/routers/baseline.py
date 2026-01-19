import pandas as pd
from pathlib import Path

from catalyst_api.engines.kpi_engine import (
    compute_baseline,
    compute_diagnostics,
)
from catalyst_api.schemas.baseline import BaselineResponse

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)
router = APIRouter()

@router.get("/intelligence/baseline", response_model=BaselineResponse)
def get_baseline():
    df = pd.read_csv("data/workforce_demo.csv")

    return BaselineResponse(
        kpis=compute_baseline(df),
        diagnostics=compute_diagnostics(df),
    )