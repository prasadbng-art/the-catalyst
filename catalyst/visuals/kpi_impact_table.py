import streamlit as st
import pandas as pd
from typing import List, Dict


def render_kpi_impact_table(deltas: List[Dict]):
    if not deltas:
        st.info("No KPI impact detected.")
        return

    df = pd.DataFrame(deltas)

    df["Δ"] = df["delta"].apply(
        lambda x: f"+{x}" if x > 0 else str(x)
    )

    df = df[[
        "kpi",
        "baseline",
        "scenario",
        "Δ",
        "direction",
        "signal",
    ]]

    st.subheader("Scenario Impact on KPIs")
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
    )
