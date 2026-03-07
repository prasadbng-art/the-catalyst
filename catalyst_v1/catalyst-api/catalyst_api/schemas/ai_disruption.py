from pydantic import BaseModel
from typing import Dict


class AIDisruptionRequest(BaseModel):
    roles: Dict[str, int]
    diagnostic: Dict[str, float]