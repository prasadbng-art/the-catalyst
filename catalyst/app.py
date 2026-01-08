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
from scenario_store import save_scenario, list_scenarios, load_scenario

# ============================================================
# REGISTRIES & DEFAULTS
# ============================================================
from metric_registry import METRIC_REGISTRY
from kpi_registry import KPI_REGISTRY
from defaults import (
    DEFAULT_PORTFOLIO_BUDGET,
    DEFAULT_PORTFOLIO_HORIZON_DAYS,
)
from kpi_thresholds import resolve_kpi_thresholds, classify_kpi

# ============================================================
# KPI ENABLEMENT RESOLVER (CLIENT-AWARE)
# ============================================================
def resolve_enabled_kpis(active_client, kpi_registry):
    """
    Returns (enabled_kpis, primary_kpi)
    Only KPIs present in KPI_REGISTRY are allowed.
    """

    # ---- No client: everything enabled
    if not active_client:
        return list(kpi_registry.keys()), None

    client_kpis = active_client.get("kpis", {})

    enabled_kpis = [
        k for k, v in client_kpis.items()
        if (
            isinstance(v, dict)
            and v.get("enabled")
            and k in kpi_registry      # ✅ correct guard
        )
    ]

    primary_kpi = client_kpis.get("primary")
    if primary_kpi not in kpi_registry:
        primary_kpi = None

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

    base_cost = calculate_hidden_cost(
        base_hidden_cost_context["role_cost_usd_monthly"],
        scenario_context
    )["total_hidden_cost"]

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

    adjusted = base_cost * replacement_multiplier
    productivity_loss = adjusted * productivity_loss_pct

    return (adjusted + productivity_loss) * projected_exits

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
def load_driver_evidence(active_client: dict | None):
    base = Path(__file__).resolve().parent

    if active_client:
        client_id = active_client["client"]["name"].lower().replace(" ", "_")
        path = base / "clients" / client_id / "data" / "driver_evidence.json"

        if path.exists():
            return json.loads(path.read_text())

    return {}

    # ---- Fallback to demo defaults
    fallback = base_dir / "clients" / "demo" / "data" / "driver_evidence.json"
    if fallback.exists():
        with open(fallback, "r") as f:
            return json.load(f)

    # ---- Absolute last resort
    return {}

# ============================================================
# LOAD HIDDEN COST CONTEXT (CLIENT-AWARE, SAFE)
# ============================================================
@st.cache_data(show_spinner=False)
def load_hidden_cost_context(active_client: dict | None):
    base_dir = Path(__file__).resolve().parent

    # ---- Client-specific
    if active_client:
        client_id = active_client["client"]["id"]
        client_path = (
            base_dir / "clients" / client_id / "data" / "hidden_cost_context.json"
        )

        if client_path.exists():
            with open(client_path, "r", encoding="utf-8") as f:
                return json.load(f)

    # ---- Fallback to demo
    fallback = base_dir / "clients" / "demo" / "data" / "hidden_cost_context.json"
    if fallback.exists():
        with open(fallback, "r", encoding="utf-8") as f:
            return json.load(f)

    # ---- Hard fail (this is correct behaviour)
    raise FileNotFoundError(
        "Hidden cost context missing for active client and demo fallback."
    )


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
    selected = st.sidebar.selectbox("Active Client", ["— None —"] + available_clients)
    if selected != "— None —":
        st.session_state.active_client = selected
    else:
        st.session_state.pop("active_client", None)
else:
    st.sidebar.info("No calibrated clients found.")

if st.sidebar.button("Run Client Calibration Wizard"):
    run_client_wizard()
    st.stop()

active_client = get_active_client(st.session_state)
enabled_kpis, primary_kpi = resolve_enabled_kpis(active_client, KPI_REGISTRY)

if active_client:
    with st.sidebar.expander("Active Client (Debug)", expanded=False):
        st.json(active_client)
    with st.sidebar.expander("KPI Configuration", expanded=False):
        st.write("Enabled KPIs:", enabled_kpis)
        st.write("Primary KPI:", primary_kpi)

st.sidebar.markdown("---")

# ============================================================
# SCENARIO COMPARE — SELECTION
# ============================================================
st.sidebar.markdown("## Scenario Compare")

if active_client:
    saved_scenarios = list_scenarios(st.session_state.active_client)

    if saved_scenarios:
        selected_scenarios = st.sidebar.multiselect(
            "Select scenarios to compare",
            saved_scenarios
        )
    else:
        st.sidebar.info("No saved scenarios yet.")
        selected_scenarios = []
