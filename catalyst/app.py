import streamlit as st
import json
from pathlib import Path
from copy import deepcopy

# ============================================================
# APP CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

BASE_DIR = Path(__file__).resolve().parent
CLIENTS_DIR = BASE_DIR / "clients"

# ============================================================
# WIZARD & CLIENT CONFIG
# ============================================================
from wizard.wizard import run_client_wizard
from client_config import list_clients, get_active_client

# ============================================================
# INTELLIGENCE LAYERS
# ============================================================
from intelligence.action_portfolio import optimise_action_portfolio
from intelligence.hidden_cost import calculate_hidden_cost
from narrative_engine import generate_narrative
from scenario_store import save_scenario, list_scenarios, load_scenario

# ============================================================
# REGISTRIES & DEFAULTS
# ============================================================
from kpi_registry import KPI_REGISTRY
from defaults import (
    DEFAULT_PORTFOLIO_BUDGET,
    DEFAULT_PORTFOLIO_HORIZON_DAYS,
)
from kpi_thresholds import resolve_kpi_thresholds, classify_kpi

# ============================================================
# STARTUP INTEGRITY CHECK (v0.7)
# ============================================================
def run_startup_integrity_check():
    required = [
        CLIENTS_DIR / "demo" / "data" / "hidden_cost_context.json",
        CLIENTS_DIR / "demo" / "data" / "driver_evidence.json",
        BASE_DIR / "config" / "drivers.yaml",
    ]

    missing = [str(p) for p in required if not p.exists()]
    if missing:
        st.error("🚨 Catalyst startup check failed.")
        st.write("Missing required files:")
        for m in missing:
            st.write(f"- {m}")
        st.stop()

run_startup_integrity_check()

# ============================================================
# CLIENT-AWARE LOADERS (CANONICAL)
# ============================================================
@st.cache_data(show_spinner=False)
def load_hidden_cost_context(client_id: str | None):
    if client_id:
        path = CLIENTS_DIR / client_id / "data" / "hidden_cost_context.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))

    fallback = CLIENTS_DIR / "demo" / "data" / "hidden_cost_context.json"
    return json.loads(fallback.read_text(encoding="utf-8"))

@st.cache_data(show_spinner=False)
def load_driver_evidence(client_id: str | None):
    if client_id:
        path = CLIENTS_DIR / client_id / "data" / "driver_evidence.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))

    fallback = CLIENTS_DIR / "demo" / "data" / "driver_evidence.json"
    return json.loads(fallback.read_text(encoding="utf-8"))

# ============================================================
# KPI ENABLEMENT RESOLVER
# ============================================================
def resolve_enabled_kpis(active_client):
    if not active_client:
        return list(KPI_REGISTRY.keys()), None

    kpis = active_client.get("kpis", {})
    enabled = [
        k for k, v in kpis.items()
        if isinstance(v, dict) and v.get("enabled") and k in KPI_REGISTRY
    ]

    primary = kpis.get("primary")
    if primary not in enabled:
        primary = enabled[0] if enabled else None

    return enabled, primary

# ============================================================
# CLIENT-DRIVEN EXPOSURE
# ============================================================
def resolve_client_exposure(
    *,
    scenario_context: dict,
    projected_exits: int,
    client_financials: dict | None,
    base_hidden_cost_context: dict
) -> float:

    base_cost = calculate_hidden_cost(
        base_hidden_cost_context["role_cost_usd_monthly"],
        scenario_context
    )["total_hidden_cost"]

    multiplier = client_financials.get("replacement_multiplier", 1.0) if client_financials else 1.0
    productivity_loss = client_financials.get("productivity_loss_pct", 0.0) if client_financials else 0.0

    adjusted = base_cost * multiplier
    return (adjusted + adjusted * productivity_loss) * projected_exits

# ============================================================
# SIDEBAR — CLIENT CONTROL PLANE
# ============================================================
st.sidebar.title("The Catalyst")
st.sidebar.markdown("## Client Context")

clients = list_clients()
if clients:
    selected = st.sidebar.selectbox("Active Client", ["— None —"] + clients)
    if selected != "— None —":
        st.session_state.active_client = selected
    else:
        st.session_state.pop("active_client", None)
