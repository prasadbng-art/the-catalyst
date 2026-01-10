import pandas as pd

REQUIRED_COLUMNS = {
    "employee_id",
    "role",
    "manager_id",
    "tenure_months",
    "salary",
    "performance_band",
    "engagement_score",
    "attrition_risk_score",
}

def load_workforce_file(uploaded_file):
    """
    Loads CSV or Excel workforce snapshot and validates schema.
    Returns (df, errors, warnings)
    """

    errors = []
    warnings = []

    # ---------- Load ----------
    try:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.name.endswith(".xlsx"):
            df = pd.read_excel(uploaded_file)
        else:
            errors.append("Unsupported file type. Please upload CSV or Excel.")
            return None, errors, warnings
    except Exception as e:
        errors.append(f"Unable to read file: {e}")
        return None, errors, warnings

    # ---------- Normalize ----------
    df.columns = [c.strip().lower() for c in df.columns]

    # ---------- Required columns ----------
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        errors.append(
            f"Missing required columns: {', '.join(sorted(missing))}"
        )

    # ---------- Data type checks ----------
    for col in ["tenure_months", "salary", "engagement_score", "attrition_risk_score"]:
        if col in df.columns:
            if not pd.api.types.is_numeric_dtype(df[col]):
                errors.append(f"Column '{col}' must be numeric.")

    # ---------- Performance band validation ----------
    if "performance_band" in df.columns:
        allowed = {"low", "medium", "high"}
        invalid = set(df["performance_band"].astype(str).str.lower().unique()) - allowed
        if invalid:
            warnings.append(
                f"Unexpected performance_band values: {', '.join(invalid)}. "
                "Expected: low / medium / high."
            )

    # ---------- Engagement score range ----------
    if "engagement_score" in df.columns:
        if df["engagement_score"].max() > 100 or df["engagement_score"].min() < 0:
            warnings.append("Engagement scores should be between 0 and 100.")

    # ---------- Attrition risk normalization note ----------
    if "attrition_risk_score" in df.columns:
        if df["attrition_risk_score"].max() > 1:
            warnings.append(
                "Attrition risk appears to be percentage-based; "
                "it will be normalized internally."
            )

    if errors:
        return None, errors, warnings

    return df, errors, warnings
