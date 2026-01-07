import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import yaml
from pathlib import Path

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="The Catalyst",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# CONFIG VALIDATOR (FAIL-FAST)
# ============================================================
def validate_config(config):
    errors = []

    enabled_personas = set(config.get("personas", {}).get("enabled", []))
    kpis = config.get("kpis", {})

    for kpi_name, kpi in kpis.items():
        if not kpi.get("enabled", False):
            continue

        for required in ["thresholds", "labels", "action_plans"]:
            if required not in kpi:
                errors.append(
                    f"KPI '{kpi_name}' missing required block '{required}'"
                )

        thresholds = set(kpi.get("thresholds", {}).keys())
        labels = set(kpi.get("labels", {}).keys())

        for state in thresholds:
            if state not in labels:
                errors.append(
                    f"KPI '{kpi_name}' state '{state}' missing label"
                )

        for state, persona_block in kpi.get("action_plans", {}).items():
            for persona in persona_block.keys():
                if persona not in enabled_personas:
                    errors.append(
                        f"KPI '{kpi_name}' state '{state}' uses undefined persona '{persona}'"
                    )

    if errors:
        raise ValueError(
            "CONFIG VALIDATION FAILED:\n" + "\n".join(errors)
        )

# ============================================================
# DEMO TREND DATA (STATIC VISUAL ONLY)
# ============================================================
@st.cache_data(show_spinner=False)
def get_sentiment_trend():
    dates = pd.date_range(end=pd.Timestamp.today(), periods=12, freq="M")
    sentiment_trend = np.array(
        [-3, -4, -5, -6, -7, -8, -8, -7, -6, -5, -4, -3]
    )
    return pd.DataFrame({
        "Date": dates,
        "Sentiment Score": sentiment_trend
    })

df_sentiment = get_sentiment_trend()

# ============================================================
# CLIENT CONFIG LOADING
# ============================================================
CLIENT_ID = "demo"
CONFIG_PATH = Path(f"clients/{CLIENT_ID}/config.yaml")

@st.cache_data(show_spinner=False)
def load_and_validate_config(path):
    with open(path, "r") as f:
        config = yaml.safe_load(f)
    validate_config(config)
    return config

CLIENT_CONFIG = load_and_validate_config(CONFIG_PATH)

# ============================================================
# ATTRITION INTELLIGENCE PAGE (LAYOUT + NARRATIVE)
# ============================================================
def render_attrition_intelligence_page(attrition_rate):

    st.title("Attrition Intelligence")
    st.caption(
        "An integrated view of exit risk, hidden cost exposure, and value leakage — "
        "designed for decision-making, not reporting."
    )

    # --------------------------------------------------------
    # SECTION 1 — ATTRITION RISK POSTURE
    # --------------------------------------------------------
    st.markdown("## Attrition Risk Posture")

    with st.container(border=True):
        col1, col2, col3, col4 = st.columns(4)

        col1.metric("Annual Attrition Rate", f"{attrition_rate}%")
        col2.metric("Expected Exits (180 days)", "18–22")
        col3.metric("Visible Attrition Cost", "US$8.4M")
        col4.metric("Hidden Attrition Cost", "US$13.9M ⚠️")

    st.info(
        "Current attrition exposure is driven more by **hidden operational and knowledge loss** "
        "than by visible replacement costs. Managing exits alone will not fully contain value leakage."
    )

    # --------------------------------------------------------
    # SECTION 2 — RISK CONCENTRATION
    # --------------------------------------------------------
    st.markdown("## Risk Concentration")

    with st.expander("Engineering | Mid-tenure | High Performers"):
        st.markdown(
            """
            **Why this segment matters**
            - Represents ~34% of projected exits in the next 6 months
            - Accounts for ~52% of total hidden cost exposure
            - High role interdependence and limited successor readiness

            Attrition in this segment disproportionately affects delivery timelines,
            institutional knowledge, and downstream team productivity.
            """
        )

    # --------------------------------------------------------
    # SECTION 3 — DRIVER INTELLIGENCE
    # --------------------------------------------------------
    st.markdown("## Driver Intelligence")

    tab_exit, tab_damage = st.tabs(
        ["Exit Drivers — Why people leave", "Damage Drivers — Why exits hurt"]
    )

    with tab_exit:
        st.markdown(
            """
            **Manager Effectiveness**  
            Gaps in day-to-day managerial capability reduce role clarity, feedback quality,
            and psychological safety. This accelerates disengagement and increases the
            likelihood of voluntary exits, particularly among high performers.

            **Career Velocity Constraints**  
            Signals of stalled progression — limited role movement, delayed promotions,
            or skill underutilisation — increase perceived opportunity cost of staying.
            This is especially pronounced in mid-tenure cohorts.

            **Engagement & Sentiment Decline**  
            Sustained drops in engagement scores often precede exits by several months,
            reflecting emotional withdrawal well before formal resignation.
            """
        )

    with tab_damage:
        st.markdown(
            """
            **Knowledge Concentration Risk**  
            Attrition impact increases sharply when critical knowledge is tacit,
            undocumented, or held by a small number of individuals. Exits in such roles
            create disproportionate disruption beyond headcount loss.

            **Role Criticality & Interdependence**  
            Highly interdependent roles amplify downstream impact. Even a single exit
            can slow multiple teams, delay decisions, or create quality risks.

            **Successor Readiness Gaps**  
            Weak internal benches or lack of shadowing extend ramp-up periods,
            increasing productivity loss even when replacements are hired quickly.
            """
        )

    # --------------------------------------------------------
    # SECTION 4 — PREDICTIVE OUTLOOK
    # --------------------------------------------------------
    st.markdown("## Predictive Outlook")

    with st.container(border=True):
        col1, col2, col3 = st.columns(3)

        col1.metric("Expected Exits (90 days)", "7–9")
        col2.metric("Expected Exits (180 days)", "18–22")
        col3.metric("Projected Hidden Cost Exposure", "US$9.4–11.2M")

    st.caption(
        "Model confidence: **Medium**. Projections are conservative and exclude long-term "
        "reputational or strategic costs."
    )

    # --------------------------------------------------------
    # SECTION 5 — PRESCRIPTIVE ACTIONS
    # --------------------------------------------------------
    st.markdown("## Prescriptive Actions")

    with st.container(border=True):
        st.subheader("Knowledge Capture & Shadow Staffing")

        st.markdown(
            """
            This intervention does not directly reduce attrition probability.
            Its primary objective is to **contain hidden cost exposure** by
            accelerating knowledge transfer and reducing single-point failure risk.
            """
        )

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Attrition Risk Impact", "Neutral")
        col2.metric("Hidden Cost Reduction", "↓32%")
        col3.metric("Time to Impact", "30 days")
        col4.metric("Estimated Cost Avoided", "US$4.4M")

# ============================================================
# SIDEBAR
# ============================================================
st.sidebar.title("The Catalyst")

attrition_rate = st.sidebar.slider(
    "Annual Attrition Rate (%)",
    min_value=5.0,
    max_value=40.0,
    value=21.3,
    step=0.5
)

page = st.sidebar.radio(
    "Navigate",
    [
        "Overview",
        "Attrition Intelligence"
    ]
)

# ============================================================
# PAGES
# ============================================================
if page == "Overview":
    st.title("The Catalyst")
    st.caption(
        "Catalyst connects workforce signals → drivers → future risk → financial impact → action."
    )

elif page == "Attrition Intelligence":
    render_attrition_intelligence_page(attrition_rate)
