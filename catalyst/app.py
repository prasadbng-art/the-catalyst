import streamlit as st
import json
from pathlib import Path
from copy import deepcopy
from intelligence.action_portfolio import optimise_action_portfolio
from metric_registry import METRIC_REGISTRY
from kpi_registry import KPI_REGISTRY
from defaults import (
    DEFAULT_PORTFOLIO_BUDGET,
    DEFAULT_PORTFOLIO_HORIZON_DAYS,
    DEFAULT_EXPOSURE_BASE
)

# ============================================================
# PERSONA THEME (PAUSED FOR POLISH, BUT CORRECTLY WIRED)
# ============================================================
def apply_persona_theme(persona: str):
    themes = {
        "CEO": {"bg": "#0047AB"},
        "CFO": {"bg": "#8C5A00"},
        "CHRO": {"bg": "#005F5F"}
    }
    theme = themes.get(persona, themes["CEO"])

    st.markdown(
        f"""
        <style>
        section[data-testid="stSidebar"] {{
            background-color: {theme["bg"]};
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
# LOAD HIDDEN COST CONTEXT (FAIL FAST)
# ============================================================
@st.cache_data(show_spinner=False)
def load_hidden_cost_context():
    base_dir = Path(__file__).resolve().parent
    with open(base_dir / "clients/demo/data/hidden_cost_context.json", "r") as f:
        ctx = json.load(f)

    required = ["role_cost_usd_monthly", "context"]
    missing = [k for k in required if k not in ctx]
    if missing:
        raise ValueError(f"Hidden cost context missing keys: {missing}")

    return ctx

BASE_HIDDEN_COST_CONTEXT = load_hidden_cost_context()

# ============================================================
# ACTION CATALOG (DEMO)
# ============================================================
ACTIONS = [
    {"name": "Knowledge Capture & Shadow Staffing", "cost_to_execute": 420000, "impact_pct": 0.32, "time_to_impact_days": 30},
    {"name": "Manager Coaching Sprint", "cost_to_execute": 180000, "impact_pct": 0.18, "time_to_impact_days": 60},
    {"name": "Accelerated Internal Mobility Program", "cost_to_execute": 260000, "impact_pct": 0.22, "time_to_impact_days": 90}
]

PROJECTED_EXITS_180D = 20

# ============================================================
# ATTRITION INTELLIGENCE
# ============================================================
def render_attrition_intelligence_page(attrition_rate: float, scenario_context: dict):

    st.title("Attrition Intelligence")
    st.caption("Operational and financial intelligence for attrition risk")

    # ---- Signals in scope (dual registry proof)
    st.markdown("### Signals in Scope")

    cols = st.columns(3)
    i = 0
    for metric_key in KPI_REGISTRY["attrition"]["metrics"]:
        meta = METRIC_REGISTRY.get(metric_key)
        if not meta:
            continue

        value = meta.get("default", "—")
        if meta["type"] == "currency":
            value = f"US${value:,.0f}"
        elif meta["type"] == "percentage":
            value = f"{value}%"

        cols[i % 3].metric(meta["label"], value)
        i += 1

    st.markdown("---")

    # ---- Sensitivity
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
# CFO SUMMARY
# ============================================================
def render_cfo_summary(
    attrition_rate: float,
    scenario_context: dict,
    portfolio_budget: float,
    portfolio_horizon: int
):
    st.title("CFO / Board Summary")

    low_ctx, base_ctx, high_ctx = generate_sensitivity_contexts(scenario_context)

    def hc(ctx):
        return calculate_hidden_cost(
            BASE_HIDDEN_COST_CONTEXT["role_cost_usd_monthly"], ctx
        )["total_hidden_cost"]

    hc_low, hc_base, hc_high = hc(low_ctx), hc(base_ctx), hc(high_ctx)

    exposure_low = hc_low * PROJECTED_EXITS_180D
    exposure_base = hc_base * PROJECTED_EXITS_180D
    exposure_high = hc_high * PROJECTED_EXITS_180D

    col1, col2, col3 = st.columns(3)
    col1.metric("Attrition Rate", f"{attrition_rate}%")
    col2.metric("Projected Exits (180d)", PROJECTED_EXITS_180D)
    col3.metric("Exposure (Base)", f"US${exposure_base/1e6:.1f}M")

    st.markdown("### ROI-Ranked Actions")

    roi_rows = []
    for action in ACTIONS:
        roi = compute_action_roi(exposure_base, action)
        roi_rows.append({**action, **roi})

    roi_rows.sort(key=lambda x: x["roi_multiple"] or 0, reverse=True)

    for action in roi_rows[:3]:
        with st.container(border=True):
            st.subheader(action["name"])
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Investment", f"US${action['cost_to_execute']/1e6:.2f}M")
            c2.metric("Avoided Cost", f"US${action['cost_avoided']/1e6:.2f}M")
            c3.metric("ROI", f"{action['roi_multiple']}×")
            c4.metric("Payback", f"{action['payback_days']} days")

# --------------------------------------------------------
# OPTIMAL ACTION PORTFOLIO
# --------------------------------------------------------            
st.markdown("## Optimal Action Portfolio")

portfolio_budget = DEFAULT_PORTFOLIO_BUDGET
portfolio_horizon = DEFAULT_PORTFOLIO_HORIZON_DAYS
exposure_base = DEFAULT_EXPOSURE_BASE

portfolio = optimise_action_portfolio(
    actions=ACTIONS,
    total_budget=portfolio_budget,
    max_time_days=portfolio_horizon,
    projected_exposure=exposure_base
)

if not portfolio["selected_actions"]:
    st.warning("No actions fit within the current constraints.")
else:
    for action in portfolio["selected_actions"]:
        with st.container(border=True):
            st.subheader(action["name"])
            c1, c2, c3 = st.columns(3)
            c1.metric("Cost", f"US${action['cost_to_execute']/1e6:.2f}M")
            c2.metric("Cost Avoided", f"US${action['cost_avoided']/1e6:.2f}M")
            c3.metric("ROI", f"{action['roi']:.2f}×")

    st.markdown("### Portfolio Summary")

    c1, c2, c3 = st.columns(3)
    c1.metric("Budget Used", f"US${portfolio['budget_used']/1e6:.2f}M")
    c2.metric("Budget Remaining", f"US${portfolio['budget_remaining']/1e6:.2f}M")
    c3.metric(
        "Portfolio ROI",
        f"{portfolio['portfolio_roi']:.2f}×"
        if portfolio["portfolio_roi"] else "—"
    )

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")

persona = st.sidebar.selectbox("View as", ["CEO", "CFO", "CHRO"])
apply_persona_theme(persona)

st.sidebar.markdown("### KPI Focus")

selected_kpi = st.sidebar.selectbox(
    "Select KPI",
    options=list(KPI_REGISTRY.keys()),
    format_func=lambda k: KPI_REGISTRY[k]["label"]
)

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
    ["Overview", "KPI Intelligence", "CFO Summary"]
)
st.sidebar.markdown("### Action Portfolio Constraints")

portfolio_budget = st.sidebar.number_input(
    "Available Budget (US$)",
    min_value=100000,
    max_value=5000000,
    value=1000000,
    step=50000
)

portfolio_horizon = st.sidebar.slider(
    "Time Horizon (days)",
    min_value=30,
    max_value=180,
    value=90,
    step=15
)

# ============================================================
# ROUTING
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("Catalyst converts people risk into financial decisions.")

elif page == "KPI Intelligence":
    if selected_kpi == "attrition":
        render_attrition_intelligence_page(attrition_rate, scenario_context)
    else:
        st.title(KPI_REGISTRY[selected_kpi]["label"])
        st.info("This KPI intelligence module is under active development.")

elif page == "CFO Summary":
    render_cfo_summary(
        attrition_rate,
        scenario_context,
        portfolio_budget,
        portfolio_horizon
    )
