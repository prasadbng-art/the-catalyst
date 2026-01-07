import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import yaml
from pathlib import Path

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# CONFIG VALIDATOR (FAIL-FAST)
# ============================================================
def validate_config(config):
    errors = []

    enabled_personas = set(config.get("personas", {}).get("enabled", []))
    kpis = config.get("kpis", {})

    for kpi_name, kpi in kpis.items():
        if not kpi.get("enabled", False):
            continue

        for required in ["thresholds", "labels", "action_plans"]:
            if required not in kpi:
                errors.append(
                    f"KPI '{kpi_name}' missing required block '{required}'"
                )

        thresholds = set(kpi.get("thresholds", {}).keys())
        labels = set(kpi.get("labels", {}).keys())

        for state in thresholds:
            if state not in labels:
                errors.append(
                    f"KPI '{kpi_name}' state '{state}' missing label"
                )

        for state, persona_block in kpi.get("action_plans", {}).items():
            for persona in persona_block.keys():
                if persona not in enabled_personas:
                    errors.append(
                        f"KPI '{kpi_name}' state '{state}' uses undefined persona '{persona}'"
                    )

    if errors:
        raise ValueError(
            "CONFIG VALIDATION FAILED:\n" + "\n".join(errors)
        )

# ============================================================
# DEMO TREND DATA (STATIC VISUAL ONLY)
# ============================================================
@st.cache_data(show_spinner=False)
def get_sentiment_trend():
    dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
    sentiment_trend = np.array(
        [-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3]
    )
    return pd.DataFrame({
        "Date": dates,
        "Sentiment Score": sentiment_trend
    })

df_sentiment = get_sentiment_trend()

# ============================================================
# CLIENT CONFIG LOADING
# ============================================================
CLIENT_ID = "demo"
CONFIG_PATH = Path(f"clients/{CLIENT_ID}/config.yaml")

@st.cache_data(show_spinner=False)
def load_and_validate_config(path):
    with open(path, "r") as f:
        config = yaml.safe_load(f)
    validate_config(config)
    return config

CLIENT_CONFIG = load_and_validate_config(CONFIG_PATH)

# ============================================================
# KPI CLASSIFIER
# ============================================================
def classify_kpi(kpi_name, value, config, direction):
    kpi = config["kpis"][kpi_name]
    thresholds = kpi["thresholds"]
    labels = kpi["labels"]

    if value is None:
        return "unknown", "Insufficient data"

    if direction == "lower_is_worse":
        ordered = sorted(thresholds.items(), key=lambda x: x[1])
        for state, limit in ordered:
            if value <= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]

    if direction == "higher_is_worse":
        ordered = sorted(thresholds.items(), key=lambda x: -x[1])
        for state, limit in ordered:
            if value >= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]

# ============================================================
# EXECUTIVE SUMMARY
# ============================================================
def generate_executive_summary(metric, state):
    summaries = {
        "sentiment_health": {
            "negative": "Rising sentiment risk may impair execution if not addressed.",
            "critical": "Severe sentiment risk threatens near-term execution stability.",
            "healthy": "Employee sentiment is within control."
        },
        "manager_effectiveness": {
            "negative": "Manager capability gaps are constraining execution.",
            "critical": "Systemic manager effectiveness issues are impairing execution.",
            "healthy": "Manager capability is supporting execution."
        },
        "attrition_economics": {
            "high": "Attrition is creating material financial exposure.",
            "critical": "Severe attrition leakage threatens performance.",
            "healthy": "Attrition costs are currently controlled."
        }
    }
    return summaries.get(metric, {}).get(
        state, "No executive summary available."
    )

