"""
cost_framing_v1.py

Phase I cost framing logic for Catalyst.

Purpose:
Translate changes in attrition risk into
risk-adjusted financial exposure and savings.

This module is intentionally simple and conservative.
"""

def compute_attrition_cost_impact(
    baseline_attrition_risk: float,
    what_if_attrition_risk: float,
    headcount: int,
    avg_cost_per_exit: float = 145_000,
    risk_realization_factor: float = 0.6,
    horizon_months: int = 12,
):
    """
    Compute baseline vs what-if attrition cost exposure.

    Parameters
    ----------
    baseline_attrition_risk : float
        Baseline attrition risk as a percentage (e.g., 14.0 for 14%)

    what_if_attrition_risk : float
        Attrition risk after what-if actions (percentage)

    headcount : int
        Total employee population considered

    avg_cost_per_exit : float, optional
        Average replacement + productivity cost per exit
        Default = 145,000 (conservative industry estimate)

    risk_realization_factor : float, optional
        Fraction of modeled risk expected to materialize
        Default = 0.6 (prevents overstatement)

    horizon_months : int, optional
        Time horizon for exposure framing
        Default = 12 months

    Returns
    -------
    dict
        {
            baseline_exits,
            what_if_exits,
            baseline_cost_exposure,
            what_if_cost_exposure,
            exits_avoided,
            cost_protected,
            horizon_months
        }
    """

    # --- Guardrails ---
    baseline_attrition_risk = max(baseline_attrition_risk, 0)
    what_if_attrition_risk = max(what_if_attrition_risk, 0)
    risk_realization_factor = min(max(risk_realization_factor, 0), 1)

    # --- Convert risk → expected exits ---
    baseline_exits = (
        headcount * (baseline_attrition_risk / 100) * risk_realization_factor
    )

    what_if_exits = (
        headcount * (what_if_attrition_risk / 100) * risk_realization_factor
    )

    # --- Convert exits → cost exposure ---
    baseline_cost_exposure = baseline_exits * avg_cost_per_exit
    what_if_cost_exposure = what_if_exits * avg_cost_per_exit

    # --- Delta framing ---
    exits_avoided = baseline_exits - what_if_exits
    cost_protected = baseline_cost_exposure - what_if_cost_exposure

    return {
        "baseline_exits": round(baseline_exits, 1),
        "what_if_exits": round(what_if_exits, 1),
        "baseline_cost_exposure": round(baseline_cost_exposure, 0),
        "what_if_cost_exposure": round(what_if_cost_exposure, 0),
        "exits_avoided": round(exits_avoided, 1),
        "cost_protected": round(cost_protected, 0),
        "horizon_months": horizon_months,
    }
