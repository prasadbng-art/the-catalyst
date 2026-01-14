# catalyst/analytics/cost_narrative_cfo_v1.py

def generate_cfo_cost_narrative(costs, bands):
    baseline = costs["baseline_cost_exposure"]
    preventable = costs["preventable_cost"]
    downside = bands["aggressive"]["baseline_cost"]

    headline = (
        "Attrition represents a material and partially avoidable cost exposure."
    )

    body = (
        f"Based on current workforce dynamics, annualized attrition-related cost "
        f"exposure is estimated at approximately ₹{baseline/1e7:.1f} Cr. "
        f"Under conservative assumptions, a meaningful portion of this exposure "
        f"(~₹{preventable/1e7:.1f} Cr) appears structurally preventable through targeted interventions.\n\n"
        f"Downside sensitivity analysis indicates potential exposure rising to "
        f"₹{downside/1e7:.1f} Cr under adverse realization scenarios, suggesting "
        f"non-trivial earnings volatility if no mitigating action is taken."
    )

    posture = (
        "Treat attrition mitigation as a risk-adjusted capital allocation decision, "
        "prioritizing interventions with measurable cost avoidance and rapid payback."
    )

    return {
        "headline": headline,
        "body": body,
        "posture": posture,
    }
