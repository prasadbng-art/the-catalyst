# catalyst/kpi_registry.py

"""
Authoritative KPI Registry for Catalyst Phase I
All KPIs rendered in visuals and narratives must be declared here.
"""

KPI_REGISTRY = {
    "attrition_risk": {
        "label": "Attrition Risk",
        "unit": "%",
        "description": "Estimated probability of employee exits over the next 12 months",
        "direction": "lower_is_better",
        "format": "percentage",
    },

    "predicted_attrition_12m": {
        "label": "Predicted Attrition (12 Months)",
        "unit": "employees",
        "description": "Expected number of employee exits over the next 12 months",
        "direction": "lower_is_better",
        "format": "integer",
    },

    "engagement_index": {
        "label": "Engagement Index",
        "unit": "index",
        "description": "Aggregate employee engagement score",
        "direction": "higher_is_better",
        "format": "score",
    },

    "manager_effectiveness": {
        "label": "Manager Effectiveness",
        "unit": "index",
        "description": "Average manager effectiveness score",
        "direction": "higher_is_better",
        "format": "score",
    },
}
