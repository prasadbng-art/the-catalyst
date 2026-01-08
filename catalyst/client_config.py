# catalyst/client_config.py

import yaml
from pathlib import Path

# ============================================================
# CLIENT STORAGE CONTRACT (DIRECTORY-BASED)
# ============================================================
CLIENTS_DIR = Path(__file__).resolve().parent / "clients"


# ============================================================
# CLIENT DISCOVERY
# ============================================================
def list_clients() -> list[str]:
    """
    Returns available client names (directory names).
    A valid client must have:
        clients/<client_name>/config.yaml
    """
    if not CLIENTS_DIR.exists():
        return []

    clients = []
    for p in CLIENTS_DIR.iterdir():
        if p.is_dir() and (p / "config.yaml").exists():
            clients.append(p.name)

    return sorted(clients)


# ============================================================
# CLIENT LOADING
# ============================================================
def load_client_profile(client_name: str) -> dict | None:
    """
    Loads a client profile by name.
    """
    path = CLIENTS_DIR / client_name / "config.yaml"
    if not path.exists():
        return None

    with open(path, "r") as f:
        return yaml.safe_load(f)


# ============================================================
# ACTIVE CLIENT RESOLUTION
# ============================================================
def get_active_client(st_session_state) -> dict | None:
    """
    Returns active client profile if selected.
    """
    client_name = st_session_state.get("active_client")
    if not client_name:
        return None

    return load_client_profile(client_name)
