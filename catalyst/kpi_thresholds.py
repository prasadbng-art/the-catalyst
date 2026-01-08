# catalyst/kpi_thresholds.py

from defaults import DEFAULT_KPI_THRESHOLDS


def resolve_kpi_thresholds(
    *,
    kpi: str,
    active_client: dict | None
) -> dict:
    """
    Returns threshold config for a KPI.
    Client overrides take precedence over defaults.
    """
    if (
        active_client
        and "kpis" in active_client
        and kpi in active_client["kpis"]
        and "thresholds" in active_client["kpis"][kpi]
    ):
        return active_client["kpis"][kpi]["thresholds"]

    return DEFAULT_KPI_THRESHOLDS.get(kpi, {})
