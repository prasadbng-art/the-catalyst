import numpy as np

def classify_status(value, green, amber):
    if value <= green:
        return "green"
    elif value <= amber:
        return "amber"
    return "red"

def derive_kpis_from_workforce(df):
    kpis = {}

    # Normalize attrition risk to 0–1
    risk = df["attrition_risk_score"]
    if risk.max() > 1:
        risk = risk / 100

    # --- Attrition rate ---
    attrition_rate = risk.mean() * 100
    kpis["attrition_rate"] = {
        "value": round(attrition_rate, 1),
        "status": classify_status(attrition_rate, 12, 18)
    }

    # --- High performer attrition ---
    high_perf = df[df["performance_band"].str.lower() == "high"]
    if not high_perf.empty:
        hp_risk = risk.loc[high_perf.index].mean() * 100
    else:
        hp_risk = 0

    kpis["high_performer_attrition"] = {
        "value": round(hp_risk, 1),
        "status": classify_status(hp_risk, 8, 12)
    }

    # --- Engagement index ---
    engagement = df["engagement_score"].mean()
    kpis["engagement_index"] = {
        "value": round(engagement, 1),
        "status": classify_status(100 - engagement, 30, 45)
    }

    # --- Manager effectiveness ---
    mgr = (
        df.groupby("manager_id")
        .agg(
            team_size=("employee_id", "count"),
            avg_engagement=("engagement_score", "mean")
        )
    )

    mgr_score = mgr["avg_engagement"] * np.log(mgr["team_size"] + 1)
    mgr_index = (mgr_score.mean() / mgr_score.max()) * 100

    kpis["manager_effectiveness"] = {
        "value": round(mgr_index, 1),
        "status": classify_status(100 - mgr_index, 30, 45)
    }

    # --- Regretted loss rate ---
    avg_salary = df["salary"].mean()
    regretted_cost = (risk.loc[high_perf.index] * high_perf["salary"]).sum()
    total_payroll = df["salary"].sum()

    regretted_rate = (regretted_cost / total_payroll) * 100 if total_payroll else 0

    kpis["regretted_loss_rate"] = {
        "value": round(regretted_rate, 1),
        "status": classify_status(regretted_rate, 3, 6)
    }

    # --- Cost of attrition ---
    cost_of_attrition = (risk * df["salary"]).sum()

    kpis["cost_of_attrition"] = {
        "value": round(cost_of_attrition / 1e6, 2),  # in millions
        "status": "info"
    }

    return kpis
