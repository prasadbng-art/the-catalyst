# catalyst/wizard/wizard.py

import streamlit as st
import yaml
from pathlib import Path

from .steps import (
    step_client_identity,
    step_strategy,
    step_kpi_enablement,
    step_financials
)
from .validators import validate_client_profile

CLIENT_DIR = Path(__file__).resolve().parents[1] / "clients"


def run_client_wizard():

    if "wizard_step" not in st.session_state:
        st.session_state.wizard_step = 0

    if "profile" not in st.session_state:
        st.session_state.profile = {
            "client": {},
            "strategy": {},
            "kpis": {
                "primary": "attrition",
                "attrition": {"enabled": True},
                "engagement": {"enabled": False},
                "sentiment": {"enabled": False},
            },
            "financials": {}
        }
def run_client_wizard():

    if "profile" not in st.session_state:
        st.session_state.profile = {}

    # ---- INITIALISE CLIENT PROFILE SCHEMA (CRITICAL)
    st.session_state.profile.setdefault("client", {
        "name": "",
        "industry": "",
        "region": ""
    })

    st.session_state.profile.setdefault("strategy", {
        "posture": "cost",
        "horizon_days": 180
    })

    st.session_state.profile.setdefault("financials", {
        "replacement_multiplier": 1.0,
        "productivity_loss_pct": 0.0
    })

    st.session_state.profile.setdefault("kpis", {
        "primary": "attrition",
        "attrition": {
            "enabled": True
        }
    })

    if "wizard_step" not in st.session_state:
        st.session_state.wizard_step = 0

    ...

    steps = [
        step_client_identity,
        step_strategy,
        step_kpi_enablement,
        step_financials
    ]

    steps[st.session_state.wizard_step](st.session_state.profile)

    col1, col2 = st.columns(2)

    if col1.button("Back") and st.session_state.wizard_step > 0:
        st.session_state.wizard_step -= 1

    if col2.button("Next"):
        if st.session_state.wizard_step < len(steps) - 1:
            st.session_state.wizard_step += 1
        else:
            errors = validate_client_profile(st.session_state.profile)
            if errors:
                for e in errors:
                    st.error(e)
            else:
                save_client_profile(st.session_state.profile)
                st.success("Client profile saved.")
                st.session_state.clear()
                st.rerun()


def save_client_profile(profile: dict):
    CLIENT_DIR.mkdir(exist_ok=True)

    filename = profile["client"]["name"].lower().replace(" ", "_") + ".yaml"
    with open(CLIENT_DIR / filename, "w") as f:
        yaml.safe_dump(profile, f, sort_keys=False)
