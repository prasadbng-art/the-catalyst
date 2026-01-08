# catalyst/scenario_store.py

import json
from pathlib import Path
from datetime import datetime


BASE_SCENARIO_DIR = Path(__file__).resolve().parent / "scenarios"


def save_scenario(
    *,
    scenario_name: str,
    client_name: str,
    persona: str,
    inputs: dict,
    derived: dict,
    portfolio: dict
):
    client_dir = BASE_SCENARIO_DIR / client_name
    client_dir.mkdir(parents=True, exist_ok=True)

    payload = {
        "metadata": {
            "scenario_name": scenario_name,
            "timestamp": datetime.utcnow().isoformat(),
            "client": client_name,
            "persona": persona
        },
        "inputs": inputs,
        "derived": derived,
        "portfolio": portfolio
    }

    filename = scenario_name.lower().replace(" ", "_") + ".json"

    with open(client_dir / filename, "w") as f:
        json.dump(payload, f, indent=2)


def list_scenarios(client_name: str) -> list[str]:
    client_dir = BASE_SCENARIO_DIR / client_name
    if not client_dir.exists():
        return []

    return [f.stem for f in client_dir.glob("*.json")]


def load_scenario(client_name: str, scenario_name: str) -> dict:
    path = BASE_SCENARIO_DIR / client_name / f"{scenario_name}.json"
    with open(path, "r") as f:
        return json.load(f)
