# catalyst/context_persistence.py

import json
from pathlib import Path
from copy import deepcopy
from datetime import datetime

# ============================================================
# CONTEXT PERSISTENCE HELPERS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[0]
CONTEXT_DIR = BASE_DIR / "contexts"
CONTEXT_DIR.mkdir(exist_ok=True)


def _serialise(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def save_context_v1(context: dict):
    """
    Persist Context v1 to disk (client-scoped).
    """
    client_id = context["meta"]["client_id"]
    path = CONTEXT_DIR / f"{client_id}.context.json"

    with open(path, "w", encoding="utf-8") as f:
        json.dump(context, f, default=_serialise, indent=2)


def load_context_v1(client_id: str) -> dict | None:
    """
    Load persisted Context v1 if present.
    """
    path = CONTEXT_DIR / f"{client_id}.context.json"
    if not path.exists():
        return None

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
