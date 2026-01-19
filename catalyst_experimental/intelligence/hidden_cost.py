from typing import Dict


# ------------------------------------------------------------
# Core Hidden Cost Calculator
# ------------------------------------------------------------
def calculate_hidden_cost(
    role_cost_usd_monthly: float,
    context: Dict
) -> Dict:
    """
    Calculates HC1–HC5 and total hidden cost per exit.
    All inputs are conservative, proxy-driven, CFO-safe.
    """

    # -------------------------------
    # HC1 — Pre-exit productivity decay
    # -------------------------------
    hc1 = (
        role_cost_usd_monthly
        * context.get("pre_exit_productivity_loss_pct", 0.20)
        * context.get("pre_exit_duration_months", 2)
    )

    # -------------------------------
    # HC2 — Vacancy productivity loss
    # -------------------------------
    hc2 = (
        role_cost_usd_monthly
        * context.get("vacancy_duration_months", 2)
        * context.get("role_criticality_multiplier", 1.0)
    )

    # -------------------------------
    # HC3 — Ramp-up inefficiency
    # -------------------------------
    hc3 = (
        role_cost_usd_monthly
        * context.get("ramp_up_duration_months", 4)
        * context.get("ramp_up_inefficiency_pct", 0.35)
    )

    # -------------------------------
    # HC4 — Manager & team load tax
    # -------------------------------
    hc4 = (
        role_cost_usd_monthly
        * context.get("manager_time_diversion_pct", 0.08)
        * context.get("manager_disruption_months", 2)
    )

    # -------------------------------
    # HC5 — Knowledge continuity risk
    # -------------------------------
    hc5 = (
        role_cost_usd_monthly
        * context.get("knowledge_risk_multiplier", 0.5)
        * context.get("knowledge_transition_months", 3)
    )

    total_hidden_cost = hc1 + hc2 + hc3 + hc4 + hc5

    return {
        "HC1_pre_exit_decay": round(hc1, 2),
        "HC2_vacancy_loss": round(hc2, 2),
        "HC3_ramp_up_loss": round(hc3, 2),
        "HC4_manager_load": round(hc4, 2),
        "HC5_knowledge_risk": round(hc5, 2),
        "total_hidden_cost": round(total_hidden_cost, 2)
    }
