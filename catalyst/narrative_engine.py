# catalyst/narrative_engine.py

def generate_narrative(
    *,
    kpi: str,
    kpi_state: dict,
    client_context: dict | None,
    persona: str,
    strategy_context: dict | None
) -> dict:
    """
    Core narrative abstraction layer.
    Returns a NarrativeBlock.
    """

    posture = (
        strategy_context["posture"]
        if strategy_context
        else "cost"
    )

    # ---- Attrition Narratives (v0.7)
    if kpi == "attrition":
        return _attrition_narrative(
            kpi_state,
            persona,
            posture
        )

    # ---- Default Fallback
    return {
        "headline": "Insight pending",
        "interpretation": "This KPI has not yet been narrativised.",
        "risk_statement": "Narrative logic is under development.",
        "recommended_posture": "monitor",
        "confidence": "low"
    }


# ============================================================
# KPI-SPECIFIC NARRATIVES
# ============================================================

def _attrition_narrative(
    kpi_state: dict,
    persona: str,
    posture: str
) -> dict:

    rate = kpi_state.get("attrition_rate", 0)

    # ---- Headline logic
    if rate > 25:
        headline = "Attrition risk is materially elevated"
        confidence = "high"
    elif rate > 15:
        headline = "Attrition risk is trending above tolerance"
        confidence = "medium"
    else:
        headline = "Attrition remains within controllable bounds"
        confidence = "low"

    # ---- Persona-aware interpretation
    if persona == "CFO":
        interpretation = (
            "Current attrition levels translate into direct financial exposure "
            "through replacement cost, vacancy drag, and lost productivity."
        )
    elif persona == "CHRO":
        interpretation = (
            "Attrition signals underlying issues in engagement, capability growth, "
            "or managerial effectiveness."
        )
    else:  # CEO
        interpretation = (
            "Sustained attrition at this level risks execution velocity "
            "and leadership continuity."
        )

    # ---- Strategy-aware posture
    if posture == "cost":
        recommended = "prioritise targeted, high-ROI interventions"
    elif posture == "growth":
        recommended = "invest selectively to stabilise critical talent pools"
    else:
        recommended = "monitor trends and intervene surgically"

    return {
        "headline": headline,
        "interpretation": interpretation,
        "risk_statement": (
            "If unmanaged, attrition at this level compounds operational "
            "and financial risk over the planning horizon."
        ),
        "recommended_posture": recommended,
        "confidence": confidence
    }
