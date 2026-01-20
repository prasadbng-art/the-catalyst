from enum import Enum

class Persona(str, Enum):
    CEO = "CEO"
    CHRO = "CHRO"
    CFO = "CFO"
    BU_HEAD = "BU_HEAD"
