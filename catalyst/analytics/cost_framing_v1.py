# catalyst/analytics/cost_framing_v1.py

"""
Cost Framing Engine — Catalyst Phase I
Transforms attrition KPIs into executive financial insight.
"""

from catalyst.cost_framing_v1 import compute_attrition_cost_impact


def compute_cost_framing(
    baseline_kpis: dict,
    workforce_df,
    financials: dict,
    what_if_kpis: dict | None = None,
):
    # --------------------------------------------------
    # Resolve attrition risks (percent)
    # --------------------------------------------------
    baseline_attrition_pct = baseline_kpis.get(
        "attrition_risk", {}
    ).get("value", 0.0)

    effective_attrition_pct = (
        what_if_kpis.get("attrition_risk", {}).get("value")
        if what_if_kpis
        else baseline_attrition_pct
    )

    # --------------------------------------------------
    # Resolve workforce & assumptions
    # --------------------------------------------------
    headcount = len(workforce_df)

    avg_cost_per_exit = financials.get("avg_cost_per_exit", 145_000)
    risk_realization_factor = financials.get("risk_realization_factor", 0.6)

    # --------------------------------------------------
    # Delegate to engine
    # --------------------------------------------------
    impact = compute_attrition_cost_impact(
        baseline_attrition_risk=baseline_attrition_pct,
        what_if_attrition_risk=effective_attrition_pct,
        headcount=headcount,
        avg_cost_per_exit=avg_cost_per_exit,
        risk_realization_factor=risk_realization_factor,
    )

    # --------------------------------------------------
    # Normalize for UI consumption
    # --------------------------------------------------
    return {
        "baseline_cost_exposure": impact["baseline_cost_exposure"],
        "preventable_cost": impact["cost_protected"],
        "what_if_cost_impact": (
            impact["cost_protected"] if what_if_kpis else None
        ),
    }
