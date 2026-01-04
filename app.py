import streamlit as st
from kpi_registry import KPI_REGISTRY
import pandas as pd
import numpy as np
import altair as alt

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(page_title="The Catalyst", layout="wide")

# ============================================================
# KPI RUNTIME VALUES (single source of truth – demo)
# ============================================================
sentiment_score = -8  # change to test scenarios

kpi_values = {
    "sentiment_score": sentiment_score
}

# ============================================================
# DEMO DATA (shared across visuals)
# ============================================================

# --- Sentiment trend ---
dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
sentiment_trend = np.array([-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3])

df_trend = pd.DataFrame({
    "Date": dates,
    "Sentiment Score": sentiment_trend
}).set_index("Date")

# --- Risk concentration ---
risk_data = pd.DataFrame({
    "Segment": ["Sales", "Engineering", "Support", "Operations", "HR"],
    "Attrition Risk Index": [78, 64, 59, 42, 35]
}).sort_values("Attrition Risk Index", ascending=False)

# --- Attrition cost by location (US$) ---
location_cost_data = pd.DataFrame({
    "Location": ["United States", "India", "United Kingdom", "Poland", "Philippines"],
    "Attrition Cost (USD)": [4_900_000, 3_200_000, 1_800_000, 1_400_000, 1_100_000]
}).sort_values("Attrition Cost (USD)", ascending=False)

# ============================================================
# DERIVED INSIGHT (shared by visuals & narrative)
# ============================================================
trend_delta = df_trend["Sentiment Score"].iloc[-1] - df_trend["Sentiment Score"].iloc[0]

if trend_delta > 0:
    trend_direction = "improving"
elif trend_delta < 0:
    trend_direction = "declining"
else:
    trend_direction = "stable"

narrative_context = {
    "sentiment_score": sentiment_score,
    "trend_direction": trend_direction
}

# ============================================================
# PERSONA-SPECIFIC NARRATIVES
# ============================================================
PERSONA_NARRATIVES = {
    "CEO": {
        "negative": (
            "Employee sentiment is deteriorating, creating a material business risk. "
            "Attrition costs are significant and concentrated, requiring leadership attention."
        ),
        "recovering": (
            "Employee sentiment is recovering from a recent low, indicating early traction. "
            "However, sentiment remains below a healthy threshold and risk persists."
        ),
        "stable": (
            "Employee sentiment remains broadly stable and does not pose a material business risk."
        )
    },
    "CHRO": {
        "negative": (
            "Sustained sentiment decline points to weakening engagement drivers, "
            "likely related to manager capability and internal mobility constraints."
        ),
        "recovering": (
            "Sentiment improvements suggest interventions are gaining traction. "
            "The focus now is sustaining momentum and embedding manager capability."
        ),
        "stable": (
            "Sentiment stability suggests engagement mechanisms are holding, "
            "allowing focus on long-term workforce health."
        )
    },
    "HRBP": {
        "negative": (
            "Sentiment decline is concentrated in specific teams, "
            "indicating the need for immediate manager-level intervention."
        ),
        "recovering": (
            "Sentiment is improving but remains fragile. "
            "Consistency in manager behaviour will be critical."
        ),
        "stable": (
            "Sentiment remains steady across most teams, "
            "providing an opportunity to reinforce effective practices."
        )
    }
}

# ============================================================
# PERSONA-SPECIFIC ACTION GUIDANCE
# ============================================================
PERSONA_ACTIONS = {
    "CEO": {
        "negative": [
            "Treat sentiment decline as an enterprise risk.",
            "Direct attention to the highest cost-exposure locations.",
            "Authorize focused interventions with clear ROI."
        ],
        "recovering": [
            "Sustain current interventions and monitor momentum.",
            "Track sentiment monthly as a leading indicator.",
            "Prepare contingencies if recovery stalls."
        ],
        "stable": [
            "Maintain current engagement investments.",
            "Shift focus toward growth and productivity.",
            "Monitor sentiment as an early warning signal."
        ]
    },
    "CHRO": {
        "negative": [
            "Diagnose manager capability gaps.",
            "Accelerate internal mobility initiatives.",
            "Reallocate engagement budgets toward targeted actions."
        ],
        "recovering": [
            "Reinforce behaviours driving improvement.",
            "Stabilize systems supporting workload and career flow.",
            "Validate ROI of interventions."
        ],
        "stable": [
            "Strengthen leadership capability proactively.",
            "Plan for long-term workforce sustainability.",
            "Use stability as a planning baseline."
        ]
    },
    "HRBP": {
        "negative": [
            "Prioritize coaching with at-risk managers.",
            "Address workload and role clarity issues.",
            "Track team-level sentiment closely."
        ],
        "recovering": [
            "Ensure follow-through on recent actions.",
            "Support managers in maintaining consistency.",
            "Watch for early regression signals."
        ],
        "stable": [
            "Reinforce strong manager behaviours.",
            "Engage teams proactively.",
            "Maintain regular check-ins."
        ]
    }
}

# ============================================================
# PERSONA-AWARE ROUTERS
# ============================================================
def resolve_state(context):
    sentiment = context["sentiment_score"]
    trend = context["trend_direction"]

    if sentiment < 0 and trend == "improving":
        return "recovering"
    elif sentiment < 0:
        return "negative"
    else:
        return "stable"


def generate_persona_narrative(context, persona):
    return PERSONA_NARRATIVES[persona][resolve_state(context)]


def generate_persona_actions(context, persona):
    return PERSONA_ACTIONS[persona][resolve_state(context)]

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.header("View As")

