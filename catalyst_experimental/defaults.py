# defaults.py
DEFAULT_PORTFOLIO_BUDGET = 1_000_000  # currency-agnostic
DEFAULT_PORTFOLIO_HORIZON_DAYS = 180
DEFAULT_EXPOSURE_BASE = {
    "attrition_rate": 0.18,
    "headcount": 1000
}
DEFAULT_KPI_THRESHOLDS = {
    "attrition": {
        "green": {"max": 15},
        "amber": {"min": 15, "max": 25},
        "red": {"min": 25}
    }
}
