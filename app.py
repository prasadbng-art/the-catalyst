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
    "Sentiment Health": {
        "CEO": [
            ("High", "Declare sentiment decline an enterprise risk", "Executive Committee", "30 days", "Risk ownership assigned"),
            ("Medium", "Focus on worst-affected locations", "CEO / COO", "60 days", "Stabilization observed"),
            ("Low", "Track sentiment as early warning", "CHRO", "Ongoing", "Proactive response")
        ],
        "CHRO": [
            ("High", "Diagnose manager capability gaps", "HR Leadership", "30 days", "Root causes identified"),
            ("Medium", "Accelerate internal mobility pilots", "Talent COE", "60 days", "Engagement improves"),
            ("Low", "Refresh listening cadence", "People Analytics", "Ongoing", "Trend clarity")
        ],
        "HRBP": [
            ("High", "Immediate coaching interventions", "HRBP", "30 days", "Local sentiment improves"),
            ("Medium", "Clarify roles & workload", "Business Leaders", "60 days", "Reduced friction"),
            ("Low", "Reinforce effective managers", "HRBP", "Ongoing", "Stability maintained")
        ]
    },

    "Manager Effectiveness": {
        "CEO": [
            ("High", "Treat weak management as a growth constraint", "Executive Committee", "30 days", "Ownership assigned"),
            ("Medium", "Hold leaders accountable for team health", "CEO / COO", "60 days", "Productivity improves"),
            ("Low", "Track manager quality at board level", "Strategy", "Ongoing", "Early detection")
        ],
        "CHRO": [
            ("High", "Launch targeted capability uplift", "HR Leadership", "30 days", "Scores improve"),
            ("Medium", "Redesign enablement programs", "L&D", "60 days", "Consistency achieved"),
            ("Low", "Embed effectiveness in reviews", "HR Ops", "Ongoing", "Sustained gains")
        ],
        "HRBP": [
            ("High", "Coach bottom-quartile managers", "HRBP", "30 days", "Behavior change"),
            ("Medium", "Clarify expectations", "Business Leaders", "60 days", "Reduced friction"),
            ("Low", "Scale best practices", "HRBP", "Ongoing", "Replication achieved")
        ]
    },

    "Attrition Economics": {
        "CEO": [
            ("High", "Treat attrition cost as EBIT leakage", "Exec Team", "30 days", "Cost owned"),
            ("Medium", "Prioritize top cost-heavy locations", "COO", "60 days", "Run-rate reduced"),
            ("Low", "Integrate attrition into growth planning", "Strategy", "Ongoing", "Predictability")
        ],
        "CHRO": [
            ("High", "Reallocate spend to high-ROI levers", "HR Leadership", "30 days", "Efficiency improves"),
            ("Medium", "Align workforce plans to risk", "Workforce COE", "60 days", "Stability achieved"),
            ("Low", "Embed economics in reviews", "HR Ops", "Ongoing", "Accountability")
        ],
        "HRBP": [
            ("High", "Target flight-risk roles", "HRBP", "30 days", "Exits reduced"),
            ("Medium", "Improve role mobility", "Talent Partners", "60 days", "Retention improves"),
            ("Low", "Track exit drivers", "HRBP", "Ongoing", "Insights sharpened")
        ]
    }
}

def render_action_plan(metric, persona):
    df = pd.DataFrame(
        ACTION_PLANS[metric][persona],
        columns=["Priority", "Action", "Owner", "Timeline", "Success Metric"]
    )
    st.subheader("🎯 Recommended Action Plan")
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

    col1, col2 = st.columns([2, 1])

    with col1:
        chart = alt.Chart(df_sentiment).mark_line(point=True).encode(
            x="Date:T",
            y=alt.Y("Sentiment Score:Q", scale=alt.Scale(domain=[-10, 0])),
            tooltip=["Date", "Sentiment Score"]
        ).properties(height=300)
        st.altair_chart(chart, use_container_width=True)

    with col2:
        st.metric("Current Sentiment Score", sentiment_score, delta=trend_delta)
        st.caption("Direction matters more than absolute value.")

    render_action_plan("Sentiment Health", persona)
    executive_transition("Sentiment Health", persona)

# ============================================================
# MANAGER EFFECTIVENESS
# ============================================================
elif page == "Manager Effectiveness":
    st.title("Manager Effectiveness")
    st.caption("Root cause of sentiment and attrition outcomes")

    render_executive_storyline(persona)

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
        st.metric("Manager Effectiveness Index", manager_effectiveness_index, delta=-6)
        st.caption("Below-threshold capability amplifies downstream risk.")

    render_action_plan("Manager Effectiveness", persona)
    executive_transition("Manager Effectiveness", persona)

# ============================================================
# ATTRITION ECONOMICS
# ============================================================
elif page == "Attrition Economics":
    st.title("Attrition Economics")
    st.caption("Financial impact of unmanaged people risk")

    render_executive_storyline(persona)

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
        st.metric("Annual Attrition Cost", f"${attrition_cost/1_000_000:.1f}M")
        uplift = st.slider("Assume sentiment improvement (points)", 1, 10, 5)
        savings = attrition_cost * uplift * 0.015
        st.metric("Estimated Savings", f"${savings/1_000_000:.2f}M")

    render_action_plan("Attrition Economics", persona)
    executive_transition("Attrition Economics", persona)
