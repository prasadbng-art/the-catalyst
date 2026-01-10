# demo_loader_v1.py

import streamlit as st
from demo_context_v1 import DEMO_BASELINE_CONTEXT

def load_demo_context_v1():
    """
    Loads a fully populated demo baseline
    into session_state in the canonical Context v1 way.
    """

    st.session_state["baseline_context"] = DEMO_BASELINE_CONTEXT
    st.session_state["scenario_overrides"] = {}
    st.session_state["context_initialized"] = True
