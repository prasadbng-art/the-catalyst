import streamlit as st
from catalyst.analytics.what_if_engine_v1 import apply_what_if
from catalyst.analytics.roi_lens_v1 import compute_roi_lens
from catalyst.file_ingest_v1 import load_workforce_file

# ============================================================
# 🔐 Auth Stub (demo only)
# ============================================================
st.session_state.setdefault("authenticated", True)
st.session_state.setdefault("email", "demo@catalyst.ai")

# ============================================================
# 🧭 App Setup
# ============================================================
st.set_page_config(page_title="Catalyst", layout="wide")
# ============================================================
# 💲 USD Formatter (Canonical)
# ============================================================
def format_usd(value: float, millions: bool = True) -> str:
    if value is None:
        return "—"
    if millions:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"

# ============================================================
# 🧠 Session State — Canonical
# ============================================================
st.session_state.setdefault("active_page", "briefing")
st.session_state.setdefault("persona", "CEO")

# Simulation-related (owned by Simulation page only)
st.session_state.setdefault("what_if_kpis", None)
st.session_state.setdefault("attrition_reduction", 0)
st.session_state.setdefault("engagement_lift", 0)
st.session_state.setdefault("manager_lift", 0)

# Data (global, upload-only mutation)
st.session_state.setdefault("workforce_df", None)

# ============================================================
# 🧭 Page Registry
# ============================================================
PAGES = {
    "briefing": "Current KPIs",
    "simulation": "Simulation",
    "context": "Context",
}

# ============================================================
# 📌 Global Navigation Sidebar
# ============================================================
def render_navigation_sidebar():
    st.sidebar.markdown("## Catalyst")

    page = st.sidebar.radio(
        "Navigation",
        options=list(PAGES.keys()),
        format_func=lambda k: PAGES[k],
        index=list(PAGES.keys()).index(st.session_state["active_page"]),
    )

    st.session_state["active_page"] = page

    st.sidebar.divider()
    st.sidebar.markdown("## Data")

# ============================================================
# 🟧 Load Dataset Sidebar
# ============================================================    

uploaded_file = st.sidebar.file_uploader(
    "Upload workforce file",
    type=["csv", "xlsx"],
)

if uploaded_file is not None:
    df, errors, warnings = load_workforce_file(uploaded_file)

    if errors:
        for e in errors:
            st.sidebar.error(e)
        st.stop()

    for w in warnings:
        st.sidebar.warning(w)

    st.session_state["workforce_df"] = df

    # Invalidate derived state safely
    st.session_state.pop("baseline_kpis", None)
    st.session_state.pop("what_if_kpis", None)

# ============================================================
# 🟧 Simulation Sidebar
# ============================================================

def render_simulation_sidebar():
    st.sidebar.divider()
    st.sidebar.markdown("## Perspective")

    persona = st.sidebar.selectbox(
        "Persona",
        ["CEO", "CFO", "CHRO"],
        index=["CEO", "CFO", "CHRO"].index(st.session_state["persona"]),
    )
    st.session_state["persona"] = persona

    st.sidebar.divider()
    st.sidebar.markdown("## Simulate")

    st.sidebar.slider(
        "Effectiveness of retention actions (%)",
        0, 30,
        key="attrition_reduction",
    )
    st.sidebar.slider(
        "Engagement uplift (points)",
        0, 20,
        key="engagement_lift",
    )
    st.sidebar.slider(
        "Manager capability uplift (points)",
        0, 20,
        key="manager_lift",
    )

    if st.sidebar.button("Apply Simulation"):
        st.session_state["what_if_kpis"] = apply_what_if(
        st.session_state["baseline_kpis"],
        {
            "attrition_risk_reduction_pct": st.session_state["attrition_reduction"],
            "engagement_lift": st.session_state["engagement_lift"],
            "manager_effectiveness_lift": st.session_state["manager_lift"],
            "headcount": len(st.session_state["workforce_df"]),
            "risk_realization_factor": 0.6,
        },
    )
    st.rerun()


    if st.sidebar.button("Clear Simulation"):
        clear_simulation()
        st.rerun()

