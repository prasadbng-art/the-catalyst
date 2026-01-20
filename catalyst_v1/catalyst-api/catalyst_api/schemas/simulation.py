from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    attrition_risk_reduction_pct: float = Field(..., ge=0, le=100)
    engagement_uplift_points: float = Field(..., ge=0)
    manager_effectiveness_uplift_points: float = Field(..., ge=0)

intervention_cost: float = Field(
        default=5_000_000,
        ge=0,
        description="Annual cost of proposed intervention"
    )

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
    roi: ROIImpact

class ROIImpact(BaseModel):
    intervention_cost: float
    cost_avoided: float
    roi_multiple: float | None
    net_benefit: float
    payback_period_months: float | None

