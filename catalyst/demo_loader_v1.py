# demo_loader_v1.py

from context_manager_v1 import ContextManagerV1
from demo_context_v1 import DEMO_BASELINE_CONTEXT

def load_demo_context_v1():
    """
    Creates and returns a fully initialized Context v1
    using the demo baseline.
    """
    context = ContextManagerV1(
        baseline_context=DEMO_BASELINE_CONTEXT
    )

    return context
