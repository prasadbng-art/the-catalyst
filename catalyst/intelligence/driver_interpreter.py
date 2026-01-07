import yaml
from pathlib import Path


# ------------------------------------------------------------
# Load Driver Definitions
# ------------------------------------------------------------
def load_driver_definitions(relative_path: str):
    """
    Load drivers.yaml using a path relative to the catalyst package root.
    """
    base_dir = Path(__file__).resolve().parents[1]  # catalyst/
    full_path = base_dir / relative_path

    with open(full_path, "r") as f:
        return yaml.safe_load(f)["drivers"]

# ------------------------------------------------------------
# Template Selection Logic
# ------------------------------------------------------------
def select_template(templates, strength):
    """
    Selects the correct narrative template
    based on strength thresholds defined in YAML.
    """
    for template_name, template in templates.items():
        rules = template.get("when", {})

        if "strength_gte" in rules and strength >= rules["strength_gte"]:
            return template["text"]

        if "strength_between" in rules:
            low, high = rules["strength_between"]
            if low <= strength < high:
                return template["text"]

        if "strength_lt" in rules and strength < rules["strength_lt"]:
            return template["text"]

    return None


# ------------------------------------------------------------
# Narrative Generator
# ------------------------------------------------------------
def generate_driver_narrative(
    driver_id,
    evidence,
    kpi_label,
    driver_definitions
):
    """
    Produces a KPI-aware narrative explanation
    for a single driver.
    """

    driver = driver_definitions.get(driver_id)
    if not driver:
        return None

    strength = evidence.get("strength", 0.0)
    signals = evidence.get("signals", [])

    templates = driver["narrative"]["templates"]
    template_text = select_template(templates, strength)

    if not template_text:
        return None

    return template_text.format(
        kpi_label=kpi_label,
        strength_pct=int(strength * 100),
        signals=", ".join(signals) if signals else "multiple contributing signals"
    )
