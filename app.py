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
## ============================================================
# CONFIG VALIDATOR (FAIL-FAST)
# ============================================================

def validate_config(config):
    errors = []

    enabled_personas = set(config.get("personas", {}).get("enabled", []))
    kpis = config.get("kpis", {})

    for kpi_name, kpi in kpis.items():
        if not kpi.get("enabled", False):
            continue

        # ---- required blocks
        for required in ["thresholds", "labels", "action_plans"]:
            if required not in kpi:
                errors.append(f"KPI '{kpi_name}' missing '{required}' block")

        thresholds = set(kpi.get("thresholds", {}).keys())
        labels = set(kpi.get("labels", {}).keys())
        action_states = set(kpi.get("action_plans", {}).keys())

        # ---- state alignment
        for state in thresholds:
            if state not in labels:
                errors.append(
                    f"KPI '{kpi_name}' state '{state}' has no matching label"
                )
            if state not in action_states:
                errors.append(
                    f"KPI '{kpi_name}' state '{state}' has no action_plans defined"
                )

        # ---- persona validation
        for state, persona_block in kpi.get("action_plans", {}).items():
            for persona in persona_block.keys():
                if persona not in enabled_personas:
                    errors.append(
                        f"KPI '{kpi_name}' state '{state}' uses undefined persona '{persona}'"
                    )

    if errors:
        raise ValueError("CONFIG VALIDATION FAILED:\n" + "\n".join(errors))

 ============================================================
# CLIENT CONFIG LOADING
# ============================================================
CLIENT_ID = "demo"

CONFIG_PATH = Path(f"clients/{CLIENT_ID}/config.yaml")
with open(CONFIG_PATH, "r") as f:
    CLIENT_CONFIG = yaml.safe_load(f)
validate_config(CLIENT_CONFIG)

# ============================================================
# MOCK DATA (SANDBOX)
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
# KPI CLASSIFIER (CONFIG-DRIVEN)
# ============================================================
def classify_kpi(kpi_name, value, config, direction):
    kpi = config["kpis"][kpi_name]
    thresholds = kpi["thresholds"]
    labels = kpi["labels"]

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
# ACTION PLAN RENDERER (CONFIG-DRIVEN)
# ============================================================
def render_action_plan(metric, state, persona, config):
    plans = (
        config["kpis"]
        .get(metric, {})
        .get("action_plans", {})
        .get(state, {})
        .get(persona, [])
    )

    st.subheader("🎯 Recommended Action Plan")

    if not plans:
        st.info("No prescribed actions for this decision state.")
        return

    df = pd.DataFrame(plans)
    st.caption(f"Decision state: {state.upper()}")
    st.dataframe(df, use_container_width=True)

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
    ["Overview", "Sentiment Health", "Manager Effectiveness", "Attrition Economics"]
)

# ============================================================
# OVERVIEW
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown("""
    **Catalyst connects workforce signals → root causes → financial impact → action.**

    Each metric is designed as a **decision page**, not a dashboard.
    """)

# ============================================================
# SENTIMENT HEALTH (COMPLETE & STABLE)
# ============================================================
elif page == "Sentiment Health":
    st.title("Sentiment Health")
    st.caption("Early warning signal for engagement and execution risk")

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
            y=alt.Y("Sentiment Score:Q", scale=alt.Scale(domain=[-10, 0])),
            tooltip=["Date", "Sentiment Score"]
        ).properties(height=300)

        st.altair_chart(chart, use_container_width=True)

    with col2:
        st.metric("Sentiment Status", sentiment_label)
        st.caption(f"Decision state: {sentiment_state.upper()}")

    render_action_plan(
        metric="sentiment_health",
        state=sentiment_state,
        persona=persona,
        config=CLIENT_CONFIG
    )

# ============================================================
# MANAGER EFFECTIVENESS (SAFE SCAFFOLD)
# ============================================================
elif page == "Manager Effectiveness":
    st.title("Manager Effectiveness")
    st.caption("Root cause of sentiment and attrition outcomes")

    manager_state, manager_label = classify_kpi(
        "manager_effectiveness",
        manager_effectiveness_index,
        CLIENT_CONFIG,
        direction="lower_is_worse"
    )

    st.metric("Manager Effectiveness Status", manager_label)
    st.caption(f"Decision state: {manager_state.upper()}")

    render_action_plan(
        metric="manager_effectiveness",
        state=manager_state,
        persona=persona,
        config=CLIENT_CONFIG
    )

# ============================================================
# ATTRITION ECONOMICS (SAFE SCAFFOLD)
# ============================================================
elif page == "Attrition Economics":
    st.title("Attrition Economics")
    st.caption("Financial impact of unmanaged people risk")

    attrition_state, attrition_label = classify_kpi(
        "attrition_economics",
        attrition_rate,
        CLIENT_CONFIG,
        direction="higher_is_worse"
    )

    st.metric("Attrition Risk Level", attrition_label)
    st.caption(f"Decision state: {attrition_state.upper()}")

    render_action_plan(
        metric="attrition_economics",
        state=attrition_state,
        persona=persona,
        config=CLIENT_CONFIG
    )
