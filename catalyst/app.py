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
from catalyst.analytics.cost_narrative_cfo_v1 import generate_cost_narrative
from catalyst.analytics.board_summary_v1 import generate_board_summary
from catalyst.analytics.roi_lens_v1 import compute_roi_lens

# ============================================================
# USD formatter
# ============================================================

def format_usd(value: float, millions: bool = True) -> str:
    if value is None:
        return "—"
    if millions:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"

# ============================================================
# App setup
# ============================================================

st.set_page_config(page_title="Catalyst", layout="wide")

# ============================================================
# Session State Initialization
# ============================================================

st.session_state.setdefault("context_v1", {})
st.session_state.setdefault("demo_welcomed", False)
st.session_state.setdefault("workforce_df", None)
st.session_state.setdefault("what_if_kpis", None)
st.session_state.setdefault("attrition_reduction", 0)
st.session_state.setdefault("engagement_lift", 0)
st.session_state.setdefault("manager_lift", 0)


# ============================================================
# Context Resolution (Authoritative)
# ============================================================

context = get_effective_context()

# ============================================================
# Simulation state (derived, authoritative)
# ============================================================

is_simulation = st.session_state.get("what_if_kpis") is not None

# ============================================================
# Journey State (Phase 3)
# ============================================================

st.session_state.setdefault("journey_state", "entry")

# ============================================================
# Phase 3A — Simplified Startup & Routing (Authoritative)
# ============================================================

# Canonical defaults
st.session_state.setdefault("journey_state", "baseline")
st.session_state.setdefault("what_if_kpis", None)

# ------------------------------------------------------------
# Minimal entry: only when no data exists
# ------------------------------------------------------------

def render_minimal_upload():
    st.markdown("## Catalyst")
    st.markdown("### Executive Attrition Risk Briefing")

    st.markdown(
        """
        Upload a workforce snapshot (CSV or Excel) to view:
        - Current attrition exposure
        - Estimated financial impact
        - Decision simulations (optional)
        """
    )

    uploaded_file = st.file_uploader(
        "Upload workforce data",
        type=["csv", "xlsx"],
    )

    if not uploaded_file:
        st.info("Upload a file to begin.")
        st.stop()

    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.error(e)
        st.stop()

    for w in warnings:
        st.warning(w)

    st.session_state["workforce_df"] = df

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis

    st.session_state["journey_state"] = "baseline"
    st.rerun()

# ------------------------------------------------------------
# Routing guard
# ------------------------------------------------------------

if st.session_state.get("workforce_df") is None:
    render_minimal_upload()
    st.stop()

# From here onward:
# → Baseline Attrition Briefing is ALWAYS the default

# ============================================================
# Sidebar — Upload
# ============================================================

st.sidebar.markdown("## 📄 Upload Workforce Data")

uploaded_file = st.sidebar.file_uploader("Upload CSV or Excel", ["csv", "xlsx"])

if uploaded_file:
    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df

    baseline_kpis = build_baseline_kpis(df)
    context.setdefault("baseline", {})
    context["baseline"]["kpis"] = baseline_kpis

if st.session_state["journey_state"] == "baseline" and st.session_state["workforce_df"] is None:
    st.info("Upload workforce data to begin analysis.")
    st.stop()


# ============================================================
# Sidebar — Persona
# ============================================================

st.sidebar.markdown("## 👤 Perspective")
persona_options = ["CEO", "CFO", "CHRO"]

selected_persona = st.sidebar.selectbox(
    "Persona",
    persona_options,
    index=persona_options.index(context.get("persona", "CEO")),
)

context["persona"] = selected_persona
st.session_state["context_v1"]["persona"] = selected_persona

# ============================================================
# Sidebar — What-If Sandbox
# ============================================================

if st.session_state.get("journey_state") == "simulation":
    st.sidebar.markdown("## 🧪 Simulate a leadership decision")
    st.sidebar.caption(
        "Adjust assumptions below and apply the simulation to explore potential outcomes."
    )

attrition_reduction = st.sidebar.slider("Effectiveness of retention actions (%)", 0, 30, key="attrition_reduction",)
engagement_lift = st.sidebar.slider("Engagement uplift (points)", 0, 20, key="engagement_lift",)
manager_lift = st.sidebar.slider("Manager capability uplift (points)", 0, 20, "manager_lift",)

if st.sidebar.button("Apply Simulation"):
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
    st.rerun()

