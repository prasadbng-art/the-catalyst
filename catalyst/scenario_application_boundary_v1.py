"""
scenario_application_boundary_v1.py
-----------------------------------
Canonical boundary for applying and clearing scenario overrides
against Context v1.

Rules:
- UI may REQUEST scenario activation
- Scenarios emit data-only overrides
- ContextManagerV1 owns mutation
- This is the ONLY place scenarios touch context
"""

from typing import Optional

from context_manager_v1 import ContextManagerV1
from scenario_v09 import get_scenario_overrides


# -------------------------------------------------------------------
# Public API
# -------------------------------------------------------------------

def apply_scenario(
    context_manager: ContextManagerV1,
    scenario_id: str,
    actor: str = "scenario_engine_v1",
) -> None:
    """
    Apply a scenario as a Context v1 override.

    Idempotent:
    - Clears any existing scenario override first
    - Applies exactly one active scenario
    """

    # 1. Clear any existing scenario override
    clear_scenario(context_manager, actor=actor)

    # 2. Fetch scenario override payload (pure data)
    overrides = get_scenario_overrides(scenario_id)

    if not overrides:
        # Unknown or empty scenario → no-op
        return

    # 3. Apply override via ContextManager
    context_manager.apply_override(
        override_id=f"scenario_{scenario_id}",
        override_type="scenario",
        payload=overrides,
        actor=actor,
    )


def clear_scenario(
    context_manager: ContextManagerV1,
    actor: str = "scenario_engine_v1",
) -> None:
    """
    Remove any active scenario override from Context v1.
    """

    active = context_manager.list_overrides(override_type="scenario")

    for o in active:
        context_manager.remove_override(
            override_id=o["id"],
            actor=actor,
        )
