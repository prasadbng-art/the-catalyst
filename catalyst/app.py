import streamlit as st
import json
from pathlib import Path
from copy import deepcopy

def apply_persona_theme(persona: str):
    themes = {
        "CEO": {
            "bg": "#0047AB",       # Cobalt Blue
            "text": "#FFFFFF",
            "header": "#E6F0FF",
            "accent": "#AECBFA"
        },
        "CFO": {
            "bg": "#8C5A00",       # Dark Amber
            "text": "#FFF8E1",
            "header": "#FFE082",
            "accent": "#FFD54F"
        },
        "CHRO": {
            "bg": "#005F5F",       # Deep Teal
            "text": "#E0F2F1",
            "header": "#B2DFDB",
            "accent": "#80CBC4"
        }
    }

    theme = themes.get(persona, themes["CEO"])

    st.markdown(
        f"""
        <style>
        /* Sidebar background */
        section[data-testid="stSidebar"] {{
            background-color: {theme["bg"]};
        }}

        /* General sidebar text */
        section[data-testid="stSidebar"] * {{
            color: {theme["text"]};
        }}

        /* Sidebar headers */
        section[data-testid="stSidebar"] h1,
        section[data-testid="stSidebar"] h2,
        section[data-testid="stSidebar"] h3 {{
            color: {theme["header"]};
        }}

        /* Widget labels (sliders, radios, selectbox) */
        section[data-testid="stSidebar"] label,
        section[data-testid="stSidebar"] span {{
            color: {theme["text"]} !important;
        }}

        /* Slider value text */
        section[data-testid="stSidebar"] div[data-testid="stMarkdownContainer"] {{
            color: {theme["text"]} !important;
        }}

        /* Radio buttons & checkmarks */
        section[data-testid="stSidebar"] svg {{
            fill: {theme["accent"]};
        }}

        /* Slider track & thumb */
        section[data-testid="stSidebar"] div[data-baseweb="slider"] > div {{
            color: {theme["accent"]};
        }}

        /* Dropdown (selectbox) text */
        section[data-testid="stSidebar"] div[data-baseweb="select"] {{
            color: {theme["text"]};
        }}
        </style>
        """,
        unsafe_allow_html=True
    )


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

PROJECTED_EXITS_180D = 20

# ============================================================
# ATTRITION INTELLIGENCE PAGE (UNCHANGED CORE)
# ============================================================
def render_attrition_intelligence_page(attrition_rate: float, scenario_context: dict):

    st.title("Attrition Intelligence")
    st.caption("Operational and financial intelligence for attrition risk.")

    low_ctx, base_ctx, high_ctx = generate_sensitivity_contexts(scenario_context)

    def hc(ctx):
        return calculate_hidden_cost(
            BASE_HIDDEN_COST_CONTEXT["role_cost_usd_monthly"], ctx
        )["total_hidden_cost"]

    hc_low, hc_base, hc_high = hc(low_ctx), hc(base_ctx), hc(high_ctx)

    st.metric(
        "Hidden Cost per Exit (Range)",
        f"US${hc_low/1e6:.2f}–{hc_high/1e6:.2f}M"
    )

# ============================================================
# CFO / BOARD SUMMARY VIEW
# ============================================================
def render_cfo_summary(attrition_rate: float, scenario_context: dict):

    st.title("CFO / Board Summary")
    st.caption("One-page financial view of attrition exposure and decisions.")

    low_ctx, base_ctx, high_ctx = generate_sensitivity_contexts(scenario_context)

    def hc(ctx):
        return calculate_hidden_cost(
            BASE_HIDDEN_COST_CONTEXT["role_cost_usd_monthly"], ctx
        )["total_hidden_cost"]

    hc_low, hc_base, hc_high = hc(low_ctx), hc(base_ctx), hc(high_ctx)

    exposure_low = hc_low * PROJECTED_EXITS_180D
    exposure_base = hc_base * PROJECTED_EXITS_180D
    exposure_high = hc_high * PROJECTED_EXITS_180D

    # --------------------------------------------------------
    # EXECUTIVE SNAPSHOT
    # --------------------------------------------------------
    st.markdown("## Executive Risk Snapshot")

    col1, col2, col3 = st.columns(3)
    col1.metric("Annual Attrition Rate", f"{attrition_rate}%")
    col2.metric("Projected Exits (180 days)", PROJECTED_EXITS_180D)
    col3.metric(
        "Financial Exposure (Base)",
        f"US${exposure_base/1e6:.1f}M"
    )

    # --------------------------------------------------------
    # FINANCIAL EXPOSURE BANDS
    # --------------------------------------------------------
    st.markdown("## Financial Exposure (Low / Base / High)")

    col1, col2, col3 = st.columns(3)
    col1.metric("Low Case", f"US${exposure_low/1e6:.1f}M")
    col2.metric("Base Case", f"US${exposure_base/1e6:.1f}M")
    col3.metric("High Case", f"US${exposure_high/1e6:.1f}M")

    st.caption(
        "Ranges reflect operational uncertainty in vacancy duration, "
        "ramp-up efficiency, and knowledge loss."
    )

    # --------------------------------------------------------
    # ACTION ROI SUMMARY
    # --------------------------------------------------------
    st.markdown("## ROI-Ranked Mitigation Options")

    roi_rows = []

    for action in ACTIONS:
        roi = compute_action_roi(exposure_base, action)
        roi_rows.append({**action, **roi})

    roi_rows = sorted(
        roi_rows,
        key=lambda x: x["roi_multiple"] or 0,
        reverse=True
    )

    for action in roi_rows[:3]:
        with st.container(border=True):
            st.subheader(action["name"])

            col1, col2, col3, col4 = st.columns(4)
            col1.metric("Investment", f"US${action['cost_to_execute']/1e6:.2f}M")
            col2.metric("Cost Avoided", f"US${action['cost_avoided']/1e6:.2f}M")
            col3.metric("ROI", f"{action['roi_multiple']}×")
            col4.metric("Payback", f"{action['payback_days']} days")

    # --------------------------------------------------------
    # DECISION GUIDANCE
    # --------------------------------------------------------
    st.markdown("## Decision Guidance")

    st.info(
        f"""
        - Attrition presents a **material financial exposure** in the next 180 days.
        - Even in a conservative case, exposure exceeds **US${exposure_low/1e6:.1f}M**.
        - The top ranked action delivers **>3× ROI** with payback inside one quarter.
        - Delay increases exposure asymmetrically due to knowledge and ramp-up effects.
        """
    )

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")

persona = st.sidebar.selectbox(
    "View as",
    ["CEO", "CFO", "CHRO"]
)

apply_persona_theme(persona)

st.sidebar.markdown("---")

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
    ["Overview", "Attrition Intelligence", "CFO Summary"]
)

# ============================================================
# ROUTING
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption(
        "Catalyst converts people risk into financial decisions."
    )

elif page == "Attrition Intelligence":
    render_attrition_intelligence_page(attrition_rate, scenario_context)

elif page == "CFO Summary":
    render_cfo_summary(attrition_rate, scenario_context)