def clear_simulation():
    st.session_state["what_if_kpis"] = None
    st.session_state["attrition_reduction"] = 0
    st.session_state["engagement_lift"] = 0
    st.session_state["manager_lift"] = 0

# ============================================================
# 🟪 Context Sidebar (Persona only)
# ============================================================
def render_context_sidebar():
    st.sidebar.divider()
    st.sidebar.markdown("## Perspective")

    persona = st.sidebar.selectbox(
        "Persona",
        ["CEO", "CFO", "CHRO"],
        index=["CEO", "CFO", "CHRO"].index(st.session_state["persona"]),
    )
    st.session_state["persona"] = persona

# ============================================================
# 📊 Briefing — Baseline Only
# ============================================================
from catalyst.file_ingest_v1 import load_workforce_file
from catalyst.analytics.baseline_kpi_builder_v1 import build_baseline_kpis
from catalyst.analytics.cost_framing_v1 import compute_cost_framing
from visuals.kpi_current import render_kpi_current_performance

def render_briefing_page():
    st.header("Current Workforce KPIs")
    st.caption("Insight type: Descriptive (Observe)")
    st.caption("Baseline view only. No simulation. No persona.")

    # -------------------------------
    # Data guard
    # -------------------------------
    df = st.session_state.get("workforce_df")
    if df is None:
        st.info("Upload a workforce file to view baseline KPIs.")
        return

    # -------------------------------
    # Baseline KPI build (one-time)
    # -------------------------------
    if "baseline_kpis" not in st.session_state:
        st.session_state["baseline_kpis"] = build_baseline_kpis(df)

    baseline_kpis = st.session_state["baseline_kpis"]

    # -------------------------------
    # KPI Display (single KPI focus)
    # -------------------------------
    st.subheader("Attrition Risk — Current Exposure")
    render_kpi_current_performance(
        kpi="attrition_risk",
        current_value=baseline_kpis["attrition_risk"]["value"],
        active_client=None,
    )

    st.divider()

    # -------------------------------
    # Cost Exposure (baseline only)
    # -------------------------------
    st.subheader("Financial Exposure (Baseline)")
    costs = compute_cost_framing(
        baseline_kpis=baseline_kpis,
        workforce_df=df,
        financials={},
        what_if_kpis=None,  # explicitly forbidden
    )

    st.metric(
        "Annual attrition cost exposure",
        format_usd(costs["baseline_cost_exposure"]),
    )
    
    st.divider()

    # -------------------------------
    # Diagnostics (Where, not Why)
    # -------------------------------
    render_location_diagnostics_baseline(df)


def render_location_diagnostics_baseline(df):
    st.subheader("Diagnostics — Location View")
    st.caption("Distributional context only. No causality implied.")

    required_cols = {
        "location",
        "attrition_flag",
        "attrition_risk_score",
        "employee_id",
    }
    missing = required_cols - set(df.columns)
    if missing:
        st.warning(
            f"Required fields not available for diagnostics: {', '.join(missing)}"
        )
        return

    summary = (
        df.groupby("location")
        .agg(
            recent_attrition=("attrition_flag", "mean"),
            avg_attrition_risk=("attrition_risk_score", "mean"),
            headcount=("employee_id", "count"),
        )
        .reset_index()
    )

    summary["recent_attrition"] = (summary["recent_attrition"] * 100).round(1)
    summary["avg_attrition_risk"] = (summary["avg_attrition_risk"] * 100).round(1)

    summary = summary.sort_values("headcount", ascending=False)

    display_df = summary.rename(
        columns={
            "location": "Location",
            "recent_attrition": "Recent Attrition (Observed) %",
            "avg_attrition_risk": "Avg Attrition Risk (Forward-looking) %",
            "headcount": "Headcount",
        }
    )

    st.dataframe(display_df, use_container_width=True, hide_index=True)

    st.caption(
        "Observed attrition reflects past outcomes; attrition risk reflects forward-looking exposure. "
        "These describe different time horizons and should be read together."
    )


