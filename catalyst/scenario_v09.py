# ==========================================================
# Catalyst v0.9 — Scenario Comparison
# Decision Trade-off Intelligence
# ==========================================================

import streamlit as st
from enum import Enum
from typing import Dict, List, Optional, Literal
from dataclasses import dataclass
from pydantic import BaseModel, Field, validator

# ==========================================================
# Context v1 Override Wiring (Steps 2, 3, 4, 5)
# ==========================================================

from context_manager_v1 import apply_override, remove_override
from scenario_override_adapter import scenario_to_override


def reset_scenario_overrides(context_v1: dict) -> dict:
    """
    Remove all scenario overrides before applying a new one.
    Enforces pairwise-only integrity.
    """
    for o in list(context_v1.get("overrides", [])):
        if o.get("type") == "scenario":
            context_v1 = remove_override(
                context=context_v1,
                override_id=o["id"],
                actor="scenario_v09",
            )
    return context_v1


# ==========================================================
# Enums
# ==========================================================

class QualitativeLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TimeSpeed(str, Enum):
    fast = "fast"
    moderate = "moderate"
    slow = "slow"

class PostureSignal(str, Enum):
    control_oriented = "control_oriented"
    capability_building = "capability_building"
    growth_oriented = "growth_oriented"
    defensive = "defensive"

class Direction(str, Enum):
    up = "up"
    down = "down"
    neutral = "neutral"


# ==========================================================
# Scenario Schema (v0.9)
# ==========================================================

class ScenarioIdentity(BaseModel):
    id: str = Field(..., pattern="^[a-z0-9_]+$")
    label: str
    intent: str

class AssumptionBlock(BaseModel):
    external: Dict[str, str]
    internal: Dict[str, str]

class InterventionBlock(BaseModel):
    interventions: List[str]

    @validator("interventions")
    def must_have_interventions(cls, v):
        if not v:
            raise ValueError("At least one intervention must be declared.")
        return v

class CapitalConstraint(BaseModel):
    budget_range: QualitativeLevel
    spend_profile: str

class TimeConstraint(BaseModel):
    horizon_months: int
    first_signal_months: int

    @validator("first_signal_months")
    def signal_before_horizon(cls, v, values):
        if "horizon_months" in values and v >= values["horizon_months"]:
            raise ValueError("First signal must occur before horizon.")
        return v

class ConstraintBlock(BaseModel):
    capital: CapitalConstraint
    time: TimeConstraint

class AxisExposure(BaseModel):
    capital_intensity: QualitativeLevel
    time_to_impact: TimeSpeed
    execution_risk: QualitativeLevel
    cultural_risk: QualitativeLevel
    posture_signal: PostureSignal

class MetricExpectation(BaseModel):
    expected_direction: Direction
    confidence: QualitativeLevel

class MetricMapping(BaseModel):
    metrics: Dict[str, MetricExpectation]

class ScenarioV09(BaseModel):
    identity: ScenarioIdentity
    assumptions: AssumptionBlock
    interventions: InterventionBlock
    constraints: ConstraintBlock
    axis_exposure: AxisExposure
    metrics: Optional[MetricMapping] = None


# ==========================================================
# Example Scenarios (Embedded)
# ==========================================================

