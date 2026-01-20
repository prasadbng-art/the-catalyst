from enum import Enum
from pydantic import BaseModel

class PersonaResponse(BaseModel):
    persona: str
    headline: str
    insight: str
    focus: str | None
