from copy import deepcopy
from typing import Dict, Tuple


def generate_sensitivity_contexts(
    base_context: Dict
) -> Tuple[Dict, Dict, Dict]:
    """
    Generates Low / Base / High scenarios from a base context.
    These are conservative, CFO-safe perturbations.
    """

    low = deepcopy(base_context)
    high = deepcopy(base_context)

    # Vacancy sensitivity
    low["vacancy_duration_months"] *= 0.75
    high["vacancy_duration_months"] *= 1.25

    # Ramp-up sensitivity
    low["ramp_up_duration_months"] *= 0.8
    high["ramp_up_duration_months"] *= 1.3

    # Knowledge risk sensitivity
    low["knowledge_risk_multiplier"] *= 0.7
    high["knowledge_risk_multiplier"] *= 1.4

    return low, base_context, high