SCENARIOS = {
    "Cost Containment": ScenarioV09(
        identity=ScenarioIdentity(
            id="cost_containment",
            label="Cost Containment",
            intent="Stabilise attrition through short-term control mechanisms"
        ),
        assumptions=AssumptionBlock(
            external={"labour_market": "tight"},
            internal={"leadership_alignment": "medium"}
        ),
        interventions=InterventionBlock(
            interventions=["policy_enforcement", "manager_targeting"]
        ),
        constraints=ConstraintBlock(
            capital=CapitalConstraint(
                budget_range=QualitativeLevel.low,
                spend_profile="front_loaded"
            ),
            time=TimeConstraint(
                horizon_months=12,
                first_signal_months=3
            )
        ),
        axis_exposure=AxisExposure(
            capital_intensity=QualitativeLevel.low,
            time_to_impact=TimeSpeed.fast,
            execution_risk=QualitativeLevel.low,
            cultural_risk=QualitativeLevel.medium,
            posture_signal=PostureSignal.control_oriented
        )
    ),
    "Capability Build": ScenarioV09(
        identity=ScenarioIdentity(
            id="capability_build",
            label="Capability Build",
            intent="Reduce attrition risk by building durable people capability"
        ),
        assumptions=AssumptionBlock(
            external={"labour_market": "tight"},
            internal={"leadership_alignment": "high"}
        ),
        interventions=InterventionBlock(
            interventions=[
                "manager_coaching_program",
                "career_pathing_framework",
                "listening_infrastructure"
            ]
        ),
        constraints=ConstraintBlock(
            capital=CapitalConstraint(
                budget_range=QualitativeLevel.medium,
                spend_profile="phased"
            ),
            time=TimeConstraint(
                horizon_months=18,
                first_signal_months=6
            )
        ),
        axis_exposure=AxisExposure(
            capital_intensity=QualitativeLevel.medium,
            time_to_impact=TimeSpeed.slow,
            execution_risk=QualitativeLevel.medium,
            cultural_risk=QualitativeLevel.low,
            posture_signal=PostureSignal.capability_building
        )
    )
}


# ==========================================================
# Comparison Engine (UNCHANGED)
# ==========================================================

QUAL_MAP = {"low": 1, "medium": 2, "high": 3}
TIME_MAP = {"fast": 3, "moderate": 2, "slow": 1}

@dataclass
class AxisDelta:
    axis: str
    direction: Literal["A_over_B", "B_over_A"]
    magnitude: Literal["small", "moderate", "large"]
    interpretation: str

def delta_magnitude(diff: int) -> str:
    if abs(diff) == 1:
        return "small"
    elif abs(diff) == 2:
        return "moderate"
    return "large"

def compare_axes(a: ScenarioV09, b: ScenarioV09) -> List[AxisDelta]:
    deltas: List[AxisDelta] = []

    diff = QUAL_MAP[a.axis_exposure.capital_intensity] - QUAL_MAP[b.axis_exposure.capital_intensity]
    if diff != 0:
        deltas.append(AxisDelta(
            axis="capital",
            direction="A_over_B" if diff > 0 else "B_over_A",
            magnitude=delta_magnitude(diff),
            interpretation="Higher capital commitment in exchange for broader intervention scope"
        ))

    diff = TIME_MAP[a.axis_exposure.time_to_impact] - TIME_MAP[b.axis_exposure.time_to_impact]
    if diff != 0:
        deltas.append(AxisDelta(
            axis="time",
            direction="A_over_B" if diff > 0 else "B_over_A",
            magnitude=delta_magnitude(diff),
            interpretation="Faster visible impact at the cost of long-term durability"
        ))

    diff = QUAL_MAP[a.axis_exposure.execution_risk] - QUAL_MAP[b.axis_exposure.execution_risk]
    if diff != 0:
        deltas.append(AxisDelta(
            axis="execution_risk",
            direction="A_over_B" if diff < 0 else "B_over_A",
            magnitude=delta_magnitude(diff),
            interpretation="Lower execution risk due to organisational familiarity"
        ))

    diff = QUAL_MAP[a.axis_exposure.cultural_risk] - QUAL_MAP[b.axis_exposure.cultural_risk]
    if diff != 0:
        deltas.append(AxisDelta(
            axis="cultural_risk",
            direction="A_over_B" if diff < 0 else "B_over_A",
            magnitude=delta_magnitude(diff),
            interpretation="Lower likelihood of employee backlash or disengagement"
        ))

    if a.axis_exposure.posture_signal != b.axis_exposure.posture_signal:
        deltas.append(AxisDelta(
            axis="posture",
            direction="A_over_B",
            magnitude="moderate",
            interpretation=f"Signals a shift toward {a.axis_exposure.posture_signal.replace('_', ' ')} leadership posture"
        ))

    return deltas


def detect_asymmetry(deltas: List[AxisDelta]) -> str:
    gains = [d for d in deltas if d.direction == "A_over_B"]
    losses = [d for d in deltas if d.direction == "B_over_A"]

    if gains and losses:
        return "balanced_tradeoff"
    if gains and not losses:
        return "dominant_but_risky"
    if losses and not gains:
        return "defensive_choice"
    return "neutral"


