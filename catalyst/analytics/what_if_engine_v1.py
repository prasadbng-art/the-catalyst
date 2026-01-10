def apply_what_if(baseline_kpis, levers):
    """
    Applies what-if adjustments to baseline KPIs.
    Returns adjusted KPI dict.
    """

    adjusted = {}

    # Copy baseline
    for kpi, state in baseline_kpis.items():
        adjusted[kpi] = state.copy()

    # --- Attrition risk reduction ---
    if "attrition_risk_reduction_pct" in levers:
        reduction = levers["attrition_risk_reduction_pct"] / 100
        base = baseline_kpis["attrition_risk"]["value"]
        adjusted_value = base * (1 - reduction)

        adjusted["attrition_risk"]["value"] = round(adjusted_value, 1)

    # --- Engagement improvement ---
    if "engagement_lift" in levers:
        base = baseline_kpis["engagement_index"]["value"]
        adjusted["engagement_index"]["value"] = min(
            round(base + levers["engagement_lift"], 1), 100
        )

    # --- Manager effectiveness lift ---
    if "manager_effectiveness_lift" in levers:
        base = baseline_kpis["manager_effectiveness"]["value"]
        adjusted["manager_effectiveness"]["value"] = min(
            round(base + levers["manager_effectiveness_lift"], 1), 100
        )

    # --- Recompute predicted attrition ---
    headcount = levers["headcount"]
    realization = levers["risk_realization_factor"]

    risk = adjusted["attrition_risk"]["value"] / 100

    predicted = headcount * risk * realization

    adjusted["predicted_attrition_12m"]["value"] = round(predicted, 1)

    return adjusted
