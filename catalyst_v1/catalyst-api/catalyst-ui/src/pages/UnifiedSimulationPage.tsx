import RetentionSimulatorPanel from "../components/RetentionSimulatorPanel";
import SimulationControlsPanel from "../components/SimulationControlsPanel";
import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import {
    runCatalystSimulation,
    type CatalystSimulationResponse,
} from "../api/simulation";
import type { Persona } from "../types/persona";
import type { StressProfile } from "../components/visuals/motion";

export default function UnifiedSimulationPage() {
    const [persona, setPersona] = useState<Persona>("CEO");

    const [governanceMode, setGovernanceMode] =
        useState<"DEFENSIVE" | "BALANCED" | "AGGRESSIVE">("BALANCED");

    const [catalystData, setCatalystData] =
        useState<CatalystSimulationResponse | null>(null);

    const [catalystLoading, setCatalystLoading] = useState(false);

    const [scenarioDeltaPct, setScenarioDeltaPct] =
        useState<number | null>(null);

    const [resetCounter, setResetCounter] = useState(0);

    const BASELINE_ATTRITION_UNITS = 124_121;
    const COST_PER_UNIT = 375;
    const BASELINE_COST =
        BASELINE_ATTRITION_UNITS * COST_PER_UNIT;

    const WORKFORCE_SIZE = 4000;

    // AI disruption parameters
    const aiExposure = 0.25;
    const automationEfficiency = 0.6;
    const transitionYears = 2;

    const rolesImpacted =
        WORKFORCE_SIZE * aiExposure * automationEfficiency;

    const rolesToReduce = Math.round(rolesImpacted);

    const transitionMonths = transitionYears * 12;
    const monthlyReduction =
        Math.round(rolesToReduce / transitionMonths);

    const averageSalary = 1200000;

    const annualCostReduction =
        rolesToReduce * averageSalary;

    const annualCostReductionFormatted =
        annualCostReduction.toLocaleString();


    // ================= CATALYST =================

    async function runCatalyst(mode: "DEFENSIVE" | "BALANCED" | "AGGRESSIVE") {
        try {
            setCatalystLoading(true);
            setGovernanceMode(mode);

            const result = await runCatalystSimulation({
                workforce_size: 4000,
                avg_cost_per_employee: 1200000,
                revenue_base: 5000000000,
                margin_base: 0.18,
                ai_exposure: 0.25,
                leadership_readiness: 0.7,
                margin_buffer: 0.2,
                capital_buffer: 0.6,
                governance_mode: mode,
            });

            setCatalystData(result);
        } catch (err) {
            console.error("Catalyst simulation failed:", err);
        } finally {
            setCatalystLoading(false);
        }
    }

    // ================= RETENTION =================

    function handleApplySimulation() {
        setScenarioDeltaPct(12);
    }

    function handleResetSimulation() {
        setScenarioDeltaPct(null);
        setCatalystData(null);
        setResetCounter((c) => c + 1);
    }

    // ================= STRESS PIPELINE =================

    const rawDelta = scenarioDeltaPct ?? 0;

    const normalizedImprovement =
        Math.abs(rawDelta) > 1
            ? Math.abs(rawDelta) / 100
            : Math.abs(rawDelta);

    const improvementPct = Math.min(normalizedImprovement, 1);

    const baseStress: StressProfile = catalystData
        ? {
            people: Math.min(catalystData.peak_psi_band.mean * 100, 100),
            cost: Math.min(Math.abs(catalystData.margin_band.mean) * 120, 100),
            execution: Math.min(
                Math.log10(Math.abs(catalystData.ebitda_band.mean) + 1) * 10,
                100
            ),
            macro: Math.min(catalystData.capital_trough_band.mean * 100, 100),
        }
        : {
            people: 40,
            cost: 40,
            execution: 40,
            macro: 40,
        };

    function applyGovernance(
        stress: StressProfile
    ): StressProfile {

        if (governanceMode === "DEFENSIVE") {
            return {
                people: stress.people * 0.9,
                cost: stress.cost * 1.1,
                execution: stress.execution * 0.7,
                macro: stress.macro,
            };
        }

        if (governanceMode === "AGGRESSIVE") {
            return {
                people: stress.people * 1.1,
                cost: stress.cost * 0.9,
                execution: stress.execution * 1.2,
                macro: stress.macro,
            };
        }

        return stress;
    }

    const governedStress = applyGovernance(baseStress);
    const canonicalStress: StressProfile = {
        people:
            governedStress.people *
            (1 - improvementPct * 1.8),
        cost:
            governedStress.cost *
            (1 - improvementPct * 0.8),
        execution:
            governedStress.execution *
            (1 - improvementPct * 0.9),
        macro: governedStress.macro * (1 - improvementPct * 0.3),
    };

    let aiAdjustedStress: StressProfile = { ...canonicalStress };

    if (rolesToReduce > 0) {
        const disruptionFactor =
            Math.min(rolesToReduce / WORKFORCE_SIZE, 0.25);

        const transitionShock =
            disruptionFactor * 10;

        aiAdjustedStress.people =
            canonicalStress.people + transitionShock * 0.6;

        aiAdjustedStress.execution =
            canonicalStress.execution + transitionShock * 0.8;

        aiAdjustedStress.cost =
            canonicalStress.cost * (1 - disruptionFactor * 0.6);
    }

    const stressValues = Object.values(aiAdjustedStress);
    const maxStress = Math.max(...stressValues);
    const minStress = Math.min(...stressValues);

    if (maxStress - minStress > 45) {
        const avg =
            stressValues.reduce((a, b) => a + b, 0) / 4;

        aiAdjustedStress.people =
            (aiAdjustedStress.people + avg) / 2;
        aiAdjustedStress.cost =
            (aiAdjustedStress.cost + avg) / 2;
        aiAdjustedStress.execution =
            (aiAdjustedStress.execution + avg) / 2;
        aiAdjustedStress.macro =
            (aiAdjustedStress.macro + avg) / 2;
    }

    function getDominantStress(stress: StressProfile) {
        return (
            Object.entries(stress).sort(
                (a, b) => b[1] - a[1]
            )[0][0] as keyof StressProfile
        );
    }

    const dominantStress =
        getDominantStress(aiAdjustedStress);

    const avgStress =
        (canonicalStress.people +
            canonicalStress.cost +
            canonicalStress.execution +
            canonicalStress.macro) / 4;

    let systemState = "ORGANIZATIONAL EQUILIBRIUM";

    if (avgStress > 60) {
        systemState = "SYSTEM OVERLOAD";
    } else if (avgStress > 40) {
        systemState = "STRUCTURAL TENSION";
    }

    const avoidedCost = Math.round(
        BASELINE_COST * improvementPct
    );

    const DOMINANT_STRESS_NARRATIVE: Record<
        Persona,
        Record<"people" | "cost" | "execution" | "macro", string>
    > = {
        CEO: {
            people:
                "People-related strain is the dominant destabilizer.",
            cost:
                "Cost pressure is constraining flexibility.",
            execution:
                "Execution friction is impairing delivery velocity.",
            macro:
                "External conditions are exerting systemic pressure.",
        },
        CFO: {
            people:
                "People stress may translate into productivity leakage.",
            cost:
                "Cost pressure heightens financial volatility risk.",
            execution:
                "Execution inefficiencies may erode returns.",
            macro:
                "Macroeconomic pressure increases forecasting risk.",
        },
        CHRO: {
            people:
                "People stress signals elevated burnout and retention risk.",
            cost:
                "Cost constraints may limit workforce investment.",
            execution:
                "Execution strain suggests workload imbalance.",
            macro:
                "External pressure may increase workforce anxiety.",
        },
    };

    // ================= LAYOUT =================

    return (
        <div
            style={{
                height: "100%",
                background: "#020617",
                display: "grid",
                gridTemplateColumns: "340px minmax(640px, 1fr) 560px",
                gap: 24,
                overflow: "hidden",
                boxSizing: "border-box",

            }}
        >
            {/* LEFT PANEL */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 24
                }}
            >
                <SimulationControlsPanel
                    persona={persona}
                    onPersonaChange={setPersona}
                    timeHorizon={3}
                    onTimeHorizonChange={() => { }}
                    onApply={handleApplySimulation}
                    onReset={handleResetSimulation}
                />

                {/* AI DISRUPTION SIMULATION */}
                <div
                    style={{
                        padding: "16px 18px",
                        border: "1px solid #1e293b",
                        borderRadius: 10,
                        background: "#020617"
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: "0.05em",
                            color: "#94a3b8",
                            marginBottom: 10
                        }}
                    >
                        AI DISRUPTION SIMULATION
                    </div>

                    <div style={{ marginBottom: 6 }}>
                        Roles Impacted: <strong>{rolesToReduce}</strong>
                    </div>

                    <div style={{ marginBottom: 6 }}>
                        Transition Timeline: <strong>{transitionYears} years</strong>
                    </div>

                    <div style={{ marginBottom: 6 }}>
                        Monthly Workforce Adjustment: <strong>{monthlyReduction}</strong>
                    </div>

                    <div style={{ color: "#22c55e", marginTop: 6 }}>
                        Annual Cost Reduction: <strong>${annualCostReductionFormatted}</strong>
                    </div>
                </div>
            </div>

            {/* CENTER PANEL */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textAlign: "center",
                    gap: 18,
                    paddingTop: 10,
                    height: "100%",
                    overflow: "hidden"
                }}
            >
                {/* GOVERNANCE BUTTONS */}
                <div
                    style={{
                        display: "flex",
                        gap: 18,
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {(["DEFENSIVE", "BALANCED", "AGGRESSIVE"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => runCatalyst(mode)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 999,
                                background:
                                    governanceMode === mode
                                        ? "#1d4ed8"
                                        : "#111827",
                                border: "1px solid #334155",
                                color: "#e5e7eb",
                                cursor: "pointer",
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {catalystLoading && (
                    <div style={{ marginTop: 10, color: "#94a3b8" }}>
                        Running AI transition simulation...
                    </div>
                )}

                <div
                    style={{
                        padding: "24px 28px",
                        borderRadius: 12,
                        border: "1px solid #1e293b",
                        background: "rgba(2,6,23,0.6)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        width: "100%",
                        maxWidth: 520
                    }}
                >

                    <div
                        style={{
                            color: "#94a3b8",
                            fontSize: 12,
                            letterSpacing: "1px",
                        }}
                    >
                        SYSTEM STATE
                    </div>

                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            marginBottom: 12,
                            color: "#e2e8f0",
                        }}
                    >
                        {systemState}
                    </div>

                    <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: "0.08em" }}>
                        ORGANIZATIONAL STRESS FIELD
                    </div>

                    <MagicCube
                        stress={aiAdjustedStress}
                        rawStress={baseStress}
                        persona={persona}
                        size={460}
                        showAnnotation={false}
                        baselineStress={baseStress}
                    />

                </div>

                <div
                    style={{
                        marginTop: 20,
                        color: "#cbd5f5",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        maxWidth: 520,
                        textAlign: "center"
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Dominant Stress Driver
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                        {dominantStress.toUpperCase()}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        {DOMINANT_STRESS_NARRATIVE[persona][dominantStress]}
                    </div>

                    <div style={{ marginTop: 16, color: "#22c55e" }}>
                        Expected Cost Avoided: ${avoidedCost.toLocaleString()}
                    </div>

                </div>
            </div>

            {/* RIGHT PANEL */}
            <div
                style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingLeft: 18,
                    paddingRight: 12,
                    borderLeft: "1px solid #1e293b",

                }}
            >
                <RetentionSimulatorPanel resetSignal={resetCounter} />
            </div>
        </div>
    )
}