else:
    st.sidebar.info("Select a client to view scenarios.")
    selected_scenarios = []

# ============================================================
# PERSONA & KPI SELECTION
# ============================================================
persona = st.sidebar.selectbox("View as", ["CEO", "CFO", "CHRO"])
apply_persona_theme(persona)

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
    "Vacancy Duration (months)",
    min_value=0.5,
    max_value=4.0,
    value=float(scenario_context["vacancy_duration_months"]),
    step=0.25
)

scenario_context["ramp_up_duration_months"] = st.sidebar.slider(
    "Ramp-up Duration (months)",
    min_value=2.0,
    max_value=8.0,
    value=float(scenario_context["ramp_up_duration_months"]),
    step=0.5
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
# ACTION PORTFOLIO CONSTRAINTS
# ============================================================
portfolio_budget = DEFAULT_PORTFOLIO_BUDGET
portfolio_horizon = (
    active_client
    .get("strategy", {})
    .get("horizon_days", DEFAULT_PORTFOLIO_HORIZON_DAYS)
    if active_client
    else DEFAULT_PORTFOLIO_HORIZON_DAYS
)

# ============================================================
# OPTIMAL ACTION PORTFOLIO
# ============================================================
st.markdown("## Optimal Action Portfolio")

client_financials = (
    active_client.get("financials")
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
    c3.metric("Portfolio ROI", f"{portfolio['portfolio_roi']:.2f}×")

# ============================================================
# SAVE SCENARIO (STEP F)
# ============================================================
st.markdown("---")
st.subheader("Save Scenario")

scenario_name = st.text_input("Scenario name")

if st.button("Save Scenario"):
    if not active_client:
        st.error("Select an active client before saving.")
    elif not scenario_name:
        st.error("Scenario name is required.")
    else:
        save_scenario(
            scenario_name=scenario_name,
            client_name=st.session_state.active_client,
            persona=persona,
            inputs={
                "attrition_rate": attrition_rate,
                "scenario_context": scenario_context,
                "portfolio_budget": portfolio_budget,
                "portfolio_horizon": portfolio_horizon
            },
            derived={
                "exposure": projected_exposure,
                "kpi_status": classify_kpi(
                    attrition_rate,
                    resolve_kpi_thresholds("attrition", active_client)
                )
            },
            portfolio=portfolio
        )
        st.success("Scenario saved.")

# ============================================================
# ROUTING
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption("Catalyst converts people risk into financial decisions.")

elif page == "KPI Intelligence":
    if selected_kpi == "attrition":
        st.title("Attrition Intelligence")
        thresholds = resolve_kpi_thresholds("attrition", active_client)
        status = classify_kpi(attrition_rate, thresholds)

        narrative = generate_narrative(
            kpi="attrition",
            kpi_state={"attrition_rate": attrition_rate, "status": status},
            client_context=active_client,
            persona=persona,
            strategy_context=active_client.get("strategy") if active_client else None
        )

        with st.container(border=True):
            st.subheader(narrative["headline"])
            st.write(narrative["interpretation"])
            st.markdown(f"**Risk:** {narrative['risk_statement']}")
            st.markdown(f"**Recommended posture:** {narrative['recommended_posture']}")

    else:
        st.info("This KPI module is under development.")

elif page == "CFO Summary":
    st.title("CFO / Board Summary")
    st.info("Client-aware CFO narratives coming next.")

elif page == "Scenario Compare":
    st.title("Scenario Comparison")

    if not active_client:
        st.warning("Select an active client to compare scenarios.")
    elif not selected_scenarios:
        st.info("Select one or more scenarios from the sidebar.")
    else:
        rows = []

        for scenario_name in selected_scenarios:
            scenario = load_scenario(
                st.session_state.active_client,
                scenario_name
            )

            rows.append({
                "Scenario": scenario["metadata"]["scenario_name"],
                "Persona": scenario["metadata"]["persona"],
                "Attrition %": scenario["inputs"]["attrition_rate"],
                "KPI Status": scenario["derived"]["kpi_status"],
                "Exposure (USD M)": round(scenario["derived"]["exposure"] / 1e6, 2),
                "Budget Used (USD M)": round(scenario["portfolio"]["budget_used"] / 1e6, 2),
                "Portfolio ROI": scenario["portfolio"]["portfolio_roi"]
            })

        st.dataframe(rows, use_container_width=True)
