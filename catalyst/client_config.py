# catalyst/client_config.py

import yaml
from pathlib import Path

# ============================================================
# CLIENT STORAGE (DIRECTORY-BASED, CANONICAL)
# ============================================================
CLIENTS_DIR = Path(__file__).resolve().parent / "clients"


def list_clients() -> list[str]:
    """
    Returns available client names (directory names).
    """
    if not CLIENTS_DIR.exists():
        return []

    return sorted([
        d.name
        for d in CLIENTS_DIR.iterdir()
        if d.is_dir() and (d / "config.yaml").exists()
    ])


def load_client_profile(client_name: str) -> dict | None:
    """
    Loads a client profile from clients/<client_name>/config.yaml
    """
    path = CLIENTS_DIR / client_name / "config.yaml"
    if not path.exists():
        return None

    with open(path, "r") as f:
        profile = yaml.safe_load(f)

    # ---- Inject client id for downstream use
    profile.setdefault("client", {})
    profile["client"]["id"] = client_name

    return profile


def get_active_client(st_session_state) -> dict | None:
    """
    Returns active client profile if selected.
    """
    client_name = st_session_state.get("active_client")
    if not client_name:
        return None

    return load_client_profile(client_name)
