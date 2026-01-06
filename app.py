import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import yaml
from pathlib import Path

# ============================================================
# CLIENT CONFIG LOADING
# ============================================================

CLIENT_ID = "demo"  # later this will come from env / auth

CONFIG_PATH = Path(f"clients/{CLIENT_ID}/config.yaml")

with open(CONFIG_PATH, "r") as f:
    CLIENT_CONFIG = yaml.safe_load(f)
# ============================================================
# CLIENT ACTION PLANS LOADING
# ============================================================

ACTIONS_PATH = Path(f"clients/{CLIENT_ID}/actions.yaml")

with open(ACTIONS_PATH, "r") as f:
    ACTION_PLANS = yaml.safe_load(f)

# ============================================================
# KPI CLASSIFIERS (CONFIG-DRIVEN)
# ============================================================

def classify_kpi(kpi_name, value, config, direction):
    kpi = config["kpis"][kpi_name]
    thresholds = kpi["thresholds"]
    labels = kpi["labels"]

    if direction == "higher_is_worse":
        ordered = sorted(thresholds.items(), key=lambda x: -x[1])
        for state, limit in ordered:
            if value >= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]

    else:
        ordered = sorted(thresholds.items(), key=lambda x: x[1])
        for state, limit in ordered:
            if value <= limit:
                return state, labels[state]
        return "healthy", labels["healthy"]


# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# SESSION STATE (FOR PROGRAMMATIC NAVIGATION)
# ============================================================
if "page" not in st.session_state:
    st.session_state.page = "Overview"

# ============================================================
# SIDEBAR — PERSONA & NAVIGATION
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
# SHARED MOCK DATA (SANDBOX)
# ============================================================
sentiment_score = -8
attrition_cost = 12_400_000
manager_effectiveness_index = 61

dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
sentiment_trend = np.array([-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3])

df_sentiment = pd.DataFrame({
    "Date": dates,
    "Sentiment Score": sentiment_trend
})

trend_delta = sentiment_trend[-1] - sentiment_trend[0]

# ============================================================
# EXECUTIVE STORYLINE STRIP
# ============================================================
def render_executive_storyline(persona):
    persona_message = {
        "CEO": "This is a leadership and capital allocation issue.",
        "CHRO": "This is a manager capability and system design issue.",
        "HRBP": "This is a coaching and execution issue."
    }

    st.markdown(
        """
        **Executive Storyline**

        Sentiment decline → Management effectiveness gaps → Rising attrition costs
        """
    )
    st.info(persona_message[persona])

# ============================================================
# PERSONA-AWARE EXECUTIVE TRANSITIONS
# ============================================================
def executive_transition(metric, persona):
    TRANSITIONS = {
        "Sentiment Health": {
            "CEO": (
                "Sustained sentiment decline signals an execution risk rooted in leadership behavior.",
                "Review Manager Effectiveness →",
                "Manager Effectiveness"
            ),
            "CHRO": (
                "Declining sentiment often reflects gaps in manager capability and system design.",
                "Diagnose Manager Effectiveness →",
                "Manager Effectiveness"
            ),
            "HRBP": (
                "Team-level sentiment erosion is usually driven by manager behavior.",
                "Identify Manager Gaps →",
                "Manager Effectiveness"
            )
        },
        "Manager Effectiveness": {
            "CEO": (
                "Weak management capability amplifies downstream attrition costs.",
                "Quantify Attrition Cost →",
                "Attrition Economics"
            ),
            "CHRO": (
                "Manager gaps translate directly into preventable attrition.",
                "Assess Attrition Economics →",
                "Attrition Economics"
            ),
            "HRBP": (
                "Unaddressed manager issues increase flight risk.",
                "Review Attrition Impact →",
                "Attrition Economics"
            )
        },
        "Attrition Economics": {
            "CEO": (
                "The financial impact is now clear. Targeted interventions will deliver the fastest ROI.",
                "Revisit Sentiment Health →",
                "Sentiment Health"
            ),
            "CHRO": (
                "Attrition costs reinforce the need to address sentiment drivers.",
                "Refocus on Sentiment Drivers →",
                "Sentiment Health"
            ),
            "HRBP": (
                "Attrition outcomes confirm the need for proactive engagement.",
                "Return to Sentiment Signals →",
                "Sentiment Health"
            )
        }
    }

    message, button_label, target = TRANSITIONS[metric][persona]

    st.markdown("---")
    st.subheader("Next Decision")
    st.write(message)

    if st.button(button_label):
        st.session_state.page = target
        st.rerun()

