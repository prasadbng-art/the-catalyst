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

def step_kpi_enablement(state: dict):
    st.subheader("KPI Enablement")

    # ---- Ensure KPI container exists
    kpis = state.setdefault("kpis", {})

    # ---- Canonical KPI list
    KPI_KEYS = ["attrition", "engagement", "sentiment"]

    st.markdown("### Enable KPIs")

    for kpi in KPI_KEYS:
        # ---- Default: attrition enabled, others off
        current = kpis.get(kpi, {}).get("enabled", kpi == "attrition")

        enabled = st.checkbox(
            kpi.title(),
            value=current,
            disabled=(kpi == "attrition"),  # attrition always on
            key=f"kpi_enable_{kpi}"
        )

        kpis[kpi] = {"enabled": enabled}

    # ---- Resolve enabled KPIs safely
    enabled_kpis = [
        k for k in KPI_KEYS
        if kpis.get(k, {}).get("enabled")
    ]

    if not enabled_kpis:
        st.warning("At least one KPI must be enabled.")
        return

    # ---- Primary KPI selection
    primary_default = (
        kpis.get("primary")
        if kpis.get("primary") in enabled_kpis
        else enabled
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
    
