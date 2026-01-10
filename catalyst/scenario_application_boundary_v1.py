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
from catalyst.context_manager_v1 import get_effective_context, remove_override

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

    def apply_scenario(scenario_id: str, actor: str = "scenario_engine_v1") -> None:
        """Apply a scenario as a Context v1 override."""

    # Always clear existing scenario first
    clear_scenario(actor=actor)

    payload = get_scenario_overrides(scenario_id)
    if not payload:
        return

    override = {
        "id": f"scenario_{scenario_id}",
        "type": "scenario",
        "label": scenario_id.replace("_", " ").title(),
        "payload": payload,
    }

    apply_override(
        override=override,
        actor=actor,
    )

def clear_scenario(actor: str = "scenario_engine_v1") -> None:
    """
    Remove active scenario override (if any).
    """

    context = get_effective_context()
    overrides = context.get("overrides", [])

    for o in overrides:
        if o.get("type") == "scenario":
            remove_override(
                override_id=o["id"],
                actor=actor,
            )
