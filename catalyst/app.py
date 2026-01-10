import streamlit as st

# ============================================================
# Imports (authoritative, no duplicates)
# ============================================================

from catalyst.wizard.wizard import run_client_wizard
from catalyst.context_manager_v1 import get_effective_context
from scenario_application_boundary_v1 import apply_scenario, clear_scenario

from scenario_application_boundary_v1 import (
    apply_scenario,
    clear_scenario,
)
from visuals.kpi_current import render_kpi_current_performance
from narrative_engine import generate_narrative
from scenario_comparison_v09 import render_scenario_v09

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")
st.title("Catalyst")

# ============================================================
# 🔒 CONTEXT GATE (SINGLE, AUTHORITATIVE)
# ============================================================

context = get_effective_context()

if not context:
    st.info("No active context found. Launching Client Wizard.")
    run_client_wizard()
    st.stop()


# ============================================================
# Sidebar: Context editor (demo / control only)
# ============================================================

def render_context_editor():
    """
    Temporary demo/control panel for Catalyst context.
    Context is assumed to exist.
    """
    with st.sidebar.expander("Context (Demo Control)", expanded=False):

        # ---- Persona
        context["persona"] = st.selectbox(
            "Persona",
            ["CEO", "CFO", "CHRO"],
            index=["CEO", "CFO", "CHRO"].index(context["persona"]),
        )

        # ---- Strategy posture
        context["strategy"]["posture"] = st.selectbox(
            "Strategy posture",
            ["cost", "growth", "balanced"],
            index=["cost", "growth", "balanced"].index(
                context["strategy"]["posture"]
            ),
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
                key=f"{kpi}_value",
            )

            kpi_state["status"] = st.selectbox(
                f"{kpi} status",
                ["green", "amber", "red"],
                index=["green", "amber", "red"].index(kpi_state["status"]),
                key=f"{kpi}_status",
            )

render_context_editor()

# ============================================================
# Sidebar: Scenario Control (Phase B — Explicit)
# ============================================================

with st.sidebar.expander("Scenario Control", expanded=False):

    scenarios = list_scenarios()
    scenario_ids = ["none"] + list(scenarios.keys())

    selected_scenario = st.selectbox(
        "Active Scenario",
        scenario_ids,
        format_func=lambda s: "None" if s == "none" else scenarios[s]["label"],
    )

    col_a, col_b = st.columns(2)

    with col_a:
        if st.button("Apply Scenario", disabled=selected_scenario == "none"):
         apply_scenario(selected_scenario)
        st.success("Scenario applied")

    if st.button("Clear Scenario"):
        clear_scenario()
        st.info("Scenario cleared")


# ============================================================
# Navigation
# ============================================================

page = st.sidebar.selectbox(
    "Navigate",
    [
        "Sentiment Health",
        "Current KPIs",
        "Scenario Comparison (v0.9)",
        "Wizard",
    ],
)

# ============================================================
# Pages (context is guaranteed to exist)
# ============================================================

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("Narrative decision support")

    narrative = generate_narrative(
        kpi="attrition",
        kpi_state=context["kpis"]["attrition"],
        client_context=None,
        persona=context["persona"],
        strategy_context=context["strategy"],
    )

    st.divider()
    st.subheader(narrative["headline"])
    st.markdown(narrative["interpretation"])
    st.markdown("**Risk statement**")
    st.markdown(narrative["risk_statement"])
    st.markdown("**Recommended posture**")
    st.info(narrative["recommended_posture"])
    st.caption(f"Confidence: {narrative['confidence']}")

def render_current_kpis_page():
    st.header("Current KPI Performance")

    kpi = st.selectbox(
        "Select KPI",
        list(context["kpis"].keys()),
    )

    kpi_state = context["kpis"][kpi]

    render_kpi_current_performance(
        kpi=kpi,
        current_value=kpi_state["value"],
        active_client=None,
    )

# ============================================================
# Router (ONLY place pages are invoked)
# ============================================================

if page == "Wizard":
    run_client_wizard()

elif page == "Sentiment Health":
    render_sentiment_health_page()

elif page == "Current KPIs":
    render_current_kpis_page()

elif page == "Scenario Comparison (v0.9)":
    render_scenario_v09()
