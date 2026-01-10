# demo_context_v1.py

DEMO_BASELINE_CONTEXT = {
    "client": {
        "name": "Orion Manufacturing Group",
        "industry": "Manufacturing",
        "geography": "APAC",
        "employee_count": 4200,
        "growth_stage": "Mature"
    },

    "persona": "CHRO",

    "strategy": {
        "primary_focus": "Retention & Capability Stability",
        "time_horizon_months": 18,
        "risk_tolerance": "Medium",
        "posture": "balanced"
    },

    "kpis": {
        "attrition": {
            "value": 18.4,
            "status": "red"
        },
        "high_performer_attrition": {
            "value": 7.2,
            "status": "amber"
        },
        "manager_effectiveness": {
            "value": 61.0,
            "status": "amber"
        },
        "engagement_index": {
            "value": 58.0,
            "status": "red"
        },
        "sentiment_health": {
            "value": 55.0,
            "status": "amber"
        },
        "regretted_loss_rate": {
            "value": 4.1,
            "status": "amber"
        }
    },

    "workforce": {
        "critical_roles_pct": 0.22,
        "frontline_ratio": 0.46,
        "manager_ratio": 0.11
    },

    "financials": {
        "avg_cost_per_exit": 145000,
        "annual_payroll": 312000000
    },

    "signals": {
        "exit_interviews": "Compensation stagnation, manager quality variance",
        "pulse_trend": "Declining for ICs, flat for managers",
        "leadership_confidence": "Moderate"
    },

    "scenario": None
}
