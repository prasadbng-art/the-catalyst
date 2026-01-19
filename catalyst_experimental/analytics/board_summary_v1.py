# board_summary_v1.py

def generate_board_summary(
    costs: dict,
    bands: dict,
    persona: str,
):
    """
    Generates a one-page, board-ready summary.
    Language is neutral, non-operational, and decision-oriented.
    """

    baseline = costs["baseline_cost_exposure"]
    preventable = costs["preventable_cost"]
    what_if = costs.get("what_if_cost_impact")

    conservative = bands["conservative"]["baseline_cost"]
    aggressive = bands["aggressive"]["baseline_cost"]

    preventable_pct = round((preventable / baseline) * 100, 1) if baseline else 0

    headline = "Workforce Attrition — Economic Exposure Summary"

    bullets = [
        f"Estimated annualized attrition cost exposure: ₹{baseline/1e7:.1f} Cr",
        f"Exposure range (confidence band): ₹{conservative/1e7:.1f}–₹{aggressive/1e7:.1f} Cr",
        f"Estimated preventable portion: ~{preventable_pct}% of exposure",
    ]

    if what_if and what_if > 0:
        bullets.append(
            f"Evaluated intervention scenario indicates potential annual cost avoidance of "
            f"₹{what_if/1e7:.1f} Cr"
        )

    implication = (
        "Attrition represents a recurring and partially controllable economic exposure. "
        "Targeted interventions can materially reduce cost leakage if executed with "
        "clear ownership and performance tracking."
    )

    return {
        "headline": headline,
        "bullets": bullets,
        "implication": implication,
    }
