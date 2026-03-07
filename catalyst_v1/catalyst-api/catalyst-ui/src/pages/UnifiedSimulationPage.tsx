import RetentionSimulatorPanel from "../components/RetentionSimulatorPanel";
import SimulationControlsPanel from "../components/SimulationControlsPanel";
import { useState, useEffect } from "react";
import MagicCube from "../components/visuals/MagicCube";
import {
    runCatalystSimulation,
    type CatalystSimulationResponse,
} from "../api/simulation";
import type { Persona } from "../types/persona";
import { getMotionState } from "../components/visuals/motion";
import type { StressProfile } from "../components/visuals/motion";
import { getScenarioAttritionDelta } from "../state/scenarioState";
type Scenario = {
    name: string
    stress: StressProfile
}

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
    const [showAiSimulation, setShowAiSimulation] = useState(false);

    const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});
    const [activeScenario] = useState<string>("live");

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
        const delta = getScenarioAttritionDelta();
        setScenarioDeltaPct(delta);
    }

    function handleResetSimulation() {
        setScenarioDeltaPct(null);
        setCatalystData(null);
        setResetCounter((c) => c + 1);
    }

    // ================= STRESS PIPELINE =================

    const rawDelta = scenarioDeltaPct ?? 0;
    const interventionCost =
        (window as any).scenarioInterventionCost ?? 0

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

    useEffect(() => {
        if (!scenarios["baseline"]) {
            setScenarios(prev => ({
                ...prev,
                baseline: {
                    name: "Baseline",
                    stress: baseStress
                }
            }));
        }
    }, [baseStress]);

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
            (1 - improvementPct * 0.8) +
            Math.min(interventionCost / 500000, 15),
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

    const motionState = getMotionState(aiAdjustedStress);

    let systemState = "ORGANIZATIONAL EQUILIBRIUM";

    if (motionState === "tension") {
        systemState = "STRUCTURAL TENSION";
    }

    if (motionState === "overload") {
        systemState = "SYSTEM OVERLOAD";
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
    <div
        style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            border: "1px solid #1e293b",
            background: "#020617",
            maxWidth: 520
        }}
    >
        <div
            style={{
                fontSize: 11,
                opacity: 0.7,
                marginBottom: 6,
                letterSpacing: "0.05em"
            }}
        >
            EXECUTIVE INSIGHT
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            {generateExecutiveInsight()}
        </div>
    </div>
    function generateExecutiveInsight() {

        if (dominantStress === "cost") {
            return "Cost pressure is the dominant constraint. Current interventions may reduce people risk but increase financial stress."
        }

        if (dominantStress === "people") {
            return "Workforce strain is the primary destabilizer. Retention interventions are improving stability but may require cost trade-offs."
        }

        if (dominantStress === "execution") {
            return "Execution friction is slowing delivery. Organizational workload or structural design may require intervention."
        }

        return "External macro pressure is influencing system stability."
    }

    // ================= LAYOUT =================
    const cubeHaloStyle = `
    @keyframes cubeHalo {
        0% {
            transform: scale(0.95);
            opacity: 0.6;
        }
        100% {
            transform: scale(1.05);
            opacity: 0.9;
        }
    }
    `;
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                background: "#020617",
                display: "grid",
                gridTemplateColumns: "260px minmax(880px,1fr) 420px",
                gap: 24,
                maxWidth: 1800,
                margin: "0 auto",
                boxSizing: "border-box"
            }}
        >
            <style>{cubeHaloStyle}</style>

            {/* LEFT PANEL */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    paddingLeft: 16,
                    paddingTop: 36
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

                {/* AI PANEL */}

                <div
                    style={{
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 14,
                        background: "#020617"
                    }}
                >
                    <div
                        onClick={() => setShowAiSimulation(!showAiSimulation)}
                        style={{
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        Strategic Workforce Transition (AI)
                        <span style={{ opacity: 0.6 }}>
                            {showAiSimulation ? "▼" : "▶"}
                        </span>
                    </div>

                    {showAiSimulation && (
                        <div
                            style={{
                                marginTop: 12,
                                fontSize: 14,
                                color: "#cbd5f5",
                                lineHeight: 1.6
                            }}
                        >
                            <div>Roles Impacted: <strong>{rolesToReduce}</strong></div>
                            <div>Transition Timeline: <strong>{transitionYears} years</strong></div>
                            <div>Monthly Adjustment: <strong>{monthlyReduction}</strong></div>
                            <div style={{ marginTop: 6 }}>
                                Annual Cost Reduction: <strong>${annualCostReductionFormatted}</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* CENTER PANEL */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    paddingTop: 36
                }}
            >

                {/* GOVERNANCE BUTTONS */}

                <div
                    style={{
                        display: "flex",
                        gap: 16
                    }}
                >
                    {(["DEFENSIVE", "BALANCED", "AGGRESSIVE"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => runCatalyst(mode)}
                            style={{
                                fontSize: 12,
                                padding: "6px 12px",
                                borderRadius: 999,
                                background:
                                    governanceMode === mode ? "#1d4ed8" : "#111827",
                                border: "1px solid #334155",
                                color: "#e5e7eb",
                                cursor: "pointer"
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                {catalystLoading && (
                    <div style={{ color: "#94a3b8", marginTop: 10 }}>
                        Running Catalyst simulation...
                    </div>
                )}

                {/* MAGIC CUBE CARD */}

                <div
                    style={{
                        padding: "32px 36px",
                        borderRadius: 14,
                        border: "1px solid #1e293b",
                        background: "linear-gradient(180deg, rgba(2,6,23,0.8) 0%, rgba(2,6,23,0.6) 100%)",
                        boxShadow: "0 0 60px rgba(37,99,235,0.08)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 18,
                        width: "100%",
                        maxWidth: 680
                    }}
                >

                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: "0.08em",
                            color: "#94a3b8"
                        }}
                    >
                        SYSTEM STATE
                    </div>

                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600
                        }}
                    >
                        {systemState}
                    </div>

                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >

                        {/* Halo */}
                        <div
                            style={{
                                position: "absolute",
                                width: 420,
                                height: 420,
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(2,6,23,0) 70%)",
                                filter: "blur(18px)",
                                animation: "cubeHalo 8s ease-in-out infinite alternate"
                            }}
                        />

                        <MagicCube
                            stress={
                                activeScenario === "live"
                                    ? aiAdjustedStress
                                    : scenarios[activeScenario]?.stress || aiAdjustedStress
                            }
                            rawStress={baseStress}
                            persona={persona}
                            size={520}
                            showAnnotation={false}
                            baselineStress={baseStress}
                        />

                    </div>
                </div>


                {/* INSIGHT BLOCK */}

                <div
                    style={{
                        textAlign: "center",
                        maxWidth: 520,
                        color: "#cbd5f5"
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Dominant Stress Driver
                    </div>

                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            marginTop: 4
                        }}
                    >
                        {dominantStress.toUpperCase()}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        {DOMINANT_STRESS_NARRATIVE[persona][dominantStress]}
                    </div>

                    <div
                        style={{
                            marginTop: 14,
                            color: "#22c55e"
                        }}
                    >
                        Expected Cost Avoided: ${avoidedCost.toLocaleString()}
                    </div>
                </div>
            </div>


            {/* RIGHT PANEL */}

            <div
                style={{
                    borderLeft: "1px solid #1e293b",
                    paddingLeft: 20,
                    paddingRight: 8,
                    paddingTop: 36,
                    height: "calc(100vh - 120px)",
                    overflowY: "auto"
                }}
            >
                <RetentionSimulatorPanel resetSignal={resetCounter} />
            </div>

        </div>
    )
}