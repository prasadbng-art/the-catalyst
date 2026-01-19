METRIC_REGISTRY = {
    "eNPS": {
        "label": "Employee Net Promoter Score",
        "type": "index",
        "range": (-100, 100),
        "default": -12
    },
    "sentiment_score": {
        "label": "Sentiment Score",
        "type": "index",
        "range": (-100, 100),
        "default": -8
    },
    "top_negative_themes": {
        "label": "Top Negative Themes",
        "type": "list",
        "default": ["Poor Management", "Career Stagnation", "Workload"]
    },
    "manager_effectiveness": {
        "label": "Manager Effectiveness Index",
        "type": "index",
        "range": (0, 100),
        "default": 62
    },
    "cost_of_attrition": {
        "label": "Annual Cost of Attrition",
        "type": "currency",
        "default": 12400000
    },
    "cost_by_location": {
        "label": "Cost of Attrition by Location",
        "type": "currency_grouped",
        "default": {
            "India": 3.2,
            "Poland": 4.1,
            "US": 4.9
        }
    },
    "quiet_quitting": {
        "label": "Quiet Quitting %",
        "type": "percentage",
        "default": 38
    },
    "time_since_promotion": {
        "label": "Avg Time Since Promotion (months)",
        "type": "number",
        "default": 28
    },
    "internal_mobility": {
        "label": "Internal Mobility Rate %",
        "type": "percentage",
        "default": 11
    }
}
