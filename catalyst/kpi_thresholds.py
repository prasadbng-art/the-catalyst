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
        "low": -0.2,
        "moderate": 0.2,
        "high": 0.5
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
    Classifies KPI value into green / amber / red.
    """
    if value <= thresholds["green"]["max"]:
        return "green"

    if (
        "amber" in thresholds
        and thresholds["amber"]["min"] <= value <= thresholds["amber"]["max"]
    ):
        return "amber"

    return "red"
