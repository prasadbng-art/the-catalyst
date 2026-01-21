from pydantic import BaseModel, Field
from typing import Dict, Any


# ============================================================
# Simulation Request
# ============================================================

class SimulationRequest(BaseModel):
    risk_reduction_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Expected percentage reduction in attrition risk due to intervention",
        example=25,
    )


# ============================================================
# Simulation Response
# ============================================================

class SimulationResponse(BaseModel):
    baseline_cost: float = Field(
        ...,
        description="Estimated annual attrition cost under baseline conditions",
        example=1940,
    )

    simulated_cost: float = Field(
        ...,
        description="Estimated annual attrition cost after applying risk reduction",
        example=1455,
    )

    avoided_cost: float = Field(
        ...,
        description="Annual cost avoided due to the simulated intervention",
        example=485,
    )

    risk_reduction_pct: float = Field(
        ...,
        description="Applied attrition risk reduction percentage",
        example=25,
    )

    simulated_kpis: Dict[str, Any] = Field(
        ...,
        description="KPI values after applying the simulation scenario",
    )

    diagnostics: Dict[str, Any] = Field(
        ...,
        description="Diagnostic breakdown (e.g., by location) under simulated conditions",
    )
