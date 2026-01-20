from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    attrition_risk_reduction_pct: float = Field(..., ge=0, le=100)
    engagement_uplift_points: float = Field(..., ge=0)
    manager_effectiveness_uplift_points: float = Field(..., ge=0)


class SimulationBaseline(BaseModel):
    attrition_risk: float
    annual_attrition_cost: float


class SimulationImpact(BaseModel):
    cost_avoided: float
    risk_reduction_points: float


class SimulationResponse(BaseModel):
    baseline: SimulationBaseline
    simulated: SimulationBaseline
    impact: SimulationImpact
