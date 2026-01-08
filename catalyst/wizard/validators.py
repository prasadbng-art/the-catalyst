# catalyst/wizard/validators.py

def validate_client_profile(profile: dict) -> list[str]:
    errors = []

    if not profile["client"]["name"]:
        errors.append("Client name is required.")

    enabled_kpis = [
        k for k, v in profile["kpis"].items()
        if isinstance(v, dict) and v.get("enabled")
    ]

    if not enabled_kpis:
        errors.append("At least one KPI must be enabled.")

    if profile["kpis"]["primary"] not in enabled_kpis:
        errors.append("Primary KPI must be enabled.")

    if profile["strategy"]["horizon_days"] < 90:
        errors.append("Decision horizon must be at least 90 days.")

    if profile["financials"]["replacement_multiplier"] < 1.0:
        errors.append("Replacement multiplier must be ≥ 1.0.")

    return errors
