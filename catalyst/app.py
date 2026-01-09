# ==========================================================
# Catalyst — Main App Router
# (Corrected to match actual repo structure)
# ==========================================================

import streamlit as st

# ----------------------------------------------------------
# Existing Catalyst imports (verified from your tree)
# ----------------------------------------------------------

from wizard.wizard import run_client_wizard
from visuals.kpi_current import render_kpi_current_performance
from narrative_engine import render_sentiment_health

# ----------------------------------------------------------
# NEW: v0.9 Scenario Comparison
# ----------------------------------------------------------

from scenario_v09 import render_scenario_v09

def render_current_kpis_page():
    """
    Temporary wrapper to render current KPI performance as a page.
    """

    st.header("Current KPI Performance")

    # --- Demo selector (can later be client-driven)
    kpi = st.selectbox(
        "Select KPI",
        ["attrition", "engagement", "sentiment"]
    )

    current_value = st.slider(
        "Current Value (%)",
        min_value=0.0,
        max_value=100.0,
        value=12.5,
        step=0.1,
    )

    # --- Render using existing component
    render_kpi_current_performance(
        kpi=kpi,
        current_value=current_value,
        active_client=None,
    )

# ==========================================================
# Page Config (ONLY here)
# ==========================================================

st.set_page_config(
    page_title="Catalyst",
    layout="wide"
)

st.title("Catalyst")

# ==========================================================
# Navigation
# ==========================================================

page = st.sidebar.selectbox(
    "Navigate",
    [
        "Wizard",
        "Sentiment Health",
        "Current KPIs",
        "Scenario Comparison (v0.9)"
    ]
)

# ==========================================================
# Router
# ==========================================================

if page == "Wizard":
    run_client_wizard()

elif page == "Sentiment Health":
    render_sentiment_health()

elif page == "Current KPIs":
    render_current_kpis_page()

elif page == "Scenario Comparison (v0.9)":
    render_scenario_v09()
