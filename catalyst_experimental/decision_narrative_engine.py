"""
decision_narrative_engine.py
----------------------------
Executive-grade decision narrative generation.
"""

from typing import List, Dict


def generate_decision_narrative(
    deltas: List[Dict],
    persona: str,
    scenario_label: str,
) -> Dict[str, str]:
    """
    Produces a concise executive recommendation.
    """

    positives = [d for d in deltas if d["delta"] > 0]
    negatives = [d for d in deltas if d["delta"] < 0]

    headline = f"Scenario Recommendation: {scenario_label}"

    if persona == "CFO":
        framing = (
            "From a cost and risk perspective, this scenario prioritises "
            "measurable downside reduction over long-term capability investment."
        )
    elif persona == "CHRO":
        framing = (
            "From a people and culture perspective, this scenario favours "
            "sustainable engagement and capability development."
        )
    else:  # CEO
        framing = (
            "From a strategic leadership perspective, this scenario represents "
            "a deliberate trade-off between short-term certainty and long-term resilience."
        )

    summary = (
        f"The scenario improves {len(positives)} key KPI(s) while negatively "
        f"impacting {len(negatives)}. The net effect depends on leadership priorities."
    )

    recommendation = (
        "This scenario is recommended if leadership accepts the identified trade-offs "
        "in pursuit of the highlighted gains."
    )

    return {
        "headline": headline,
        "framing": framing,
        "summary": summary,
        "recommendation": recommendation,
    }
