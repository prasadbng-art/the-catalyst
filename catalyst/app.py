import streamlit as st
import json
from pathlib import Path
from copy import deepcopy

# ============================================================
# IMPORT INTELLIGENCE LAYERS
# ============================================================
from intelligence.driver_interpreter import (
    load_driver_definitions,
    generate_driver_narrative
)
from intelligence.hidden_cost import calculate_hidden_cost
from intelligence.action_roi import compute_action_roi
from intelligence.sensitivity import generate_sensitivity_contexts

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# LOAD DRIVER DEFINITIONS
# ============================================================
@st.cache_data(show_spinner=False)
def load_drivers():
    return load_driver_definitions("config/drivers.yaml")

DRIVER_DEFS = load_drivers()

# ============================================================
# LOAD DRIVER EVIDENCE
# ============================================================
@st.cache_data(show_spinner=False)
def load_driver_evidence():
    base_dir = Path(__file__).resolve().parent
    with open(base_dir / "clients/demo/data/driver_evidence.json", "r") as f:
        return json.load(f)

DRIVER_EVIDENCE = load_driver_evidence()

# ============================================================
# LOAD HIDDEN COST CONTEXT
# ============================================================
@st.cache_data(show_spinner=False)
def load_hidden_cost_context():
    base_dir = Path(__file__).resolve().parent
    with open(base_dir / "clients/demo/data/hidden_cost_context.json", "r") as f:
        return json.load(f)

BASE_HIDDEN_COST_CONTEXT = load_hidden_cost_context()

# ============================================================
# ACTION CATALOG (DEMO)
# ============================================================
ACTIONS = [
    {
        "name": "Knowledge Capture & Shadow Staffing",
        "cost_to_execute": 420000,
        "impact_pct": 0.32,
        "time_to_impact_days": 30
    },
    {
        "name": "Manager Coaching Sprint",
        "cost_to_execute": 180000,
        "impact_pct": 0.18,
        "time_to_impact_days": 60
    },
    {
        "name": "Accelerated Internal Mobility Program",
        "cost_to_execute": 260000,
        "impact_pct": 0.22,
        "time_to_impact_days": 90
    }
]

# ============================================================
# ATTRITION INTELLIGENCE PAGE
# ============================================================
def render_attrition_intelligence_page(attrition_rate: float, scenario_context: dict):

    st.title("Attrition Intelligence")
    st.caption(
        "Decision-grade insight into attrition risk, hidden cost exposure, "
        "and value leakage."
    )

    # --------------------------------------------------------
    # SENSITIVITY CONTEXTS
    # --------------------------------------------------------
    low_ctx, base_ctx, high_ctx = generate_sensitivity_contexts(scenario_context)

    def hidden_cost_total(ctx):
        return calculate_hidden_cost(
            BASE_HIDDEN_COST_CONTEXT["role_cost_usd_monthly"],
            ctx
        )["total_hidden_cost"]

    hc_low = hidden_cost_total(low_ctx)
    hc_base = hidden_cost_total(base_ctx)
    hc_high = hidden_cost_total(high_ctx)

    projected_exits = 20

    # --------------------------------------------------------
    # ATTRITION RISK POSTURE
    # --------------------------------------------------------
    st.markdown("## Attrition Risk Posture")

    with st.container(border=True):
        col1, col2, col3, col4 = st.columns(4)

        col1.metric("Annual Attrition Rate", f"{attrition_rate}%")
        col2.metric("Expected Exits (180 days)", "18–22")
        col3.metric("Hidden Cost / Exit (Range)",
                    f"US${hc_low/1e6:.2f}–{hc_high/1e6:.2f}M")
        col4.metric("Projected Exposure (180d)",
                    f"US${(hc_low*projected_exits)/1e6:.1f}–{(hc_high*projected_exits)/1e6:.1f}M")

    # --------------------------------------------------------
    # DRIVER INTELLIGENCE
    # --------------------------------------------------------
    st.markdown("## Driver Intelligence")

    tab_exit, tab_damage = st.tabs(
        ["Exit Drivers — Why people leave", "Damage Drivers — Why exits hurt"]
    )

    with tab_exit:
        for driver_id, evidence in DRIVER_EVIDENCE["attrition"]["exit_drivers"].items():
            narrative = generate_driver_narrative(
                driver_id, evidence, "attrition", DRIVER_DEFS
            )
            if narrative:
                st.markdown(f"**{DRIVER_DEFS[driver_id]['meta']['label']}**")
                st.write(narrative)
                st.markdown("---")

    with tab_damage:
        for driver_id, evidence in DRIVER_EVIDENCE["attrition"]["damage_drivers"].items():
            narrative = generate_driver_narrative(
                driver_id, evidence, "attrition", DRIVER_DEFS
            )
            if narrative:
                st.markdown(f"**{DRIVER_DEFS[driver_id]['meta']['label']}**")
                st.write(narrative)
                st.markdown("---")

    # --------------------------------------------------------
    # PRESCRIPTIVE ACTIONS — ROI BANDS
    # --------------------------------------------------------
    st.markdown("## Prescriptive Actions (ROI Bands)")

    for action in ACTIONS:
        roi_low = compute_action_roi(hc_low * projected_exits, action)
        roi_base = compute_action_roi(hc_base * projected_exits, action)
        roi_high = compute_action_roi(hc_high * projected_exits, action)

        with st.container(border=True):
            st.subheader(action["name"])

            col1, col2, col3 = st.columns(3)

            col1.metric(
                "Cost Avoided (Range)",
                f"US${roi_low['cost_avoided']/1e6:.1f}–{roi_high['cost_avoided']/1e6:.1f}M"
            )

            col2.metric(
                "ROI Multiple (Range)",
                f"{roi_low['roi_multiple']}×–{roi_high['roi_multiple']}×"
            )

            col3.metric(
                "Payback (days)",
                f"{roi_base['payback_days']} (base)"
            )

# ============================================================
# SIDEBAR — SCENARIO CONTROLS
# ============================================================
st.sidebar.title("The Catalyst")
st.sidebar.markdown("### Scenario Controls")

scenario_context = deepcopy(BASE_HIDDEN_COST_CONTEXT["context"])

scenario_context["vacancy_duration_months"] = st.sidebar.slider(
    "Vacancy Duration (months)", 0.5, 4.0,
    float(scenario_context["vacancy_duration_months"]), 0.25
)

scenario_context["ramp_up_duration_months"] = st.sidebar.slider(
    "Ramp-up Duration (months)", 2.0, 8.0,
    float(scenario_context["ramp_up_duration_months"]), 0.5
)

scenario_context["knowledge_risk_multiplier"] = st.sidebar.slider(
    "Knowledge Risk Multiplier", 0.2, 1.0,
    float(scenario_context["knowledge_risk_multiplier"]), 0.05
)

st.sidebar.markdown("---")

attrition_rate = st.sidebar.slider(
    "Annual Attrition Rate (%)", 5.0, 40.0, 21.3, 0.5
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "Attrition Intelligence"]
)

if page == "Overview":
    st.title("The Catalyst")
    st.caption(
        "Catalyst connects workforce signals → drivers → future risk → "
        "financial impact → prescriptive action."
    )
else:
    render_attrition_intelligence_page(attrition_rate, scenario_context)
