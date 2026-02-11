import RetentionSimulatorPanel from "../components/RetentionSimulatorPanel";
import SimulationControlsPanel from "../components/SimulationControlsPanel";
import { useState } from "react";
import MagicCube from "../components/visuals/MagicCube";
import { baseOrgState } from "../state/orgState";
import { clearScenarioAttritionDelta, getScenarioAttritionDelta, } from "../state/scenarioState";
import { getSimulatedStress, setSimulatedStress } from "../state/simulatedStressState";
import type { Persona } from "../types/persona";
import type { StressProfile } from "../components/visuals/motion";

const DEMO_STRESS: Record<
    "cost" | "people" | "execution" | "macro",
    StressProfile
> = {
    cost: {
        cost: 0.85,
        people: 0.45,
        execution: 0.40,
        macro: 0.30,
    },
    people: {
        cost: 0.45,
        people: 0.85,
        execution: 0.50,
        macro: 0.35,
    },
    execution: {
        cost: 0.50,
        people: 0.45,
        execution: 0.85,
        macro: 0.35,
    },
    macro: {
        cost: 0.55,
        people: 0.45,
        execution: 0.50,
        macro: 0.85,
    },
};

export default function UnifiedSimulationPage() {
    const [applyError, setApplyError] = useState<string | null>(null);
    const [demoLens, setDemoLens] =
        useState<"cost" | "people" | "execution" | "macro">("cost");

    const BASELINE_ATTRITION_UNITS = 124_121;
    const COST_PER_UNIT = 375;
    const BASELINE_COST =
        BASELINE_ATTRITION_UNITS * COST_PER_UNIT;
    const [persona, setPersona] = useState<Persona>("CEO");
    const [scenarioDeltaPct, setLocalScenarioDeltaPct] = useState<number | null>(null);
    const isSimulationActive = scenarioDeltaPct
    const simulatedStress = getSimulatedStress();
    const cubeStress: StressProfile =
        isSimulationActive && simulatedStress
            ? simulatedStress
            : DEMO_STRESS[demoLens];
    DEMO_STRESS[demoLens] ??
        baseOrgState.stress
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
    const handleApplySimulation = () => {
        const delta = getScenarioAttritionDelta();

        if (delta === null) {
            setApplyError("Please select at least one retetion intervention before applying the simulation.");
            return;
        }
        setApplyError(null);
        // Persist delta
        setLocalScenarioDeltaPct(delta);
        const intensity = Math.abs(delta) / 100;
        setSimulatedStress({
            people: Math.max(0, baseOrgState.stress.people - intensity * 0.7),
            cost: Math.max(0, baseOrgState.stress.cost - intensity * 0.35),
            execution: Math.max(0, baseOrgState.stress.execution - intensity * 0.2),
            macro: baseOrgState.stress.macro,
        });

        // Exit demo mode
        setDemoLens("cost");

        // Force stress update
        setSimulatedStress({ ...baseOrgState.stress });
    };

    const [resetCounter, setResetCounter] = useState(0);
    const handleResetSimulation = () => {
        clearScenarioAttritionDelta();
        setSimulatedStress(null);
        setLocalScenarioDeltaPct(null);
        setResetCounter((c) => c + 1);
    };
    // ---------------- FINANCIAL LOGIC (LOCKED) ----------------

    // Normalize and clamp scenario delta
    const rawDelta = scenarioDeltaPct !== null
        ? scenarioDeltaPct
        : 0;

    // If value looks like 13 or -13 → treat as percent
    // If value looks like 0.13 → treat as fraction
    const normalizedImprovement =
        Math.abs(rawDelta) > 1
            ? Math.abs(rawDelta) / 100
            : Math.abs(rawDelta);

    // Clamp to 100% max improvement (cannot save more than baseline)
    const improvementPct = Math.min(normalizedImprovement, 1);

    // Final avoided cost (THIS is what UI should show)
    const avoidedCost = Math.round(BASELINE_COST * improvementPct);

    // ---------------- CONSOLE VERIFICATION ----------------
    return (
        <div
            style={{
                minHeight: "100vh",
                maxHeight: 560,
                background: "#020617",
                padding: "20px",
                display: "grid",
                gridTemplateRows: "minmax(520px,max-content) auto",
                gap: 8,
            }}
        >
            {/* ================= TOP GRID ================= */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr 360px",
                    gridTemplateRows: "minmax(auto,600px)auto",
                    gap: 32,
                    alignItems: "stretch",
                    minHeight: 0,
                    maxHeight: 560,
                }}
            >
                {/* LEFT PANEL */}
                <div
                    style={{
                        border: "1px solid #1e293b",
                        background: "linear-gradient(180deg,#020617 0%, #020617 100%)",
                        boxShadow: "0, 12px 32px rgba(0,0,0,0.45)",
                        borderRadius: 14,
                        padding: 14,
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
                            onApply={handleApplySimulation}
                            onReset={handleResetSimulation}
                        />
                    </div>
                    {applyError && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: "10px 12px",
                                borderRadius: 8,
                                background: "rgba(220,38,38,0.08)",
                                border: "1px solid rgba(220,38,38,0.35)",
                                color: "#f87171",
                                fontSize: 12,
                            }}
                        >
                            {applyError}
                        </div>
                    )}

                </div>

                {/* CENTER PANEL */}
                <div
                    style={{
                        border: "1px solid #1e293b",
                        background: "linear-gradient(180deg, #020617 0%, #020617 100%)",
                        boxShadow: "0, 12px 32px rgba(0,0,0,0.45)",
                        borderRadius: 12,
                        padding: 14,
                        display: "grid",
                        gridTemplateColumns: "1fr 260px",
                        gap: 24,
                        alignItems: "start",
                    }}
                >
                    {/* ================= Demo Stress Lens ================= */}
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 12,
                            justifyContent: "center",
                        }}
                    >
                        {([
                            { key: "cost", label: "Cost Pressure" },
                            { key: "people", label: "People Stress" },
                            { key: "execution", label: "Execution Load" },
                            { key: "macro", label: "External Conditions" },
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setDemoLens(key)}
                                style={{
                                    padding: "6px 10px",
                                    fontSize: 12,
                                    borderRadius: 999,
                                    cursor: "pointer",
                                    background: demoLens === key ? "#1d4ed8" : "#020617",
                                    border:
                                        demoLens === key
                                            ? "1px solid #3b82f6"
                                            : "1px solid #1e293b",
                                    color: demoLens === key ? "#e5e7eb" : "#94a3b8",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* LEFT — MAGIC CUBE */}
                    <div style={{ gridColumn: "1/-2", display: "flex", justifyContent: "center", alignItems: "center", }}>
                        <MagicCube
                            stress={cubeStress} // 🔒 DEMO-ONLY stress
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
                            padding: 14,
                            background: "#020617",
                            fontSize: 13,
                            color: "#cbd5f5",
                            lineHeight: 1.5,
                            maxHeight: 160,
                            overflow: "hidden",
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
                        border: "1px solid #1e293b",
                        background: "linear-gradient(180deg, #020617 0%, #020617 100%)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                        borderRadius: 12,
                        padding: 14,
                        minHeight: "520px",
                        overflowY: "auto",
                    }}
                >
                    <strong>Retention Levers</strong>

                    <div style={{ marginTop: 16 }}>
                        <RetentionSimulatorPanel resetSignal={resetCounter} />
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM PANEL ================= */}
            <div
                style={{
                    border: "1px solid #1e293b",
                    background: "linear-gradient(180deg, #020617 0%, #020617 100%)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                    borderRadius: 12,
                    padding: 14,
                    marginTop: 0,
                }}
            >
                <strong>Financial Outcomes</strong>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto auto",
                        gap: 26,
                        marginTop: 6,
                    }}
                >
                    {/* BASELINE */}
                    <div
                        style={{
                            padding: 14,
                            borderRadius: 12,
                            border: "1px solid #f7060e",
                            background: "#020617",
                        }}
                    >
                        <div style={{
                            fontSize: 12, opacity: 0.7,
                        }}>
                            Baseline (No Retention Action)
                        </div>

                        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>
                            ${BASELINE_COST.toLocaleString("en-US")}
                        </div>
                    </div>

                    {/* AFTER */}
                    <div
                        style={{
                            padding: 14,
                            borderRadius: 12,
                            border: "1px solid #2475f7",
                            background: "#020617",
                            boxShadow: "0 0 0 1px rgba(37,99,235,0.4), 0 8px 24px rgba(0,0,0,0.45)",
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
                            ${avoidedCost.toLocaleString("en-US")}
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                            Expected cost avoided
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
