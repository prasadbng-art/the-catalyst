"""
scenario_simulation_engine.py
-----------------------------
Non-mutating scenario simulation utilities.
"""

from copy import deepcopy
from typing import Dict, Any

from scenario_v09 import get_scenario_overrides


def simulate_scenario(
    base_context: Dict[str, Any],
    scenario_id: str,
) -> Dict[str, Any]:
    """
    Returns a simulated context with scenario overrides applied.
    DOES NOT mutate base_context.
    """

    simulated = deepcopy(base_context)
    overrides = get_scenario_overrides(scenario_id)

    if not overrides:
        return simulated

    _apply_overrides(simulated, overrides)
    return simulated


def _apply_overrides(target: Dict[str, Any], overrides: Dict[str, Any]) -> None:
    """
    Shallow recursive merge.
    This mirrors Context v1 semantics, but locally.
    """
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            _apply_overrides(target[key], value)
        else:
            target[key] = value
