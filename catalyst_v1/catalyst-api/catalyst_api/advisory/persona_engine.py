def generate_persona_insight(persona: str, baseline: dict, simulation: dict | None):
    if persona == "CEO":
        return {
            "headline": "Enterprise attrition risk remains a material business exposure",
            "insight": (
                f"Current attrition risk stands at {baseline['attrition_risk']}%. "
                "At this level, workforce instability poses a direct threat to "
                "operational continuity and margin protection."
            ),
            "focus": "Cost exposure, risk containment, leadership action threshold",
        }

    if persona == "CHRO":
        return {
            "headline": "Targeted retention levers can materially shift workforce stability",
            "insight": (
                "Attrition risk is unevenly distributed and appears responsive "
                "to engagement and manager effectiveness levers."
            ),
            "focus": "Retention programs, engagement uplift, manager capability",
        }

    if persona == "BU_HEAD":
        return {
            "headline": "Attrition risk varies meaningfully across operating units",
            "insight": (
                "Certain locations and teams carry disproportionate attrition risk, "
                "suggesting the need for localised intervention."
            ),
            "focus": "Execution, team stability, local action planning",
        }

    return {
        "headline": "Persona not recognised",
        "insight": "No advisory narrative available.",
        "focus": None,
    }
