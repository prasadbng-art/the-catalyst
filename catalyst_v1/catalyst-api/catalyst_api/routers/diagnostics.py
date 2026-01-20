from fastapi import APIRouter
import pandas as pd
from pathlib import Path

from catalyst_api.engines.kpi_engine import compute_diagnostics
from catalyst_api.schemas.baseline import Diagnostics

router = APIRouter()

# Single canonical data load
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)

@router.get(
    "/intelligence/diagnostics",
    response_model=Diagnostics,
    summary="Workforce diagnostics by location"
)
def get_diagnostics():
    return compute_diagnostics(df)
