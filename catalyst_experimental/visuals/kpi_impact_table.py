import streamlit as st
import pandas as pd
from typing import List, Dict


DIRECTION_ICON = {
    "up": "▲",
    "down": "▼",
    "flat": "●",
}

SIGNAL_COLOR = {
    "strong": "🟢",
    "moderate": "🟡",
    "weak": "🟠",
    "none": "⚪",
}


def render_kpi_impact_table(deltas: List[Dict]):
    if not deltas:
        st.info("No measurable KPI impact detected under this scenario.")
        return

    rows = []

    for d in deltas:
        rows.append({
            "KPI": d["kpi"].replace("_", " ").title(),
            "Baseline": d["baseline"],
            "Scenario": d["scenario"],
            "Δ": f"{'+' if d['delta'] > 0 else ''}{d['delta']}",
            "Direction": f"{DIRECTION_ICON[d['direction']]} {d['direction'].title()}",
            "Impact": f"{SIGNAL_COLOR[d['signal']]} {d['signal'].title()}",
        })

    df = pd.DataFrame(rows)

    st.subheader("Scenario Impact on Key KPIs")
    st.caption(
        "Comparison of baseline context vs simulated scenario outcomes. "
        "Impact reflects magnitude, not confidence."
    )

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
    )
