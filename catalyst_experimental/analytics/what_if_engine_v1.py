# catalyst/analytics/what_if_engine_v1.py

def apply_what_if(baseline_kpis, levers):
    """
    Apply hypothetical (what-if) adjustments to baseline KPIs.

    Design principles:
    - Baseline KPIs are descriptive and minimal
    - Engagement / manager improvements are assumptions, not baseline facts
    - Engine must not depend on optional or removed KPIs
    - No simulation runs without attrition risk as a base
    """

    adjusted = {}

    # --------------------------------------------------
    # Copy baseline KPIs (shallow copy, values overridden selectively)
    # --------------------------------------------------
    for kpi, state in baseline_kpis.items():
        adjusted[kpi] = state.copy()

    # --------------------------------------------------
    # Attrition risk reduction (core simulation effect)
    # --------------------------------------------------
    if "attrition_risk" not in baseline_kpis:
        raise ValueError("Baseline KPIs must include 'attrition_risk' for simulation.")

    base_risk_pct = baseline_kpis["attrition_risk"]["value"]
    reduction_pct = levers.get("attrition_risk_reduction_pct", 0)

    simulated_risk_pct = max(
        base_risk_pct * (1 - reduction_pct / 100),
        0.1,  # floor to avoid absurd zero-risk scenarios
    )

    adjusted["attrition_risk"] = {
        "value": round(simulated_risk_pct, 1),
        "unit": "%",
        "description": "Simulated attrition risk under applied assumptions.",
    }

    # --------------------------------------------------
    # Assumed engagement uplift (contextual, not measured)
    # --------------------------------------------------
    if levers.get("engagement_lift", 0) > 0:
        adjusted["engagement_uplift_assumed"] = {
            "value": levers["engagement_lift"],
            "unit": "points",
            "description": "Assumed engagement uplift applied in this scenario.",
        }

    # --------------------------------------------------
    # Assumed manager capability uplift (contextual)
    # --------------------------------------------------
    if levers.get("manager_effectiveness_lift", 0) > 0:
        adjusted["manager_capability_uplift_assumed"] = {
            "value": levers["manager_effectiveness_lift"],
            "unit": "points",
            "description": "Assumed manager capability uplift applied in this scenario.",
        }

    # --------------------------------------------------
    # Predicted attrition (derived, scenario-only)
    # --------------------------------------------------
    headcount = levers.get("headcount")
    realization = levers.get("risk_realization_factor", 0.6)

    if headcount is not None:
        predicted_exits = headcount * (simulated_risk_pct / 100) * realization

        adjusted["predicted_attrition_12m"] = {
            "value": round(predicted_exits, 1),
            "unit": "employees",
            "description": (
                "Estimated number of exits over 12 months under this scenario. "
                "Derived from simulated risk and realization assumptions."
            ),
        }

    return adjusted
