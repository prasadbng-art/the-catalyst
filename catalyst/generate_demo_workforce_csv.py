"""
generate_demo_workforce_csv.py

Generates an ingestion-compliant demo workforce dataset for Catalyst Phase I.
"""

import random
import csv

# --------------------------------------------------
# Configuration
# --------------------------------------------------
OUTPUT_FILE = "demo_workforce.csv"
NUM_EMPLOYEES = 600
NUM_MANAGERS = 50
RANDOM_SEED = 42

random.seed(RANDOM_SEED)

ROLES = ["IC", "Senior IC", "Manager", "Director"]
LOCATIONS = ["US", "India", "Europe", "APAC"]

SALARY_BANDS = {
    "IC":       {"US": 90000,  "India": 35000, "Europe": 70000, "APAC": 45000},
    "Senior IC":{"US": 120000, "India": 55000, "Europe": 90000, "APAC": 65000},
    "Manager":  {"US": 150000, "India": 75000, "Europe":110000, "APAC": 85000},
    "Director": {"US": 190000, "India":110000, "Europe":150000, "APAC":120000},
}

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def bounded(val, low=0, high=100):
    return max(low, min(high, val))


def choose_performance_band(engagement):
    if engagement >= 75:
        return "High"
    elif engagement >= 55:
        return "Medium"
    return "Low"


def generate_employee(i):
    role = random.choices(
        ROLES,
        weights=[40, 30, 20, 10],
    )[0]

    location = random.choice(LOCATIONS)
    manager_id = f"M{random.randint(1, NUM_MANAGERS):03d}"

    tenure_years = round(random.uniform(0.5, 10), 1)
    tenure_months = int(tenure_years * 12)

    manager_effectiveness = bounded(int(random.gauss(70, 12)))
    engagement_score = bounded(
        int(manager_effectiveness + random.gauss(0, 10))
    )

    performance_band = choose_performance_band(engagement_score)

    # Base attrition risk logic
    risk = 18

    if tenure_years < 2:
        risk += 6
    elif tenure_years > 6:
        risk -= 4

    if engagement_score < 50:
        risk += 7
    elif engagement_score > 75:
        risk -= 5

    if manager_effectiveness < 50:
        risk += 4

    attrition_risk_score = bounded(round(risk + random.gauss(0, 3), 1))

    # Salary (role + geo + mild noise)
    base_salary = SALARY_BANDS[role][location]
    salary = int(base_salary * random.uniform(0.9, 1.1))

    return {
        "employee_id": f"E{i:04d}",
        "manager_id": manager_id,
        "role": role,
        "performance_band": performance_band,
        "salary": salary,
        "tenure_months": tenure_months,
        "attrition_risk_score": attrition_risk_score,
    }


# --------------------------------------------------
# Main
# --------------------------------------------------
def generate_demo_workforce():
    rows = [generate_employee(i) for i in range(1, NUM_EMPLOYEES + 1)]

    with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print("✅ Demo workforce file generated")
    print(f"📄 File: {OUTPUT_FILE}")
    print(f"👥 Employees: {NUM_EMPLOYEES}")
    print(f"🧑‍💼 Managers: {NUM_MANAGERS}")


if __name__ == "__main__":
    generate_demo_workforce()
