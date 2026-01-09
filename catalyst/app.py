import streamlit as st

from wizard.wizard import run_client_wizard
from visuals.kpi_current import render_kpi_current_performance
from narrative_engine import generate_narrative
from scenario_v09 import render_scenario_v09


st.set_page_config(page_title="Catalyst", layout="wide")
st.title("Catalyst")


def render_current_kpis_page():
    st.header("Current KPI Performance")

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

    render_kpi_current_performance(
        kpi=kpi,
        current_value=current_value,
        active_client=None,
    )


def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("Narrative decision support")

    persona = st.selectbox(
        "Persona",
        ["CEO", "CFO", "CHRO"]
    )

    kpi_state = {
        "attrition_rate": st.slider(
            "Attrition Rate (%)",
            0.0, 40.0, 18.0, 0.5
        ),
        "status": st.selectbox(
            "Status",
            ["green", "amber", "red"]
        )
    }

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