# ==========================================================
# Narrative Engine (UNCHANGED)
# ==========================================================

def generate_narrative(a: ScenarioV09, b: ScenarioV09, deltas: List[AxisDelta], asymmetry: str):
    bullets = []
    for d in deltas[:3]:
        bullets.append(
            f"You gain advantage on **{d.axis.replace('_', ' ')}** at the cost of corresponding trade-offs."
        )

    framing_map = {
        "balanced_tradeoff": "This is a deliberate trade between speed, cost, risk, and organisational posture.",
        "dominant_but_risky": "This option appears advantaged but concentrates risk in fewer bets.",
        "defensive_choice": "This choice limits downside exposure while constraining long-term upside.",
        "neutral": "These scenarios differ more in posture than in expected outcomes."
    }

    return {
        "headline": f"Choosing **{a.identity.label}** over **{b.identity.label}** involves the following trade-offs:",
        "bullets": bullets,
        "framing": framing_map[asymmetry]
    }


# ==========================================================
# UI Renderer (Entry Point)
# ==========================================================

def render_scenario_v09():
    st.header("Scenario Comparison")
    st.caption("Decision Trade-off Intelligence (v0.9)")

    col1, col2 = st.columns(2)
    with col1:
        a_label = st.selectbox("Scenario A", list(SCENARIOS.keys()), index=1)
    with col2:
        b_label = st.selectbox("Scenario B", list(SCENARIOS.keys()), index=0)

    if a_label == b_label:
        st.error("Please select two different scenarios.")
        st.stop()

    scenario_a = SCENARIOS[a_label]
    scenario_b = SCENARIOS[b_label]

    # ======================================================
    # STEP 3 & 4 — APPLY CONTEXT v1 OVERRIDES (PAIRWISE)
    # ======================================================

    context_v1 = st.session_state.get("context_v1")
    if context_v1:
        context_v1 = reset_scenario_overrides(context_v1)

        override = scenario_to_override(
            scenario_id=f"scenario_{scenario_a.identity.id}_vs_{scenario_b.identity.id}",
            label=f"{scenario_a.identity.label} vs {scenario_b.identity.label}",
            payload={
                "strategy": {
                    "posture": scenario_a.axis_exposure.posture_signal.value
                }
            },
        )

        context_v1 = apply_override(
            context=context_v1,
            override=override,
            actor="scenario_v09",
        )

        st.session_state["context_v1"] = context_v1

    deltas = compare_axes(scenario_a, scenario_b)
    if not deltas:
        st.error("Catalyst cannot identify a meaningful decision difference between these scenarios.")
        st.stop()

    asymmetry = detect_asymmetry(deltas)

    left, center, right = st.columns([3, 2, 3])

    def render_card(s: ScenarioV09):
        st.subheader(s.identity.label)
        st.caption(s.identity.intent)
        st.markdown("**Constraints**")
        st.markdown(f"- Capital: {s.constraints.capital.budget_range.value}")
        st.markdown(f"- Horizon: {s.constraints.time.horizon_months} months")
        st.markdown(f"- First signal: {s.constraints.time.first_signal_months} months")
        st.markdown("**Leadership posture**")
        st.info(s.axis_exposure.posture_signal.replace('_', ' ').title())

    with left:
        render_card(scenario_a)

    with center:
        st.markdown("### Trade-offs")
        for d in deltas:
            arrow = "⬅️" if d.direction == "A_over_B" else "➡️"
            st.markdown(f"**{d.axis.replace('_', ' ').title()}** {arrow}  \n{d.interpretation}")

    with right:
        render_card(scenario_b)

    st.divider()

    narrative = generate_narrative(scenario_a, scenario_b, deltas, asymmetry)

    st.markdown("## Executive Decision Narrative")
    st.markdown(narrative["headline"])
    for b in narrative["bullets"]:
        st.markdown(f"- {b}")
    st.markdown("---")
    st.markdown(narrative["framing"])

    # ======================================================
    # STEP 5 — CLEAR SCENARIO (RETURN TO BASELINE)
    # ======================================================

    if st.button("Clear Scenario"):
        context_v1 = st.session_state.get("context_v1")
        if context_v1:
            context_v1 = reset_scenario_overrides(context_v1)
            st.session_state["context_v1"] = context_v1
