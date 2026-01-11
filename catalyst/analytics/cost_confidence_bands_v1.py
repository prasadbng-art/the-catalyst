# catalyst/analytics/cost_confidence_bands_v1.py

"""
Cost Confidence Bands — Catalyst Phase I
Generates conservative, base, and aggressive cost exposure ranges.
"""

def compute_cost_confidence_bands(
    baseline_cost: float,
    preventable_cost: float,
):
    """
    Returns confidence bands around attrition cost exposure.
    Assumptions are deliberately conservative and transparent.
    """

    bands = {
        "conservative": {
            "baseline_cost": baseline_cost * 0.85,
            "preventable_cost": preventable_cost * 0.75,
            "assumption": "Lower attrition realization and limited intervention impact",
        },
        "base": {
            "baseline_cost": baseline_cost,
            "preventable_cost": preventable_cost,
            "assumption": "Most likely realization based on current data",
        },
        "aggressive": {
            "baseline_cost": baseline_cost * 1.15,
            "preventable_cost": preventable_cost * 1.25,
            "assumption": "Higher attrition realization and strong intervention impact",
        },
    }

    # Round for presentation
    for band in bands.values():
        band["baseline_cost"] = round(band["baseline_cost"], 2)
        band["preventable_cost"] = round(band["preventable_cost"], 2)

    return bands
