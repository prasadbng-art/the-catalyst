import RetentionSimulatorPanel from "../components/RetentionSimulatorPanel";
import SimulationControlsPanel from "../components/SimulationControlsPanel";
import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import { baseOrgState } from "../state/orgState";
import { getScenarioAttritionDelta } from "../state/scenarioState";
import { getSimulatedStress } from "../state/simulatedStressState";
import type { Persona } from "../types/persona";

export default function UnifiedSimulationPage() {
    const [persona, setPersona] = useState<Persona>("CEO");
    const scenarioDeltaPct = getScenarioAttritionDelta();
    const simulatedStress = getSimulatedStress();
    const effectiveStress = simulatedStress ?? baseOrgState.stress;
    const dominantStress = getDominantStress(effectiveStress);
    const DOMINANT_STRESS_NARRATIVE: Record<
        Persona,
        Record<"people" | "cost" | "execution" | "macro", string>
    > = {
        CEO: {
            people:
                "People-related strain is the dominant pressure, signaling potential risk to overall organizational stability.",
            cost:
                "Cost pressure is the primary destabilizing force, potentially limiting strategic flexibility.",
            execution:
                "Execution constraints are restricting the organization’s ability to convert intent into outcomes.",
            macro:
                "External conditions are exerting pressure beyond internal control, increasing enterprise uncertainty.",
        },

        CFO: {
            people:
                "Elevated people stress may translate into productivity loss and increased cost exposure.",
            cost:
                "Cost pressure is the dominant risk driver, indicating heightened financial volatility and margin risk.",
            execution:
                "Execution inefficiencies may amplify costs and reduce return on invested initiatives.",
            macro:
                "Macroeconomic pressure increases financial uncertainty and complicates forecasting assumptions.",
        },

        CHRO: {
            people:
                "People-related stress signals heightened retention risk, engagement erosion, and potential burnout.",
            cost:
                "Cost pressure may constrain people investments, indirectly increasing attrition and engagement risk.",
            execution:
                "Execution stress suggests role clarity gaps, capability misalignment, or workload imbalance.",
            macro:
                "External pressures may be increasing workforce anxiety and negatively affecting morale and retention.",
        },
    };


    function getDominantStress(stress: typeof baseOrgState.stress) {
        return (Object.entries(stress) as [keyof typeof stress, number][])
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    return (
        <div
            style={{
                height: "100vh",
                background: "#020617",
                padding: "32px",
                display: "grid",
                gridTemplateRows: "1fr auto",
                gap: 32,
            }}
        >
            {/* ================= TOP GRID ================= */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr 360px",
                    gap: 32,
                    alignItems: "stretch",
                    minHeight: 0,
                }}
            >
                {/* LEFT PANEL */}
                <div
                    style={{
                        border: "2px dashed #38bdf8",
                        borderRadius: 12,
                        padding: 16,
                        overflowY: "auto",
                        minHeight: 0,
                    }}
                >
                    <strong>Simulation Controls</strong>

                    <div style={{ marginTop: 16 }}>
                        <SimulationControlsPanel
                            persona={persona}
                            onPersonaChange={setPersona}
                            timeHorizon={3}
                            onTimeHorizonChange={() => { }}
                            onApply={() => { }}
                            onReset={() => { }}
                        />
                    </div>

                </div>

                {/* CENTER PANEL */}
                <div
                    style={{
                        border: "2px dashed #22c55e",
                        borderRadius: 12,
                        padding: 24,
                        display: "grid",
                        gridTemplateColumns: "1fr 260px",
                        gap: 24,
                        alignItems: "start",
                    }}
                >
                    {/* LEFT — MAGIC CUBE */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <MagicCube
                            stress={simulatedStress ?? baseOrgState.stress}
                            persona={persona}
                            size={400}
                            showAnnotation={false}
                        />
                    </div>

                    {/* RIGHT — NARRATIVE */}
                    <div
                        style={{
                            border: "1px solid #1e293b",
                            borderRadius: 8,
                            padding: 12,
                            background: "#020617",
                            fontSize: 13,
                            color: "#cbd5f5",
                            lineHeight: 1.5,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                color: "#94a3b8",
                                marginBottom: 6,
                            }}
                        >
                            Interpretive Lens
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                            Dominant stress driver: {dominantStress.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 13 }}>
                            {DOMINANT_STRESS_NARRATIVE[persona][dominantStress]}
                        </div>

                        <div style={{ fontSize: 12, color: "#64748b" }}>
                            {scenarioDeltaPct !== null
                                ? "Reflects applied retention interventions."
                                : "Reflects baseline organizational conditions."}
                        </div>
                    </div>
                </div>


                {/* RIGHT PANEL */}
                <div
                    style={{
                        border: "2px dashed #f97316",
                        borderRadius: 12,
                        padding: 16,
                        minHeight: "520px",
                        overflowY: "auto",
                    }}
                >
                    <strong>Retention Levers</strong>

                    <div style={{ marginTop: 16 }}>
                        <RetentionSimulatorPanel />
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM PANEL ================= */}
            <div
                style={{
                    border: "2px dashed #eab308",
                    borderRadius: 12,
                    padding: 16,
                }}
            >
                <strong>Financial Outcomes</strong>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 24,
                        marginTop: 16,
                    }}
                >
                    {/* BASELINE */}
                    <div
                        style={{
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid #1e293b",
                            background: "#020617",
                        }}
                    >
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                            Baseline (No Retention Action)
                        </div>

                        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>
                            $0
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                            Expected cost avoided
                        </div>
                    </div>

                    {/* AFTER */}
                    <div
                        style={{
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid #2563eb",
                            background: "#020617",
                        }}
                    >
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                            After Retention Scenario
                        </div>
                        <div
                            style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: "#94a3b8",
                            }}
                        >
                            Driven by applied retention interventions
                        </div>


                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 600,
                                marginTop: 6,
                                color: "#22c55e",
                            }}
                        >
                            {scenarioDeltaPct === null
                                ? "$0"
                                : `$${Math.round(Math.abs(scenarioDeltaPct) * 460000).toLocaleString()}`}
                        </div>

                    </div>

                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                        Expected cost avoided
                    </div>
                </div>
            </div>

        </div>

    );
}