# ============================================================
# ACTION PLAN RENDERER
# ============================================================
def render_action_plan(metric, state, persona, config):
    plans = (
        config["kpis"]
        .get(metric, {})
        .get("action_plans", {})
        .get(state, {})
        .get(persona, [])
    )

    st.subheader("🎯 Recommended Actions")

    if not plans:
        st.info("No action prescribed for this role.")
        return

    for i, plan in enumerate(plans, start=1):
        with st.container(border=True):
            st.markdown(f"**Action {i}: {plan.get('action','')}**")
            cols = st.columns(3)
            cols[0].markdown(f"**Owner**  \n{plan.get('owner','—')}")
            cols[1].markdown(f"**Timeline**  \n{plan.get('timeline','—')}")
            cols[2].markdown(f"**Success Metric**  \n{plan.get('success_metric','—')}")

# ============================================================
# ATTRITION INTELLIGENCE PAGE (NEW)
# ============================================================
def render_attrition_intelligence_page(attrition_rate, persona):

    st.title("Attrition Intelligence")
    st.caption("Predictive view of exits, hidden cost, and value leakage")

    # ---- Section 1: Risk Posture
    st.markdown("## Attrition Risk Posture")

    with st.container(border=True):
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Attrition Rate", f"{attrition_rate}%")
        col2.metric("Expected Exits (180d)", "18–22")
        col3.metric("Visible Cost", "₹8.4 Cr")
        col4.metric("Hidden Cost", "₹13.9 Cr ⚠️")

    st.info(
        "Attrition exposure is driven more by hidden operational and knowledge loss "
        "than by replacement cost alone."
    )

    # ---- Section 2: Risk Concentration
    st.markdown("## Risk Concentration")

    with st.expander("Engineering | Mid-tenure | High performers"):
        st.write("• 34% of projected exits")
        st.write("• 52% of hidden cost exposure")
        st.write("• High role interdependency and thin succession bench")

    # ---- Section 3: Driver Intelligence
    st.markdown("## Driver Intelligence")

    tab1, tab2 = st.tabs(["Exit Drivers", "Damage Drivers"])

    with tab1:
        st.markdown("- Manager effectiveness")
        st.markdown("- Career stagnation")
        st.markdown("- Engagement decline")

    with tab2:
        st.markdown("- Knowledge concentration")
        st.markdown("- Role criticality")
        st.markdown("- Client exposure")

    # ---- Section 4: Predictive Outlook
    st.markdown("## Predictive Outlook")

    with st.container(border=True):
        col1, col2, col3 = st.columns(3)
        col1.metric("Exits (90d)", "7–9")
        col2.metric("Exits (180d)", "18–22")
        col3.metric("Hidden Cost Exposure", "₹9.4–₹11.2 Cr")

    st.caption("Model confidence: Medium")

    # ---- Section 5: Prescriptive Actions
    st.markdown("## Prescriptive Actions")

    with st.container(border=True):
        st.subheader("Knowledge Capture & Shadow Staffing")
        cols = st.columns(4)
        cols[0].metric("Attrition ↓", "—")
        cols[1].metric("Hidden Cost ↓", "32%")
        cols[2].metric("Time to Impact", "30 days")
        cols[3].metric("Cost Avoided", "₹4.4 Cr")

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")

sentiment_score = st.sidebar.slider("Sentiment Score", -10, 0, -8)
manager_effectiveness_index = st.sidebar.slider("Manager Effectiveness", 40, 90, 61)
attrition_rate = st.sidebar.slider("Attrition Rate (%)", 5.0, 40.0, 21.3)

persona = st.sidebar.selectbox("View as", ["CEO", "CHRO", "HRBP"])

page = st.sidebar.radio(
    "Navigate",
    [
        "Overview",
        "Sentiment Health",
        "Manager Effectiveness",
        "Attrition Intelligence"
    ]
)

# ============================================================
# PAGES
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine")

elif page == "Sentiment Health":
    st.title("Sentiment Health")
    chart = alt.Chart(df_sentiment).mark_line(point=True).encode(
        x="Date:T",
        y="Sentiment Score:Q"
    )
    st.altair_chart(chart, use_container_width=True)

elif page == "Manager Effectiveness":
    st.title("Manager Effectiveness")
    st.metric("Index", manager_effectiveness_index)

elif page == "Attrition Intelligence":
    render_attrition_intelligence_page(attrition_rate, persona)
