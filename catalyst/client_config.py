# catalyst/client_config.py

import yaml
from pathlib import Path

CLIENTS_DIR = Path(__file__).resolve().parent / "clients"


def list_clients() -> list[str]:
    """
    Returns available client IDs (folder names).
    """
    if not CLIENTS_DIR.exists():
        return []

    return [
        p.name
        for p in CLIENTS_DIR.iterdir()
        if p.is_dir() and (p / "config.yaml").exists()
    ]


def load_client_profile(client_id: str) -> dict | None:
    """
    Loads client profile from clients/<client_id>/config.yaml
    """
    path = CLIENTS_DIR / client_id / "config.yaml"
    if not path.exists():
        return None

    with open(path, "r") as f:
        return yaml.safe_load(f)


def get_active_client(st_session_state) -> dict | None:
    """
    Returns active client profile if selected.
    """
    client_id = st_session_state.get("active_client")
    if not client_id:
        return None

    return load_client_profile(client_id)
