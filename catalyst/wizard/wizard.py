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

# ============================================================
# PERSISTENCE — FOLDER-BASED CLIENTS (CANONICAL)
# ============================================================
def save_client_profile(profile: dict, client_id: str):
    client_dir = CLIENTS_DIR / client_id
    data_dir = client_dir / "data"

    client_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(exist_ok=True)

    # ---- Save config
    with open(client_dir / "config.yaml", "w") as f:
        yaml.safe_dump(profile, f, sort_keys=False)

    # ---- Seed default data files if missing
    seed_demo_data(client_id)

# ============================================================
# SEED DEFAULT DATA FOR NEW CLIENTS
# ============================================================
def seed_demo_data(client_id: str):
    """
    Copies demo data files into a newly created client folder
    if they do not already exist.
    """

    base_dir = Path(__file__).resolve().parents[1]
    demo_data_dir = base_dir / "clients" / "demo" / "data"
    client_data_dir = base_dir / "clients" / client_id / "data"

    client_data_dir.mkdir(exist_ok=True)

    files_to_seed = [
        "hidden_cost_context.json",
        "driver_evidence.json",
    ]

    for filename in files_to_seed:
        src = demo_data_dir / filename
        dst = client_data_dir / filename

        if src.exists() and not dst.exists():
            dst.write_text(src.read_text(), encoding="utf-8")
