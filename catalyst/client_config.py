# catalyst/client_config.py

import yaml
from pathlib import Path

CLIENTS_DIR = Path(__file__).resolve().parent / "clients"


def list_clients() -> list[str]:
    """
    Returns available client config filenames (without extension).
    """
    if not CLIENTS_DIR.exists():
        return []

    return [
        f.stem
        for f in CLIENTS_DIR.glob("*.yaml")
        if f.is_file()
    ]


def load_client_profile(client_name: str) -> dict | None:
    """
    Loads a client profile by name (stem).
    """
    path = CLIENTS_DIR / f"{client_name}.yaml"
    if not path.exists():
        return None

    with open(path, "r") as f:
        return yaml.safe_load(f)


def get_active_client(st_session_state) -> dict | None:
    """
    Returns active client profile if selected.
    """
    client_name = st_session_state.get("active_client")
    if not client_name:
        return None

    return load_client_profile(client_name)
