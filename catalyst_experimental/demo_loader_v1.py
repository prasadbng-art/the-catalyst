# demo_loader_v1.py

import streamlit as st
from demo_context_v1 import DEMO_BASELINE_CONTEXT

def load_demo_context_v1():
    """
    Injects a fully formed Context v1 object for demo mode.
    """

    st.session_state["context_v1"] = {
        "baseline": DEMO_BASELINE_CONTEXT,
        "overrides": [],          # ← MUST be a list
        "effective": None,
        "meta": {
            "mode": "demo"
        }
    }

    st.session_state["context_initialized"] = True
