import numpy as np

FORECAST_HORIZON_MONTHS = 12
RISK_REALIZATION_FACTOR = 0.6


def classify_status(value, green, amber, invert=False):
    """
    invert=True means lower is worse (e.g. engagement)
    """
    if invert:
        value = 100 - value

    if value <= green:
        return "green"
    elif value <= amber:
        return "amber"
    return "red"


def derive_kpis_from_workforce(df):
    kpis = {}

    headcount = len(df)

    # -------------------------------
    # Normalize attrition risk to 0–1
    # -------------------------------
    risk = df["attrition_risk_score"]
    if risk.max() > 1:
        risk = risk / 100

    # ===============================
    # EXPOSURE KPIs
    # ===============================

    # --- Attrition risk ---
    attrition_risk = risk.mean() * 100
    kpis["attrition_risk"] = {
        "value": round(attrition_risk, 1),
        "status": classify_status(attrition_risk, 12, 18)
    }

    # --- High performer attrition risk ---
    high_perf = df[df["performance_band"].str.lower() == "high"]

    if not high_perf.empty:
        hp_risk = risk.loc[high_perf.index].mean() * 100
    else:
        hp_risk = 0

    kpis["high_performer_attrition_risk"] = {
        "value": round(hp_risk, 1),
        "status": classify_status(hp_risk, 8, 12)
    }

    # --- Engagement index ---
    engagement = df["engagement_score"].mean()
    kpis["engagement_index"] = {
        "value": round(engagement, 1),
        "status": classify_status(engagement, 70, 55, invert=True)
    }

    # --- Manager effectiveness (proxy) ---
    mgr = (
        df.groupby("manager_id")
        .agg(
            team_size=("employee_id", "count"),
            avg_engagement=("engagement_score", "mean")
        )
    )

    mgr_score = mgr["avg_engagement"] * np.log(mgr["team_size"] + 1)
    mgr_index = (mgr_score.mean() / mgr_score.max()) * 100 if mgr_score.max() else 0

    kpis["manager_effectiveness"] = {
        "value": round(mgr_index, 1),
        "status": classify_status(mgr_index, 70, 55, invert=True)
    }

    # --- Regretted loss risk ---
    regretted_cost = (risk.loc[high_perf.index] * high_perf["salary"]).sum()
    total_payroll = df["salary"].sum()

    regretted_loss_risk = (regretted_cost / total_payroll) * 100 if total_payroll else 0

    kpis["regretted_loss_risk"] = {
        "value": round(regretted_loss_risk, 1),
        "status": classify_status(regretted_loss_risk, 3, 6)
    }

    # --- Attrition cost exposure ---
    cost_exposure = (risk * df["salary"]).sum()

    kpis["attrition_cost_exposure"] = {
        "value": round(cost_exposure / 1e6, 2),  # millions
        "status": "info"
    }

    # ===============================
    # FORECAST KPIs (Derived)
    # ===============================

    predicted_attrition_12m = (
        headcount * (attrition_risk / 100) * RISK_REALIZATION_FACTOR
    )

    kpis["predicted_attrition_12m"] = {
        "value": round(predicted_attrition_12m, 1),
        "status": "info"
    }

    return kpis
