# catalyst/kpi_thresholds.py

from defaults import DEFAULT_KPI_THRESHOLDS

KPI_THRESHOLDS = {
    "attrition": {
        "low": 10,
        "moderate": 20,
        "high": 30
    },
    "engagement": {
        "low": 40,
        "moderate": 60,
        "high": 80
    },
    "sentiment": {
        "low": 50,
        "moderate": 60,
        "high": 70
    }
}

def resolve_kpi_thresholds(kpi: str, active_client: dict | None):
    """
    Resolves KPI thresholds with client override support.
    """

    # ---- Client-specific override
    if active_client:
        client_thresholds = (
            active_client
            .get("kpi_thresholds", {})
            .get(kpi)
        )
        if client_thresholds:
            return client_thresholds

    # ---- Fallback to registry defaults
    return KPI_THRESHOLDS.get(kpi)


def classify_kpi(value: float, thresholds: dict) -> str:
    """
    Classifies KPI value using semantic thresholds:
    low / moderate / high
    """

    if not thresholds:
        return "unknown"

    low = thresholds.get("low")
    moderate = thresholds.get("moderate")
    high = thresholds.get("high")

    if low is None or moderate is None or high is None:
        return "unknown"

    if value <= low:
        return "low"
    elif value <= moderate:
        return "moderate"
    else:
        return "high"

