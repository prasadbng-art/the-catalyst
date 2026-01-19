# roi_lens_v1.py

def compute_roi_lens(
    what_if_cost_impact: float | None,
    intervention_cost: float,
):
    """
    Computes a simple ROI lens for board-level evaluation.
    """

    if not what_if_cost_impact or intervention_cost <= 0:
        return None

    net_benefit = what_if_cost_impact - intervention_cost
    roi = net_benefit / intervention_cost

    return {
        "intervention_cost": round(intervention_cost, 2),
        "cost_avoided": round(what_if_cost_impact, 2),
        "net_benefit": round(net_benefit, 2),
        "roi": round(roi, 2),
    }
