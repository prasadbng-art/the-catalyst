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
            people: catalystData.peak_psi_band.mean * 100,
            cost:
                Math.abs(catalystData.margin_band.mean) * 100,
            execution:
                Math.log10(
                    Math.abs(catalystData.ebitda_band.mean) + 1
                ) * 20,
            macro:
                catalystData.capital_trough_band.mean * 100,
        }
        : {
            people: 40,
            cost: 40,
            execution: 40,
            macro: 40,
        };

    const canonicalStress: StressProfile = {
        people:
            baseStress.people *
            (1 - improvementPct * 1.8),
        cost:
            baseStress.cost *
            (1 - improvementPct * 0.8),
        execution:
            baseStress.execution *
            (1 - improvementPct * 0.5),
        macro: baseStress.macro,
    };

    function getDominantStress(stress: StressProfile) {
        return (
            Object.entries(stress).sort(
                (a, b) => b[1] - a[1]
            )[0][0] as keyof StressProfile
        );
    }

    const dominantStress =
        getDominantStress(canonicalStress);

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
                minHeight: "100vh",
                background: "#020617",
                padding: 20,
                display: "grid",
                gridTemplateColumns: "320px 1fr 380px",
                gap: 24,
            }}
        >
            {/* LEFT PANEL */}
            <div>
                <SimulationControlsPanel
                    persona={persona}
                    onPersonaChange={setPersona}
                    timeHorizon={3}
                    onTimeHorizonChange={() => { }}
                    onApply={handleApplySimulation}
                    onReset={handleResetSimulation}
                />
            </div>

            {/* CENTER PANEL */}
            <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
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

                <div style={{ marginTop: 30 }}>
                    <MagicCube
                        stress={canonicalStress}
                        rawStress={baseStress}
                        persona={persona}
                        size={400}
                        showAnnotation={false}
                    />
                </div>

                <div style={{ marginTop: 20, color: "#cbd5f5" }}>
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
            <div>
                <RetentionSimulatorPanel resetSignal={resetCounter} />
            </div>
        </div>
    );
}