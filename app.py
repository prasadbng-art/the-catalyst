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
# SANDBOX KPI VALUES
# ============================================================
attrition_cost_usd = 12_400_000  # Annual cost of attrition (US$)

# ============================================================
# ATTRITION COST DISTRIBUTION (MOCK DATA)
# ============================================================
attrition_location_data = pd.DataFrame({
    "Location": ["United States", "India", "United Kingdom", "Poland", "Philippines"],
    "Attrition Cost (USD)": [4_900_000, 3_200_000, 1_800_000, 1_400_000, 1_100_000]
}).sort_values("Attrition Cost (USD)", ascending=False)

# ============================================================
# ATTRITION ECONOMICS — ACTION PLANS
# ============================================================
ATTRITION_ACTION_PLANS = {
    "CEO": [
        {
            "initiative": "Targeted Capital Allocation",
            "rationale": "Attrition costs are financially material and highly concentrated.",
            "30_day": "Mandate a focused retention strategy for the top two cost-heavy locations.",
            "60_day": "Approve targeted funding tied to measurable attrition reduction.",
            "owner": "Executive Committee"
        },
        {
            "initiative": "Governance & Oversight",
            "rationale": "Attrition risk requires ongoing executive visibility.",
            "30_day": "Establish a quarterly attrition cost review.",
            "60_day": "Link attrition outcomes to leadership performance reviews.",
            "owner": "CEO / COO"
        }
    ],

    "CHRO": [
        {
            "initiative": "Retention Strategy Reset",
            "rationale": "Preventable attrition is eroding workforce ROI.",
            "30_day": "Segment attrition by role, tenure, and location.",
            "60_day": "Deploy differentiated retention levers for high-risk segments.",
            "owner": "CHRO"
        },
        {
            "initiative": "Career Architecture",
            "rationale": "Limited internal mobility accelerates voluntary exits.",
            "30_day": "Identify stagnant roles with high exit rates.",
            "60_day": "Launch internal mobility and progression pilots.",
            "owner": "Talent COE"
        }
    ],

    "HRBP": [
        {
            "initiative": "Flight Risk Intervention",
            "rationale": "Attrition risk is visible earliest at team level.",
            "30_day": "Identify high-flight-risk employees and teams.",
            "60_day": "Conduct stay interviews and manager-led retention conversations.",
            "owner": "HRBP"
        },
        {
            "initiative": "Manager Enablement",
            "rationale": "Manager behavior strongly influences retention outcomes.",
            "30_day": "Flag managers with abnormal attrition patterns.",
            "60_day": "Provide targeted coaching and support.",
            "owner": "HRBP"
        }
    ]
}

# ============================================================
# SHARED ACTION PLAN RENDERER
# ============================================================
def render_action_plan(plans):
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

    st.markdown("""
    **The Catalyst** converts workforce data into  
    **financial clarity, strategic focus, and prescriptive action**.

    Use the navigation to explore decisions by metric.
    """)

# ============================================================
# ATTRITION ECONOMICS — DECISION PAGE
# ============================================================
elif page == "Attrition Economics":
    st.subheader("💰 Attrition Economics")

    # 1️⃣ SIGNAL — FINANCIAL EXPOSURE
    st.metric(
        "Annual Cost of Attrition",
        f"${attrition_cost_usd/1_000_000:.1f}M"
    )

    st.markdown("#### Where the money is leaking")

    chart = (
        alt.Chart(attrition_location_data)
        .mark_bar()
        .encode(
            x=alt.X(
                "Attrition Cost (USD):Q",
                title="Attrition Cost (US$)",
                axis=alt.Axis(format="$.2s")
            ),
            y=alt.Y(
                "Location:N",
                sort="-x",
                title=None
            ),
            tooltip=[
                "Location",
                alt.Tooltip("Attrition Cost (USD):Q", format="$.2s")
            ]
        )
        .properties(height=280)
    )

    st.altair_chart(chart, use_container_width=True)

    # 2️⃣ INTERPRETATION
    st.caption(
        "Attrition costs are highly concentrated. A small number of locations "
        "account for a disproportionate share of financial loss, indicating that "
        "targeted retention actions will deliver higher ROI than broad programs."
    )

    st.divider()

    # 3️⃣ WHAT-IF SIMULATOR
    st.subheader("🎛 What if we reduce attrition?")

    reduction_pct = st.slider(
        "Assume reduction in attrition (%)",
        min_value=1,
        max_value=5,
        value=3
    )

    estimated_savings = attrition_cost_usd * (reduction_pct / 100)

    col1, col2 = st.columns(2)
    col1.metric(
        "Estimated Annual Savings",
        f"${estimated_savings/1_000_000:.2f}M"
    )
    col2.metric(
        "Cost Reduction",
        f"{reduction_pct:.1f}%"
    )

    st.caption(
        "Even modest improvements in retention generate material financial returns."
    )

    st.divider()

    # 4️⃣ PRESCRIPTION — PERSONA-AWARE ACTION PLAN
    render_action_plan(
        ATTRITION_ACTION_PLANS[persona]
    )

# ============================================================
# PLACEHOLDERS FOR OTHER PAGES
# ============================================================
elif page == "Sentiment Health":
    st.info("Sentiment Health decision page already implemented separately.")

elif page == "Manager Effectiveness":
    st.info("Manager Effectiveness decision page to be completed next.")

# ============================================================
# FOOTER
# ============================================================
st.markdown("---")
st.caption("The Catalyst · Sandbox v1")
