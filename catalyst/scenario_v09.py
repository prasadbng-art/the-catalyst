"""
scenario_v09.py — Phase B Refactor
---------------------------------
This module defines scenario specifications as pure override emitters.

Rules:
- NO context access
- NO mutation
- NO Streamlit
- NO KPI logic
- Data-only overrides

Consumed by:
- scenario application boundary (adapter / engine)
"""

from copy import deepcopy
from typing import Dict, Optional


# -------------------------------------------------------------------
# Scenario Registry
# -------------------------------------------------------------------

SCENARIOS: Dict[str, Dict] = {
    "attrition_spike": {
        "id": "attrition_spike",
        "label": "Attrition Spike (+25%)",
        "description": "Simulates a sudden increase in employee attrition.",
        "overrides": {
            "workforce": {
                "attrition_rate_multiplier": 1.25
            }
        },
        "meta": {
            "scope": ["attrition"],
            "reversible": True
        }
    },

    "sentiment_drop": {
        "id": "sentiment_drop",
        "label": "Sentiment Drop (-15%)",
        "description": "Models a decline in overall employee sentiment.",
        "overrides": {
            "sentiment": {
                "engagement_index_delta": -0.15
            }
        },
        "meta": {
            "scope": ["sentiment"],
            "reversible": True
        }
    },

    "manager_effectiveness_decline": {
        "id": "manager_effectiveness_decline",
        "label": "Manager Effectiveness Decline",
        "description": "Simulates reduced manager effectiveness across teams.",
        "overrides": {
            "manager_effectiveness": {
                "effectiveness_score_delta": -0.20
            }
        },
        "meta": {
            "scope": ["manager_effectiveness"],
            "reversible": True
        }
    }
}


# -------------------------------------------------------------------
# Public Accessors (Pure)
# -------------------------------------------------------------------

def list_scenarios() -> Dict[str, Dict]:
    """
    Returns the full scenario registry (read-only copy).
    """
    return deepcopy(SCENARIOS)


def get_scenario_definition(scenario_id: str) -> Optional[Dict]:
    """
    Returns the full scenario definition for a given scenario_id.
    """
    scenario = SCENARIOS.get(scenario_id)
    return deepcopy(scenario) if scenario else None


def get_scenario_overrides(scenario_id: str) -> Dict:
    """
    Returns ONLY the override payload for a scenario.
    Safe default: empty dict.
    """
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        return {}
    return deepcopy(scenario.get("overrides", {}))
