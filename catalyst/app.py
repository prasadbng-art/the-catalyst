import streamlit as st

# ============================================================
# 🔐 Auth Stub (disabled for local demo)
# ============================================================

st.session_state["authenticated"] = True
st.session_state["email"] = "demo@catalyst.ai"

# ============================================================
# Imports (authoritative)
# ============================================================

from catalyst.context_manager_v1 import get_effective_context
from visuals.kpi_current import render_kpi_current_performance
from demo_loader_v1 import load_demo_context_v1
from catalyst.file_ingest_v1 import load_workforce_file

from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis
from catalyst.analytics.what_if_engine_v1 import apply_what_if

from catalyst.analytics.cost_framing_v1 import compute_cost_framing
from catalyst.analytics.cost_narrative_v1 import generate_cost_narrative
from catalyst.analytics.cost_confidence_bands_v1 import compute_cost_confidence_bands
from catalyst.analytics.cost_narrative_cfo_v1 import generate_cost_narrative
from catalyst.analytics.board_summary_v1 import generate_board_summary
from catalyst.analytics.roi_lens_v1 import compute_roi_lens

# ============================================================
# USD formatter
# ============================================================

def format_usd(value: float, millions: bool = True) -> str:
    if value is None:
        return "—"
    if millions:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

# ============================================================
# Session State Initialization
# ============================================================

st.session_state.setdefault("context_v1", {})
st.session_state.setdefault("demo_welcomed", False)
st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)

# ============================================================
# Context Resolution (Authoritative)
# ============================================================

context = get_effective_context()

# ============================================================
# Journey State (Phase 3)
# ============================================================

st.session_state.setdefault("journey_state", "entry")

# ============================================================
# Phase 3A — Simplified Startup & Routing (Authoritative)
# ============================================================

# Canonical defaults
st.session_state.setdefault("journey_state", "baseline")
st.session_state.setdefault("what_if_kpis", None)

# ------------------------------------------------------------
# Minimal entry: only when no data exists
# ------------------------------------------------------------

def render_minimal_upload():
    st.markdown("## Catalyst")
    st.markdown("### Executive Attrition Risk Briefing")

    st.markdown(
        """
        Upload a workforce snapshot (CSV or Excel) to view:
        - Current attrition exposure
        - Estimated financial impact
        - Decision simulations (optional)
        """
    )

    uploaded_file = st.file_uploader(
        "Upload workforce data",
        type=["csv", "xlsx"],
        use_container_width=True,
    )

    if not uploaded_file:
        st.info("Upload a file to begin.")
        st.stop()

    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.error(e)
        st.stop()

    for w in warnings:
        st.warning(w)

    st.session_state["workforce_df"] = df

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis

    st.session_state["journey_state"] = "baseline"
    st.rerun()

# ------------------------------------------------------------
# Routing guard
# ------------------------------------------------------------

if st.session_state.get("workforce_df") is None:
    render_minimal_upload()
    st.stop()

# From here onward:
# → Baseline Attrition Briefing is ALWAYS the default

# ============================================================
# Sidebar — Upload
# ============================================================

st.sidebar.markdown("## 📄 Upload Workforce Data")

uploaded_file = st.sidebar.file_uploader("Upload CSV or Excel", ["csv", "xlsx"])

if uploaded_file:
    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis

if st.session_state["journey_state"] == "baseline" and st.session_state["workforce_df"] is None:
    st.info("Upload workforce data to begin analysis.")
    st.stop()


# ============================================================
# Sidebar — Persona
# ============================================================

st.sidebar.markdown("## 👤 Perspective")
persona_options = ["CEO", "CFO", "CHRO"]

selected_persona = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(context.get("persona", "CEO")),
)

context["persona"] = selected_persona
st.session_state["context_v1"]["persona"] = selected_persona

# ============================================================
# Sidebar — What-If Sandbox
# ============================================================

if st.session_state.get["journey_state"] == "simulation":
    st.sidebar.markdown("## 🧪 Simulate a leadership decision")
    st.sidebar.caption(
        "Adjust assumptions below and apply the simulation to explore potential outcomes."
    )

attrition_reduction = st.sidebar.slider("Effectiveness of retention actions (%)", 0, 30, 0)
engagement_lift = st.sidebar.slider("Engagement uplift (points)", 0, 20, 0)
manager_lift = st.sidebar.slider("Manager capability uplift (points)", 0, 20, 0)

if st.sidebar.button("Apply Simulation"):
    st.session_state["what_if_kpis"] = apply_what_if(
        context["baseline"]["kpis"],
        {
            "attrition_risk_reduction_pct": attrition_reduction,
            "engagement_lift": engagement_lift,
            "manager_effectiveness_lift": manager_lift,
            "headcount": len(st.session_state["workforce_df"]),
            "risk_realization_factor": 0.6,
        },
    )
    st.rerun()

