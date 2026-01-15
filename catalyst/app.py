import streamlit as st

# ============================================================
# 🔐 Auth Stub (disabled for local demo)
# ============================================================

st.session_state["authenticated"] = True
st.session_state["email"] = "demo@catalyst.ai"

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

def format_usd(value: float, millions: bool = True) -> str:
    """
    Format currency values consistently in USD.
    """
    if value is None:
        return "—"

    if millions:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"


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
        - **Diagnose workforce risk**
        - **Quantify attrition exposure and cost**
        - **Test decisions safely using what-if simulations**
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
# 🔒 Context Gate (authoritative)
# ============================================================

if not isinstance(st.session_state.get("context_v1"), dict):
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

st.sidebar.markdown("## 👤 Perspective")
st.sidebar.caption("Adjusts interpretation, not underlying data.")

persona_options = ["CEO", "CFO", "CHRO"]
current_persona = context.get("persona", "CEO")

selected_persona = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(current_persona),
)

context["persona"] = selected_persona
st.session_state["context_v1"]["persona"] = selected_persona

# ============================================================
# Sidebar — What-If Sandbox
# ============================================================

st.sidebar.markdown("## 🧪 What-If Sandbox")

if st.session_state["workforce_df"] is None:
    st.sidebar.caption("Upload workforce data to enable simulations.")

else:
    attrition_reduction = st.sidebar.slider("Effectiveness of retention actions (%)", 0, 30, 0)
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

intervention_cost=2_000_000

with st.sidebar.expander("## 💼 Intervention Economics",expanded=False):

    intervention_cost = st.sidebar.number_input(
    "Estimated annual intervention cost ($)",
    min_value=0,
    value=intervention_cost,
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
# KPI Signal Layer
# ============================================================

def render_kpi_selector_and_signal(kpis):
    if not kpis:
        st.info("No KPIs available to display.")
        return None

    kpi_list = list(kpis.keys())
    default_index = kpi_list.index("attrition_risk") if "attrition_risk" in kpi_list else 0

    selected_kpi = st.selectbox(
        "Which risk signal should we examine?",
        kpi_list,
        index=default_index,
    )

    st.markdown("### The signal leadership should pay attention to")
    st.caption("This reflects the current state of workforce risk based on the uploaded snapshot")

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

    return selected_kpi


# ============================================================
# Economic Impact Layer (Attrition only)
# ============================================================

def render_attrition_economic_layer(context, workforce_df, what_if_kpis):
    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=workforce_df,
        financials=context.get("financials", {}),
        what_if_kpis=what_if_kpis,
    )

    st.markdown("## 💰 Economic Impact")

    st.metric(
        "Annual Attrition Cost Exposure",
        f"${costs['baseline_cost_exposure']/1e7:.1f}",
    )
    st.metric(
        "Cost realistically preventable",
        f"${costs['preventable_cost']/1e7:.1f}",
    )

    if costs.get("what_if_cost_impact"):
        st.success(
            f"With effective action, approximately "
            f"~${costs['what_if_cost_impact']/1e7:.1f}."
        )

    narrative = generate_cost_narrative(costs, context["persona"])

    st.markdown("## 🧠 What this means for leadership")
    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])
    st.info(f"**Suggested Leadership posture:** {narrative['posture']}")

    return costs


# ============================================================
# Confidence Bands Layer
# ============================================================

def render_confidence_bands_layer(costs):
    bands = compute_cost_confidence_bands(
        baseline_cost=costs["baseline_cost_exposure"],
        preventable_cost=costs["preventable_cost"],
    )

    st.markdown("### 📊How uncertain is this exposure?")
    st.caption(
        "These ranges show how outcomes vary under different but realistic assumptions."
        "Use them to understand downside risk and planning buffers, not as point forecasts."
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Conservative",
            f"${bands['conservative']['baseline_cost']/1e7:.1f}",
        )
        st.caption(bands["conservative"]["assumption"])

    with col2:
        st.metric(
            "Base Case",
            f"${bands['base']['baseline_cost']/1e7:.1f}",
        )
        st.caption(bands["base"]["assumption"])

    with col3:
        st.metric(
            "Aggressive",
            f"${bands['aggressive']['baseline_cost']/1e7:.1f}",
        )
        st.caption(bands["aggressive"]["assumption"])

    return bands

# ============================================================
# CFO Layer (Guarded)
# ============================================================

def render_cfo_layer(context, costs, bands):
    if context.get("persona") != "CFO":
        return

    st.divider()
    st.subheader("🧮 Financial Lens: CFO View")

    cfo_narrative = generate_cfo_cost_narrative(costs, bands)

    st.markdown(f"**{cfo_narrative['headline']}**")
    st.markdown(cfo_narrative["body"])
    st.info(f"**Capital posture implication:** {cfo_narrative['posture']}")


# ============================================================
# Board + ROI Layer
# ============================================================

def render_board_and_roi_layer(context, costs, bands, intervention_cost):
    with st.expander("🧾 What the Board needs to know", expanded=False):
        board = generate_board_summary(costs, bands, context["persona"])
        st.markdown(f"**{board['headline']}**")
        for bullet in board["bullets"]:
            st.markdown(f"- {bullet}")
        st.info(board["implication"])

    roi = compute_roi_lens(
        what_if_cost_impact=costs.get("what_if_cost_impact"),
        intervention_cost=intervention_cost,
    )

    if roi:
        with st.expander("📈 Does this intervention economically justify itself?", expanded=False):
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Intervention Cost", f"${roi['intervention_cost']/1e7:.1f}")
            c2.metric("Cost Avoided", f"${roi['cost_avoided']/1e7:.1f}")
            c3.metric("Net Benefit", f"${roi['net_benefit']/1e7:.1f}")
            c4.metric("ROI", f"{roi['roi']:.1f}×")

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
    st.header("What workforce risk are we carrying right now?")
    st.caption(
        "This briefing translates current people signals into business and financial exposure, "
        "and shows how leadership actions can change the outcome."
)
    kpis = (
        st.session_state["what_if_kpis"]
        if st.session_state.get("what_if_kpis")
        else context["baseline"]["kpis"]
    )

    selected_kpi = render_kpi_selector_and_signal(kpis)
    if not selected_kpi:
        return

    if selected_kpi != "attrition_risk":
        return

    costs = render_attrition_economic_layer(
        context=context,
        workforce_df=st.session_state["workforce_df"],
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    with st.expander("How uncertain is this exposure?", expanded=False):
        bands = render_confidence_bands_layer(costs)

    render_cfo_layer(context, costs, bands)

    render_board_and_roi_layer(
        context=context,
        costs=costs,
        bands=bands,
        intervention_cost=intervention_cost,
    )

# ============================================================
# Router (top-level, deterministic)
# ============================================================

if page == "Sentiment Health":
    render_sentiment_health_page()
else:
    render_current_kpis_page()
