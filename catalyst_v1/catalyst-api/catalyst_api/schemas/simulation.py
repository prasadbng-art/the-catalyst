from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


# ============================================================
# Request
# ============================================================

class SimulationRequest(BaseModel):
    risk_reduction_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Expected percentage reduction in attrition risk",
        example=25,
    )

    intervention_cost: float = Field(
        ...,
        ge=0,
        description="Estimated annual cost of the intervention",
        example=120000,
    )


# ============================================================
# CFO Impact
# ============================================================

class CFOImpact(BaseModel):
    intervention_cost: float
    cost_avoided: float
    net_roi: float
    roi_multiple: Optional[float]


# ============================================================
# Confidence Band
# ============================================================

class ConfidenceBand(BaseModel):
    low: float
    high: float
    confidence_level: float = Field(
        ...,
        description="Confidence level for the estimated range",
        example=0.8,
    )


# ============================================================
# Response
# ============================================================

class SimulationResponse(BaseModel):
    baseline_cost: float
    simulated_cost: float
    avoided_cost: float
    risk_reduction_pct: float

    cfo_impact: CFOImpact
    confidence: ConfidenceBand

    simulated_kpis: Dict[str, Any]
    diagnostics: Dict[str, Any]
