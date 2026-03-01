# catalyst_api/engines/config_resolver.py

import random
import numpy as np


class SimulationConfig:
    def __init__(self, iterations: int, seed: int, confidence: float, allow_extreme: bool):
        self.iterations = iterations
        self.seed = seed
        self.confidence = confidence
        self.allow_extreme = allow_extreme


def resolve_simulation_config(simulation_context: str) -> SimulationConfig:
    """
    Backend-enforced configuration.
    Frontend cannot override these values.
    """

    if simulation_context == "DEMO":
        return SimulationConfig(
            iterations=400,
            seed=42,
            confidence=0.80,
            allow_extreme=False
        )

    # Production
    return SimulationConfig(
        iterations=1000,
        seed=123,  # later replace with client-based hash
        confidence=0.80,
        allow_extreme=True
    )


def apply_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)