def run_simulation(
    baseline_kpis: dict,
    levers: dict,
    headcount: int,
    cost_per_exit: float,
):
    baseline_risk = baseline_kpis["attrition_risk"]["value"]

    reduction_pct = levers["attrition_risk_reduction_pct"] / 100
    new_risk = max(round(baseline_risk * (1 - reduction_pct), 1), 0)

    baseline_cost = baseline_risk / 100 * headcount * cost_per_exit
    simulated_cost = new_risk / 100 * headcount * cost_per_exit

    return {
        "baseline": {
            "attrition_risk": baseline_risk,
            "annual_attrition_cost": round(baseline_cost, 0),
        },
        "simulated": {
            "attrition_risk": new_risk,
            "annual_attrition_cost": round(simulated_cost, 0),
        },
        "impact": {
            "cost_avoided": round(baseline_cost - simulated_cost, 0),
            "risk_reduction_points": round(baseline_risk - new_risk, 1),
        },
    }
