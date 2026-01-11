"""
generate_demo_workforce_csv.py

Generates a realistic demo workforce dataset for Catalyst Phase I.
"""

import random
import csv

# ----------------------------
# Configuration
# ----------------------------
OUTPUT_FILE = "demo_workforce.csv"
NUM_EMPLOYEES = 600
RANDOM_SEED = 42

random.seed(RANDOM_SEED)

ROLE_LEVELS = ["IC", "Senior IC", "Manager", "Senior Manager", "Director"]
FUNCTIONS = ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"]
LOCATIONS = ["US", "India", "Europe", "APAC"]

# ----------------------------
# Helper functions
# ----------------------------
def bounded(value, low=0, high=100):
    return max(low, min(high, value))


def generate_employee(i):
    role = random.choices(
        ROLE_LEVELS,
        weights=[30, 25, 20, 15, 10],
    )[0]

    function = random.choice(FUNCTIONS)
    location = random.choice(LOCATIONS)

    tenure_years = round(random.uniform(0.5, 10), 1)

    # Engagement and manager effectiveness are correlated but imperfect
    manager_effectiveness = bounded(int(random.gauss(70, 12)))
    engagement_score = bounded(
        int(manager_effectiveness + random.gauss(0, 10))
    )

    # Attrition risk logic (simple, believable)
    base_risk = 18

    if tenure_years < 2:
        base_risk += 5
    elif tenure_years > 6:
        base_risk -= 4

    if engagement_score < 50:
        base_risk += 6
    elif engagement_score > 75:
        base_risk -= 5

    if manager_effectiveness < 50:
        base_risk += 4

    attrition_risk = bounded(round(base_risk + random.gauss(0, 3), 1))

    return {
        "employee_id": f"E{i:04d}",
        "role_level": role,
        "function": function,
        "location": location,
        "tenure_years": tenure_years,
        "manager_effectiveness": manager_effectiveness,
        "engagement_score": engagement_score,
        "attrition_risk": attrition_risk,
    }


# ----------------------------
# Main generator
# ----------------------------
def generate_demo_workforce():
    rows = [generate_employee(i) for i in range(1, NUM_EMPLOYEES + 1)]

    with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Demo workforce file generated: {OUTPUT_FILE}")
    print(f"Employees: {NUM_EMPLOYEES}")


if __name__ == "__main__":
    generate_demo_workforce()
