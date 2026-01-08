# catalyst/client_config.py

import yaml
from pathlib import Path

# ============================================================
# CLIENT STORAGE (MUST MATCH wizard.py)
# ============================================================
CLIENTS_DIR = Path(__file__).resolve().parent / "clients"
CLIENTS_DIR.mkdir(exist_ok=True)

# ============================================================
# LIST AVAILABLE CLIENTS
# ============================================================
def list_clients() -> list[str]:
    """
    Returns client ids (yaml filenames without extension).
    """
    if not CLIENTS_DIR.exists():
        return []

    return sorted(
        f.stem
        for f in CLIENTS_DIR.glob("*.yaml")
        if f.is_file()
    )

# ============================================================
# LOAD CLIENT PROFILE
# ============================================================
def load_client_profile(client_id: str) -> dict | None:
    """
    Loads a client profile by client_id.
    """
    path = CLIENTS_DIR / f"{client_id}.yaml"
    if not path.exists():
        return None

    with open(path, "r") as f:
        return yaml.safe_load(f)

# ============================================================
# RESOLVE ACTIVE CLIENT
# ============================================================
def get_active_client(session_state) -> dict | None:
    """
    Returns active client profile from session_state.
    """
    client_id = session_state.get("active_client")
    if not client_id:
        return None

    return load_client_profile(client_id)
