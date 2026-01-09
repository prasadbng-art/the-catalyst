import streamlit as st

DEFAULT_CONTEXT = {
    "persona": "CEO",
    "strategy": {
        "posture": "cost"
    },
    "kpis": {
        "attrition": {
            "attrition_rate": 18.0,
            "status": "amber"
        }
    }
}


def get_active_context() -> dict:
    """
    Single source of truth for Catalyst context.
    """

    if "catalyst_context" not in st.session_state:
        st.session_state["catalyst_context"] = DEFAULT_CONTEXT.copy()

    return st.session_state["catalyst_context"]
