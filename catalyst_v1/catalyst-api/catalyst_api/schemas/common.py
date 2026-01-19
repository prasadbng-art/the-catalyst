from pydantic import BaseModel
from typing import Optional

class KPIValue(BaseModel):
    value: float
    unit: str
    description: Optional[str] = None
