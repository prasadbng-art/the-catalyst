# catalyst/context_manager_v1.py

from copy import deepcopy
from datetime import datetime
from typing import Dict, List
import uuid
import streamlit as st

# ============================================================
# Context v1 Manager (In-Memory, Persistence-Ready)
# ============================================================


def create_context(
    *,
    client_id: str,
    baseline: dict,
    source: str = "wizard",
) -> dict:
    """
    Create a new Context v1 object from a baseline.
    """

    now = datetime.utcnow()

    context = {
        "meta": {
            "context_id": str(uuid.uuid4()),
            "client_id": client_id,
            "created_at": now,
            "source": source,
            "version": 1,
        },
        "baseline": deepcopy(baseline),
        "overrides": [],
        "effective": deepcopy(baseline),
        "history": [
            {
                "timestamp": now,
                "actor": source,
                "action": "create_context",
                "summary": "Context initialised from baseline",
            }
        ],
    }

    return context


# ------------------------------------------------------------

def get_effective_context():
    """
    Return the authoritative effective Context v1.
    """
    if "context_v1" not in st.session_state:
        return None

    return st.session_state["context_v1"]["effective"]

# ------------------------------------------------------------

def apply_override(
    *,
    context: dict,
    override: dict,
    actor: str,
) -> dict:
    """
    Apply an override to context (non-destructive).
    """

    context = deepcopy(context)

    override_entry = {
        "id": override.get("id", str(uuid.uuid4())),
        "type": override["type"],
        "label": override.get("label", ""),
        "applies_to": override["applies_to"],
        "changes": override["changes"],
        "expires": override.get("expires", True),
    }

    context["overrides"].append(override_entry)
    context["meta"]["version"] += 1

    context["history"].append(
        {
            "timestamp": datetime.utcnow(),
            "actor": actor,
            "action": "apply_override",
            "summary": f"Applied override: {override_entry['label']}",
        }
    )

    context["effective"] = resolve_effective_context(context)

    return context


# ------------------------------------------------------------

def remove_override(
    *,
    context: dict,
    override_id: str,
    actor: str,
) -> dict:
    """
    Remove an override by ID.
    """

    context = deepcopy(context)

    context["overrides"] = [
        o for o in context["overrides"] if o["id"] != override_id
    ]

    context["meta"]["version"] += 1

    context["history"].append(
        {
            "timestamp": datetime.utcnow(),
            "actor": actor,
            "action": "remove_override",
            "summary": f"Removed override: {override_id}",
        }
    )

    context["effective"] = resolve_effective_context(context)

    return context


# ------------------------------------------------------------

def resolve_effective_context(context: dict) -> dict:
    """
    Compute the effective context by applying overrides to baseline.
    """

    effective = deepcopy(context["baseline"])

    for override in context["overrides"]:
        _apply_changes(effective, override["changes"])

    return effective


# ------------------------------------------------------------
# Internal helpers
# ------------------------------------------------------------

def _apply_changes(target: dict, changes: dict):
    """
    Recursively apply changes into target dict.
    """

    for key, value in changes.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            _apply_changes(target[key], value)
        else:
            target[key] = value
