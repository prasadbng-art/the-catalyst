# baseline_kpi_builder_v1.py

def build_baseline_kpis(workforce_df):
    """
    Derives baseline KPIs from workforce-level data.
    Contract is stable and consumed by:
    - What-if engine
    - Cost framing
    - KPI visuals
    """

    # ---- Attrition Risk ----
    attrition_risk = round(
        workforce_df["attrition_risk_score"].mean(), 2
    )

    # ---- Engagement ----
    engagement_index = round(
        workforce_df["engagement_score"].mean(), 1
    )

    # ---- Manager Effectiveness ----
    manager_effectiveness = round(
        workforce_df["manager_effectiveness_score"].mean(), 1
    )

    return {
        "attrition_risk": {
            "value": attrition_risk,
            "unit": "percent",
            "status": (
                "red" if attrition_risk >= 15
                else "amber" if attrition_risk >= 10
                else "green"
            ),
        },
        "engagement_index": {
            "value": engagement_index,
            "unit": "index",
        },
        "manager_effectiveness": {
            "value": manager_effectiveness,
            "unit": "index",
        },
    }
