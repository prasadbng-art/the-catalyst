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
from catalyst.file_ingest_v1 import load_workforce_file

from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis
from catalyst.analytics.what_if_engine_v1 import apply_what_if

from catalyst.analytics.cost_framing_v1 import compute_cost_framing
from catalyst.analytics.cost_narrative_v1 import generate_cost_narrative
from catalyst.analytics.cost_confidence_bands_v1 import compute_cost_confidence_bands
from catalyst.analytics.cost_narrative_cfo_v1 import generate_cost_narrative
from catalyst.analytics.roi_lens_v1 import compute_roi_lens

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

# ============================================================
# Session State Initialization
# ============================================================

st.session_state.setdefault("context_v1", {})
st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)

st.session_state.setdefault("attrition_reduction", 0)
st.session_state.setdefault("engagement_lift", 0)
st.session_state.setdefault("manager_lift", 0)

st.session_state.setdefault("active_mode", "briefing")

# ============================================================
# Context Resolution
# ============================================================

context = get_effective_context()

# ============================================================
# Utilities
# ============================================================

def format_usd(value: float, millions: bool = True) -> str:
    if value is None:
        return "—"
    if millions:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"

def get_persona():
    # Safe, explicit persona resolution
    return st.session_state.get("persona", "CEO")

# ============================================================
# Sidebar — Mode Selector
# ============================================================

mode_label = st.sidebar.radio(
    "Mode",
    ["Briefing", "Explore", "Context"],
    key="mode_selector",
    index=["briefing", "explore", "context"].index(
        st.session_state["active_mode"]
    ),
)

st.session_state["active_mode"] = {
    "Briefing": "briefing",
    "Explore": "explore",
    "Context": "context",
}[mode_label]

# ============================================================
# Sidebar helpers
# ============================================================

def persona_selector(context_only=False):
    st.sidebar.markdown("## 👤 Perspective")
    persona = st.sidebar.selectbox(
        "Persona",
        ["CEO", "CFO", "CHRO"],
        index=["CEO", "CFO", "CHRO"].index(get_persona()),
    )
    st.session_state["persona"] = persona
    context["persona"] = persona

    if context_only:
        st.sidebar.caption("Perspective influences interpretation only.")

def simulation_sidebar():
    st.sidebar.markdown("## Scenario exploration")
    st.sidebar.caption("Hypothetical — not predictive")

    st.sidebar.slider(
        "Effectiveness of retention actions (%)",
        0, 30, key="attrition_reduction"
    )
    st.sidebar.slider(
        "Engagement uplift (points)",
        0, 20, key="engagement_lift"
    )
    st.sidebar.slider(
        "Manager capability uplift (points)",
        0, 20, key="manager_lift"
    )

    if st.sidebar.button("Apply simulation"):
        st.session_state["what_if_kpis"] = apply_what_if(
            context["baseline"]["kpis"],
            {
                "attrition_risk_reduction_pct": st.session_state["attrition_reduction"],
                "engagement_lift": st.session_state["engagement_lift"],
                "manager_effectiveness_lift": st.session_state["manager_lift"],
                "headcount": len(st.session_state["workforce_df"]),
                "risk_realization_factor": 0.6,
            },
        )
        st.rerun()

    st.sidebar.divider()

    if st.sidebar.button("Clear simulation"):
        st.session_state["what_if_kpis"] = None
        st.session_state["attrition_reduction"] = 0
        st.session_state["engagement_lift"] = 0
        st.session_state["manager_lift"] = 0
        st.rerun()

# ============================================================
# Pages
# ============================================================

def render_current_kpis_page():
    st.header("What workforce risk are we carrying right now?")
    st.caption("Insight type: Descriptive (Observe)")

    is_simulation = st.session_state["what_if_kpis"] is not None

    if is_simulation:
        kpis = st.session_state["what_if_kpis"]
        st.warning("Scenario view — hypothetical outcomes")
    else:
        kpis = context["baseline"]["kpis"]

    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

def render_location_diagnostics():
    st.header("Attrition Risk — Location View")
    st.caption("Distributional context. No causality implied.")

    df = st.session_state.get("workforce_df")
    if df is None:
        st.warning("No workforce data available.")
        return

    location_summary = (
        df.groupby("location")
        .agg(
            recent_attrition=("attrition_flag", "mean"),
            avg_attrition_risk=("attrition_risk_score", "mean"),
            sentiment_context=("sentiment_score", "mean"),
            headcount=("employee_id", "count"),
        )
        .reset_index()
    )

    location_summary["recent_attrition"] = (location_summary["recent_attrition"] * 100).round(1)
    location_summary["avg_attrition_risk"] = (location_summary["avg_attrition_risk"] * 100).round(1)
    location_summary["sentiment_context"] = location_summary["sentiment_context"].round(2)

    st.dataframe(location_summary, use_container_width=True, hide_index=True)

    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=df,
        financials=context.get("financials", {}),
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    persona = get_persona()
    narrative = generate_cost_narrative(costs, persona)

    st.metric("Annual attrition cost exposure", format_usd(costs["baseline_cost_exposure"]))
    st.metric("Cost realistically preventable", format_usd(costs["preventable_cost"]))

    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])

def render_pulse_canvas_lite():
    st.header("Pulse Canvas")
    st.caption("Contextual (Observe)")

    df = st.session_state.get("workforce_df")
    if df is None or "sentiment_score" not in df.columns:
        st.warning("Sentiment data not available.")
        return

    st.metric("Overall Sentiment (Synthetic)", f"{df['sentiment_score'].mean():+.2f}")

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.info("Contextual signal only. Not a KPI.")

# ============================================================
# Mode Containers
# ============================================================

def render_briefing_mode():
    st.sidebar.markdown("## Data")
    uploaded_file = st.sidebar.file_uploader(
        "Upload workforce data",
        ["csv", "xlsx"],
        key="briefing_uploader",
    )

    if uploaded_file:
        df, errors, warnings = load_workforce_file(uploaded_file)
        if errors:
            for e in errors:
                st.sidebar.error(e)
            st.stop()

        st.session_state["workforce_df"] = df
        context.setdefault("baseline", {})
        context["baseline"]["kpis"] = build_baseline_kpis(df)

    render_current_kpis_page()
    render_location_diagnostics()

def render_exploration_mode():
    persona_selector()
    simulation_sidebar()
    render_current_kpis_page()

def render_context_mode():
    persona_selector(context_only=True)
    render_pulse_canvas_lite()
    render_sentiment_health_page()

# ============================================================
# Router
# ============================================================

mode = st.session_state["active_mode"]

if mode == "briefing":
    render_briefing_mode()

elif mode == "explore":
    render_exploration_mode()

elif mode == "context":
    render_context_mode()
