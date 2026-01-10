import streamlit as st
from scenario_v09 import SCENARIOS

def render_scenario_v09():
    st.header("Scenario Comparison")
    st.caption("Decision Trade-off Intelligence (v0.9)")

    scenario_names = list(SCENARIOS.keys())

    col1, col2 = st.columns(2)
    with col1:
        a = st.selectbox("Scenario A", scenario_names, index=0)
    with col2:
        b = st.selectbox("Scenario B", scenario_names, index=1)

    if a == b:
        st.warning("Please select two different scenarios.")
        return

    st.subheader("Selected Scenarios")
    st.write(SCENARIOS[a]["label"], "vs", SCENARIOS[b]["label"])
