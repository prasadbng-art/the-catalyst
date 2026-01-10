import streamlit as st

from wizard.wizard import run_client_wizard
from visuals.kpi_current import render_kpi_current_performance
from narrative_engine import generate_narrative
from scenario_v09 import render_scenario_v09
from context_persistence import load_context_v1

# ============================================================
# CONTEXT RETRIEVAL HELPER 
# ============================================================

def get_effective_context():
    """
    Authoritative context accessor (v1 only).
    """
    if "context_v1" not in st.session_state:
        st.error("No active context found. Please run the Client Wizard.")
        st.stop()

    return st.session_state["context_v1"]["effective"]

# --------------------------------------------------
# Context editor (DEFINE FIRST)
# --------------------------------------------------

def render_context_editor():
    """
    Temporary demo/control panel for Catalyst context.
    This is NOT part of page logic.
    """

    with st.sidebar.expander("Context (Demo Control)", expanded=False):
        context = get_active_context()

        # ---- Persona
        context["persona"] = st.selectbox(
            "Persona",
            ["CEO", "CFO", "CHRO"],
            index=["CEO", "CFO", "CHRO"].index(context["persona"])
        )

        # ---- Strategy posture
        context["strategy"]["posture"] = st.selectbox(
            "Strategy posture",
            ["cost", "growth", "balanced"],
            index=["cost", "growth", "balanced"].index(
                context["strategy"]["posture"]
            )
        )

        st.markdown("### KPI Baseline")

        for kpi, kpi_state in context["kpis"].items():
            st.markdown(f"**{kpi.title()}**")

            kpi_state["value"] = st.slider(
                f"{kpi} value",
                min_value=0.0,
                max_value=100.0,
                value=float(kpi_state["value"]),
                step=0.5,
                key=f"{kpi}_value"
            )

            kpi_state["status"] = st.selectbox(
                f"{kpi} status",
                ["green", "amber", "red"],
                index=["green", "amber", "red"].index(kpi_state["status"]),
                key=f"{kpi}_status"
            )
# --------------------------------------------------
# App setup
# --------------------------------------------------
st.set_page_config(page_title="Catalyst", layout="wide")
st.title("Catalyst")

render_context_editor()

def render_current_kpis_page():
    st.header("Current KPI Performance")
context = get_effective_context()

kpi = st.selectbox(
    "Select KPI",
    list(context["kpis"].keys())
)

kpi_state = context["kpis"][kpi]

render_kpi_current_performance(
    kpi=kpi,    
    current_value=kpi_state["value"],
    active_client=None,
)

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("Narrative decision support")

    context = get_effective_context()

    persona = context["persona"]
    strategy = context["strategy"]  
    kpi_state = context["kpis"]["attrition"]

    narrative = generate_narrative(
        kpi="attrition",
        kpi_state=kpi_state,
        client_context=None,
        persona=persona,
        strategy_context={"posture": "cost"},
    )

    st.divider()

    st.subheader(narrative["headline"])
    st.markdown(narrative["interpretation"])
    st.markdown("**Risk statement**")
    st.markdown(narrative["risk_statement"])
    st.markdown("**Recommended posture**")
    st.info(narrative["recommended_posture"])
    st.caption(f"Confidence: {narrative['confidence']}")


page = st.sidebar.selectbox(
    "Navigate",
    [
        "Wizard",
        "Sentiment Health",
        "Current KPIs",
        "Scenario Comparison (v0.9)"
    ]
)

if page == "Wizard":
    run_client_wizard()

elif page == "Sentiment Health":
    render_sentiment_health_page()

elif page == "Current KPIs":
    render_current_kpis_page()

elif page == "Scenario Comparison (v0.9)":
    render_scenario_v09()
# ============================================================