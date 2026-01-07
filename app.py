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

        # Required blocks
        for required in ["thresholds", "labels", "action_plans"]:
            if required not in kpi:
                errors.append(
                    f"KPI '{kpi_name}' missing required block '{required}'"
                )

        thresholds = set(kpi.get("thresholds", {}).keys())
        labels = set(kpi.get("labels", {}).keys())
        action_states = set(kpi.get("action_plans", {}).keys())

        # State alignment
        for state in thresholds:
            if state not in labels:
                errors.append(
                    f"KPI '{kpi_name}' state '{state}' missing label"
                )

        # Persona validation
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
# KPI CLASSIFIER (CONFIG-DRIVEN)
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

def generate_cross_metric_insights(states):
    insights = []

    mgr = states.get("manager_effectiveness")
    sentiment = states.get("sentiment_health")
    attrition = states.get("attrition_economics")

    if mgr in ["negative", "critical"] and sentiment in ["negative", "critical"]:
        insights.append(
            "Manager capability gaps are likely contributing to the current sentiment risk. "
            "Leadership effectiveness should be reviewed in affected teams."
        )

    if mgr in ["negative", "critical"] and attrition in ["high", "critical"]:
        insights.append(
            "Preventable attrition costs appear to be linked to manager effectiveness issues. "
            "Targeted manager interventions may reduce financial leakage."
        )

    return insights
def generate_executive_summary(metric, state):
    summaries = {
        "sentiment_health": {
            "negative": "Rising sentiment risk may impair execution if not addressed.",
            "critical": "Severe sentiment risk threatens near-term execution stability.",
            "healthy": "Employee sentiment is within control with no immediate execution risk."
        },
        "manager_effectiveness": {
            "negative": "Manager capability gaps are constraining execution and may be driving downstream risk.",
            "critical": "Systemic manager effectiveness issues are impairing execution.",
            "healthy": "Manager capability is supporting execution effectively."
        },
        "attrition_economics": {
            "high": "Attrition is creating material financial exposure requiring targeted intervention.",
            "critical": "Severe attrition-related cost leakage threatens financial performance.",
            "healthy": "Attrition-related costs are currently controlled."
        }
    }

    return summaries.get(metric, {}).get(
        state,
        "No executive summary available for the current state."
    )

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

    st.subheader("🎯 Recommended Actions")

    if not plans:
        st.info(
            "No action is prescribed for this role in the current decision state. "
            "Ownership lies with a different leadership role, or no intervention is required."
        )
        return

    for i, plan in enumerate(plans, start=1):
        priority = plan.get("priority", "Medium")
        action = plan.get("action", "")
        owner = plan.get("owner", "—")
        timeline = plan.get("timeline", "—")
        success = plan.get("success_metric", "—")

        # Priority styling
        if priority.lower() == "high":
            badge = "🔴 HIGH PRIORITY"
        elif priority.lower() == "medium":
            badge = "🟠 MEDIUM PRIORITY"
        else:
            badge = "🟢 LOW PRIORITY"

        with st.container():
            st.markdown(f"### {badge}")
            st.markdown(f"**Action {i}: {action}**")

            cols = st.columns(3)
            cols[0].markdown(f"**Owner**  \n{owner}")
            cols[1].markdown(f"**Timeline**  \n{timeline}")
            cols[2].markdown(f"**Success Metric**  \n{success}")

            st.markdown("---")

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")
data_mode = st.sidebar.radio(
    "Data Mode",
    ["Demo Data", "Client Upload"],
    index=0
)

st.sidebar.markdown("---")

st.sidebar.markdown("### 🔧 Scenario Controls")

if data_mode == "Demo Data":
    sentiment_score = st.sidebar.slider(
        "Employee Sentiment Score",
        min_value=-10,
        max_value=0,
        value=-8,
        step=1
    )

    manager_effectiveness_index = st.sidebar.slider(
        "Manager Effectiveness Index",
        min_value=40,
        max_value=90,
        value=61,
        step=1
    )

    attrition_rate = st.sidebar.slider(
        "Annual Attrition Rate (%)",
        min_value=5.0,
        max_value=40.0,
        value=21.3,
        step=0.5
    )
elif data_mode == "Client Upload":
    st.sidebar.markdown("### 📤 Upload Client Data")

    uploaded_file = st.sidebar.file_uploader(
        "Upload CSV",
        type=["csv"]
    )

    if uploaded_file is not None:
        df_client = pd.read_csv(uploaded_file)

        sentiment_score = df_client.get("sentiment_score", [None])[0]
        manager_effectiveness_index = df_client.get("manager_effectiveness_index", [None])[0]
        attrition_rate = df_client.get("attrition_rate", [None])[0]

    else:
        sentiment_score = None
        manager_effectiveness_index = None
        attrition_rate = None

st.sidebar.markdown("---")
persona = st.sidebar.selectbox(
    "View as",
    ["CEO", "CHRO", "HRBP"]
)

page = st.sidebar.radio(
    "Navigate",
    [
        "Overview",
        "Sentiment Health",
        "Manager Effectiveness",
        "Attrition Economics"
    ]
)
# ============================================================
# DECISION STATE STORE (CROSS-METRIC CONTEXT)
# ============================================================
decision_states = {}

# ============================================================
# OVERVIEW
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown(
        """
        **Catalyst connects workforce signals → root causes → financial impact → action.**

        Each metric is designed as a **decision page**, not a dashboard.
        """
    )

# ============================================================
# SENTIMENT HEALTH (REFERENCE IMPLEMENTATION)
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
    st.info(
        generate_executive_summary("sentiment_health", sentiment_state)
    )
    decision_states["sentiment_health"] = sentiment_state

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
        st.metric("Sentiment Status", sentiment_label)
        st.caption(f"Decision state: {sentiment_state.upper()}")

    render_action_plan(
        metric="sentiment_health",
        state=sentiment_state,
        persona=persona,
        config=CLIENT_CONFIG
    )

# ============================================================
# MANAGER EFFECTIVENESS
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
    manager_state, manager_label = classify_kpi(...)

    st.info(
        generate_executive_summary("manager_effectiveness", manager_state)
    )

    decision_states["manager_effectiveness"] = manager_state

    st.metric("Manager Effectiveness Status", manager_label)
    st.caption(f"Decision state: {manager_state.upper()}")

    render_action_plan(
        metric="manager_effectiveness",
        state=manager_state,
        persona=persona,
        config=CLIENT_CONFIG
    )
    insights = generate_cross_metric_insights(decision_states)

    if insights:
        st.markdown("### 🧠 Decision Context")
        for insight in insights:
            st.info(insight)

# ============================================================
# ATTRITION ECONOMICS
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
    attrition_state, attrition_label = classify_kpi(...)

    st.info(
        generate_executive_summary("attrition_economics", attrition_state)
    )

    decision_states["attrition_economics"] = attrition_state

    st.metric("Attrition Risk Level", attrition_label)
    st.caption(f"Decision state: {attrition_state.upper()}")

    render_action_plan(
        metric="attrition_economics",
        state=attrition_state,
        persona=persona,
        config=CLIENT_CONFIG
    )
    insights = generate_cross_metric_insights(decision_states)

    if insights:
        st.markdown("### 🧠 Decision Context")
        for insight in insights:
            st.info(insight)