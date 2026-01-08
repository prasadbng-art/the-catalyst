# catalyst/wizard/steps.py

import streamlit as st

def step_client_identity(state):
    st.subheader("Client Identity")

    state["client"]["name"] = st.text_input(
        "Client Name", state["client"]["name"]
    )

    state["client"]["industry"] = st.selectbox(
        "Industry",
        ["IT Services", "Manufacturing", "BFSI", "Healthcare", "Other"],
        index=0
    )

    state["client"]["geography"] = st.selectbox(
        "Geography",
        ["India", "APAC", "EMEA", "US"],
        index=0
    )

    state["client"]["size_band"] = st.selectbox(
        "Organisation Size",
        ["<500", "500-1000", "1000-5000", "5000+"],
        index=2
    )


def step_strategy(state):
    st.subheader("Strategic Context")

    state["strategy"]["posture"] = st.radio(
        "Primary Strategic Posture",
        ["cost", "growth", "stability"]
    )

    state["strategy"]["risk_tolerance"] = st.radio(
        "Risk Tolerance",
        ["low", "medium", "high"]
    )

    state["strategy"]["horizon_days"] = st.selectbox(
        "Decision Horizon (days)",
        [90, 180, 365]
    )


def step_kpi_enablement(state):
    st.subheader("KPI Enablement")

    state["kpis"]["attrition"]["enabled"] = st.checkbox(
        "Attrition", value=True, disabled=True
    )

    state["kpis"]["engagement"]["enabled"] = st.checkbox(
        "Engagement"
    )

    state["kpis"]["sentiment"]["enabled"] = st.checkbox(
        "Sentiment"
    )

    enabled = [
        k for k, v in state["kpis"].items()
        if isinstance(v, dict) and v["enabled"]
    ]

    state["kpis"]["primary"] = st.selectbox(
        "Primary KPI",
        enabled
    )


def step_financials(state):
    st.subheader("Financial Sensitivity")

    state["financials"]["replacement_multiplier"] = st.slider(
        "Replacement Cost Multiplier",
        1.0, 2.5, 1.4, 0.1
    )

    state["financials"]["time_to_fill_days"] = st.slider(
        "Time to Fill (days)",
        30, 120, 60, 5
    )

    state["financials"]["productivity_loss_pct"] = st.slider(
        "Productivity Loss (%)",
        0.1, 0.5, 0.25, 0.05
    )
