import pandas as pd
from catalyst_api.schemas.common import KPIValue
from schemas.baseline import BaselineKPIs, Diagnostics, LocationDiagnostic

def compute_baseline(df: pd.DataFrame) -> BaselineKPIs:
    attrition_risk = df["attrition_risk_score"].mean() * 100
    headcount = df["employee_id"].nunique()

    # placeholder cost logic (replace later)
    cost_exposure = headcount * attrition_risk * 1000 / 100

    return BaselineKPIs(
        attrition_risk=KPIValue(
            value=round(attrition_risk, 1),
            unit="%",
            description="Forward-looking likelihood of exits under current conditions",
        ),
        headcount=KPIValue(
            value=headcount,
            unit="employees",
        ),
        annual_attrition_cost_exposure=KPIValue(
            value=round(cost_exposure, 1),
            unit="USD",
            description="Estimated annual business exposure from attrition",
        ),
    )

def compute_diagnostics(df: pd.DataFrame) -> Diagnostics:
    rows = []

    grouped = df.groupby("location")

    for location, g in grouped:
        rows.append(
            LocationDiagnostic(
                location=location,
                headcount=len(g),
                recent_attrition_pct=round(g["attrition_flag"].mean() * 100, 1),
                avg_attrition_risk_pct=round(g["attrition_risk_score"].mean() * 100, 1),
            )
        )

    return Diagnostics(by_location=rows)
