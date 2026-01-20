from fastapi import APIRouter
import pandas as pd
from pathlib import Path

from catalyst_api.engines.kpi_engine import (
    compute_baseline,
    compute_diagnostics,
)
from catalyst_api.schemas.baseline import BaselineResponse

router = APIRouter()

# ✅ Single, canonical data load (module-level)
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)


@router.get("/intelligence/baseline", response_model=BaselineResponse)
def get_baseline():
    return BaselineResponse(
        kpis=compute_baseline(df),
        diagnostics=compute_diagnostics(df),
    )
    