st.sidebar.divider()

if st.sidebar.button("Clear simulation"):
    st.session_state["what_if_kpis"] = None
    st.rerun()

# ============================================================
# Sidebar — Intervention Economics
# ============================================================

intervention_cost = 2_000_000
if st.session_state["journey_state"] == "simulation":
    with st.sidebar.expander("💼 Intervention economics", expanded=False):
        intervention_cost = st.sidebar.number_input(
            "Estimated annual intervention cost (USD)",
        min_value=0,
        value=intervention_cost,
        step=500_000,
    )

# ============================================================
# Pages
# ============================================================
if st.session_state["journey_state"] == "simulation":
    st.warning(
        "⚠️ **Simulation mode** — The results below reflect hypothetical leadership actions, "
        "not the current baseline."
    )
else:
    st.info(
        "You are viewing the **current (baseline) state** based on uploaded data. "
        "No simulated interventions are applied."
    )

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("High-level workforce risk summary.")

def render_current_kpis_page():
    st.header("What workforce risk are we carrying right now?")
    st.caption("All financial figures shown in USD.")

    # --------------------------------------------------
    # Resolve KPI source (baseline vs simulation)
    # --------------------------------------------------
    is_simulation = st.session_state.get("what_if_kpis") is not None

    if is_simulation:
        kpis = st.session_state["what_if_kpis"]
        st.caption("Showing simulated outcomes based on the selected leadership actions.")
    else:
        kpis = context["baseline"]["kpis"]

    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

    if selected_kpi != "attrition_risk":
        st.info(
            "This demo currently focuses on **Attrition Risk** and its economic impact."
        )
        return

    # --------------------------------------------------
    # Cost framing (authoritative engine)
    # --------------------------------------------------
    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=st.session_state["workforce_df"],
        financials=context.get("financials", {}),
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    st.metric(
        "Annual attrition cost exposure (direct + hidden costs)",
        format_usd(costs["baseline_cost_exposure"]),
    )
    st.metric(
        "Cost realistically preventable",
        format_usd(costs["preventable_cost"]),
    )

    with st.expander("What’s included in this cost estimate?"):
        st.markdown(
            """
            This estimate reflects the **full business cost of attrition**, not just
            hiring or replacement expenses.

            It includes:
            - Hiring and onboarding costs  
            - Productivity loss during vacancy periods  
            - Ramp-up inefficiency for new hires  
            - Manager time diverted to backfilling and coaching  
            - Team disruption and engagement drag  

            These factors are modeled conservatively to reflect realistic
            operating impact, not worst-case assumptions.
            """
        )

    # --------------------------------------------------
    # Narrative calibration (Phase 3A)
    # --------------------------------------------------
    narrative = generate_cost_narrative(costs, context["persona"])

    if is_simulation:
        narrative["headline"] = "Scenario view — hypothetical outcomes"
        narrative["body"] = (
            "The following reflects a **simulated scenario** based on the assumptions applied. "
            "These outcomes are **not predictions**, but illustrations of directional impact.\n\n"
            + narrative["body"]
        )
    else:
        narrative["headline"] = "Current exposure — baseline view"

    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])

    # --------------------------------------------------
    # Confidence bands
    # --------------------------------------------------
    bands = compute_cost_confidence_bands(
        costs["baseline_cost_exposure"],
        costs["preventable_cost"],
    )

    with st.expander("How uncertain is this exposure?"):
        st.metric("Conservative", format_usd(bands["conservative"]["baseline_cost"]))
        st.metric("Base case", format_usd(bands["base"]["baseline_cost"]))
        st.metric("Aggressive", format_usd(bands["aggressive"]["baseline_cost"]))

    # --------------------------------------------------
    # CFO lens (persona-aware)
    # --------------------------------------------------
    if context["persona"] == "CFO":
        cfo = generate_cost_narrative(costs, bands)
        st.subheader("Financial lens (CFO view)")
        st.markdown(cfo["body"])

    # --------------------------------------------------
    # ROI lens (only meaningful during simulation)
    # --------------------------------------------------
    if is_simulation:
        roi = compute_roi_lens(costs.get("what_if_cost_impact"), intervention_cost)
        if roi:
            with st.expander("Does this intervention economically justify itself?"):
                st.metric("Intervention cost", format_usd(roi["intervention_cost"]))
                st.metric("Annual cost avoided", format_usd(roi["cost_avoided"]))
                st.metric("Net benefit", format_usd(roi["net_benefit"]))
                st.metric("Return multiple", f"{roi['roi']:.1f}×")

# ============================================================
# Router
# ============================================================

page = st.sidebar.selectbox("Navigate", ["Sentiment Health", "Current KPIs"])

if page == "Sentiment Health":
    render_sentiment_health_page()
else:
    render_current_kpis_page()
