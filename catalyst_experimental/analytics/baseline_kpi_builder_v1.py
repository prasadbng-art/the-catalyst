def build_baseline_kpis(workforce_df):
    kpis = {}

    # --------------------------------------------------
    # Attrition Risk (Core KPI)
    # --------------------------------------------------
    if "attrition_risk_score" in workforce_df.columns:
        kpis["attrition_risk"] = {
            "value": round(workforce_df["attrition_risk_score"].mean() * 100, 1),
            "unit": "%",
            "description": "Forward-looking likelihood of employee exits under current conditions.",
        }

    # --------------------------------------------------
    # Headcount (Contextual, not evaluative)
    # --------------------------------------------------
    if "employee_id" in workforce_df.columns:
        kpis["headcount"] = {
            "value": int(workforce_df["employee_id"].nunique()),
            "unit": "employees",
            "description": "Total workforce size represented in this dataset.",
        }

    # --------------------------------------------------
    # Engagement (Optional / Future)
    # --------------------------------------------------
    if "engagement_score" in workforce_df.columns:
        kpis["engagement"] = {
            "value": round(workforce_df["engagement_score"].mean(), 1),
            "unit": "score",
            "description": "Average engagement score (if available).",
        }

    return kpis
