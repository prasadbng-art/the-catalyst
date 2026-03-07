import numpy as np
import json
from pathlib import Path


def compute_ai_indices(diagnostic):

    exposure = np.mean([
        diagnostic["task_structure"],
        100 - diagnostic["cognitive_complexity"],
        diagnostic["role_fragmentation"]
    ])

    readiness = np.mean([
        diagnostic["data_infrastructure"],
        diagnostic["ai_capability"],
        diagnostic["change_velocity"]
    ])

    velocity = np.mean([
        diagnostic["competitive_ai_pressure"],
        diagnostic["industry_digitization"],
        diagnostic["regulation_environment"]
    ])

    macro = np.mean([
        diagnostic["labor_cost_pressure"],
        diagnostic["talent_availability"],
        diagnostic["economic_outlook"]
    ])

    return exposure, readiness, velocity, macro

def compute_disruption(exposure, readiness, velocity, macro):

    risk = (
        0.35 * exposure +
        0.30 * velocity +
        0.20 * (100 - readiness) +
        0.15 * macro
    )

    automation = exposure * velocity / 100
    realized = automation * (1 - readiness/100)

    return {
        "risk_score": round(risk,1),
        "automation": round(realized,1)
    }

def generate_scenarios(exposure, readiness, velocity, macro):

    base = compute_disruption(exposure, readiness, velocity, macro)

    conservative = compute_disruption(
        exposure,
        readiness * 1.1,
        velocity * 0.8,
        macro * 0.9
    )

    accelerated = compute_disruption(
        exposure,
        readiness * 0.9,
        velocity * 1.25,
        macro * 1.15
    )

    return {
        "conservative": conservative,
        "expected": base,
        "accelerated": accelerated
    }

def compute_role_exposure(roles, velocity, readiness, macro):

    role_file = Path("catalyst_api/data/role_library.json")

    with open(role_file) as f:
        role_scores = json.load(f)

    results = []

    for role, count in roles.items():

        base = role_scores.get(role, 40)

        exposure = base * (velocity/100) * (1 + macro/200) * (1 - readiness/150)

        results.append({
            "role": role,
            "exposure": round(exposure,1),
            "employees": count,
            "roles_impacted": int(count * exposure/100)
        })

    return results

