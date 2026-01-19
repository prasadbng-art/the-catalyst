import numpy as np
import pandas as pd

np.random.seed(42)

# --------------------------------------------------
# Configuration
# --------------------------------------------------
N_EMPLOYEES = 1500

LOCATIONS = {
    "Bangalore": {"weight": 0.30, "risk_bias": 0.20, "sentiment_bias": -0.10},  # quietly broken
    "Pune":      {"weight": 0.20, "risk_bias": 0.05, "sentiment_bias":  0.00},
    "Hyderabad": {"weight": 0.15, "risk_bias": -0.05, "sentiment_bias":  0.10}, # misleadingly healthy
    "Chennai":   {"weight": 0.15, "risk_bias": 0.10, "sentiment_bias": -0.05},
    "Gurgaon":   {"weight": 0.10, "risk_bias": 0.00, "sentiment_bias":  0.00},
    "Remote":    {"weight": 0.10, "risk_bias": 0.15, "sentiment_bias": -0.15},
}

FUNCTIONS = ["Engineering", "Sales", "Operations", "Support", "Corporate"]

# --------------------------------------------------
# Helper functions
# --------------------------------------------------
def generate_tenure():
    # Skew toward mid-tenure exits (18–36 months)
    buckets = [
        np.random.randint(3, 12),
        np.random.randint(12, 24),
        np.random.randint(24, 36),
        np.random.randint(36, 72),
    ]
    return np.random.choice(buckets, p=[0.15, 0.30, 0.30, 0.25])

def generate_sentiment(bias):
    raw = np.random.normal(0.0 + bias, 0.35)
    return np.clip(raw, -1.0, 1.0)

def sentiment_band(score):
    if score < -0.25:
        return "Negative"
    elif score > 0.25:
        return "Positive"
    return "Neutral"

def generate_attrition_risk(tenure, sentiment, risk_bias):
    base = 0.25
    tenure_effect = 0.20 if 18 <= tenure <= 36 else -0.05
    sentiment_effect = -0.15 * sentiment
    noise = np.random.normal(0, 0.05)
    risk = base + tenure_effect + sentiment_effect + risk_bias + noise
    return float(np.clip(risk, 0.05, 0.90))

def generate_attrition_flag(risk, location):
    # Recent attrition is *not* perfectly aligned with risk
    base_prob = risk * 0.4
    if location == "Hyderabad":
        base_prob += 0.10  # misleadingly high exits
    return int(np.random.rand() < base_prob)

# --------------------------------------------------
# Data generation
# --------------------------------------------------
rows = []
employee_id = 1

for loc, cfg in LOCATIONS.items():
    n_loc = int(N_EMPLOYEES * cfg["weight"])
    for _ in range(n_loc):
        tenure = generate_tenure()
        sent = generate_sentiment(cfg["sentiment_bias"])
        risk = generate_attrition_risk(
            tenure,
            sent,
            cfg["risk_bias"],
        )

        row = {
            "employee_id": employee_id,
            "location": loc,
            "function": np.random.choice(FUNCTIONS),
            "tenure_months": tenure,
            "sentiment_score": round(sent, 2),
            "sentiment_band": sentiment_band(sent),
            "attrition_risk_score": round(risk, 2),
            "attrition_flag": generate_attrition_flag(risk, loc),
        }

        rows.append(row)
        employee_id += 1

df = pd.DataFrame(rows)

# --------------------------------------------------
# Final sanity constraints
# --------------------------------------------------
assert df["attrition_risk_score"].between(0, 1).all()
assert set(df["sentiment_band"].unique()) <= {"Negative", "Neutral", "Positive"}

# --------------------------------------------------
# Output
# --------------------------------------------------
df.to_csv("catalyst_demo_stress_v2.csv", index=False)

print("Generated catalyst_demo_stress_v2.csv")
print(df.groupby("location").agg(
    headcount=("employee_id", "count"),
    avg_risk=("attrition_risk_score", "mean"),
    recent_attrition=("attrition_flag", "mean"),
    avg_sentiment=("sentiment_score", "mean"),
))
