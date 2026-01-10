import streamlit as st

# ============================================================
# Imports (authoritative, no duplicates)
# NOTE:
# Scenario UI, scenario data, and scenario application
# are intentionally separated (Phase B).
# ============================================================

from catalyst.wizard.wizard import run_client_wizard
from catalyst.context_manager_v1 import get_effective_context
from scenario_application_boundary_v1 import apply_scenario, clear_scenario
from scenario_state_reader import get_active_scenario
from scenario_application_boundary_v1 import (
    apply_scenario,
    clear_scenario,
)
from visuals.kpi_current import render_kpi_current_performance
from narrative_engine import generate_narrative
from scenario_comparison_v09 import render_scenario_v09
from scenario_v09 import list_scenarios
from scenario_simulation_engine import simulate_scenario
from scenario_v09 import list_scenarios
from kpi_delta_engine import compute_kpi_deltas
from visuals.kpi_impact_table import render_kpi_impact_table
from decision_narrative_engine import generate_decision_narrative

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

simulated_context = None

if st.session_state.get("simulate") and st.session_state.get("simulate_scenario_id") != "none":
    simulated_context = simulate_scenario(
        base_context=context,
        scenario_id=st.session_state["simulate_scenario_id"],
    )

# ============================================================
# Sidebar: Scenario Status (Phase C1)
# ============================================================

with st.sidebar.container():
    active_scenario = get_active_scenario(context)

    if active_scenario:
        st.info(f"Scenario active: {active_scenario['label']}")
        st.markdown("### 🔁 Active Scenario")
        st.success(active_scenario["label"])
        st.caption("Context is scenario-adjusted")
    else:
        st.markdown("### 🟢 Baseline Context")
        st.caption("No active scenario")

# ============================================================
# Sidebar: Context editor (demo / control only)
# ============================================================
def render_context_editor():
    """
    Temporary demo/control panel for Catalyst context.
    Context is assumed to exist.
    """
    with st.sidebar.expander("Context (Demo Control)", expanded=False):

        # ---- Persona (UI-level default)
        persona_options = ["CEO", "CFO", "CHRO"]

    current_persona = context.get("persona", "CEO")
    if current_persona not in persona_options:
        current_persona = "CEO"

    context["persona"] = st.selectbox(
        "Persona",
        persona_options,
        index=persona_options.index(current_persona),
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
# Sidebar: What-If Simulation (Phase C2)
# ============================================================

with st.sidebar.expander("What-If Simulation", expanded=False):

    scenarios = list_scenarios()
    scenario_ids = list(scenarios.keys())

    simulate_id = st.selectbox(
        "Simulate scenario",
        ["none"] + scenario_ids,
        format_func=lambda s: "None" if s == "none" else scenarios[s]["label"],
        key="simulate_scenario_id",
    )

    simulate = st.button(
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

    active_context = simulated_context if simulated_context else context

    if simulated_context:
        st.info(
            f"Simulated scenario: "
            f"{scenarios[st.session_state['simulate_scenario_id']]['label']}"
        )

    kpi = st.selectbox(
        "Select KPI",
        list(active_context["kpis"].keys()),
    )

    kpi_state = active_context["kpis"][kpi]

    render_kpi_current_performance(
        kpi=kpi,
        current_value=kpi_state["value"],
        active_client=None,
    )
# ======================================================
# Phase D1 — Scenario Impact Table (EXECUTIVE VIEW)
# ======================================================
    if simulated_context:
        deltas = compute_kpi_deltas(
            baseline=context,
            scenario=simulated_context,
        )
        render_kpi_impact_table(deltas)

# ======================================================
# Phase D2 — Executive Decision Narrative
# ======================================================
    if simulated_context:
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
