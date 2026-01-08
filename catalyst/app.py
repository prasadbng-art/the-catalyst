import streamlit as st
import json
from pathlib import Path
from copy import deepcopy

# ============================================================
# WIZARD & CLIENT CONFIG
# ============================================================
from wizard.wizard import run_client_wizard
from client_config import list_clients, get_active_client

# ============================================================
# INTELLIGENCE LAYERS
# ============================================================
from intelligence.action_portfolio import optimise_action_portfolio
from intelligence.driver_interpreter import load_driver_definitions
from intelligence.hidden_cost import calculate_hidden_cost
from intelligence.action_roi import compute_action_roi
from intelligence.sensitivity import generate_sensitivity_contexts
from narrative_engine import generate_narrative

# ============================================================
# REGISTRIES & DEFAULTS
# ============================================================
from metric_registry import METRIC_REGISTRY
from kpi_registry import KPI_REGISTRY
from defaults import (
    DEFAULT_PORTFOLIO_BUDGET,
    DEFAULT_PORTFOLIO_HORIZON_DAYS,
   )
# # ============================================================
# KPI ENABLEMENT RESOLVER (CLIENT-AWARE)
# ============================================================
def resolve_enabled_kpis(active_client, kpi_registry):
    """
    Returns (enabled_kpis, primary_kpi)
    """
    if not active_client:
        return list(kpi_registry.keys()), None

    enabled_kpis = [
        k for k, v in active_client["kpis"].items()
        if isinstance(v, dict) and v.get("enabled")
    ]

    primary_kpi = active_client["kpis"].get("primary")

    return enabled_kpis, primary_kpi

# ============================================================
# CLIENT-DRIVEN EXPOSURE RESOLVER (v0.7)
# ============================================================
def resolve_client_exposure(
    *,
    scenario_context: dict,
    projected_exits: int,
    client_financials: dict | None,
    base_hidden_cost_context: dict
) -> float:
    """
    Computes total projected exposure using client financial assumptions.
    """

    # ---- Base hidden cost per exit
    base_cost = calculate_hidden_cost(
        base_hidden_cost_context["role_cost_usd_monthly"],
        scenario_context
    )["total_hidden_cost"]

    # ---- Client financial overrides
    replacement_multiplier = (
        client_financials["replacement_multiplier"]
        if client_financials
        else 1.0
    )

    productivity_loss_pct = (
        client_financials["productivity_loss_pct"]
        if client_financials
        else 0.0
    )

    # ---- Final exposure calculation
    adjusted_cost_per_exit = base_cost * replacement_multiplier
    productivity_loss = adjusted_cost_per_exit * productivity_loss_pct

    total_cost_per_exit = adjusted_cost_per_exit + productivity_loss

    return total_cost_per_exit * projected_exits

# ============================================================
# PERSONA THEME (LOGIC-ONLY)
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
        ctx = json.load(f)

    for key in ["role_cost_usd_monthly", "context"]:
        if key not in ctx:
            raise ValueError(f"Hidden cost context missing key: {key}")

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
# SIDEBAR — CLIENT CONTROL PLANE
# ============================================================
st.sidebar.title("The Catalyst")

st.sidebar.markdown("## Client Context")

available_clients = list_clients()

if available_clients:
    selected_client = st.sidebar.selectbox(
        "Active Client",
        options=["— None —"] + available_clients
    )

    if selected_client != "— None —":
        st.session_state.active_client = selected_client
    else:
        st.session_state.pop("active_client", None)
else:
    st.sidebar.info("No calibrated clients found.")

if st.sidebar.button("Run Client Calibration Wizard"):
    run_client_wizard()
    st.stop()

# ---- Resolve active client ONCE
active_client = get_active_client(st.session_state)
enabled_kpis, primary_kpi = resolve_enabled_kpis(
    active_client,
    KPI_REGISTRY
)

# ---- Existing debug (client profile)
if active_client:
    with st.sidebar.expander("Active Client (Debug)", expanded=False):
        st.json(active_client)

