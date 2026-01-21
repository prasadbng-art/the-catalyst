def run_simulation(
    baseline_kpis,
    levers: dict,
    headcount: int,
    cost_per_exit: float,
):
    """
    Run a what-if simulation by applying a risk reduction
    to baseline attrition metrics.
    """

    # --------------------------------------------------
    # 1. Extract baseline values (OBJECT access, not dict)
    # --------------------------------------------------

    baseline_risk_pct = baseline_kpis.attrition_risk.value
    baseline_cost = baseline_kpis.annual_attrition_cost_exposure.value

    # --------------------------------------------------
    # 2. Apply lever
    # --------------------------------------------------

    risk_reduction_pct = levers.get("risk_reduction_pct", 0)

    simulated_risk_pct = baseline_risk_pct * (1 - risk_reduction_pct / 100)

    # --------------------------------------------------
    # 3. Cost impact (simple, demo-grade)
    # --------------------------------------------------

    simulated_cost = baseline_cost * (simulated_risk_pct / baseline_risk_pct)
    avoided_cost = baseline_cost - simulated_cost

    # --------------------------------------------------
    # 4. Simulated KPIs (clone + override)
    # --------------------------------------------------

    simulated_kpis = {
        "attrition_risk": {
            "value": round(simulated_risk_pct, 2),
            "unit": "%",
            "description": "Simulated attrition risk after intervention",
        },
        "annual_attrition_cost_exposure": {
            "value": round(simulated_cost, 0),
            "unit": "USD",
            "description": "Simulated annual attrition cost exposure",
        },
    }

    # --------------------------------------------------
    # 5. Diagnostics (pass-through for demo)
    # --------------------------------------------------

    diagnostics = baseline_kpis.diagnostics

    # --------------------------------------------------
    # 6. Return canonical structure
    # --------------------------------------------------

    return {
        "baseline_cost": round(baseline_cost, 0),
        "simulated_cost": round(simulated_cost, 0),
        "avoided_cost": round(avoided_cost, 0),
        "simulated_kpis": simulated_kpis,
        "diagnostics": diagnostics,
    }
