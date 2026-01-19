from pydantic import BaseModel
from typing import List
from .common import KPIValue

class BaselineKPIs(BaseModel):
    attrition_risk: KPIValue
    headcount: KPIValue
    annual_attrition_cost_exposure: KPIValue

class LocationDiagnostic(BaseModel):
    location: str
    headcount: int
    recent_attrition_pct: float
    avg_attrition_risk_pct: float

class Diagnostics(BaseModel):
    by_location: List[LocationDiagnostic]

class BaselineResponse(BaseModel):
    kpis: BaselineKPIs
    diagnostics: Diagnostics