else:
    st.sidebar.info("No calibrated clients found.")

if st.sidebar.button("Run Client Calibration Wizard"):
    run_client_wizard()
    st.stop()

client_id = st.session_state.get("active_client")
active_client = get_active_client(st.session_state)

if active_client:
    with st.sidebar.expander("Active Client (Debug)"):
        st.json(active_client)

# ============================================================
# LOAD CLIENT DATA
# ============================================================
BASE_HIDDEN_COST_CONTEXT = load_hidden_cost_context(client_id)
DRIVER_EVIDENCE = load_driver_evidence(client_id)

enabled_kpis, primary_kpi = resolve_enabled_kpis(active_client)

# ============================================================
# PERSONA & KPI SELECTION
# ============================================================
persona = st.sidebar.selectbox("View as", ["CEO", "CFO", "CHRO"])

if enabled_kpis:
    selected_kpi = st.sidebar.selectbox(
        "Select KPI",
        enabled_kpis,
        index=enabled_kpis.index(primary_kpi) if primary_kpi in enabled_kpis else 0,
        format_func=lambda k: KPI_REGISTRY[k]["label"]
    )
else:
    selected_kpi = None
    st.sidebar.warning("No KPIs enabled.")

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
    scenario_context["knowledge_risk_multiplier"], 0.05
)

attrition_rate = st.sidebar.slider(
    "Annual Attrition Rate (%)", 5.0, 40.0, 21.3, 0.5
)

page = st.sidebar.radio(
    "Navigate",
    ["Overview", "KPI Intelligence", "CFO Summary", "Scenario Compare"]
)

# ============================================================
# ACTION PORTFOLIO
# ============================================================
ACTIONS = [
    {"name": "Knowledge Capture & Shadow Staffing", "cost_to_execute": 420000, "impact_pct": 0.32, "time_to_impact_days": 30},
    {"name": "Manager Coaching Sprint", "cost_to_execute": 180000, "impact_pct": 0.18, "time_to_impact_days": 60},
    {"name": "Accelerated Internal Mobility Program", "cost_to_execute": 260000, "impact_pct": 0.22, "time_to_impact_days": 90},
]

PROJECTED_EXITS_180D = 20

portfolio_budget = DEFAULT_PORTFOLIO_BUDGET
portfolio_horizon = (
    active_client.get("strategy", {}).get("horizon_days", DEFAULT_PORTFOLIO_HORIZON_DAYS)
    if active_client else DEFAULT_PORTFOLIO_HORIZON_DAYS
)

client_financials = active_client.get("financials") if active_client else None

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

# ============================================================
# MAIN VIEW
# ============================================================
st.title("Optimal Action Portfolio")

for action in portfolio.get("selected_actions", []):
    with st.container(border=True):
        st.subheader(action["name"])
        c1, c2, c3 = st.columns(3)
        c1.metric("Cost", f"US${action['cost_to_execute']/1e6:.2f}M")
        c2.metric("Cost Avoided", f"US${action['cost_avoided']/1e6:.2f}M")
        c3.metric("ROI", f"{action['roi']:.2f}×")

# ============================================================
# SAVE SCENARIO
# ============================================================
st.markdown("---")
st.subheader("Save Scenario")

scenario_name = st.text_input("Scenario name")

if st.button("Save Scenario"):
    if not client_id:
        st.error("Select an active client before saving.")
    elif not scenario_name:
        st.error("Scenario name is required.")
    else:
        save_scenario(
            scenario_name=scenario_name,
            client_name=client_id,
            persona=persona,
            inputs={
                "attrition_rate": attrition_rate,
                "scenario_context": scenario_context,
                "portfolio_budget": portfolio_budget,
                "portfolio_horizon": portfolio_horizon,
            },
            derived={
                "exposure": projected_exposure,
                "kpi_status": classify_kpi(
                    attrition_rate,
                    resolve_kpi_thresholds("attrition", active_client),
                ),
            },
            portfolio=portfolio,
        )
        st.success("Scenario saved.")
