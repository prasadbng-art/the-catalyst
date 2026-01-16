# catalyst/analytics/cost_narrative_cfo_v1.py

def generate_cost_narrative(costs: dict, persona: str):
    baseline_cost = costs.get("baseline_cost_exposure")
    preventable_cost = costs.get("preventable_cost")
    what_if_impact = costs.get("what_if_cost_impact")

    headline = "Attrition represents a strategic value leak"

    body_parts = []

    if baseline_cost:
        body_parts.append(
            "Current workforce attrition translates into a material annual value erosion."
        )

    if preventable_cost:
        body_parts.append(
            "A meaningful portion of this exposure appears preventable through targeted leadership action."
        )

    if what_if_impact:
        body_parts.append(
            "Under the current simulated scenario, a significant share of this cost could be avoided."
        )

    return {
        "headline": headline,
        "body": " ".join(body_parts),
        "posture": "Proactive mitigation warranted",
    }
