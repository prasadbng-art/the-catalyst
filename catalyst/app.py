import streamlit as st
import json
from pathlib import Path

# ============================================================
# IMPORT INTELLIGENCE LAYERS (STREAMLIT-CORRECT)
# ============================================================
from intelligence.driver_interpreter import (
    load_driver_definitions,
    generate_driver_narrative
)

from intelligence.hidden_cost import calculate_hidden_cost

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# LOAD GLOBAL DRIVER DEFINITIONS
# ============================================================
@st.cache_data(show_spinner=False)
def load_drivers():
    return load_driver_definitions("config/drivers.yaml")

DRIVER_DEFS = load_drivers()

# ============================================================
# LOAD DRIVER EVIDENCE (DEMO)
# ============================================================
@st.cache_data(show_spinner=False)
def load_driver_evidence():
    path = Path("clients/demo/data/driver_evidence.json")
    with open(path, "r") as f:
        return json.load(f)

DRIVER_EVIDENCE = load_driver_evidence()

# ============================================================
# LOAD HIDDEN COST CONTEXT (DEMO)
# ============================================================
@st.cache_data(show_spinner=False)
def load_hidden_cost_context():
    path = Path("clients/demo/data/hidden_cost_context.json")
    with open(path, "r") as f:
        return json.load(f)

HIDDEN_COST_CONTEXT = load_hidden_cost_context()

# ============================================================
# ATTRITION INTELLIGENCE PAGE
# ============================================================
def render_attrition_intelligence_page(attrition_rate: float):

    st.title("Attrition Intelligence")
    st.caption(
        "Decision-grade insight into attrition risk, hidden cost exposure, "
        "and value leakage."
    )

    # --------------------------------------------------------
    # COMPUTE HIDDEN COST (PER EXIT)
    # --------------------------------------------------------
    hidden_cost = calculate_hidden_cost(
        role_cost_usd_monthly=HIDDEN_COST_CONTEXT["role_cost_usd_monthly"],
        context=HIDDEN_COST_CONTEXT["context"]
    )

    per_exit_hidden_cost = hidden_cost["total_hidden_cost"]

    # --------------------------------------------------------
    # SECTION 1 — ATTRITION RISK POSTURE
    # --------------------------------------------------------
    st.markdown("## Attrition Risk Posture")

    with st.container(border=True):
        col1, col2, col3, col4 = st.columns(4)

        col1.metric("Annual Attrition Rate", f"{attrition_rate}%")
        col2.metric("Expected Exits (180 days)", "18–22")
        col3.metric("Visible Attrition Cost (per exit)", "US$0.42M")
        col4.metric(
            "Hidden Attrition Cost (per exit)",
            f"US${per_exit_hidden_cost / 1_000_000:.2f}M ⚠️"
        )

    st.info(
        "Attrition exposure is driven primarily by **hidden operational and "
        "knowledge loss**, not just visible replacement costs."
    )

    # --------------------------------------------------------
    # SECTION 2 — RISK CONCENTRATION
    # --------------------------------------------------------
    st.markdown("## Risk Concentration")

    segment = DRIVER_EVIDENCE["attrition"]["segment_context"]

    with st.expander(segment["segment_name"], expanded=False):
        st.markdown(
            f"""
            **Why this segment matters**
            - Represents approximately **{segment['population_pct']}%** of projected exits
            - Business criticality: **{segment['business_criticality']}**

            Attrition in this segment disproportionately affects delivery continuity,
            institutional knowledge, and downstream productivity.
            """
        )

    # --------------------------------------------------------
    # SECTION 3 — DRIVER INTELLIGENCE (DYNAMIC)
    # --------------------------------------------------------
    st.markdown("## Driver Intelligence")

    tab_exit, tab_damage = st.tabs(
        ["Exit Drivers — Why people leave", "Damage Drivers — Why exits hurt"]
    )

    with tab_exit:
        for driver_id, evidence in DRIVER_EVIDENCE["attrition"]["exit_drivers"].items():
            narrative = generate_driver_narrative(
                driver_id=driver_id,
                evidence=evidence,
                kpi_label="attrition",
                driver_definitions=DRIVER_DEFS
            )
            if narrative:
                st.markdown(f"**{DRIVER_DEFS[driver_id]['meta']['label']}**")
                st.write(narrative)
                st.markdown("---")

    with tab_damage:
        for driver_id, evidence in DRIVER_EVIDENCE["attrition"]["damage_drivers"].items():
            narrative = generate_driver_narrative(
                driver_id=driver_id,
                evidence=evidence,
                kpi_label="attrition",
                driver_definitions=DRIVER_DEFS
            )
            if narrative:
                st.markdown(f"**{DRIVER_DEFS[driver_id]['meta']['label']}**")
                st.write(narrative)
                st.markdown("---")

    # --------------------------------------------------------
    # SECTION 4 — PREDICTIVE OUTLOOK
    # --------------------------------------------------------
    st.markdown("## Predictive Outlook")

    projected_exits_180d = 20  # demo midpoint
    projected_hidden_cost = per_exit_hidden_cost * projected_exits_180d

    with st.container(border=True):
        col1, col2, col3 = st.columns(3)

        col1.metric("Expected Exits (90 days)", "7–9")
        col2.metric("Expected Exits (180 days)", "18–22")
        col3.metric(
            "Projected Hidden Cost Exposure (180 days)",
            f"US${projected_hidden_cost / 1_000_000:.2f}M"
        )

    st.caption(
        "Model confidence: **Medium**. Projections are conservative and exclude "
        "long-term reputational or strategic costs."
    )

    # --------------------------------------------------------
    # SECTION 5 — PRESCRIPTIVE ACTIONS
    # --------------------------------------------------------
    st.markdown("## Prescriptive Actions")

    with st.container(border=True):
        st.subheader("Knowledge Capture & Shadow Staffing")

        st.markdown(
            """
            This intervention does not directly reduce attrition probability.
            Its primary objective is to **contain hidden cost exposure** by
            accelerating knowledge transfer and reducing single-point failure risk.
            """
        )

        cost_avoided = projected_hidden_cost * 0.32

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Attrition Risk Impact", "Neutral")
        col2.metric("Hidden Cost Reduction", "↓32%")
        col3.metric("Time to Impact", "30 days")
        col4.metric(
            "Estimated Cost Avoided",
            f"US${cost_avoided / 1_000_000:.2f}M"
        )

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")

attrition_rate = st.sidebar.slider(
    "Annual Attrition Rate (%)",
    min_value=5.0,
    max_value=40.0,
    value=21.3,
    step=0.5
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "Attrition Intelligence"]
)

# ============================================================
# PAGE ROUTING
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption(
        "Catalyst connects workforce signals → drivers → future risk → "
        "financial impact → prescriptive action."
    )

elif page == "Attrition Intelligence":
    render_attrition_intelligence_page(attrition_rate)
