import streamlit as st

# ============================================================
# Imports (authoritative)
# ============================================================

from catalyst.context_manager_v1 import get_effective_context
from visuals.kpi_current import render_kpi_current_performance
from demo_loader_v1 import load_demo_context_v1
from catalyst.file_ingest_v1 import load_workforce_file
from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

st.markdown(
    """
    <style>
    .landing-card {
        max-width: 720px;
        margin: 60px auto;
        padding: 40px;
        border-radius: 12px;
        background-color: #ffffff;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ============================================================
# Session State Initialization (AUTHORITATIVE)
# ============================================================

if "context_v1" not in st.session_state:
    st.session_state["context_v1"] = None

if "demo_mode" not in st.session_state:
    st.session_state["demo_mode"] = False

if "demo_welcomed" not in st.session_state:
    st.session_state["demo_welcomed"] = False

if "workforce_df" not in st.session_state:
    st.session_state["workforce_df"] = None

if "what_if_kpis" not in st.session_state:
    st.session_state["what_if_kpis"] = None

# ============================================================
# 🎬 DEMO ENTRY LANDING
# ============================================================

def render_demo_entry():
    st.markdown('<div class="landing-card">', unsafe_allow_html=True)

    st.markdown("## Catalyst")
    st.markdown("### Interactive Talent Intelligence Demo")

    st.markdown(
        """
        Catalyst helps leadership teams:
        - **Diagnose workforce risk** using real employee data  
        - **Quantify attrition exposure and cost** before it materializes  
        - **Test decisions safely** using what-if simulations  
        """
    )

    st.divider()

    st.caption(
        "This is a demo environment. Uploaded data is processed in-session only "
        "and is not stored."
    )

    st.divider()

    if st.button("▶ Run Interactive Demo", use_container_width=True):
        load_demo_context_v1()
        st.session_state["demo_mode"] = True
        st.rerun()

    st.caption(
        "You will be prompted to upload a simple workforce snapshot (CSV or Excel)."
    )

    st.markdown("</div>", unsafe_allow_html=True)

# ============================================================
# 🔒 CONTEXT ENTRY GATE
# ============================================================

if not isinstance(st.session_state["context_v1"], dict):
    render_demo_entry()
    st.stop()

context = get_effective_context()

# ============================================================
# Demo Badge + Welcome
# ============================================================

st.markdown(
    """
    <div style="
        position: fixed;
        top: 8px;
        right: 16px;
        background-color: #f0f2f6;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        color: #555;
        z-index: 1000;">
        🧪 Demo Mode
    </div>
    """,
    unsafe_allow_html=True,
)

if not st.session_state["demo_welcomed"]:
    st.toast(
        "Welcome to the Catalyst interactive demo. "
        "Upload data to begin workforce analysis.",
        icon="🎬",
    )
    st.session_state["demo_welcomed"] = True

# ============================================================
# SIDEBAR — PHASE I DEMO
# ============================================================

# ----------------------------
# 📄 Upload Workforce Data
# ----------------------------
st.sidebar.markdown("## 📄 Upload Workforce Data")

uploaded_file = st.sidebar.file_uploader(
    "Upload CSV or Excel",
    type=["csv", "xlsx"],
)

if uploaded_file:
    df, errors, warnings = load_workforce_file(uploaded_file)

# ----------------------------
# Derive baseline KPIs from workforce data
# ----------------------------
attrition_risk = round(df["attrition_risk_score"].mean(), 2)

baseline_kpis = {
    "attrition_risk": {
        "value": attrition_risk,
        "unit": "percent",
        "status": "red" if attrition_risk > 15 else "amber",
    },
    "engagement_index": {
        "value": round(df["engagement_score"].mean(), 1),
        "unit": "index",
    },
    "manager_effectiveness": {
        "value": round(df["manager_effectiveness_score"].mean(), 1),
        "unit": "index",
    },
}

# Inject into context
st.session_state["context_v1"]["baseline"]["kpis"] = baseline_kpis


if errors:
    for e in errors:
        st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df
    st.sidebar.success(f"Loaded {len(df)} employee records")

# ---------------------------------
# Build baseline KPIs from workforce
# ---------------------------------
baseline_kpis = build_baseline_kpis(df)

# Ensure context structure exists
context.setdefault("baseline", {})
context["baseline"]["kpis"] = baseline_kpis

# Also expose as current KPIs
context["kpis"] = baseline_kpis

# ============================================================
# EMPTY STATE (NO DATA)
# ============================================================

def render_empty_state():
    st.markdown("### No workforce data loaded yet")

    st.markdown(
        """
        Upload a simple workforce snapshot to begin your analysis.

        Once uploaded, Catalyst will:
        - Calculate **attrition risk and exposure**
        - Surface **key workforce KPIs**
        - Enable **what-if simulations** to test decisions safely
        """
    )

    st.info(
        "Upload a CSV or Excel file using the **Upload Workforce Data** section "
        "in the sidebar to get started."
    )

    st.caption(
        "This is a demo environment. Uploaded data is processed in-session only "
        "and is not stored."
    )

if st.session_state["workforce_df"] is None:
    render_empty_state()
    st.stop()

# ============================================================
# 👤 View As (Persona)
# ============================================================

st.sidebar.markdown("## 👤 View As")

persona_options = ["CEO", "CFO", "CHRO"]
current_persona = context.get("persona", "CEO")

if current_persona not in persona_options:
    current_persona = "CEO"

context["persona"] = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(current_persona),
)

# ============================================================
# 🧪 What-If Sandbox
# ============================================================

st.sidebar.markdown("## 🧪 What-If Sandbox")

attrition_reduction = st.sidebar.slider(
    "Reduce attrition risk (%)",
    0, 30, 0,
    help="Retention programs, compensation actions, policy changes"
)

engagement_lift = st.sidebar.slider(
    "Increase engagement (points)",
    0, 20, 0,
    help="Culture, workload balance, manager quality"
)

manager_lift = st.sidebar.slider(
    "Improve manager effectiveness (points)",
    0, 20, 0,
    help="Coaching, capability building"
)

run_what_if = st.sidebar.button("Apply What-If")

if run_what_if:
    from catalyst.analytics.what_if_engine_v1 import apply_what_if

    baseline_kpis = context["baseline"]["kpis"]

    levers = {
        "attrition_risk_reduction_pct": attrition_reduction,
        "engagement_lift": engagement_lift,
        "manager_effectiveness_lift": manager_lift,
        "headcount": len(st.session_state["workforce_df"]),
        "risk_realization_factor": 0.6,
    }

    st.session_state["what_if_kpis"] = apply_what_if(
        baseline_kpis,
        levers
    )

# Reset What-If
st.sidebar.divider()
if st.sidebar.button("↩ Reset What-If"):
    st.session_state["what_if_kpis"] = None

# ============================================================
# Navigation
# ============================================================

page = st.sidebar.selectbox(
    "Navigate",
    ["Sentiment Health", "Current KPIs"],
)

# ============================================================
# Pages
# ============================================================

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("Narrative decision support")

    st.info(
        "This view summarizes workforce risk derived from uploaded data. "
        "Use the What-If Sandbox to explore how changes in attrition risk, "
        "engagement, and manager effectiveness alter outcomes."
    )

def render_current_kpis_page():
    st.header("Current KPI Performance")

    if st.session_state["what_if_kpis"]:
        kpis = st.session_state["what_if_kpis"]
        st.caption("Showing simulated (What-If) KPIs")
    else:
        kpis = context["baseline"]["kpis"]
        st.caption("Showing baseline KPIs")

    if not kpis:
        st.info("No KPIs available.")
        return

    selected_kpi = st.selectbox("Select KPI", list(kpis.keys()))
    kpi_state = kpis[selected_kpi]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpi_state.get("value", 0.0),
        active_client=None,
    )

# ============================================================
# Router
# ============================================================

if page == "Sentiment Health":
    render_sentiment_health_page()

elif page == "Current KPIs":
    render_current_kpis_page()