# ============================================================
# ACTION PLAN REGISTRY
# ============================================================
ACTION_PLANS = {
    "sentiment_health": {
        "CEO": {
            "critical": [
                ("High", "Escalate sentiment as enterprise risk", "Executive Committee", "30 days", "Risk formally owned"),
                ("High", "Mandate leadership intervention in red zones", "CEO / COO", "45 days", "Stabilization begins")
            ],
            "negative": [
                ("Medium", "Focus on worst-affected locations", "CEO / COO", "60 days", "Sentiment trend reverses"),
                ("Low", "Track sentiment monthly", "CHRO", "Ongoing", "Early warning maintained")
            ],
            "stable": [
                ("Low", "Maintain listening cadence", "CHRO", "Ongoing", "No deterioration observed")
            ]
        },

        "CHRO": {
            "critical": [
                ("High", "Run root-cause diagnostics on manager capability", "HR Leadership", "30 days", "Drivers identified"),
                ("High", "Launch targeted intervention pods", "People COE", "45 days", "Hotspots addressed")
            ],
            "negative": [
                ("Medium", "Strengthen internal mobility pilots", "Talent COE", "60 days", "Engagement lift"),
                ("Low", "Refresh survey instruments", "People Analytics", "Ongoing", "Signal clarity")
            ],
            "stable": [
                ("Low", "Embed sentiment into workforce planning", "HR Ops", "Ongoing", "Sustained stability")
            ]
        },

        "HRBP": {
            "critical": [
                ("High", "Immediate manager coaching", "HRBP", "30 days", "Local sentiment improves"),
                ("High", "Reset role clarity and workload", "Business Leaders", "45 days", "Friction reduced")
            ],
            "negative": [
                ("Medium", "Target teams showing early decline", "HRBP", "60 days", "Stabilization achieved")
            ],
            "stable": [
                ("Low", "Reinforce best practices", "HRBP", "Ongoing", "Consistency maintained")
            ]
        }
    },

    "manager_effectiveness": {
        "CEO": {
            "critical": [
                ("High", "Treat management weakness as growth blocker", "Board / Exec", "30 days", "Ownership assigned")
            ],
            "negative": [
                ("Medium", "Tie leader KPIs to team health", "CEO / COO", "60 days", "Accountability improves")
            ],
            "stable": [
                ("Low", "Monitor leadership pipeline", "Strategy", "Ongoing", "Early detection")
            ]
        }
        # (CHRO / HRBP can be added next)
    },

   
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
    st.dataframe(df, use_container_width=True)

    st.subheader("🎯 Recommended Action Plan")
    st.caption(f"Decision state: {state.upper()}")

    st.dataframe(df, use_container_width=True)

# ============================================================
# OVERVIEW
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown("""
    Catalyst connects **workforce signals → root causes → financial impact → action**.

    Each metric is designed as a **decision page**, not a dashboard.
    """)

# ============================================================
# SENTIMENT HEALTH
# ============================================================
elif page == "Sentiment Health":
    st.title("Sentiment Health")
    st.caption("Early warning signal for engagement and execution risk")

    render_executive_storyline(persona)

    # ---- Classify sentiment using client config ----
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

    render_action_plan("sentiment_health", persona, sentiment_state)
    executive_transition("Sentiment Health", persona)

# ============================================================
# MANAGER EFFECTIVENESS
# ============================================================
elif page == "Manager Effectiveness":
    st.title("Manager Effectiveness")
    st.caption("Root cause of sentiment and attrition outcomes")

    render_executive_storyline(persona)

   # ---- Classify manager effectiveness using client config ----
    manager_state, manager_label = classify_kpi(
        "manager_effectiveness",
        manager_effectiveness_index,
        CLIENT_CONFIG,
        direction="lower_is_worse"
    )

    col1, col2 = st.columns([2, 1])

    with col1:
        mgr_data = pd.DataFrame({
            "Dimension": ["Coaching", "Clarity", "Trust", "Execution", "Feedback"],
            "Score": [58, 62, 65, 59, 60]
        })

        chart = alt.Chart(mgr_data).mark_bar().encode(
            x=alt.X("Score:Q", scale=alt.Scale(domain=[0, 100])),
            y=alt.Y("Dimension:N", sort="-x"),
            tooltip=["Dimension", "Score"]
        ).properties(height=300)

        st.altair_chart(chart, use_container_width=True)

    with col2:
        st.metric(
            "Manager Effectiveness Status",
            manager_label,
            delta=manager_effectiveness_index
        )

        st.caption(f"Decision state: {manager_state.upper()}")

    render_action_plan("manager_effectiveness", persona, manager_state)
    executive_transition("Manager Effectiveness", persona)


# ============================================================
# ATTRITION ECONOMICS
# ============================================================
elif page == "Attrition Economics":
    st.title("Attrition Economics")
    st.caption("Financial impact of unmanaged people risk")

    render_executive_storyline(persona)

    attrition_rate = 21.3  # % annualized (mock)

    attrition_state, attrition_label = classify_kpi(
        "attrition_economics",
        attrition_rate,
        CLIENT_CONFIG,
        direction="higher_is_worse"
    )

    col1, col2 = st.columns([2, 1])

    with col1:
        location_data = pd.DataFrame({
            "Location": ["US", "India", "UK", "Poland", "Philippines"],
            "Cost": [4.9, 3.2, 1.8, 1.4, 1.1]
        })

        chart = alt.Chart(location_data).mark_bar().encode(
            x=alt.X("Cost:Q", title="Attrition Cost (US$ M)"),
            y=alt.Y("Location:N", sort="-x"),
            tooltip=["Location", "Cost"]
        ).properties(height=300)

        st.altair_chart(chart, use_container_width=True)

    with col2:
        st.metric(
            "Attrition Risk Level",
            attrition_label,
            delta=f"{attrition_rate:.1f}%"
        )

        st.caption(f"Decision state: {attrition_state.upper()}")

        st.divider()

        uplift = st.slider(
            "Assume targeted intervention impact (sentiment points)",
            1, 10, 5
        )

        savings = attrition_cost * uplift * 0.015

        st.metric(
            "Estimated Annual Savings",
            f"${savings/1_000_000:.2f}M"
        )

    render_action_plan("attrition_economics", attrition_state, persona, ACTION_PLANS)
    executive_transition("Attrition Economics", persona)