st.sidebar.divider()

if st.sidebar.button("Clear simulation"):
    st.session_state["what_if_kpis"] = None
    st.session_state["attrition_reduction"] = 0
    st.session_state["engagement_lift"] = 0
    st.session_state["manager_lift"] = 0
    st.rerun()

# ============================================================
# Sidebar — Intervention Economics
# ============================================================

intervention_cost = 2_000_000
if st.session_state["journey_state"] == "simulation":
    with st.sidebar.expander("💼 Intervention economics", expanded=False):
        intervention_cost = st.sidebar.number_input(
            "Estimated annual intervention cost (USD)",
        min_value=0,
        value=intervention_cost,
        step=500_000,
    )

# ============================================================
# Pages
# ============================================================
if st.session_state["journey_state"] == "simulation":
    st.warning(
        "⚠️ **Simulation mode** — The results below reflect hypothetical leadership actions, "
        "not the current baseline."
    )
else:
    st.info(
        "You are viewing the **current (baseline) state** based on uploaded data. "
        "No simulated interventions are applied."
    )

with st.expander("Contextual note on sentiment", expanded=False):
    st.markdown(
        """
        In organisations where sentiment signals are available, elevated attrition risk is often accompanied by uneven sentiment patterns across teams or locations.

        The sentiment context shown in this demo is **synthetically generated** and is intended to illustrate how such signals can add texture to attrition discussions. It does not replace core attrition and cost metrics, nor does it imply causality or required action.
        """
    )

def render_sentiment_health_page():
    st.header("Sentiment Health")
    st.caption("High-level workforce risk summary.")

    # --------------------------------------------------
    # Phase 3B — Mandatory framing (authoritative)
    # --------------------------------------------------
    st.info(
        """
        **Sentiment Health is a contextual signal, not a KPI.**

        The demo dataset used in Catalyst does **not** include direct measures of
        employee sentiment (such as engagement surveys, pulse scores, or text feedback).

        This view exists to explain **how sentiment typically interacts with attrition risk**
        — not to present measured outcomes, predictions, or scores.
        """
    )

    st.divider()

    # --------------------------------------------------
    # What sentiment health usually reflects
    # --------------------------------------------------
    st.subheader("What sentiment health typically reflects")
    st.caption("Qualitative patterns commonly observed in organisations")

    st.markdown(
        """
        In production environments, sentiment health is usually informed by signals such as:

        - Employee engagement or pulse survey results  
        - eNPS or qualitative feedback trends  
        - Manager effectiveness feedback  
        - Collaboration or network friction  
        - Indicators of burnout or disengagement  

        These signals help explain *why* attrition pressure may emerge over time,
        but they do not, by themselves, determine outcomes.
        """
    )

    st.divider()

    # --------------------------------------------------
    # How to use this lens alongside KPIs
    # --------------------------------------------------
    st.subheader("How to use this lens alongside attrition KPIs")
    st.caption("Interpretive guidance for executives")

    st.markdown(
        """
        Use Sentiment Health as a **supporting lens** when reviewing attrition exposure:

        - Attrition KPIs answer: **“How much risk are we carrying?”**  
        - Sentiment context helps explore: **“What conditions may be contributing?”**

        Importantly:
        - Sentiment signals are **directional**, not deterministic  
        - They should **inform inquiry**, not trigger action by themselves  
        - Financial exposure should always be assessed through the KPI view  
        """
    )

    st.divider()

