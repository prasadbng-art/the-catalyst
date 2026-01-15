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
from catalyst.analytics.cost_narrative_cfo_v1 import generate_cfo_cost_narrative
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

st.session_state.setdefault("context_v1", None)
st.session_state.setdefault("demo_welcomed", False)
st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)

# ============================================================
# Journey State (Phase 3)
# ============================================================

st.session_state.setdefault("journey_state", "entry")

# ============================================================
# 🎬 Demo Entry Landing
# ============================================================

def render_demo_entry():
    st.markdown("## Catalyst")
    st.markdown("### Interactive Talent Intelligence Demo")

    st.markdown(
        """
        - Diagnose workforce risk  
        - Quantify attrition exposure and cost  
        - Test decisions safely using what-if simulations  
        """
    )

    if st.button("▶ Run Interactive Demo", use_container_width=True):
        load_demo_context_v1()
        st.rerun()

def render_entry_screen():
    st.header("Catalyst — Executive Workforce Risk Sandbox")
    st.subheader("A guided decision environment for leadership teams")

    st.markdown(
        """
        This sandbox demonstrates how Catalyst helps leaders:
        - Understand **attrition risk**
        - Quantify **financial exposure**
        - Safely **simulate leadership decisions**

        **Scope note:**  
        This demo focuses on *attrition risk and its economic impact only*.
        """
    )

    st.divider()

    if st.button("Enter demo", use_container_width=True):
        st.session_state["journey_state"] = "intro"
        st.rerun()

def render_intro_screen():
    st.header("What you’ll see in this demo")

    st.markdown(
        """
        In the next few steps, Catalyst will guide you through:

        **1. Upload a workforce snapshot**  
        A simple CSV or Excel file.

        **2. Review current attrition risk**  
        Including estimated financial exposure.

        **3. Simulate leadership actions**  
        And see how outcomes could change.

        No data is stored. Everything runs in-session.
        """
    )

    st.divider()

    if st.button("Upload workforce snapshot", use_container_width=True):
        st.session_state["journey_state"] = "upload"
        st.rerun()

def render_upload_screen():
    st.header("Step 1 of 3 — Upload workforce data")

    st.markdown(
        """
        Upload a workforce snapshot (CSV or Excel).  
        This data is used to compute attrition risk for this session only.
        """
    )

    uploaded_file = st.file_uploader(
        "Upload CSV or Excel",
        type=["csv", "xlsx"],
    )

    if not uploaded_file:
        st.info("Please upload a file to continue.")
        return

    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.error(e)
        return

    for w in warnings:
        st.warning(w)

    st.success(f"Loaded {len(df)} employee records")

    # Persist data (same logic you already have)
    st.session_state["workforce_df"] = df

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis

    st.divider()

    if st.button("Continue to attrition briefing", use_container_width=True):
        st.session_state["journey_state"] = "baseline"
        st.rerun()

# ============================================================
# 🔒 Context Gate
# ============================================================

if not isinstance(st.session_state.get("context_v1"), dict):
    render_demo_entry()
    st.stop()

context = get_effective_context()

# ============================================================
# Phase 3A — Journey Router (Entry → Intro → Upload)
# ============================================================

state = st.session_state.get("journey_state", "entry")

if state == "entry":
    render_entry_screen()
    st.stop()

if state == "intro":
    render_intro_screen()
    st.stop()

if state == "upload":
    render_upload_screen()
    st.stop()

# From here onward:
# state == "baseline" (existing app behavior)

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

st.sidebar.markdown("## 🧪 What-If Sandbox")

attrition_reduction = st.sidebar.slider("Effectiveness of retention actions (%)", 0, 30, 0)
engagement_lift = st.sidebar.slider("Engagement uplift (points)", 0, 20, 0)
manager_lift = st.sidebar.slider("Manager capability uplift (points)", 0, 20, 0)

if st.sidebar.button("Simulate this decision"):
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

st.sidebar.divider()

if st.sidebar.button("Clear simulation"):
    st.session_state["what_if_kpis"] = None

# ============================================================
# Sidebar — Intervention Economics
# ============================================================

intervention_cost = 2_000_000

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

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("High-level workforce risk summary.")

def render_current_kpis_page():
    st.header("What workforce risk are we carrying right now?")
    st.caption("All financial figures shown in USD.")

    kpis = (
        st.session_state["what_if_kpis"]
        if st.session_state.get("what_if_kpis")
        else context["baseline"]["kpis"]
    )

    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

    if selected_kpi != "attrition_risk":
        return

    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=st.session_state["workforce_df"],
        financials=context.get("financials", {}),
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    st.metric("Annual attrition cost exposure", format_usd(costs["baseline_cost_exposure"]))
    st.metric("Cost realistically preventable", format_usd(costs["preventable_cost"]))

    narrative = generate_cost_narrative(costs, context["persona"])
    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])

    bands = compute_cost_confidence_bands(
        costs["baseline_cost_exposure"],
        costs["preventable_cost"],
    )

    with st.expander("How uncertain is this exposure?"):
        st.metric("Conservative", format_usd(bands["conservative"]["baseline_cost"]))
        st.metric("Base case", format_usd(bands["base"]["baseline_cost"]))
        st.metric("Aggressive", format_usd(bands["aggressive"]["baseline_cost"]))

    if context["persona"] == "CFO":
        cfo = generate_cfo_cost_narrative(costs, bands)
        st.subheader("Financial lens (CFO view)")
        st.markdown(cfo["body"])

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
