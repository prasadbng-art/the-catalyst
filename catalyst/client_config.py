# catalyst/client_config.py

import yaml
from pathlib import Path

# ============================================================
# CLIENT STORAGE (FOLDER-BASED — CANONICAL)
# ============================================================
BASE_DIR = Path(__file__).resolve().parents[1]
CLIENTS_DIR = BASE_DIR / "clients"
CLIENTS_DIR.mkdir(exist_ok=True)

# ============================================================
# LIST AVAILABLE CLIENTS
# ============================================================
def list_clients() -> list[str]:
    """
    Returns client IDs (folder names under /clients).
    """
    return sorted(
        d.name
        for d in CLIENTS_DIR.iterdir()
        if d.is_dir() and (d / "config.yaml").exists()
    )

# ============================================================
# LOAD CLIENT PROFILE
# ============================================================
def load_client_profile(client_id: str) -> dict | None:
    """
    Loads config.yaml from a client folder.
    """
    config_path = CLIENTS_DIR / client_id / "config.yaml"
    if not config_path.exists():
        return None

    with open(config_path, "r", encoding="utf-8") as f:
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

# ============================================================
# SAVE CLIENT PROFILE (USED BY WIZARD)
# ============================================================
def save_client_profile(profile: dict, client_id: str):
    """
    Persists client profile and seeds demo data if needed.
    """
    client_dir = CLIENTS_DIR / client_id
    data_dir = client_dir / "data"

    client_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(exist_ok=True)

    # ---- Save config.yaml
    with open(client_dir / "config.yaml", "w", encoding="utf-8") as f:
        yaml.safe_dump(profile, f, sort_keys=False)

    seed_demo_data(client_id)

# ============================================================
# SEED DEFAULT DATA FOR NEW CLIENTS
# ============================================================
def seed_demo_data(client_id: str):
    """
    Copies demo data files into a newly created client folder
    if they do not already exist.
    """
    demo_data_dir = CLIENTS_DIR / "demo" / "data"
    client_data_dir = CLIENTS_DIR / client_id / "data"

    client_data_dir.mkdir(exist_ok=True)

    for filename in [
        "hidden_cost_context.json",
        "driver_evidence.json",
    ]:
        src = demo_data_dir / filename
        dst = client_data_dir / filename

        if src.exists() and not dst.exists():
            dst.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
