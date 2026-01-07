from typing import Dict


def compute_action_roi(
    projected_hidden_cost: float,
    action: Dict
) -> Dict:
    """
    Computes ROI metrics for a prescriptive action.
    All currency values are in US$.
    """

    impact_pct = action.get("impact_pct", 0.0)
    cost_to_execute = action.get("cost_to_execute", 0.0)
    time_to_impact_days = action.get("time_to_impact_days", 90)

    cost_avoided = projected_hidden_cost * impact_pct

    roi_multiple = (
        cost_avoided / cost_to_execute
        if cost_to_execute > 0 else None
    )

    payback_days = (
        (cost_to_execute / cost_avoided) * time_to_impact_days
        if cost_avoided > 0 else None
    )

    return {
        "cost_avoided": round(cost_avoided, 2),
        "roi_multiple": round(roi_multiple, 2) if roi_multiple else None,
        "payback_days": round(payback_days, 1) if payback_days else None
    }
