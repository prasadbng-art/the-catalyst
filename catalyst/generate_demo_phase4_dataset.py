import numpy as np
import pandas as pd
import random

# ============================================================
# Phase 4 Synthetic Dataset Generator
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

# Salary bands by level (USD)
salary_bands = {
    "Junior": (45000, 75000),
    "Mid": (70000, 120000),
    "Senior": (110000, 180000),
    "Leader": (160000, 260000),
}

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

def generate_attrition_risk(sentiment_score, engagement_index, tenure):
    base_risk = 0.25
    sentiment_effect = -0.15 * sentiment_score
    engagement_effect = -0.002 * (engagement_index - 50)
    tenure_effect = -0.01 * min(tenure, 5)
    noise = np.random.normal(0, 0.05)

    risk = np.clip(
        base_risk + sentiment_effect + engagement_effect + tenure_effect + noise,
        0.05,
        0.85,
    )
    return risk

# ------------------------------------------------------------
# Generate manager structure
# ------------------------------------------------------------

manager_ids = [f"MGR_{i:03d}" for i in range(1, 101)]

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

    salary_min, salary_max = salary_bands[level]
    annual_salary = int(np.random.uniform(salary_min, salary_max))

    sentiment_score, sentiment_band = generate_sentiment()
    engagement_index, engagement_band = generate_engagement(sentiment_score)

    survey_response_count = int(np.clip(np.random.poisson(6), 1, 20))

    attrition_risk = generate_attrition_risk(
        sentiment_score, engagement_index, tenure_years
    )

    risk_band = (
        "High" if attrition_risk > 0.6 else
        "Medium" if attrition_risk > 0.35 else
        "Low"
    )

    attrition_flag = int(
        np.random.rand() < (attrition_risk * 0.6)
    )

    rows.append({
    "employee_id": employee_id,

    # --- Core identity ---
    "department": department,
    "location": location,
    "role": role_family,                  # legacy compatibility
    "level": level,
    "manager_id": manager_id,

    # --- Tenure ---
    "tenure_years": tenure_years,
    "tenure_months": int(tenure_years * 12),  # legacy compatibility

    # --- Compensation ---
    "annual_salary_usd": annual_salary,
    "salary": annual_salary,               # legacy compatibility

    # --- Performance / engagement (legacy expectations) ---
    "engagement_score": engagement_index,  # legacy name
    "performance_band": engagement_band,   # placeholder, synthetic

    # --- Phase 4 sentiment ---
    "sentiment_score": round(sentiment_score, 3),
    "sentiment_band": sentiment_band,
    "survey_response_count": survey_response_count,
    "sentiment_source": "synthetic_demo",

    # --- Attrition ---
    "attrition_flag": attrition_flag,
    "attrition_risk_score": round(attrition_risk, 3),
    "risk_band": risk_band,

    # --- Metadata ---
    "engagement_index": engagement_index,
    "engagement_band": engagement_band,
    "data_provenance": "synthetic_demo_v2",
    "confidence_note": "Simulated for demonstration purposes only",
})


df = pd.DataFrame(rows)

# ------------------------------------------------------------
# Optional: derive manager aggregates (safe, non-prescriptive)
# ------------------------------------------------------------

manager_stats = (
    df.groupby("manager_id")
      .agg(
          manager_sentiment_avg=("sentiment_score", "mean"),
          team_size=("employee_id", "count")
      )
      .reset_index()
)

df = df.merge(manager_stats, on="manager_id", suffixes=("", "_mgr"))

df["manager_sentiment_avg"] = df["manager_sentiment_avg_mgr"].round(3)
df["team_size"] = df["team_size_mgr"]

df.drop(columns=["manager_sentiment_avg_mgr", "team_size_mgr"], inplace=True)

# ------------------------------------------------------------
# Export
# ------------------------------------------------------------

OUTPUT_FILE = "demo_phase4_synthetic.csv"
df.to_csv(OUTPUT_FILE, index=False)

print(f"✅ Phase 4 synthetic demo dataset generated: {OUTPUT_FILE}")
print(df.head())
