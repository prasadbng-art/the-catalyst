from pydantic import BaseModel, Field
from typing import Literal, Dict


# ============================================================
# Request
# ============================================================

class CatalystSimulationRequest(BaseModel):
    workforce_size: int = Field(..., gt=0)
    avg_cost_per_employee: float = Field(..., gt=0)

    revenue_base: float = Field(..., gt=0)
    margin_base: float = Field(..., ge=0, le=1)

    ai_exposure: float = Field(..., ge=0, le=1)
    leadership_readiness: float = Field(..., ge=0, le=1)
    margin_buffer: float = Field(..., ge=0, le=1)
    capital_buffer: float = Field(..., ge=0, le=1)

    governance_mode: Literal["DEFENSIVE", "BALANCED", "AGGRESSIVE"]

    simulation_context: Literal["DEMO", "PRODUCTION"] = "DEMO"


# ============================================================
# Response Models
# ============================================================

class AnchorPoints(BaseModel):
    peak_psi_quarter: int
    capital_trough_quarter: int
    cost_stabilization_quarter: int


class FinancialBand(BaseModel):
    mean: float
    p10: float
    p90: float
    p2_5: float
    p97_5: float


class CatalystSimulationResponse(BaseModel):
    anchors: AnchorPoints

    margin_band: FinancialBand
    ebitda_band: FinancialBand

    peak_psi_band: FinancialBand
    capital_trough_band: FinancialBand

    steady_state_workforce: int