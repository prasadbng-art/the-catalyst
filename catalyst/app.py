import streamlit as st

# ============================================================
# Imports (authoritative, no duplicates)
# ============================================================

from catalyst.wizard.wizard import run_client_wizard
from catalyst.context_manager_v1 import get_effective_context
from scenario_application_boundary_v1 import apply_scenario, clear_scenario
from scenario_state_reader import get_active_scenario

from visuals.kpi_current import render_kpi_current_performance
from visuals.kpi_impact_table import render_kpi_impact_table

from narrative_engine import generate_narrative
from decision_narrative_engine import generate_decision_narrative

from scenario_v09 import list_scenarios
from scenario_simulation_engine import simulate_scenario
from scenario_comparison_v09 import render_scenario_v09

from kpi_delta_engine import compute_kpi_deltas
from demo_loader_v1 import load_demo_context_v1

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

# ============================================================
# 🎬 DEMO ENTRY LANDING
# ============================================================

def render_demo_entry():
    st.title("Catalyst")
    st.subheader("Interactive Talent Intelligence Demo")

    st.markdown(
        """
        Explore how Catalyst helps leadership teams diagnose workforce risk,
        evaluate scenarios, and make economically grounded people decisions.
        """
    )

    st.divider()

    if st.button("▶ Run Interactive Demo", use_container_width=True):
        st.session_state["context_v1"] = load_demo_context_v1()
        st.session_state["demo_mode"] = True
        st.rerun()

# ============================================================
# 🔒 CONTEXT ENTRY GATE (AUTHORITATIVE)
# ============================================================

if "context_v1" not in st.session_state:
    render_demo_entry()
    st.stop()

context = get_effective_context()

simulated_context = None

if st.session_state.get("simulate") and st.session_state.get("simulate_scenario_id") != "none":
    simulated_context = simulate_scenario(
        base_context=context,
        scenario_id=st.session_state["simulate_scenario_id"],
    )

# ============================================================
# Sidebar: Scenario Status
# ============================================================

with st.sidebar.container():
    active_scenario = get_active_scenario(context)

    if active_scenario:
        st.markdown("### 🔁 Active Scenario")
        st.success(active_scenario["label"])
        st.caption("Context is scenario-adjusted")
    else:
        st.markdown("### 🟢 Baseline Context")
        st.caption("No active scenario")

# ============================================================
# Sidebar: Context Editor (Demo Control)
# ============================================================

with st.sidebar.expander("Context (Demo Control)", expanded=False):

    persona_options = ["CEO", "CFO", "CHRO"]
    current_persona = context.get("persona", "CEO")

    context["persona"] = st.selectbox(
        "Persona",
        persona_options,
        index=persona_options.index(current_persona if current_persona in persona_options else "CEO"),
    )

    strategy_options = ["cost", "growth", "balanced"]
    strategy = context.get("strategy", {})
    current_posture = strategy.get("posture", "balanced")

    strategy["posture"] = st.selectbox(
        "Strategy posture",
        strategy_options,
        index=strategy_options.index(current_posture if current_posture in strategy_options else "balanced"),
    )

    context["strategy"] = strategy

    st.markdown("### KPI Baseline")

    kpis = context.get("kpis", {})

    for kpi, kpi_state in kpis.items():
        st.markdown(f"**{kpi.title()}**")

        kpi_state["value"] = st.slider(
            f"{kpi} value",
            min_value=0.0,
            max_value=100.0,
            value=float(kpi_state.get("value", 0.0)),
            step=0.5,
            key=f"{kpi}_value",
        )

        kpi_state["status"] = st.selectbox(
            f"{kpi} status",
            ["green", "amber", "red"],
            index=["green", "amber", "red"].index(kpi_state.get("status", "amber")),
            key=f"{kpi}_status",
        )

    context["kpis"] = kpis

# ============================================================
# Sidebar: Scenario Control (Phase B)
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

    with col_b:
        if st.button("Clear Scenario"):
            clear_scenario()
            st.info("Scenario cleared")

# ============================================================
# Sidebar: What-If Simulation (Phase C)
# ============================================================

with st.sidebar.expander("What-If Simulation", expanded=False):

    scenario_ids = list(scenarios.keys())

    simulate_id = st.selectbox(
        "Simulate scenario",
        ["none"] + scenario_ids,
        format_func=lambda s: "None" if s == "none" else scenarios[s]["label"],
        key="simulate_scenario_id",
    )

    st.session_state["simulate"] = st.button(
        "Run Simulation",
        disabled=simulate_id == "none",
    )

# ============================================================
# Navigation
# ============================================================

page = st.sidebar.selectbox(
    "Navigate",
    [
        "Sentiment Health",
        "Current KPIs",
        "Scenario Comparison (v0.9)",
    ],
)

# ============================================================
# Pages
# ============================================================

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("Narrative decision support")

    kpis = context.get("kpis", {})

    if "attrition" not in kpis:
        st.info("Attrition KPI not configured.")
        return

    kpi_state = kpis["attrition"]

    narrative = generate_narrative(
        kpi="attrition",
        kpi_state=kpi_state,
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

    active_context = simulated_context if simulated_context else context
    kpis = active_context.get("kpis", {})

    if not kpis:
        st.info("No KPIs configured.")
        return

    kpi = st.selectbox("Select KPI", list(kpis.keys()))
    kpi_state = kpis[kpi]

    render_kpi_current_performance(
        kpi=kpi,
        current_value=kpi_state.get("value", 0.0),
        active_client=None,
    )

    if simulated_context:
        deltas = compute_kpi_deltas(
            baseline=context,
            scenario=simulated_context,
        )

        render_kpi_impact_table(deltas)

        narrative = generate_decision_narrative(
            deltas=deltas,
            persona=context["persona"],
            scenario_label=scenarios[st.session_state["simulate_scenario_id"]]["label"],
        )

        st.divider()
        st.subheader(narrative["headline"])
        st.markdown(narrative["framing"])
        st.markdown(f"**Summary:** {narrative['summary']}")
        st.info(narrative["recommendation"])

# ============================================================
# Router
# ============================================================

if page == "Sentiment Health":
    render_sentiment_health_page()

elif page == "Current KPIs":
    render_current_kpis_page()

elif page == "Scenario Comparison (v0.9)":
    render_scenario_v09()
