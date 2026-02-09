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
                            persona={"CFO"}
                            onPersonaChange={() => { }}
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
                        minHeight: "520px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        gap: 16,
                    }}
                >
                    <strong>Organizational Response</strong>

                    <div style={{ fontSize: 13, color: "#cbd5f5", marginBottom: 12, }}>
                        Retention interventions adjust workforce risj, which propagates into
                        organizational stress and financial exposure.
                    </div>

                    <MagicCube
                        stress={simulatedStress ?? baseOrgState.stress}
                        persona={persona}
                        size={420}
                    />

                    <div
                        style={{
                            marginTop: 12,
                            fontSize: 13,
                            color: "#94a3b8",
                        }}
                    >
                        {scenarioDeltaPct !== null
                            ? "Visualizing simulated organizational state after retention actions."
                            : "Visualizing baseline organizational state."}
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
                            <div style={{ fontSize: 22, fontWeight: 600 }}>
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
        </div>
    );
}
