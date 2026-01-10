# catalyst/scenario_override_adapter.py

def scenario_to_override(
    *,
    scenario_id: str,
    label: str,
    scenario_payload: dict,
) -> dict:
    """
    Translate a v0.9 scenario payload into a Context v1 override.
    """

    changes = {}

    # ---- Strategy posture override
    if "strategy" in scenario_payload:
        changes["strategy"] = scenario_payload["strategy"]

    # ---- KPI overrides
    if "kpis" in scenario_payload:
        changes["kpis"] = scenario_payload["kpis"]

    return {
        "id": scenario_id,
        "type": "scenario",
        "label": label,
        "applies_to": list(changes.keys()),
        "changes": changes,
        "expires": True,
    }
