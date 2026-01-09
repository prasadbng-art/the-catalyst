import streamlit as st

DEFAULT_CONTEXT = {
    "persona": "CEO",
    "strategy": {
        "posture": "cost"
    },
    "kpis": {
        "attrition": {
            "value": 18.0,
            "status": "amber"
        },
        "engagement": {
            "value": 72.0,
            "status": "green"
        },
        "sentiment": {
            "value": 64.0,
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

def update_context_from_wizard(
    *,
    persona: str,
    posture: str,
    kpis: dict,
):
    """
    Controlled entry point for Wizard → Context writes.
    """

    context = get_active_context()

    context["persona"] = persona
    context["strategy"]["posture"] = posture

    for kpi, state in kpis.items():
        if kpi in context["kpis"]:
            context["kpis"][kpi].update(state)
