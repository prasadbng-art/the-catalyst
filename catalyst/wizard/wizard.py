# catalyst/wizard/wizard.py

import streamlit as st
import yaml
from pathlib import Path
from copy import deepcopy

from .steps import (
    step_client_identity,
    step_strategy,
    step_kpi_enablement,
    step_financials
)
from .validators import validate_client_profile

# ============================================================
# CLIENT STORAGE (MUST MATCH app.py EXPECTATIONS)
# ============================================================
CLIENT_BASE_DIR = Path(__file__).resolve().parents[1] / "clients"

# ============================================================
# CANONICAL CLIENT PROFILE SCHEMA
# ============================================================
CLIENT_PROFILE_SCHEMA = {
    "client": {
        "name": "",
        "industry": "",
        "region": ""
    },
    "strategy": {
        "posture": "cost",
        "horizon_days": 180
    },
    "financials": {
        "replacement_multiplier": 1.0,
        "productivity_loss_pct": 0.0
    },
    "kpis": {
        "primary": "attrition",
        "attrition": {
            "enabled": True
        },
        "engagement": {
            "enabled": False
        },
        "sentiment": {
            "enabled": False
        }
    }
}

# ============================================================
# MAIN WIZARD ENTRY POINT
# ============================================================
def run_client_wizard():

    # ---- Initialise state ONCE
    if "profile" not in st.session_state:
        st.session_state.profile = deepcopy(CLIENT_PROFILE_SCHEMA)

    if "wizard_step" not in st.session_state:
        st.session_state.wizard_step = 0

    steps = [
        step_client_identity,
        step_strategy,
        step_kpi_enablement,
        step_financials,
        step_complete  # 👈 EXPLICIT FINAL STEP
    ]

    # ---- Render current step
    steps[st.session_state.wizard_step](st.session_state.profile)

    st.markdown("---")
    col1, col2 = st.columns(2)

    # ---- Navigation
    if col1.button("Back") and st.session_state.wizard_step > 0:
        st.session_state.wizard_step -= 1
        st.rerun()

    if col2.button("Next"):
        if st.session_state.wizard_step < len(steps) - 1:
            st.session_state.wizard_step += 1
            st.rerun()


# ============================================================
# FINAL COMMIT STEP (CRITICAL)
# ============================================================
def step_complete(profile: dict):
    st.header("Review & Save Client Profile")

    st.write("Please review the calibrated client profile:")
    st.json(profile)

    errors = validate_client_profile(profile)
    if errors:
        st.error("Please fix the following issues before saving:")
        for e in errors:
            st.write(f"- {e}")
        return

    if st.button("Save Client Profile"):
        client_name = profile["client"]["name"].strip()

        if not client_name:
            st.error("Client name is required.")
            return

        save_client_profile(profile)

        # ---- Make client immediately active
        st.session_state.active_client = client_name

        # ---- Clean up wizard state
        del st.session_state.profile
        del st.session_state.wizard_step

        st.success(f"Client '{client_name}' calibrated successfully.")
        st.rerun()


# ============================================================
# PERSISTENCE (MATCHES app.py)
# ============================================================
def save_client_profile(profile: dict):
    client_name = profile["client"]["name"].strip()
    client_dir = CLIENT_BASE_DIR / client_name
    client_dir.mkdir(parents=True, exist_ok=True)

    with open(client_dir / "config.yaml", "w") as f:
        yaml.safe_dump(profile, f, sort_keys=False)