if active_client:
    with st.sidebar.expander("KPI Configuration", expanded=False):
        st.write("Enabled KPIs:", enabled_kpis)
        st.write("Primary KPI:", primary_kpi)

st.sidebar.markdown("---")

# ============================================================
# PERSONA & KPI SELECTION
# ============================================================
persona = st.sidebar.selectbox("View as", ["CEO", "CFO", "CHRO"])
apply_persona_theme(persona)

if enabled_kpis:
    default_index = (
        enabled_kpis.index(primary_kpi)
        if primary_kpi in enabled_kpis
        else 0
    )

    selected_kpi = st.sidebar.selectbox(
        "Select KPI",
        options=enabled_kpis,
        index=default_index,
        format_func=lambda k: KPI_REGISTRY[k]["label"]
    )
else:
    st.sidebar.warning("No KPIs enabled for this client.")
    selected_kpi = None


# ============================================================
# SCENARIO CONTEXT
# ============================================================
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

attrition_rate = st.sidebar.slider(
    "Annual Attrition Rate (%)", 5.0, 40.0, 21.3, 0.5
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "KPI Intelligence", "CFO Summary"]
)

# ============================================================
# ACTION PORTFOLIO CONSTRAINTS (CLIENT-AWARE)
# ============================================================
portfolio_budget = DEFAULT_PORTFOLIO_BUDGET

portfolio_horizon = (
    DEFAULT_PORTFOLIO_HORIZON_DAYS
    if not active_client
    else active_client["strategy"]["horizon_days"]
)

# ============================================================
# OPTIMAL ACTION PORTFOLIO
# ============================================================
st.markdown("## Optimal Action Portfolio")

client_financials = (
    active_client["financials"]
    if active_client
    else None
)

projected_exposure = resolve_client_exposure(
    scenario_context=scenario_context,
    projected_exits=PROJECTED_EXITS_180D,
    client_financials=client_financials,
    base_hidden_cost_context=BASE_HIDDEN_COST_CONTEXT
)

portfolio = optimise_action_portfolio(
    actions=ACTIONS,
    total_budget=portfolio_budget,
    max_time_days=portfolio_horizon,
    projected_exposure=projected_exposure
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
# ATTRITION INTELLIGENCE
# ============================================================

def render_attrition_intelligence_page(attrition_rate: float, scenario_context: dict):

    st.title("Attrition Intelligence")
    st.caption("Operational and financial intelligence for attrition risk")

# ---- Narrative
kpi_state = {
    "attrition_rate": attrition_rate
}

strategy_context = (
    active_client["strategy"]
    if active_client
    else None
)

narrative = generate_narrative(
    kpi="attrition",
    kpi_state=kpi_state,
    client_context=active_client,
    persona=persona,
    strategy_context=strategy_context
)

with st.container(border=True):
    st.subheader(narrative["headline"])
    st.write(narrative["interpretation"])
    st.markdown(f"**Risk:** {narrative['risk_statement']}")
    st.markdown(f"**Recommended posture:** {narrative['recommended_posture']}")

    st.markdown("### Signals in Scope")

    cols = st.columns(3)
    for i, metric_key in enumerate(KPI_REGISTRY["attrition"]["metrics"]):
        meta = METRIC_REGISTRY.get(metric_key)
        if not meta:
            continue

        value = meta.get("default", "—")
        if meta["type"] == "currency":
            value = f"US${value:,.0f}"
        elif meta["type"] == "percentage":
            value = f"{value}%"

        cols[i % 3].metric(meta["label"], value)

    st.markdown("---")

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
# ROUTING
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("Catalyst converts people risk into financial decisions.")

elif page == "KPI Intelligence":
    if not selected_kpi:
        st.warning("No KPI enabled for this client.")
    elif selected_kpi == "attrition":
        render_attrition_intelligence_page(attrition_rate, scenario_context)
    else:
        st.title(KPI_REGISTRY[selected_kpi]["label"])
        st.info("This KPI intelligence module is under active development.")

elif page == "CFO Summary":
    st.title("CFO / Board Summary")
    st.info("Client-aware CFO narratives coming next.")
