# cost_narrative_cfo_v1.py

def generate_cfo_cost_narrative(
    costs: dict,
    bands: dict,
):
    """
    CFO-grade cost narrative.
    Focuses on exposure, controllability, and capital efficiency.
    """

    baseline = costs["baseline_cost_exposure"]
    preventable = costs["preventable_cost"]
    what_if = costs.get("what_if_cost_impact")

    conservative = bands["conservative"]["baseline_cost"]
    aggressive = bands["aggressive"]["baseline_cost"]

    preventable_pct = round((preventable / baseline) * 100, 1) if baseline else 0

    headline = "Attrition represents a material and partially controllable cost exposure"

    body = (
        f"Based on current workforce risk indicators, annualized attrition-related cost "
        f"exposure is estimated at approximately ₹{baseline/1e7:.1f} Cr. "
        f"Sensitivity analysis indicates a plausible range of ₹{conservative/1e7:.1f}–"
        f"₹{aggressive/1e7:.1f} Cr under conservative to adverse conditions. "
        f"Approximately {preventable_pct}% of this exposure is considered realistically "
        f"addressable through targeted retention and capability interventions."
    )

    if what_if and what_if > 0:
        body += (
            f" Under the evaluated intervention scenario, the model indicates potential "
            f"cost avoidance of approximately ₹{what_if/1e7:.1f} Cr on an annualized basis."
        )

    posture = (
        "Evaluate retention interventions as capital efficiency levers, "
        "prioritizing actions with measurable payback within the planning horizon."
    )

    return {
        "headline": headline,
        "body": body,
        "posture": posture,
    }
