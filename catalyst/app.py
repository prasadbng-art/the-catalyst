import streamlit as st
# from supabase import create_client

# ------------------------------------------------------------
# 🔐 Auth Stub (disabled for local dev)
# ------------------------------------------------------------

st.session_state["authenticated"] = True
st.session_state["email"] = "demo@catalyst.ai"

# ============================================================
# 🔐 Authentication (Bolt / Supabase Gateway)
# ============================================================

# SUPABASE_URL = "https://zgdodfbhvtumiqgwedgx.supabase.co"
# SUPABASE_ANON_KEY = "YOUR_PUBLIC_KEY"


#def verify_token(token: str):
#    try:
#        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
#        res = supabase.auth.get_user(token)
#        return res.user if res else None
#   except Exception:
#        return None


# query_params = st.query_params

# if "token" in query_params:
#    user = verify_token(query_params["token"])
#    if user:
#        st.session_state["authenticated"] = True
#        st.session_state["user"] = user
#        st.session_state["email"] = query_params.get("email")

#if not st.session_state.get("authenticated"):
#    st.error("Please log in through the HR Decision Engine.")
#    st.stop()

# ============================================================
# Imports (authoritative)
# ============================================================

from catalyst.context_manager_v1 import get_effective_context
from visuals.kpi_current import render_kpi_current_performance
from demo_loader_v1 import load_demo_context_v1
from catalyst.file_ingest_v1 import load_workforce_file

from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis
from catalyst.analytics.what_if_engine_v1 import apply_what_if

from catalyst.analytics.cost_framing_v1 import compute_cost_framing
from catalyst.analytics.cost_narrative_v1 import generate_cost_narrative
from catalyst.analytics.cost_confidence_bands_v1 import compute_cost_confidence_bands
from catalyst.analytics.cost_narrative_cfo_v1 import generate_cfo_cost_narrative
from catalyst.analytics.board_summary_v1 import generate_board_summary
from catalyst.analytics.roi_lens_v1 import compute_roi_lens

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
# Session State Initialization
# ============================================================

st.session_state.setdefault("context_v1", None)
st.session_state.setdefault("demo_mode", False)
st.session_state.setdefault("demo_welcomed", False)
st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)

# ============================================================
# 🎬 Demo Entry Landing
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
# 🔒 Context Gate
# ============================================================

if not isinstance(st.session_state["context_v1"], dict):
    render_demo_entry()
    st.stop()

context = get_effective_context()

# ============================================================
# Demo Badge
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
        "Welcome to the Catalyst interactive demo. Upload data to begin.",
        icon="🎬",
    )
    st.session_state["demo_welcomed"] = True

# ============================================================
# Sidebar — Data Ingestion
# ============================================================

st.sidebar.markdown("## 📄 Upload Workforce Data")

uploaded_file = st.sidebar.file_uploader(
    "Upload CSV or Excel",
    type=["csv", "xlsx"],
)

if uploaded_file:
    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df
    st.sidebar.success(f"Loaded {len(df)} employee records")

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis
    context["kpis"] = baseline_kpis

# ============================================================
# Empty State
# ============================================================

if st.session_state["workforce_df"] is None:
    st.info("Upload workforce data to begin analysis.")
    st.stop()

# ============================================================
# Sidebar — Persona
# ============================================================

st.sidebar.markdown("## 👤 View As")

persona_options = ["CEO", "CFO", "CHRO"]
current_persona = context.get("persona", "CEO")

context["persona"] = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(current_persona),
)

# ============================================================
# Sidebar — What-If Sandbox
# ============================================================

st.sidebar.markdown("## 🧪 What-If Sandbox")

attrition_reduction = st.sidebar.slider("Reduce attrition risk (%)", 0, 30, 0)
engagement_lift = st.sidebar.slider("Increase engagement (points)", 0, 20, 0)
manager_lift = st.sidebar.slider("Improve manager effectiveness (points)", 0, 20, 0)

st.sidebar.caption(
    "These controls simulate the impact of targeted retention and capability actions."
)

if st.sidebar.button("Apply intervention scenario"):
    st.session_state["what_if_kpis"] = apply_what_if(
        context["baseline"]["kpis"],
        {
            "attrition_risk_reduction_pct": attrition_reduction,
            "engagement_lift": engagement_lift,
            "manager_effectiveness_lift": manager_lift,
            "headcount": len(st.session_state["workforce_df"]),
            "risk_realization_factor": 0.6,
        },
    )

st.sidebar.divider()

if st.sidebar.button("↩ Reset What-If"):
    st.session_state["what_if_kpis"] = None

