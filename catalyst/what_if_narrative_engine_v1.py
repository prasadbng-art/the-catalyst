def generate_what_if_narrative(baseline_kpis, what_if_kpis, persona):
    baseline_risk = baseline_kpis["attrition"]["value"]
    what_if_risk = what_if_kpis["attrition"]["value"]

    delta = baseline_risk - what_if_risk

    if delta > 2:
        headline = "Attrition risk meaningfully reduced under proposed actions"
        implication = (
            "The modeled interventions materially lower workforce exit risk, "
            "suggesting a defensible reduction in attrition exposure."
        )
    elif delta > 0.5:
        headline = "Incremental improvement in attrition risk observed"
        implication = (
            "The proposed changes yield modest improvements, "
            "but may not fully offset underlying attrition drivers."
        )
    else:
        headline = "Limited impact on attrition risk under current assumptions"
        implication = (
            "The modeled actions are unlikely to materially alter attrition outcomes "
            "without stronger or more targeted interventions."
        )

    if persona == "CFO":
        recommendation = (
            "Prioritize interventions with the highest cost-to-risk reduction ratio "
            "before committing incremental spend."
        )
    elif persona == "CHRO":
        recommendation = (
            "Focus on targeted retention levers in critical roles to amplify impact."
        )
    else:  # CEO
        recommendation = (
            "Treat retention as a strategic risk lever and align leadership actions accordingly."
        )

    summary = (
        f"Attrition risk shifts from {baseline_risk:.1f}% to {what_if_risk:.1f}% "
        f"under the modeled scenario."
    )

    return {
        "headline": headline,
        "summary": summary,
        "implication": implication,
        "recommendation": recommendation,
    }
