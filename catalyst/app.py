import streamlit as st

# ============================================================
# 🔐 Auth Stub (demo only)
# ============================================================

st.session_state["authenticated"] = True
st.session_state["email"] = "demo@catalyst.ai"

# ============================================================
# Imports
# ============================================================

from catalyst.context_manager_v1 import get_effective_context
from catalyst.file_ingest_v1 import load_workforce_file

from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis
from catalyst.analytics.what_if_engine_v1 import apply_what_if
from catalyst.analytics.cost_framing_v1 import compute_cost_framing
from catalyst.analytics.cost_narrative_v1 import generate_cost_narrative
from catalyst.analytics.cost_confidence_bands_v1 import compute_cost_confidence_bands
from catalyst.analytics.roi_lens_v1 import compute_roi_lens

from visuals.kpi_current import render_kpi_current_performance

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

# ============================================================
# Session state defaults
# ============================================================

st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)
st.session_state.setdefault("attrition_reduction", 0)
st.session_state.setdefault("engagement_lift", 0)
st.session_state.setdefault("manager_lift", 0)

# ============================================================
# Context (authoritative)
# ============================================================

context = get_effective_context()
context.setdefault("baseline", {})
context.setdefault("persona", "CEO")

# ============================================================
# Utilities
# ============================================================

def format_usd(value: float, millions: bool = True) -> str:
    if value is None:
        return "—"
    return f"${value/1e6:,.1f}M" if millions else f"${value:,.0f}"

# ============================================================
# GLOBAL SIDEBAR — DATA INGEST (ONCE)
# ============================================================

st.sidebar.markdown("## Data")

uploaded_file = st.sidebar.file_uploader(
    "Upload workforce data",
    ["csv", "xlsx"],
    key="global_uploader"
)

if uploaded_file:
    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df
    context["baseline"]["kpis"] = build_baseline_kpis(df)

if st.session_state["workforce_df"] is None:
    st.info("Upload workforce data to begin.")
    st.stop()

# ============================================================
# GLOBAL SIDEBAR — MODE SELECTOR
# ============================================================

mode = st.sidebar.radio(
    "Mode",
    ["Briefing", "Explore", "Context"],
    key="mode_selector"
)

# ============================================================
# GLOBAL SIDEBAR — PERSONA
# ============================================================

st.sidebar.markdown("## Perspective")

persona = st.sidebar.selectbox(
    "Persona",
    ["CEO", "CFO", "CHRO"],
    index=["CEO", "CFO", "CHRO"].index(context["persona"]),
    key="persona_selector"
)

context["persona"] = persona

# ============================================================
# MODE: BRIEFING (OBSERVE)
# ============================================================

def render_briefing():
    st.header("What workforce risk are we carrying right now?")
    st.caption("Insight type: Descriptive (Observe)")

    kpis = context["baseline"]["kpis"]
    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi]["value"],
        active_client=None,
    )

    costs = compute_cost_framing(
        baseline_kpis=kpis,
        workforce_df=st.session_state["workforce_df"],
        financials=context.get("financials", {}),
        what_if_kpis=None,
    )

    st.metric(
        "Annual attrition cost exposure",
        format_usd(costs["baseline_cost_exposure"])
    )

    narrative = generate_cost_narrative(costs, context["persona"])
    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])

# ============================================================
# MODE: EXPLORE (SIMULATE)
# ============================================================

def render_explore():
    st.header("What could change if leadership intervenes?")
    st.caption("Insight type: Infer & Simulate")

    st.sidebar.markdown("## Simulation controls")

    attr = st.sidebar.slider(
        "Retention effectiveness (%)",
        0, 30,
        key="attrition_reduction"
    )

    eng = st.sidebar.slider(
        "Engagement uplift (points)",
        0, 20,
        key="engagement_lift"
    )

    mgr = st.sidebar.slider(
        "Manager capability uplift (points)",
        0, 20,
        key="manager_lift"
    )

    if st.sidebar.button("Apply simulation"):
        st.session_state["what_if_kpis"] = apply_what_if(
            context["baseline"]["kpis"],
            {
                "attrition_risk_reduction_pct": attr,
                "engagement_lift": eng,
                "manager_effectiveness_lift": mgr,
                "headcount": len(st.session_state["workforce_df"]),
                "risk_realization_factor": 0.6,
            },
        )

    if st.sidebar.button("Clear simulation"):
        st.session_state["what_if_kpis"] = None
        st.session_state["attrition_reduction"] = 0
        st.session_state["engagement_lift"] = 0
        st.session_state["manager_lift"] = 0

    if st.session_state["what_if_kpis"] is None:
        st.info("Apply a simulation to explore outcomes.")
        return

    kpis = st.session_state["what_if_kpis"]
    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi]["value"],
        active_client=None,
    )

# ============================================================
# MODE: CONTEXT (QUALITATIVE)
# ============================================================

def render_context():
    st.header("Workforce context")
    st.caption("Insight type: Contextual (Sensemaking)")

    df = st.session_state["workforce_df"]

    if "sentiment_score" not in df.columns:
        st.warning("Sentiment data not available in this dataset.")
        return

    st.metric(
        "Overall sentiment (synthetic)",
        f"{df['sentiment_score'].mean():+.2f}"
    )

    st.caption(
        "Sentiment is contextual — not a KPI, not a prediction, and not a prescription."
    )

# ============================================================
# ROUTER
# ============================================================

if mode == "Briefing":
    render_briefing()
elif mode == "Explore":
    render_explore()
else:
    render_context()
