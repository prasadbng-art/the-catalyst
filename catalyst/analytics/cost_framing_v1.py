# catalyst/analytics/cost_framing_v1.py

"""
Cost Framing Engine — Catalyst Phase I
Transforms attrition KPIs into executive financial insight.
"""

def compute_cost_framing(
    baseline_kpis: dict,
    workforce_df,
    financials: dict,
    what_if_kpis: dict | None = None,
):
    headcount = len(workforce_df)
    avg_cost_per_exit = financials.get("avg_cost_per_exit", 0)

    attrition_risk = baseline_kpis["attrition_risk"]["value"] / 100
    predicted_exits = round(headcount * attrition_risk)

    baseline_cost = predicted_exits * avg_cost_per_exit

    # Conservative assumption: only part of attrition is preventable
    preventable_factor = 0.35
    preventable_cost = baseline_cost * preventable_factor

    what_if_impact = None

    if what_if_kpis and "predicted_attrition_12m" in what_if_kpis:
        new_exits = what_if_kpis["predicted_attrition_12m"]["value"]
        avoided_exits = max(0, predicted_exits - new_exits)
        what_if_impact = avoided_exits * avg_cost_per_exit

    return {
        "baseline_cost_exposure": round(baseline_cost, 2),
        "preventable_cost": round(preventable_cost, 2),
        "what_if_cost_impact": round(what_if_impact, 2) if what_if_impact else None,
    }
