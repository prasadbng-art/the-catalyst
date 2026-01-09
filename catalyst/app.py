# ==========================================================
# Catalyst — Main App Router
# (Corrected to match actual repo structure)
# ==========================================================

import streamlit as st

# ----------------------------------------------------------
# Existing Catalyst imports (verified from your tree)
# ----------------------------------------------------------

from wizard.wizard import render_wizard
from visuals.kpi_current import render_kpi_current
from narrative_engine import render_sentiment_health

# ----------------------------------------------------------
# NEW: v0.9 Scenario Comparison
# ----------------------------------------------------------

from scenario_v09 import render_scenario_v09


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
    render_wizard()

elif page == "Sentiment Health":
    render_sentiment_health()

elif page == "Current KPIs":
    render_kpi_current()

elif page == "Scenario Comparison (v0.9)":
    render_scenario_v09()
