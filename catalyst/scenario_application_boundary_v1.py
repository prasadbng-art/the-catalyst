"""
scenario_application_boundary_v1.py
-----------------------------------
Canonical boundary for applying and clearing scenario overrides
against Context v1.

This version matches the actual Context v1 API
(no manager object required).
"""

from catalyst.context_manager_v1 import apply_override, remove_override
from scenario_v09 import get_scenario_overrides


def apply_scenario(
    scenario_id: str,
    actor: str = "scenario_engine_v1",
) -> None:
    """
    Apply a scenario as a Context v1 override.
    """

    # Clear existing scenario override first
    clear_scenario(actor=actor)

    overrides = get_scenario_overrides(scenario_id)
    if not overrides:
        return

    apply_override(
        override_id=f"scenario_{scenario_id}",
        override_type="scenario",
        payload=overrides,
        actor=actor,
    )


def clear_scenario(
    actor: str = "scenario_engine_v1",
) -> None:
    """
    Remove any active scenario override.
    """

    remove_override(
        override_type="scenario",
        actor=actor,
    )
