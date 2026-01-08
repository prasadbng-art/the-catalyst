from typing import List, Dict


def optimise_action_portfolio(
    actions: List[Dict],
    total_budget: float,
    max_time_days: int,
    projected_exposure: float
) -> Dict:
    """
    Greedy, explainable portfolio optimiser.
    Maximises cost avoided under budget and time constraints.
    """

    enriched = []

    # Compute cost avoided for each action
    for action in actions:
        cost_avoided = projected_exposure * action["impact_pct"]
        enriched.append({
            **action,
            "cost_avoided": cost_avoided,
            "roi": cost_avoided / action["cost_to_execute"]
        })

    # Sort by ROI descending
    enriched.sort(key=lambda x: x["roi"], reverse=True)

    selected = []
    spent = 0.0
    total_avoided = 0.0

    for action in enriched:
        if spent + action["cost_to_execute"] > total_budget:
            continue
        if action["time_to_impact_days"] > max_time_days:
            continue

        selected.append(action)
        spent += action["cost_to_execute"]
        total_avoided += action["cost_avoided"]

    return {
        "selected_actions": selected,
        "budget_used": spent,
        "budget_remaining": total_budget - spent,
        "total_cost_avoided": total_avoided,
        "portfolio_roi": (
            total_avoided / spent if spent > 0 else None
        )
    }
