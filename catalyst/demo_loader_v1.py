# demo_loader_v1.py

import streamlit as st
from demo_context_v1 import DEMO_BASELINE_CONTEXT

def load_demo_context_v1():
    """
    Canonical demo loader aligned with Context v1 invariants.
    """

    st.session_state["context_v1"] = DEMO_BASELINE_CONTEXT
    st.session_state["scenario_overrides"] = {}
    st.session_state["context_initialized"] = True
