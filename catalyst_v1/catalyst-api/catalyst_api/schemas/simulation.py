from pydantic import BaseModel
from typing import Optional


class ROIImpact(BaseModel):
    intervention_cost: float
    savings: float
    net_roi: float
    roi_ratio: float


class SimulationResponse(BaseModel):
    scenario: str
    roi: ROIImpact
    confidence: Optional[float] = None
