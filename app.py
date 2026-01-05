import streamlit as st
import pandas as pd
import numpy as np
import altair as alt

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide"
)

# ============================================================
# GLOBAL KPI RUNTIME VALUES (single source of truth – sandbox)
# ============================================================
sentiment_score = -8
cost_of_attrition_usd = 12_400_000
manager_effectiveness_index = 62

# ============================================================
# SENTIMENT TREND (shared by visual + narrative)
# ============================================================
dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
sentiment_trend = np.array([-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3])

df_sentiment = pd.DataFrame(
    {"Date": dates, "Sentiment Score": sentiment_trend}
).set_index("Date")

trend_delta = sentiment_trend[-1] - sentiment_trend[0]
if trend_delta > 0:
    trend_direction = "improving"
elif trend_delta < 0:
    trend_direction = "declining"
else:
    trend_direction = "stable"

# ============================================================
# PERSONA NARRATIVES
# ============================================================
PERSONA_NARRATIVES = {
    "CEO": {
        "negative": (
            "Employee sentiment represents a growing business risk. "
            "Left unaddressed, it will continue to drive avoidable attrition costs "
            "and leadership distraction."
        ),
        "stable": (
            "Sentiment is not currently a material business risk. "
            "Leadership attention can remain focused on growth and execution."
        )
    },
    "CHRO": {
        "negative": (
            "Sustained sentiment decline signals weakening engagement drivers, "
            "particularly around manager capability and career mobility."
        ),
        "stable": (
            "Sentiment stability suggests existing engagement mechanisms are holding, "
            "creating space for longer-term workforce capability building."
        )
    },
    "HRBP": {
        "negative": (
            "Sentiment decline is likely concentrated within specific teams. "
            "Immediate manager-level intervention is required."
        ),
        "stable": (
            "Teams appear broadly stable. Proactive reinforcement can prevent "
            "future disengagement."
        )
    }
}

PERSONA_ACTIONS = {
    "CEO": {
        "negative": [
            "Treat sentiment decline as an enterprise risk, not an HR issue",
            "Focus executive attention on the top two cost-heavy locations",
            "Fund targeted interventions with measurable ROI expectations"
        ],
        "stable": [
            "Maintain current engagement investment levels",
            "Monitor sentiment as an early warning signal",
            "Shift focus toward productivity and growth levers"
        ]
    },
    "CHRO": {
        "negative": [
            "Diagnose manager capability gaps in high-risk teams",
            "Accelerate internal mobility and career progression pilots",
            "Redirect engagement spend from broad programs to focused actions"
        ],
        "stable": [
            "Strengthen leadership capability pipelines",
            "Refine career architecture to sustain engagement",
            "Use stability as a baseline for workforce planning"
        ]
    },
    "HRBP": {
        "negative": [
            "Initiate coaching conversations with at-risk managers",
            "Address workload and role clarity issues",
            "Track sentiment monthly at team level"
        ],
        "stable": [
            "Reinforce strong manager behaviors",
            "Engage teams showing early warning signals",
            "Maintain regular sentiment check-ins"
        ]
    }
}

def persona_state():
    return "negative" if sentiment_score < 0 else "stable"

# ============================================================
# SIDEBAR NAVIGATION
# ============================================================
st.sidebar.title("The Catalyst")

persona = st.sidebar.selectbox(
    "View as",
    ["CEO", "CHRO", "HRBP"]
)

page = st.sidebar.radio(
    "Navigate",
    [
        "Overview",
        "Sentiment Health",
        "Attrition Economics",
        "Manager Effectiveness"
    ]
)

# ============================================================
# OVERVIEW PAGE
# ============================================================
def render_overview():
    st.title("The Catalyst")
    st.caption("A people decision engine for leaders")

    st.markdown("""
    **The Catalyst** translates workforce signals into  
    **financial impact, strategic clarity, and action plans**.

    Use the navigation to explore decisions by metric.
    """)

# ============================================================
# SENTIMENT HEALTH PAGE
# ============================================================
def render_sentiment_page():
    st.title("Sentiment Health")

    # 1️⃣ Signal
    st.subheader("📈 Executive Signal")
    st.line_chart(df_sentiment, height=260)

    signal_text = (
        "Sentiment is improving, but remains below neutral."
        if trend_direction == "improving" and sentiment_score < 0
        else "Sentiment is declining, increasing near-term risk."
    )
    st.caption(signal_text)

    st.divider()

    # 2️⃣ Persona Meaning
    st.subheader("🧠 What this means for you")
    st.write(PERSONA_NARRATIVES[persona][persona_state()])

    st.divider()

    # 3️⃣ What-If
    st.subheader("💰 What if sentiment improves?")
    delta = st.slider("Assume sentiment improves by:", 1, 20, 5)

    savings_pct = delta * 0.015
    savings = cost_of_attrition_usd * savings_pct

    st.metric(
        "Estimated Annual Savings",
        f"${savings/1_000_000:.2f}M",
        delta=f"{savings_pct*100:.1f}%"
    )

    st.divider()

    # 4️⃣ Action Plan
    st.subheader("🎯 Recommended Action Plan")
    for i, action in enumerate(PERSONA_ACTIONS[persona][persona_state()], 1):
        st.write(f"**{i}.** {action}")

# ============================================================
# ATTRITION ECONOMICS PAGE
# ============================================================
def render_attrition_page():
    st.title("Attrition Economics")

    st.subheader("🌍 Cost Concentration")

    location_cost_data = pd.DataFrame({
        "Location": ["United States", "India", "United Kingdom", "Poland", "Philippines"],
        "Attrition Cost (USD)": [4_900_000, 3_200_000, 1_800_000, 1_400_000, 1_100_000]
    })

    chart = (
        alt.Chart(location_cost_data)
        .mark_bar()
        .encode(
            x=alt.X("Attrition Cost (USD):Q", axis=alt.Axis(format="$.2s")),
            y=alt.Y("Location:N", sort="-x"),
            tooltip=["Location", alt.Tooltip("Attrition Cost (USD):Q", format="$.2s")]
        )
        .properties(height=300)
    )

    st.altair_chart(chart, use_container_width=True)

    st.caption(
        "Attrition costs are geographically concentrated. "
        "Targeting the highest-cost locations delivers outsized returns."
    )

# ============================================================
# MANAGER EFFECTIVENESS PAGE
# ============================================================
def render_manager_page():
    st.title("Manager Effectiveness")

    st.metric(
        "Manager Effectiveness Index",
        manager_effectiveness_index
    )

    st.caption(
        "Manager effectiveness is a leading indicator of sentiment and attrition risk."
    )

# ============================================================
# ROUTER
# ============================================================
if page == "Overview":
    render_overview()

elif page == "Sentiment Health":
    render_sentiment_page()

elif page == "Attrition Economics":
    render_attrition_page()

elif page == "Manager Effectiveness":
    render_manager_page()

st.markdown("---")
st.caption("The Catalyst • Sandbox v1")