def render_diagnostics_page():
    st.header("Diagnostics")
    st.caption("Insight type: Descriptive (Where, not why)")
    st.info("Distributional views only. No interpretation.")

def render_simulation_page():
    df = st.session_state.get("workforce_df")

    if df is None:
        st.info("Upload workforce data before running simulations.")
    return

# Ensure baseline exists
    if "baseline_kpis" not in st.session_state:
        st.session_state["baseline_kpis"] = build_baseline_kpis(df)

    baseline_kpis = st.session_state["baseline_kpis"]

    st.header("Simulation")
    st.caption("Insight type: Counterfactual (Explore)")
    st.caption("Hypothetical scenarios only. Baseline remains intact.")

    df = st.session_state.get("workforce_df")
    baseline_kpis = st.session_state.get("baseline_kpis")

    if df is None or baseline_kpis is None:
        st.info("Upload workforce data and review baseline KPIs before running simulations.")
    return

    # --------------------------------------------------
    # Apply Simulation (triggered from sidebar button)
    # --------------------------------------------------
    if st.session_state.get("apply_simulation_trigger"):
        st.session_state["what_if_kpis"] = apply_what_if(
            baseline_kpis,
            {
                "attrition_risk_reduction_pct": st.session_state["attrition_reduction"],
                "engagement_lift": st.session_state["engagement_lift"],
                "manager_effectiveness_lift": st.session_state["manager_lift"],
                "headcount": len(df),
                "risk_realization_factor": 0.6,
            },
        )
        st.session_state["apply_simulation_trigger"] = False

    is_simulation = st.session_state.get("what_if_kpis") is not None
    
    st.metric(
        "Estimated cost realistically addressable (scenario)",
        format_usd(costs["preventable_cost"]),  
    )

    # --------------------------------------------------
    # KPI Contrast
    # --------------------------------------------------
    st.subheader("Attrition Risk — Baseline vs Scenario")

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Baseline")
        render_kpi_current_performance(
            kpi="attrition_risk",
            current_value=baseline_kpis["attrition_risk"]["value"],
            active_client=None,
        )

    with col2:
        st.caption("Scenario (Simulated)")
        if is_simulation:
            render_kpi_current_performance(
                kpi="attrition_risk",
                current_value=st.session_state["what_if_kpis"]["attrition_risk"]["value"],
                active_client=None,
            )
        else:
            st.info("Apply a simulation to view scenario outcomes.")

    st.divider()

    # --------------------------------------------------
    # Cost Impact (Scenario-aware)
    # --------------------------------------------------
    costs = compute_cost_framing(
        baseline_kpis=baseline_kpis,
        workforce_df=df,
        financials={},
        what_if_kpis=st.session_state.get("what_if_kpis"),
    )

    st.subheader("Financial Impact (Scenario View)")

    st.metric(
        "Baseline annual attrition cost exposure",
        format_usd(costs["baseline_cost_exposure"]),
    )

    if is_simulation:
        st.metric(
            "Annual cost avoided (scenario)",
            format_usd(costs["preventable_cost"]),
        )
    else:
        st.caption("Scenario cost impact will appear after simulation is applied.")

    st.divider()

    # --------------------------------------------------
    # ROI Lens (only if simulation exists)
    # --------------------------------------------------
    if is_simulation and costs.get("what_if_cost_impact") is not None:

        roi = compute_roi_lens(
            costs.get("what_if_cost_impact"),
            intervention_cost,
        )

        if roi:
            st.subheader("Economic Lens (ROI)")
            col1, col2, col3, col4 = st.columns(4)

            col1.metric("Intervention cost", format_usd(roi["intervention_cost"]))
            col2.metric("Annual cost avoided", format_usd(roi["cost_avoided"]))
            col3.metric("Net benefit", format_usd(roi["net_benefit"]))
            col4.metric("Return multiple", f"{roi['roi']:.1f}×")