st.sidebar.markdown("## 💼 Intervention Economics")

intervention_cost = st.sidebar.number_input(
    "Estimated annual intervention cost (₹)",
    min_value=0,
    value=2_000_000,
    step=500_000,
)

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
    st.caption(
        "Workforce risk summary derived from uploaded data. "
        "Use the What-If Sandbox to explore mitigation strategies."
    )


def render_current_kpis_page():
    st.header("Current KPI Performance")
    st.caption(
        "This view summarizes workforce risk and its economic implications "
        "based on uploaded data and selected interventions."
    )

    kpis = (
        st.session_state["what_if_kpis"]
        if st.session_state["what_if_kpis"]
        else context["baseline"]["kpis"]
    )

    kpi_list = list(kpis.keys())
    default_index = (
        kpi_list.index("attrition_risk")
        if "attrition_risk" in kpi_list
        else 0
    )

    selected_kpi = st.selectbox(
        "Focus KPI",
        kpi_list,
        index=default_index,
        help="Select the KPI you want to examine in detail",
    )

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

    # ========================================================
    # 💰 Economic Impact
    # ========================================================

    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=st.session_state["workforce_df"],
        financials=context.get("financials", {}),
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    st.markdown("## 💰 Economic Impact")

    col1, col2 = st.columns(2)
    col1.metric(
        "Baseline Attrition Cost Exposure",
        f"₹{costs['baseline_cost_exposure']/1e7:.1f} Cr",
    )
    col2.metric(
        "Preventable Cost (Estimated)",
        f"₹{costs['preventable_cost']/1e7:.1f} Cr",
    )

    if costs.get("what_if_cost_impact"):
        st.success(
            f"This intervention scenario avoids approximately "
            f"₹{costs['what_if_cost_impact']/1e7:.1f} Cr annually."
        )

    # ========================================================
    # 🧠 Interpretation & Risk
    # ========================================================

    narrative = generate_cost_narrative(costs, context["persona"])

    st.markdown("## 🧠 Interpretation & Risk")
    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])
    st.info(f"**Recommended posture:** {narrative['posture']}")

    # ========================================================
    # 📊 Confidence Bands (Collapsed)
    # ========================================================

    bands = compute_cost_confidence_bands(
        baseline_cost=costs["baseline_cost_exposure"],
        preventable_cost=costs["preventable_cost"],
    )

    with st.expander("📊 View confidence bands", expanded=False):
        c1, c2, c3 = st.columns(3)
        c1.metric("Conservative", f"₹{bands['conservative']['baseline_cost']/1e7:.1f} Cr")
        c2.metric("Base Case", f"₹{bands['base']['baseline_cost']/1e7:.1f} Cr")
        c3.metric("Aggressive", f"₹{bands['aggressive']['baseline_cost']/1e7:.1f} Cr")
        st.caption(
            "Confidence bands reflect sensitivity to attrition realization "
            "and intervention effectiveness."
        )

    # ========================================================
    # 🧮 CFO Interpretation
    # ========================================================

    if context["persona"] == "CFO":
        cfo = generate_cfo_cost_narrative(costs, bands)
        st.markdown("## 🧮 CFO Interpretation")
        st.markdown(f"**{cfo['headline']}**")
        st.markdown(cfo["body"])
        st.info(f"**Capital posture:** {cfo['posture']}")

    # ========================================================
    # 🧾 Board Summary (Expanded)
    # ========================================================

    with st.expander("🧾 Board-ready summary", expanded=True):
        board = generate_board_summary(costs, bands, context["persona"])
        st.markdown(f"**{board['headline']}**")
        for bullet in board["bullets"]:
            st.markdown(f"- {bullet}")
        st.info(board["implication"])

    # ========================================================
    # 📈 ROI Lens (Collapsed)
    # ========================================================

    roi = compute_roi_lens(
        what_if_cost_impact=costs.get("what_if_cost_impact"),
        intervention_cost=intervention_cost,
    )

    if roi:
        with st.expander("📈 ROI lens (intervention economics)", expanded=False):
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Intervention Cost", f"₹{roi['intervention_cost']/1e7:.1f} Cr")
            c2.metric("Cost Avoided", f"₹{roi['cost_avoided']/1e7:.1f} Cr")
            c3.metric("Net Benefit", f"₹{roi['net_benefit']/1e7:.1f} Cr")
            c4.metric("ROI", f"{roi['roi']:.1f}×")

# ============================================================
# Router
# ============================================================

if page == "Sentiment Health":
    render_sentiment_health_page()
else:
    render_current_kpis_page()
