from fastapi import APIRouter, Query
import pandas as pd
from pathlib import Path

from catalyst_api.engines.kpi_engine import compute_baseline
from catalyst_api.advisory.persona_engine import generate_persona_insight
from catalyst_api.schemas.persona import PersonaResponse

router = APIRouter()

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "workforce_demo.csv"
df = pd.read_csv(DATA_PATH)

@router.get("/intelligence/persona", response_model=PersonaResponse)
def persona_view(persona: str = Query(..., enum=["CEO", "CHRO", "BU_HEAD"])):
    baseline = compute_baseline(df)

    insight = generate_persona_insight(
        persona=persona,
        baseline=baseline,
        simulation=None,
    )

    return {
        "persona": persona,
        **insight,
    }
