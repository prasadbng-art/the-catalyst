from fastapi import APIRouter
from catalyst_api.schemas.catalyst_simulation import (
    CatalystSimulationRequest,
    CatalystSimulationResponse,
)
from catalyst_api.engines.config_resolver import resolve_simulation_config, apply_seed

# Placeholder import (we will create engine next)
from catalyst_api.engines.catalyst_engine import run_catalyst_simulation

router = APIRouter()

@router.post("/catalyst/simulate", response_model=CatalystSimulationResponse)
def simulate_catalyst(request: CatalystSimulationRequest):

    config = resolve_simulation_config(request.simulation_context)
    apply_seed(config.seed)

    result = run_catalyst_simulation(request, config)

    return result

from catalyst_api.engines.ai_disruption_engine import (
    compute_ai_indices,
    generate_scenarios,
    compute_role_exposure
)


@router.post("/catalyst/ai-disruption")
def ai_disruption(payload: dict):

    diagnostic = payload["diagnostic"]
    roles = payload["roles"]

    exposure, readiness, velocity, macro = compute_ai_indices(diagnostic)

    scenarios = generate_scenarios(exposure, readiness, velocity, macro)

    role_results = compute_role_exposure(
        roles,
        velocity,
        readiness,
        macro
    )

    return {
        "indices":{
            "exposure":exposure,
            "readiness":readiness,
            "velocity":velocity,
            "macro":macro
        },
        "scenarios":scenarios,
        "role_exposure":role_results
    }