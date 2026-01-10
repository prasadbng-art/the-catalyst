# catalyst/context_manager_v1.py

from copy import deepcopy
from datetime import datetime
import uuid
import streamlit as st
from typing import Dict

# ============================================================
# Context v1 Manager
# Canonical, invariant-safe implementation
# ============================================================


# ------------------------------------------------------------
# 🔒 Context invariant initializer (CRITICAL)
# ------------------------------------------------------------

def _ensure_context_invariants(context: dict) -> dict:
    """
    Ensure Context v1 structural invariants.
    This function makes the context self-healing and safe
    for all mutation and read paths.
    """

    # ---- meta
    if "meta" not in context:
        context["meta"] = {}

    if "version" not in context["meta"]:
        context["meta"]["version"] = 1

    # ---- overrides
    if "overrides" not in context:
        context["overrides"] = []

    # ---- history
    if "history" not in context:
        context["history"] = []

    # ---- effective
    if "effective" not in context and "baseline" in context:
        context["effective"] = deepcopy(context["baseline"])

    return context


# ------------------------------------------------------------
# Context creation
# ------------------------------------------------------------

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

    return _ensure_context_invariants(context)


# ------------------------------------------------------------
# Accessor
# ------------------------------------------------------------

def get_effective_context() -> dict | None:
    """
    Return the authoritative effective Context v1.
    """

    if "context_v1" not in st.session_state:
        return None

    context = _ensure_context_invariants(st.session_state["context_v1"])
    return context


# ------------------------------------------------------------
# Override application
# ------------------------------------------------------------

def apply_override(
    *,
    context: dict,
    override: dict,
    actor: str,
) -> dict:
    """
    Apply an override to Context v1 (non-destructive).
    """

    context = _ensure_context_invariants(deepcopy(context))

    override_entry = {
        "id": override["id"],
        "type": override["type"],
        "label": override.get("label", ""),
        "applies_to": override["applies_to"],
        "changes": override["changes"],
        "actor": actor,
        "timestamp": datetime.utcnow(),
    }

    context["overrides"].append(override_entry)
    context["meta"]["version"] += 1

    context["history"].append(
        {
            "timestamp": datetime.utcnow(),
            "actor": actor,
            "action": "apply_override",
            "summary": f"Applied override: {override_entry['id']}",
        }
    )

    context["effective"] = resolve_effective_context(context)

    return context


# ------------------------------------------------------------
# Override removal
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

    context = _ensure_context_invariants(deepcopy(context))

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
# Effective context resolution
# ------------------------------------------------------------

def resolve_effective_context(context: dict) -> dict:
    """
    Compute the effective context by applying overrides to baseline.
    """

    context = _ensure_context_invariants(context)

    effective = deepcopy(context["baseline"])

    for override in context["overrides"]:
        _apply_changes(effective, override["changes"])

    return effective


# ------------------------------------------------------------
# Internal helpers
# ------------------------------------------------------------

def _apply_changes(target: dict, changes: dict) -> None:
    """
    Recursively apply changes into target dict.
    """

    for key, value in changes.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            _apply_changes(target[key], value)
        else:
            target[key] = value
