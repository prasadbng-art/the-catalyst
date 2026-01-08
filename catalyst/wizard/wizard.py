# catalyst/wizard/wizard.py

import streamlit as st
import yaml
from pathlib import Path
from copy import deepcopy

from .steps import (
    step_client_identity,
    step_strategy,
    step_kpi_enablement,
    step_financials,
)
from .validators import validate_client_profile

# ============================================================
# CLIENT STORAGE (MUST MATCH client_config.py)
# ============================================================
BASE_DIR = Path(__file__).resolve().parents[1]
CLIENTS_DIR = BASE_DIR / "clients"
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
# ✅ MAIN WIZARD ENTRY POINT (THIS WAS MISSING)
# ============================================================
def run_client_wizard():
    """
    Streamlit-driven multi-step client calibration wizard.
    """

    # ---- Initialize session state once
    if "profile" not in st.session_state:
        st.session_state.profile = deepcopy(CLIENT_PROFILE_SCHEMA)

    if "wizard_step" not in st.session_state:
        st.session_state.wizard_step = 0

    steps = [
        step_client_identity,
        step_strategy,
        step_kpi_enablement,
        step_financials,
        step_complete,   # final step
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
# FINAL STEP — REVIEW & SAVE
# ============================================================
def step_complete(profile: dict):
    st.header("Review & Save Client Profile")
    st.json(profile)

    errors = validate_client_profile(profile)
    if errors:
        st.error("Please fix the following issues:")
        for e in errors:
            st.write(f"- {e}")
        return

    if st.button("Save Client Profile"):
        raw_name = profile["client"]["name"].strip()
        if not raw_name:
            st.error("Client name is required.")
            return

        client_id = raw_name.lower().replace(" ", "_")

        save_client_profile(profile, client_id)

        # ---- Activate client immediately
        st.session_state.active_client = client_id

        # ---- Clean wizard state
        st.session_state.pop("profile", None)
        st.session_state.pop("wizard_step", None)

        st.success(f"Client '{raw_name}' calibrated and activated.")
        st.rerun()


# ============================================================
# PERSISTENCE
# ============================================================
def save_client_profile(profile: dict, client_id: str):
    client_dir = CLIENTS_DIR / client_id
    data_dir = client_dir / "data"

    client_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(exist_ok=True)

    with open(client_dir / "config.yaml", "w", encoding="utf-8") as f:
        yaml.safe_dump(profile, f, sort_keys=False)