def render_context_page():
    st.header("Context — Pulse & Sentiment")
    st.caption("Insight type: Contextual (Interpretive)")
    st.caption("These signals provide texture, not decisions.")

    # --------------------------------------------------
    # Mandatory provenance disclosure
    # --------------------------------------------------
    st.info(
        "**Data note:** Sentiment values shown here are *synthetically generated for demonstration purposes*. "
        "They illustrate how Catalyst would integrate sentiment signals when available in production."
    )

    df = st.session_state.get("workforce_df")
    if df is None:
        st.info("Upload workforce data to view contextual signals.")
        return

    # --------------------------------------------------
    # Guardrails: required columns
    # --------------------------------------------------
    required_cols = {"sentiment_score", "sentiment_band", "location"}
    missing = required_cols - set(df.columns)
    if missing:
        st.warning(
            f"Sentiment context is not available in this dataset. Missing fields: {', '.join(missing)}"
        )
        return

    # --------------------------------------------------
    # Aggregate sentiment (descriptive only)
    # --------------------------------------------------
    st.subheader("Overall Sentiment (Aggregate)")
    overall = df["sentiment_score"].mean()
    st.metric("Aggregate sentiment (synthetic)", f"{overall:+.2f}")
    st.caption(
        "This aggregate summarizes simulated sentiment across the workforce. "
        "It is not a performance score, prediction, or KPI."
    )

    st.divider()

    # --------------------------------------------------
    # Distribution (bands)
    # --------------------------------------------------
    st.subheader("Sentiment Distribution")
    band_dist = (
        df["sentiment_band"]
        .value_counts(normalize=True)
        .rename_axis("Sentiment band")
        .reset_index(name="Share")
    )

    for _, row in band_dist.iterrows():
        st.write(f"- **{row['Sentiment band']}**: {row['Share'] * 100:.1f}%")

    st.caption(
        "Neutral responses are common in most sentiment instruments and do not imply disengagement."
    )

    st.divider()

    # --------------------------------------------------
    # By location (aggregate only)
    # --------------------------------------------------
    st.subheader("Sentiment by Location (Aggregate)")
    by_loc = (
        df.groupby("location", as_index=False)["sentiment_score"]
        .mean()
        .sort_values("sentiment_score", ascending=False)
    )

    for _, row in by_loc.iterrows():
        st.write(f"- **{row['location']}**: {row['sentiment_score']:+.2f}")

    st.caption(
        "Variation across locations is descriptive. Differences should not be treated as diagnostic."
    )

    st.divider()

    # --------------------------------------------------
    # Persona-aware framing (non-causal)
    # --------------------------------------------------
    persona = st.session_state.get("persona", "CEO")
    st.subheader(f"Interpretive Lens — {persona}")

    if persona == "CFO":
        st.markdown(
            "- This view provides **contextual orientation**, not financial validation.\n"
            "- Signals here should not be translated directly into cost or ROI assumptions.\n"
            "- Use alongside baseline exposure, not in place of it."
        )
    elif persona == "CHRO":
        st.markdown(
            "- Use sentiment context to **frame inquiry**, not action.\n"
            "- Signals are directional and require corroboration.\n"
            "- Avoid translating patterns directly into interventions."
        )
    else:  # CEO default
        st.markdown(
            "- Use sentiment context to **sense conditions**, not outcomes.\n"
            "- It complements risk exposure without implying causality.\n"
            "- Decisions should integrate multiple lenses."
        )

    st.divider()

    # --------------------------------------------------
    # Explicit non-claims (trust reinforcement)
    # --------------------------------------------------
    st.subheader("What This View Does Not Claim")
    st.markdown(
        "- It does **not** predict attrition\n"
        "- It does **not** assign performance scores\n"
        "- It does **not** quantify financial impact\n"
        "- It does **not** recommend interventions\n\n"
        "This view exists purely to provide interpretive context."
    )


# ============================================================
# 🧭 Main Router
# ============================================================
def render_main():
    page = st.session_state["active_page"]

    if page == "briefing":
        render_briefing_page()

    elif page == "diagnostics":
        render_diagnostics_page()

    elif page == "simulation":
        render_simulation_page()
        render_simulation_sidebar()

    elif page == "context":
        render_context_page()
        render_context_sidebar()

# ============================================================
# 🚀 App Entry
# ============================================================
render_navigation_sidebar()
render_main()
