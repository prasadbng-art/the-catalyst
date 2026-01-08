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
# CLIENT STORAGE (MUST MATCH client_config.py)
# ============================================================
CLIENTS_DIR = Path(__file__).resolve().parents[1] / "clients"
CLIENTS_DIR.mkdir(exist_ok=True)

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
        "attrition": {"enabled": True},
        "engagement": {"enabled": False},
        "sentiment": {"enabled": False}
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
        step_complete
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
        raw_name = profile["client"]["name"].strip()

        if not raw_name:
            st.error("Client name is required.")
            return

        # ---- Canonical client id
        client_id = raw_name.lower().replace(" ", "_")

        save_client_profile(profile, client_id)

        # ---- Activate client immediately
        st.session_state.active_client = client_id

        # ---- Clean up wizard state
        st.session_state.pop("profile", None)
        st.session_state.pop("wizard_step", None)

        st.success(f"Client '{raw_name}' calibrated and activated.")
        st.rerun()

# ============================================================
# PERSISTENCE (FLAT FILE — MATCHES client_config.py)
# ============================================================
def save_client_profile(profile: dict, client_id: str):
    path = CLIENTS_DIR / f"{client_id}.yaml"
    with open(path, "w") as f:
        yaml.safe_dump(profile, f, sort_keys=False)