def render_pulse_canvas_lite():
    st.header("Pulse Canvas (Contextual View)")
    st.caption("A high-level view of workforce sentiment patterns (illustrative).")

    # --------------------------------------------------
    # Mandatory provenance disclosure (Phase 4)
    # --------------------------------------------------
    st.info(
        """
        **Data note:**  
        Sentiment values shown here are *synthetically generated for demonstration purposes*.  
        They illustrate how Catalyst would integrate sentiment signals when available in production.
        """
    )

    df = st.session_state.get("workforce_df")
    if df is None or "sentiment_score" not in df.columns:
        st.warning("Sentiment data is not available in this dataset.")
        return

    st.divider()

    # --------------------------------------------------
    # Overall sentiment (aggregate)
    # --------------------------------------------------
    overall_sentiment = df["sentiment_score"].mean()

    st.metric(
        "Overall Sentiment (Synthetic)",
        f"{overall_sentiment:+.2f}"
    )

    st.caption(
        "This aggregate value summarizes simulated sentiment across the workforce. "
        "It is not a performance score or prediction."
    )

    st.divider()

    # --------------------------------------------------
    # Sentiment band distribution
    # --------------------------------------------------
    st.subheader("Sentiment distribution")
    band_dist = (
        df["sentiment_band"]
        .value_counts(normalize=True)
        .rename_axis("Sentiment band")
        .reset_index(name="Share")
    )

    for _, row in band_dist.iterrows():
        st.write(f"- **{row['Sentiment band']}**: {row['Share']*100:.1f}%")

    st.caption(
        "Neutral responses are common in most sentiment instruments and do not indicate disengagement."
    )

    st.divider()

    # --------------------------------------------------
    # Sentiment by location (aggregate only)
    # --------------------------------------------------
    st.subheader("Sentiment by location (aggregate)")

    sentiment_by_location = (
        df.groupby("location", as_index=False)["sentiment_score"]
        .mean()
        .sort_values("sentiment_score", ascending=False)
    )

    for _, row in sentiment_by_location.iterrows():
        st.write(
            f"- **{row['location']}**: {row['sentiment_score']:+.2f}"
        )

    st.caption(
        "Variation across locations illustrates how sentiment may differ within an organisation. "
        "Differences are descriptive, not diagnostic."
    )

    # --------------------------------------------------
    # Explicit non-claims (trust reinforcement)
    # --------------------------------------------------
    st.subheader("What this view does not claim")
    st.caption("To avoid misinterpretation")

    st.markdown(
        """
        This view does **not**:

        - Assign a sentiment score  
        - Predict attrition outcomes  
        - Quantify financial impact  
        - Recommend interventions  
        - Replace KPI-based decision-making  

        It exists purely to provide **interpretive context**.
        """
    )

def render_current_kpis_page():
    st.header("What workforce risk are we carrying right now?")
    st.caption("All financial figures shown in USD.")

    # --------------------------------------------------
    # Resolve KPI source (baseline vs simulation)
    # --------------------------------------------------
    
    if is_simulation:
        kpis = st.session_state["what_if_kpis"]
        st.caption("Showing simulated outcomes based on the selected leadership actions.")
    else:
        kpis = context["baseline"]["kpis"]

    selected_kpi = list(kpis.keys())[0]

    render_kpi_current_performance(
        kpi=selected_kpi,
        current_value=kpis[selected_kpi].get("value", 0.0),
        active_client=None,
    )

    if selected_kpi != "attrition_risk":
        st.info(
            "This demo currently focuses on **Attrition Risk** and its economic impact."
        )
        return

