import streamlit as st

# ============================================================
# Imports (authoritative, no duplicates)
# ============================================================

from catalyst.context_manager_v1 import get_effective_context
from visuals.kpi_current import render_kpi_current_performance
# from narrative_engine import generate_narrative
from demo_loader_v1 import load_demo_context_v1
from catalyst.ingestion.file_ingest_v1 import load_workforce_file

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
    load_demo_context_v1()
    st.session_state["demo_mode"] = True
    st.rerun()


# # ============================================================
# 🔒 CONTEXT ENTRY GATE (AUTHORITATIVE)
# ============================================================

if not isinstance(st.session_state.get("context_v1"), dict):
    render_demo_entry()
    st.stop()

context = get_effective_context()

st.markdown(
    """
    <div style="
        position: fixed;
        top: 8px;
        right: 16px;
        background-color: #f0f2f6;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        color: #555;
        z-index: 1000;">
        🧪 Demo Mode
    </div>
    """,
    unsafe_allow_html=True,
)

if not st.session_state.get("demo_welcomed"):
    st.toast(
        "Welcome to the Catalyst interactive demo. "
        "Explore baseline risk, apply scenarios, and simulate outcomes.",
        icon="🎬",
    )
    st.session_state["demo_welcomed"] = True

# ============================================================
# SIDEBAR — PHASE I DEMO (AUTHORITATIVE)
# ============================================================

# ----------------------------
# 📄 Upload Workforce Data
# ----------------------------
st.sidebar.markdown("## 📄 Upload Workforce Data")

uploaded_file = st.sidebar.file_uploader(
    "Upload CSV or Excel",
    type=["csv", "xlsx"],
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
    st.sidebar.success(f"Loaded {len(df)} employee records")

# ----------------------------
# 👤 View As (Persona)
# ----------------------------
st.sidebar.markdown("## 👤 View As")

persona_options = ["CEO", "CFO", "CHRO"]

current_persona = context.get("persona", "CEO")
if current_persona not in persona_options:
    current_persona = "CEO"

context["persona"] = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(current_persona),
)

# ----------------------------
# 🧪 What-If Sandbox
# ----------------------------
st.sidebar.markdown("## 🧪 What-If Sandbox")

attrition_reduction = st.sidebar.slider(
    "Reduce attrition risk (%)",
    0, 30, 0,
    help="Retention programs, compensation actions, policy changes"
)

engagement_lift = st.sidebar.slider(
    "Increase engagement (points)",
    0, 20, 0,
    help="Culture, workload balance, manager quality"
)

manager_lift = st.sidebar.slider(
    "Improve manager effectiveness (points)",
    0, 20, 0,
    help="Coaching, capability building"
)

run_what_if = st.sidebar.button("Apply What-If")

if run_what_if and "workforce_df" in st.session_state:
    from catalyst.analytics.what_if_engine_v1 import apply_what_if

    levers = {
        "attrition_risk_reduction_pct": attrition_reduction,
        "engagement_lift": engagement_lift,
        "manager_effectiveness_lift": manager_lift,
        "headcount": len(st.session_state["workforce_df"]),
        "risk_realization_factor": 0.6,
    }

    baseline_kpis = context["baseline"]["kpis"]

    st.session_state["what_if_kpis"] = apply_what_if(
        baseline_kpis,
        levers
    )

# ----------------------------
# ↩ Reset What-If
# ----------------------------
st.sidebar.divider()

if st.sidebar.button("↩ Reset What-If"):
    st.session_state.pop("what_if_kpis", None)


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

    kpi = st.selectbox("Select KPI", list(kpi.keys()))
    kpi_state = kpi[kpi]

    render_kpi_current_performance(
        kpi=kpi,
        current_value=kpi_state.get("value", 0.0),
        active_client=None,
    )

    #st.divider()
    #st.subheader(narrative["headline"])
    #st.markdown(narrative["framing"])
    #st.markdown(f"**Summary:** {narrative['summary']}")
    #st.info(narrative["recommendation"])

page = st.sidebar.selectbox(
    "Navigate",
    ["Sentiment Health", "Current KPIs"],
)    
# ============================================================
# Router
# ============================================================
if page == "Sentiment Health":
    render_sentiment_health_page()

elif page == "Current KPIs":
    render_current_kpis_page()
