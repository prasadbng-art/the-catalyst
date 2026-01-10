"""
scenario_application_boundary_v1.py
-----------------------------------
Canonical boundary for applying and clearing scenario overrides
against Context v1.

This version EXACTLY matches the Context v1 function signatures.
"""

from catalyst.context_manager_v1 import (
    get_effective_context,
    apply_override,
    remove_override,
)
from scenario_v09 import get_scenario_overrides


def apply_scenario(scenario_id: str, actor: str = "scenario_engine_v1") -> None:
    """
    Apply a scenario as a Context v1 override.
    """

    # Get current effective context
    context = get_effective_context()

    # Clear any existing scenario override
    context = clear_scenario(context=context, actor=actor)

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
        context=context,
        override=override,
        actor=actor,
    )


def clear_scenario(context: dict | None = None, actor: str = "scenario_engine_v1") -> dict:
    """
    Remove active scenario override (if any) and return updated context.
    """

    if context is None:
        context = get_effective_context()

    for o in list(context.get("overrides", [])):
        if o.get("type") == "scenario":
            context = remove_override(
                context=context,
                override_id=o["id"],
                actor=actor,
            )

    return context
