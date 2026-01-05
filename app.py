import streamlit as st
import pandas as pd
import numpy as np
import altair as alt

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
)

# ============================================================
# SIDEBAR: PERSONA + NAVIGATION
# ============================================================
st.sidebar.title("The Catalyst")

persona = st.sidebar.selectbox(
    "View as",
    ["CEO", "CHRO", "HRBP"]
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "Sentiment Health", "Attrition Economics", "Manager Effectiveness"]
)

# ============================================================
# MOCK KPI VALUES (SANDBOX)
# ============================================================
sentiment_score = -8
attrition_cost_usd = 12_400_000
manager_effectiveness_index = 62

# ============================================================
# SENTIMENT TREND DATA
# ============================================================
dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
sentiment_trend = np.array([-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3])

df_trend = pd.DataFrame({
    "Date": dates,
    "Sentiment Score": sentiment_trend
}).set_index("Date")

trend_delta = df_trend["Sentiment Score"].iloc[-1] - df_trend["Sentiment Score"].iloc[0]
trend_direction = "declining" if trend_delta < 0 else "improving"

# ============================================================
# ACTION PLANS — SENTIMENT HEALTH
# ============================================================
SENTIMENT_ACTION_PLANS = {
    "CEO": [
        {
            "initiative": "Leadership Intervention",
            "rationale": "Sustained sentiment decline represents an enterprise execution risk.",
            "30_day": "Mandate leadership capability review for high-risk locations.",
            "60_day": "Fund and launch targeted leadership intervention programs.",
            "owner": "Executive Committee"
        },
        {
            "initiative": "Geographic Focus",
            "rationale": "Sentiment erosion is concentrated, not systemic.",
            "30_day": "Identify top two cost-heavy locations by sentiment impact.",
            "60_day": "Tie executive reviews to sentiment recovery milestones.",
            "owner": "CEO / COO"
        }
    ],
    "CHRO": [
        {
            "initiative": "Manager Capability Reset",
            "rationale": "Manager effectiveness is the dominant driver of sentiment decline.",
            "30_day": "Run manager diagnostics in high-risk teams.",
            "60_day": "Deploy coaching and feedback loops linked to engagement KPIs.",
            "owner": "HR Leadership"
        }
    ],
    "HRBP": [
        {
            "initiative": "Team-Level Intervention",
            "rationale": "Sentiment erosion is visible at team and manager level.",
            "30_day": "Conduct listening sessions and skip-level check-ins.",
            "60_day": "Track sentiment monthly post-intervention.",
            "owner": "HRBP"
        }
    ]
}

# ============================================================
# ACTION PLANS — ATTRITION ECONOMICS
# ============================================================
ATTRITION_ACTION_PLANS = {
    "CEO": [
        {
            "initiative": "Cost Containment",
            "rationale": "Attrition costs are financially material and unevenly distributed.",
            "30_day": "Identify top attrition cost centers.",
            "60_day": "Approve targeted retention investments.",
            "owner": "Executive Committee"
        }
    ],
    "CHRO": [
        {
            "initiative": "Retention Strategy",
            "rationale": "Preventable attrition is eroding workforce ROI.",
            "30_day": "Segment attrition by role and tenure.",
            "60_day": "Deploy differentiated retention levers.",
            "owner": "CHRO"
        }
    ],
    "HRBP": [
        {
            "initiative": "Flight Risk Management",
            "rationale": "Attrition risk is visible at team level.",
            "30_day": "Identify high-risk employees.",
            "60_day": "Run stay interviews and career conversations.",
            "owner": "HRBP"
        }
    ]
}

# ============================================================
# ACTION PLANS — MANAGER EFFECTIVENESS
# ============================================================
MANAGER_ACTION_PLANS = {
    "CEO": [
        {
            "initiative": "Leadership Accountability",
            "rationale": "Manager effectiveness directly impacts execution quality.",
            "30_day": "Review manager performance distribution.",
            "60_day": "Link leadership incentives to people outcomes.",
            "owner": "CEO"
        }
    ],
    "CHRO": [
        {
            "initiative": "Capability Uplift",
            "rationale": "Manager skill gaps are systemic.",
            "30_day": "Launch capability assessment.",
            "60_day": "Roll out leadership development tracks.",
            "owner": "CHRO"
        }
    ],
    "HRBP": [
        {
            "initiative": "Coaching & Enablement",
            "rationale": "Manager behavior drives team experience.",
            "30_day": "Shadow manager interactions.",
            "60_day": "Provide targeted coaching.",
            "owner": "HRBP"
        }
    ]
}

# ============================================================
# SHARED RENDER FUNCTION
# ============================================================
def render_action_plan(title, plans):
    st.markdown("### 🎯 Recommended Action Plan")
    for plan in plans:
        with st.expander(f"Initiative: {plan['initiative']}", expanded=True):
            st.markdown(f"**Why this matters**  \n{plan['rationale']}")
            st.markdown("**30-Day Goal**")
            st.write(plan["30_day"])
            st.markdown("**60-Day Goal**")
            st.write(plan["60_day"])
            st.markdown(f"**Owner:** {plan['owner']}")

# ============================================================
# OVERVIEW PAGE
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown(
        """
        **The Catalyst** translates workforce signals into  
        **financial impact, strategic clarity, and prescriptive action.**

        Use the navigation to explore decisions by metric.
        """
    )

# ============================================================
# SENTIMENT HEALTH PAGE
# ============================================================
elif page == "Sentiment Health":
    st.subheader("📈 Sentiment Health")

    st.metric("Current Sentiment Score", sentiment_score)

    st.line_chart(df_trend, height=260)

    st.caption(
        f"Sentiment trend is **{trend_direction}**. "
        "Sustained decline signals emerging engagement risk."
    )

    render_action_plan(
        "Sentiment Health",
        SENTIMENT_ACTION_PLANS[persona]
    )

# ============================================================
# ATTRITION ECONOMICS PAGE
# ============================================================
elif page == "Attrition Economics":
    st.subheader("💰 Attrition Economics")

    st.metric(
        "Annual Cost of Attrition",
        f"${attrition_cost_usd/1_000_000:.1f}M"
    )

    st.caption(
        "Attrition costs are financially material and concentrated."
    )

    render_action_plan(
        "Attrition Economics",
        ATTRITION_ACTION_PLANS[persona]
    )

# ============================================================
# MANAGER EFFECTIVENESS PAGE
# ============================================================
elif page == "Manager Effectiveness":
    st.subheader("🧭 Manager Effectiveness")

    st.metric(
        "Manager Effectiveness Index",
        manager_effectiveness_index
    )

    st.caption(
        "Manager capability is a leading indicator of sentiment and attrition."
    )

    render_action_plan(
        "Manager Effectiveness",
        MANAGER_ACTION_PLANS[persona]
    )

# ============================================================
# FOOTER
# ============================================================
st.markdown("---")
st.caption("The Catalyst · Sandbox v1")
