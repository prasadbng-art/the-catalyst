import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import yaml
from pathlib import Path

# ============================================================
# CLIENT CONFIG LOADING
# ============================================================

CLIENT_ID = "demo"

CONFIG_PATH = Path(f"clients/{CLIENT_ID}/config.yaml")
ACTIONS_PATH = Path(f"clients/{CLIENT_ID}/actions.yaml")

with open(CONFIG_PATH, "r") as f:
    CLIENT_CONFIG = yaml.safe_load(f)

with open(ACTIONS_PATH, "r") as f:
    ACTION_PLANS = yaml.safe_load(f)

# ============================================================
# KPI CLASSIFIER (CONFIG-DRIVEN)
# ============================================================

def classify_kpi(kpi_name, value, config, direction):
    kpi = config["kpis"][kpi_name]
    thresholds = kpi["thresholds"]
    labels = kpi["labels"]

    if direction == "higher_is_worse":
        for state, limit in sorted(thresholds.items(), key=lambda x: -x[1]):
            if value >= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]

    else:  # lower is worse
        for state, limit in sorted(thresholds.items(), key=lambda x: x[1]):
            if value <= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]

# ============================================================
# ACTION PLAN RENDERER (STATE-AWARE)
# ============================================================

def render_action_plan(metric, state, persona, config):
    plans = (
        config["kpis"]
        .get(metric, {})
        .get("action_plans", {})
        .get(state, {})
        .get(persona, [])
    )

    if not plans:
        st.info("No prescribed actions for this decision state.")
        return

    df = pd.DataFrame(plans)

    st.subheader("🎯 Recommended Action Plan")
    st.caption(f"Decision state: {state.upper()}")
    st.dataframe(df, use_container_width=True)


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# SESSION STATE
# ============================================================

if "page" not in st.session_state:
    st.session_state.page = "Overview"

# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("The Catalyst")

persona = st.sidebar.selectbox(
    "View as",
    ["CEO", "CHRO", "HRBP"]
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "Sentiment Health", "Manager Effectiveness", "Attrition Economics"],
    index=["Overview", "Sentiment Health", "Manager Effectiveness", "Attrition Economics"]
        .index(st.session_state.page)
)

st.session_state.page = page

# ============================================================
# MOCK DATA
# ============================================================

sentiment_score = -8
manager_effectiveness_index = 61
attrition_rate = 21.3
attrition_cost = 12_400_000

dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
sentiment_trend = np.array([-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3])

df_sentiment = pd.DataFrame({
    "Date": dates,
    "Sentiment Score": sentiment_trend
})

# ============================================================
# OVERVIEW
# ============================================================

if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown("""
    **Signal → Root Cause → Financial Impact → Action**

    Each page is a **decision surface**, not a dashboard.
    """)

# ============================================================
# SENTIMENT HEALTH
# ============================================================

elif page == "Sentiment Health":
    st.title("Sentiment Health")
    st.caption("Early warning signal for engagement and execution risk")

    render_executive_storyline(persona)

    # ---- Classify sentiment via client config ----
    sentiment_state, sentiment_label = classify_kpi(
        "sentiment_health",
        sentiment_score,
        CLIENT_CONFIG,
        direction="lower_is_worse"
    )

    col1, col2 = st.columns([2, 1])

    with col1:
        chart = alt.Chart(df_sentiment).mark_line(point=True).encode(
            x="Date:T",
            y=alt.Y(
                "Sentiment Score:Q",
                scale=alt.Scale(domain=[-10, 0])
            ),
            tooltip=["Date", "Sentiment Score"]
        ).properties(height=300)

        st.altair_chart(chart, use_container_width=True)

    with col2:
        st.metric(
            "Sentiment Status",
            sentiment_label,
            delta=sentiment_score
        )
        st.caption(f"Decision state: {sentiment_state.upper()}")

    # ---- State-aware, persona-aware action plan ----
    render_action_plan(
        metric="sentiment_health",
        state=sentiment_state,
        persona=persona,
        config=CLIENT_CONFIG
    )

    executive_transition("Sentiment Health", persona)


# ============================================================
# MANAGER EFFECTIVENESS
# ============================================================

elif page == "Manager Effectiveness":
    st.title("Manager Effectiveness")

    manager_state, manager_label = classify_kpi(
        "manager_effectiveness",
        manager_effectiveness_index,
        CLIENT_CONFIG,
        direction="lower_is_worse"
    )

    st.metric("Manager Effectiveness", manager_label)
    st.caption(f"Decision state: {manager_state.upper()}")

    render_action_plan("manager_effectiveness", manager_state, persona)

# ============================================================
# ATTRITION ECONOMICS
# ============================================================

elif page == "Attrition Economics":
    st.title("Attrition Economics")

    attrition_state, attrition_label = classify_kpi(
        "attrition_economics",
        attrition_rate,
        CLIENT_CONFIG,
        direction="higher_is_worse"
    )

    col1, col2 = st.columns([2, 1])

    with col1:
        st.metric("Annual Attrition Cost", f"${attrition_cost/1_000_000:.1f}M")

    with col2:
        st.metric("Attrition Risk", attrition_label)
        st.caption(f"Decision state: {attrition_state.upper()}")

    render_action_plan("attrition_economics", attrition_state, persona)
