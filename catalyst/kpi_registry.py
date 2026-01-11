KPI_REGISTRY = {
    
    # --- existing KPIs ---

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
}

    "attrition": {
        "label": "Attrition Intelligence",
        "metrics": [
            "eNPS",
            "sentiment_score",
            "manager_effectiveness",
            "quiet_quitting",
            "cost_of_attrition"
        ],
        "has_prediction": True,
        "has_financial_impact": True,
        "has_prescriptions": True
    },
    "engagement": {
        "label": "Engagement Intelligence",
        "metrics": [
            "eNPS",
            "sentiment_score",
            "internal_mobility",
            "time_since_promotion"
        ],
        "has_prediction": False,
        "has_financial_impact": False,
        "has_prescriptions": False
    },
    "sentiment": {
        "label": "Sentiment Intelligence",
        "metrics": [
            "sentiment_score",
            "top_negative_themes"
        ],
        "has_prediction": False,
        "has_financial_impact": False,
        "has_prescriptions": False
    }
}
