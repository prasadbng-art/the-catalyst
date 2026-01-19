import numpy as np
import pandas as pd
import random

# ============================================================
# Phase 4 Synthetic Demo Dataset Generator (Authoritative)
# ============================================================

RANDOM_SEED = 42
N_EMPLOYEES = 1000

np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

# ------------------------------------------------------------
# Reference dimensions
# ------------------------------------------------------------

departments = ["Engineering", "Sales", "Operations", "HR", "Finance", "Marketing"]
locations = ["US", "India", "UK", "Germany", "Poland", "Singapore"]
levels = ["Junior", "Mid", "Senior", "Leader"]
role_families = ["Tech", "Commercial", "Operations"]

salary_bands = {
    "Junior": (45000, 75000),
    "Mid": (70000, 120000),
    "Senior": (110000, 180000),
    "Leader": (160000, 260000),
}

manager_ids = [f"MGR_{i:03d}" for i in range(1, 101)]

# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------

def generate_sentiment():
    score = np.clip(np.random.normal(0, 0.35), -1, 1)
    if score < -0.2:
        band = "Negative"
    elif score > 0.2:
        band = "Positive"
    else:
        band = "Neutral"
    return score, band


def generate_engagement(sentiment_score):
    base = 60 + (sentiment_score * 25)
    noise = np.random.normal(0, 10)
    index = int(np.clip(base + noise, 0, 100))

    if index < 40:
        band = "Low"
    elif index < 70:
        band = "Medium"
    else:
        band = "High"

    return index, band


def generate_attrition_risk(sentiment_score, engagement_index, tenure_years):
    base_risk = 0.25
    sentiment_effect = -0.15 * sentiment_score
    engagement_effect = -0.002 * (engagement_index - 50)
    tenure_effect = -0.01 * min(tenure_years, 5)
    noise = np.random.normal(0, 0.05)

    risk = np.clip(
        base_risk + sentiment_effect + engagement_effect + tenure_effect + noise,
        0.05,
        0.85,
    )
    return risk

def generate_manager_effectiveness(engagement_score):
    base = 55 + (engagement_score - 50) * 0.4
    noise = np.random.normal(0, 8)
    return int(np.clip(base + noise, 30, 95))

# ------------------------------------------------------------
# Generate employees
# ------------------------------------------------------------

rows = []

for i in range(N_EMPLOYEES):
    employee_id = f"EMP_{i+1:05d}"
    department = random.choice(departments)
    location = random.choice(locations)
    level = random.choices(levels, weights=[0.3, 0.4, 0.2, 0.1])[0]
    role_family = random.choice(role_families)
    manager_id = random.choice(manager_ids)

    tenure_years = round(np.clip(np.random.exponential(3), 0, 15), 1)
    tenure_months = int(tenure_years * 12)

    salary_min, salary_max = salary_bands[level]
    salary = int(np.random.uniform(salary_min, salary_max))

    sentiment_score, sentiment_band = generate_sentiment()
    engagement_score, engagement_band = generate_engagement(sentiment_score)
    manager_effectiveness_score = generate_manager_effectiveness(engagement_score)


    survey_response_count = int(np.clip(np.random.poisson(6), 1, 20))

    attrition_risk = generate_attrition_risk(
        sentiment_score, engagement_score, tenure_years
    )

    risk_band = (
        "High" if attrition_risk > 0.6 else
        "Medium" if attrition_risk > 0.35 else
        "Low"
    )

    attrition_flag = int(np.random.rand() < (attrition_risk * 0.6))

    rows.append({
        # --- Identity ---
        "employee_id": employee_id,
        "department": department,
        "location": location,
        "role": role_family,
        "level": level,
        "manager_id": manager_id,

        # --- Tenure & compensation ---
        "tenure_months": tenure_months,
        "tenure_years": tenure_years,
        "salary": salary,
        "annual_salary_usd": salary,

        # --- Engagement / performance (legacy-compatible) ---
        "engagement_score": engagement_score,
        "engagement_index": engagement_score,
        "engagement_band": engagement_band,
        "performance_band": engagement_band,
        "manager_effectiveness_score": manager_effectiveness_score,

        # --- Sentiment (Phase 4) ---
        "sentiment_score": round(sentiment_score, 3),
        "sentiment_band": sentiment_band,
        "survey_response_count": survey_response_count,
        "sentiment_source": "synthetic_demo",

        # --- Attrition ---
        "attrition_flag": attrition_flag,
        "attrition_risk_score": round(attrition_risk, 3),
        "risk_band": risk_band,

        # --- Provenance ---
        "data_provenance": "synthetic_demo_v2",
        "confidence_note": "Simulated for demonstration purposes only",
    })

df = pd.DataFrame(rows)

# ------------------------------------------------------------
# Manager-level aggregates (safe, descriptive only)
# ------------------------------------------------------------

manager_stats = (
    df.groupby("manager_id")
      .agg(
          manager_sentiment_avg=("sentiment_score", "mean"),
          team_size=("employee_id", "count")
      )
      .reset_index()
)

df = df.merge(manager_stats, on="manager_id")

df["manager_sentiment_avg"] = df["manager_sentiment_avg"].round(3)

# ------------------------------------------------------------
# Export
# ------------------------------------------------------------

OUTPUT_FILE = "demo_phase4_synthetic.csv"
df.to_csv(OUTPUT_FILE, index=False)

print(f"✅ Phase 4 synthetic demo dataset generated: {OUTPUT_FILE}")
print(df.head())
