# cost_narrative_v1.py

def generate_cost_narrative(
    costs: dict,
    persona: str = "CEO",
):
    """
    Generates a deterministic executive narrative explaining attrition cost impact.
    Phase I: rule-based, persona-aware.
    """

    baseline = costs.get("baseline_cost_exposure", 0)
    preventable = costs.get("preventable_cost", 0)
    what_if = costs.get("what_if_cost_impact")

    if baseline <= 0:
        return {
            "headline": "Attrition cost exposure unavailable",
            "body": "Insufficient data to quantify economic impact.",
            "posture": "Data integrity check recommended",
        }

    preventable_pct = round((preventable / baseline) * 100, 1) if baseline else 0

    # -------------------------
    # Persona framing
    # -------------------------
    if persona == "CFO":
        headline = "Material and controllable attrition cost exposure"
        body = (
            f"Annualized attrition cost exposure is estimated at ₹{baseline/1e7:.1f} Cr. "
            f"Approximately {preventable_pct}% of this cost is preventable through "
            f"targeted workforce interventions."
        )
        posture = "Prioritize cost-avoidance and capital efficiency"

    elif persona == "CHRO":
        headline = "Attrition costs signal systemic people risks"
        body = (
            f"Attrition-related losses of ₹{baseline/1e7:.1f} Cr reflect underlying "
            f"engagement, manager effectiveness, and retention challenges. "
            f"An estimated {preventable_pct}% of this exposure is addressable."
        )
        posture = "Focus on retention levers and leadership capability"

    else:  # CEO default
        headline = "Attrition represents a strategic value leak"
        body = (
            f"Current workforce attrition translates into an estimated "
            f"₹{baseline/1e7:.1f} Cr annual value erosion. "
            f"Roughly {preventable_pct}% of this loss appears preventable."
        )
        posture = "Treat retention as a strategic performance lever"

    # -------------------------
    # What-If overlay
    # -------------------------
    if what_if and what_if > 0:
        body += (
            f" Under the current What-If scenario, approximately "
            f"₹{what_if/1e7:.1f} Cr in attrition cost could be avoided annually."
        )

    return {
        "headline": headline,
        "body": body,
        "posture": posture,
    }
