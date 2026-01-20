from pydantic import BaseModel
from typing import Optional


# ---------- Request ----------

class SimulationRequest(BaseModel):
    persona: str
    intervention_cost: float
    scenario: Optional[str] = "default"


# ---------- ROI ----------

class ROIImpact(BaseModel):
    intervention_cost: float
    savings: float
    net_roi: float
    roi_ratio: float


# ---------- Response ----------

class SimulationResponse(BaseModel):
    scenario: str
    roi: ROIImpact
    confidence: Optional[float] = None