def render_location_diagnostics():
    st.header("Attrition Risk — Location View")
    st.caption("Descriptive variation across locations. No causality implied.")

    df = st.session_state.get("workforce_df")
    if df is None:
        st.warning("No workforce data available.")
        return

    required_cols = {
        "location",
        "attrition_flag",
        "attrition_risk_score",
        "sentiment_score",
        "employee_id",
    }

    missing = required_cols - set(df.columns)
    if missing:
        st.warning(
            f"Required fields not available for diagnostics: {', '.join(missing)}"
        )
        return

    # --------------------------------------------------
    # Aggregate by location (read-only diagnostics)
    # --------------------------------------------------

    location_summary = (
        df.groupby("location")
        .agg(
            recent_attrition=("attrition_flag", "mean"),
            avg_attrition_risk=("attrition_risk_score", "mean"),
            sentiment_context=("sentiment_score", "mean"),
            headcount=("employee_id", "count"),
        )
        .reset_index()
    )

    # Convert to percentages where appropriate
    location_summary["recent_attrition"] = (
        location_summary["recent_attrition"] * 100
    ).round(1)

    location_summary["avg_attrition_risk"] = (
        location_summary["avg_attrition_risk"] * 100
    ).round(1)

    location_summary["sentiment_context"] = (
        location_summary["sentiment_context"]
    ).round(2)

    # Sort by headcount to avoid league-table bias
    location_summary = location_summary.sort_values(
        "headcount", ascending=False
    )

    # --------------------------------------------------
    # Display table
    # --------------------------------------------------

    st.subheader("Location-level overview")

    display_df = location_summary.rename(
        columns={
            "location": "Location",
            "recent_attrition": "Recent Attrition (Observed) %",
            "avg_attrition_risk": "Avg Attrition Risk (Forward-looking) %",
            "sentiment_context": "Sentiment (Context)",
            "headcount": "Headcount",
        }
    )

    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True,
    )

    # --------------------------------------------------
    # Interpretive guardrails
    # --------------------------------------------------

    st.caption(
        """
        Recent attrition reflects observed outcomes over the data period, while attrition risk represents a
        forward-looking estimate under current conditions. These measures describe different time horizons
        and should be interpreted together as context, not as validation or contradiction of one another.
        """
    )

    st.info(
        """
        **Interpretation note**  
        This view highlights *where* attrition risk varies, not *why*.  
        Differences across locations reflect a combination of market conditions, organisational structure,
        and workforce composition, and should not be used to infer root causes or required actions.
        """
    )

    # --------------------------------------------------
    # Cost framing (authoritative engine)
    # --------------------------------------------------
    costs = compute_cost_framing(
        baseline_kpis=context["baseline"]["kpis"],
        workforce_df=st.session_state["workforce_df"],
        financials=context.get("financials", {}),
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    st.metric(
        "Annual attrition cost exposure (direct + hidden costs)",
        format_usd(costs["baseline_cost_exposure"]),
    )
    st.metric(
        "Cost realistically preventable",
        format_usd(costs["preventable_cost"]),
    )

    with st.expander("What’s included in this cost estimate?"):
        st.markdown(
            """
            This estimate reflects the **full business cost of attrition**, not just
            hiring or replacement expenses.

            It includes:
            - Hiring and onboarding costs  
            - Productivity loss during vacancy periods  
            - Ramp-up inefficiency for new hires  
            - Manager time diverted to backfilling and coaching  
            - Team disruption and engagement drag  

            These factors are modeled conservatively to reflect realistic
            operating impact, not worst-case assumptions.
            """
        )

    # --------------------------------------------------
    # Narrative calibration (Phase 3A)
    # --------------------------------------------------
    narrative = generate_cost_narrative(costs, context["persona"])

    if is_simulation:
        narrative["headline"] = "Scenario view — hypothetical outcomes"
        narrative["body"] = (
            "The following reflects a **simulated scenario** based on the assumptions applied. "
            "These outcomes are **not predictions**, but illustrations of directional impact.\n\n"
            + narrative["body"]
        )
    else:
        narrative["headline"] = "Current exposure — baseline view"

    st.markdown(f"**{narrative['headline']}**")
    st.markdown(narrative["body"])

    # --------------------------------------------------
    # Confidence bands
    # --------------------------------------------------
    bands = compute_cost_confidence_bands(
        costs["baseline_cost_exposure"],
        costs["preventable_cost"],
    )

    with st.expander("How uncertain is this exposure?"):
        st.metric("Conservative", format_usd(bands["conservative"]["baseline_cost"]))
        st.metric("Base case", format_usd(bands["base"]["baseline_cost"]))
        st.metric("Aggressive", format_usd(bands["aggressive"]["baseline_cost"]))

    # --------------------------------------------------
    # CFO lens (persona-aware)
    # --------------------------------------------------
    if context["persona"] == "CFO":
        cfo = generate_cost_narrative(costs, bands)
        st.subheader("Financial lens (CFO view)")
        st.markdown(cfo["body"])

    # --------------------------------------------------
    # ROI lens (only meaningful during simulation)
    # --------------------------------------------------
    if is_simulation:
        roi = compute_roi_lens(costs.get("what_if_cost_impact"), intervention_cost)
        if roi:
            with st.expander("Does this intervention economically justify itself?"):
                st.metric("Intervention cost", format_usd(roi["intervention_cost"]))
                st.metric("Annual cost avoided", format_usd(roi["cost_avoided"]))
                st.metric("Net benefit", format_usd(roi["net_benefit"]))
                st.metric("Return multiple", f"{roi['roi']:.1f}×")

# ============================================================
# Router
# ============================================================

page = st.sidebar.selectbox(
    "Navigate",
    ["Current KPIs", "Pulse Canvas", "Diagnostics", "Sentiment Health"],
    index=0
)

if page == "Pulse Canvas":
    render_pulse_canvas_lite()
elif page == "Diagnostics":
    render_location_diagnostics()
elif page == "Sentiment Health":
    render_sentiment_health_page()
else:
    render_current_kpis_page()