persona = st.sidebar.selectbox(
    "Persona",
    ["CEO", "CHRO", "HRBP"]
)

st.sidebar.header("Select KPIs to explore")

selected_kpis = []
for kpi_key, meta in KPI_REGISTRY.items():
    if st.sidebar.checkbox(meta["label"], value=False):
        selected_kpis.append(kpi_key)

# ============================================================
# HEADER
# ============================================================
st.title("The Catalyst")
st.caption("A people decision engine for leaders")

# ============================================================
# VISUAL 1: SENTIMENT TRAJECTORY
# ============================================================
st.subheader("Sentiment Trajectory — Direction of Risk")

c1, c2, c3 = st.columns(3)
c1.metric("Current Sentiment", sentiment_score)
c2.metric("Lowest Point", df_trend["Sentiment Score"].min())
c3.metric("Trend", trend_direction.capitalize())

state = resolve_state(narrative_context)
color_map = {
    "negative": "#d62728",
    "recovering": "#ff7f0e",
    "stable": "#2ca02c"
}

base = alt.Chart(df_trend.reset_index()).encode(
    x="Date:T",
    y=alt.Y("Sentiment Score:Q", scale=alt.Scale(domain=[-10, 1]))
)

line = base.mark_line(strokeWidth=3, color=color_map[state])

threshold = alt.Chart(
    pd.DataFrame({"y": [0]})
).mark_rule(strokeDash=[4, 4], color="gray").encode(y="y:Q")

st.altair_chart(line + threshold, use_container_width=True)

st.divider()

# ============================================================
# VISUAL 2: RISK CONCENTRATION
# ============================================================
st.subheader("Risk Concentration — Where Problems Cluster")

top_risk_segments = (risk_data["Attrition Risk Index"] >= 60).sum()

c1, c2, c3 = st.columns(3)
c1.metric("High-Risk Segments", f"{top_risk_segments} of {len(risk_data)}")
c2.metric("Risk Shape", "Highly Concentrated")
c3.metric("Primary Exposure", risk_data.iloc[0]["Segment"])

risk_chart = (
    alt.Chart(risk_data)
    .mark_bar()
    .encode(
        x=alt.X("Attrition Risk Index:Q", scale=alt.Scale(domain=[0, 100])),
        y=alt.Y("Segment:N", sort="-x"),
        color=alt.condition(
            alt.datum["Attrition Risk Index"] >= 60,
            alt.value("#d62728"),
            alt.value("#ffbf00")
        )
    )
)

st.altair_chart(risk_chart, use_container_width=True)

# ============================================================
# VISUAL 3: COST OF ATTRITION BY LOCATION
# ============================================================
st.subheader("Cost of Attrition — Where Money Leaks (US$)")

total_cost = location_cost_data["Attrition Cost (USD)"].sum()
top_location = location_cost_data.iloc[0]

c1, c2, c3 = st.columns(3)
c1.metric("Total Annual Cost", f"${total_cost/1_000_000:.1f}M")
c2.metric("Top Location", top_location["Location"])
c3.metric("Cost Concentration", f"{top_location['Attrition Cost (USD)']/total_cost:.0%}")

cost_chart = (
    alt.Chart(location_cost_data)
    .mark_bar()
    .encode(
        x=alt.X("Attrition Cost (USD):Q", axis=alt.Axis(format="$.2s")),
        y=alt.Y("Location:N", sort="-x"),
        color=alt.condition(
            alt.datum["Attrition Cost (USD)"] == top_location["Attrition Cost (USD)"],
            alt.value("#d62728"),
            alt.value("#cfcfcf")
        )
    )
)

st.altair_chart(cost_chart, use_container_width=True)

# ============================================================
# VISUAL 4: FINANCIAL WHAT-IF
# ============================================================
st.subheader("Financial Impact — What Improvement Buys You")

annual_attrition_cost = 12_400_000
rate = 0.015

c1, c2, c3 = st.columns(3)
c1.metric("Annual Attrition Cost", "$12.4M")
c2.metric("Cost Sensitivity", "1.5% per point")
c3.metric("Decision Lens", "Preventable Loss")

uplift = st.slider("", 1, 20, 5)
savings = annual_attrition_cost * uplift * rate

cA, cB = st.columns(2)
cA.metric("Estimated Annual Savings", f"${savings/1_000_000:.2f}M")
cB.metric("Residual Cost", f"${(annual_attrition_cost - savings)/1_000_000:.2f}M")

st.divider()

# ============================================================
# KPI SNAPSHOT + INTERPRETATION
# ============================================================
left, right = st.columns([2, 3])

with left:
    st.subheader("KPI Snapshot")
    for kpi in selected_kpis:
        meta = KPI_REGISTRY[kpi]
        if meta["type"] == "index":
            st.metric(meta["label"], kpi_values.get(kpi, meta["default"]))
        elif meta["type"] == "percentage":
            st.metric(meta["label"], f"{meta['default']}%")
        elif meta["type"] == "currency":
            st.metric(meta["label"], f"${meta['default']/1_000_000:.1f}M")
        elif meta["type"] == "number":
            st.metric(meta["label"], meta["default"])
        elif meta["type"] == "list":
            st.write(meta["label"])
            for item in meta["default"]:
                st.write(f"• {item}")

with right:
    st.subheader("Catalyst Interpretation")

    st.info(generate_persona_narrative(narrative_context, persona))

    st.markdown("### Recommended Actions")
    for action in generate_persona_actions(narrative_context, persona):
        st.success(action)

st.caption("The Catalyst © v1 — demo")
