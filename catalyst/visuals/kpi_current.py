# catalyst/visuals/kpi_current.py

import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from kpi_thresholds import classify_kpi, resolve_kpi_thresholds
from kpi_registry import KPI_REGISTRY


# ============================================================
# DEMO TIME-SERIES GENERATOR (CLIENT-AWARE LATER)
# ============================================================
def generate_demo_kpi_timeseries(
    *,
    kpi: str,
    current_value: float,
    periods: int = 12,
):
    """
    Generates a believable historical trend ending at current_value.
    """

    np.random.seed(42)

    drift = {
        "attrition": 0.3,
        "engagement": -0.2,
        "sentiment": -0.1,
    }.get(kpi, 0.0)

    values = [current_value]

    for _ in range(periods - 1):
        prev = values[-1]
        shock = np.random.normal(0, 0.8)
        values.append(max(0, prev - drift + shock))

    values = list(reversed(values))

    dates = [
        datetime.today() - timedelta(days=30 * i)
        for i in reversed(range(periods))
    ]

    return pd.DataFrame({
        "period": dates,
        "value": values
    })


# ============================================================
# MAIN RENDERER
# ============================================================
def render_kpi_current_performance(
    *,
    kpi: str,
    current_value: float,
    active_client: dict | None,
):
    """
    Renders current-period KPI performance and trend.
    """

    st.markdown("## Current Period Performance")

    thresholds = resolve_kpi_thresholds(kpi, active_client)
    status = classify_kpi(current_value, thresholds)

    # ---- Status visuals (aligned with v0.8 semantics)
    STATUS_VISUALS = {
        "low": ("🟢", "Low risk"),
        "moderate": ("🟡", "Moderate risk"),
        "high": ("🔴", "High risk"),
        "unknown": ("⚪", "Unknown"),
    }

    icon, label = STATUS_VISUALS.get(status, STATUS_VISUALS["unknown"])

    # ---- Scorecard
    c1, c2, c3 = st.columns(3)

    c1.metric(
        KPI_REGISTRY[kpi]["label"],
        f"{current_value:.1f}%",
    )

    c2.metric(
        "Status",
        f"{icon} {label}",
    )

    c3.metric(
        "Thresholds",
        f"{thresholds}",
    )

    # ---- Trend
    st.markdown("### Trend (Last 12 Months)")

    df = generate_demo_kpi_timeseries(
        kpi=kpi,
        current_value=current_value,
    )

    st.line_chart(
        df.set_index("period")["value"],
        height=280,
    )
