"""
scenario_state_reader.py
------------------------
Read-only helpers to detect active scenario state
from Context v1 effective context.
"""

from typing import Optional, Dict, Any


def get_active_scenario(context: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """
    Returns active scenario metadata if present, else None.
    Never mutates context.
    """

    # Preferred: explicit override metadata
    overrides = context.get("overrides", [])
    for o in overrides:
        if o.get("type") == "scenario":
            return {
                "id": o.get("id"),
                "label": o.get("label", o.get("id")),
                "actor": o.get("actor"),
            }

    # Fallback: scenario marker (defensive)
    scenario = context.get("meta", {}).get("active_scenario")
    if scenario:
        return scenario

    return None
