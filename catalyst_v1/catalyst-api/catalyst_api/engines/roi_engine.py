def compute_roi(cost_avoided: float, intervention_cost: float):
    if intervention_cost <= 0:
        return {
            "roi_multiple": None,
            "net_benefit": cost_avoided,
            "payback_period_months": None,
        }

    roi_multiple = round(cost_avoided / intervention_cost, 2)
    net_benefit = round(cost_avoided - intervention_cost, 0)

    payback_months = round((intervention_cost / cost_avoided) * 12, 1) \
        if cost_avoided > 0 else None

    return {
        "roi_multiple": roi_multiple,
        "net_benefit": net_benefit,
        "payback_period_months": payback_months,
    }
