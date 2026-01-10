"""
kpi_delta_engine.py
-------------------
Pure KPI delta computation for executive comparison.
"""

from typing import Dict, Any, List


def compute_kpi_deltas(
    baseline: Dict[str, Any],
    scenario: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Compares KPI values between baseline and scenario contexts.
    Returns a list of delta records.
    """

    deltas = []

    for kpi, base_state in baseline["kpis"].items():
        scen_state = scenario["kpis"].get(kpi)

        if not scen_state:
            continue

        base_val = base_state["value"]
        scen_val = scen_state["value"]
        delta = scen_val - base_val

        deltas.append({
            "kpi": kpi,
            "baseline": base_val,
            "scenario": scen_val,
            "delta": round(delta, 2),
            "direction": _direction(delta),
            "signal": _signal(delta),
        })

    return deltas


def _direction(delta: float) -> str:
    if delta > 0:
        return "up"
    if delta < 0:
        return "down"
    return "flat"


def _signal(delta: float) -> str:
    abs_d = abs(delta)
    if abs_d >= 10:
        return "strong"
    if abs_d >= 3:
        return "moderate"
    if abs_d > 0:
        return "weak"
    return "none"
