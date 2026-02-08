import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import { demoOrganizationState } from "../demo/demoOrganizationState";
import SimulationCard from "./retention-simulator/SimulationCard";
import { getScenarioAttritionDelta, setScenarioAttritionDelta } from "../state/scenarioState";

/* =========================================================
   Intervention catalog
========================================================= */
const INTERVENTIONS = [
    { key: "none", label: "No Action" },
    { key: "leadership", label: "Leadership Coaching" },
    { key: "compensation", label: "Compensation Adjustment" },
    { key: "mobility", label: "Internal Mobility Opportunity" },
    { key: "role_redesign", label: "Role Redesign" },
];

export default function RetentionSimulatorPage() {
    const navigate = useNavigate();

    /* =========================================================
       Per-employee simulated risks
       key = person.id
       value = simulated risk %
    ========================================================= */
    const [simulatedRisks, setSimulatedRisks] = useState<
        Record<string, number | null>
    >({});

    const people = demoOrganizationState.people.entities;

    /* =========================================================
       Baseline organization risk
    ========================================================= */
    const baselineAvgRisk =
        people.reduce((sum, p) => sum + p.baselineRiskPct, 0) / people.length;

    /* =========================================================
       Simulated organization risk
    ========================================================= */
    const simulatedValues = Object.values(simulatedRisks).filter(
        (v): v is number => v !== null
    );

    const simulatedAvgRisk =
        simulatedValues.length > 0
            ? simulatedValues.reduce((sum, v) => sum + v, 0) /
            simulatedValues.length
            : null;

    /* =========================================================
       Delta (what the financial model needs)
    ========================================================= */
    const deltaPct =
        simulatedAvgRisk !== null
            ? Math.round((simulatedAvgRisk - baselineAvgRisk) * 10) / 10
            : null;

    /* =========================================================
       Narrative helper
    ========================================================= */
    let narrative: string | null = null;

    if (deltaPct !== null) {
        if (deltaPct <= -2) {
            narrative =
                "Meaningful reduction in flight risk across targeted talent.";
        } else if (deltaPct < 0) {
            narrative = "Moderate localized retention improvement.";
        } else if (deltaPct === 0) {
            narrative = "No modeled change in retention risk.";
        } else {
            narrative =
                "Modeled interventions may be insufficient or misaligned.";
        }
    }

    /* =========================================================
       Handlers
    ========================================================= */
    const handleSimulate = (id: string, simulatedRisk: number | null) => {
        setSimulatedRisks((prev) => ({
            ...prev,
            [id]: simulatedRisk,
        }));
    };

    const handleSendToFinancials = () => {
        if (deltaPct === null) return;
        console.log("RS -> sending delta:", deltaPct);
        setScenarioAttritionDelta(deltaPct);
        navigate("/simulation");

    };

    /* =========================================================
       Render
    ========================================================= */
    return (
        <PageShell>
            <div style={{ maxWidth: 1200, padding: 24 }}>
                {/* ================= PAGE HEADER ================= */}
                <div style={{ marginBottom: 24 }}>
                    <h1>Retention Intervention Simulator</h1>
                    <p style={{ opacity: 0.75 }}>
                        Explore hypothetical retention interventions. All outcomes shown are
                        simulated.
                    </p>
                </div>

                {/* ================= ORG-LEVEL IMPACT ================= */}
                {deltaPct !== null && (
                    <div
                        style={{
                            marginBottom: 24,
                            padding: 16,
                            borderRadius: 8,
                            background: "#020617",
                            border: "1px solid #1e293b",
                            maxWidth: 720,
                            color: "#e5e7eb",
                        }}
                    >
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                            Simulated Organization-Level Impact
                        </div>

                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: deltaPct < 0 ? "#16a34a" : "#dc2626",
                                marginTop: 6,
                            }}
                        >
                            {deltaPct < 0 ? "" : "+"}
                            {deltaPct}% attrition risk change
                        </div>

                        {narrative && (
                            <div
                                style={{
                                    marginTop: 10,
                                    padding: 10,
                                    borderRadius: 6,
                                    background: "#0f172a",
                                    border: "1px solid #1e293b",
                                    fontSize: 13,
                                    color: "#cbd5f5",
                                }}
                            >
                                {narrative}
                            </div>
                        )}

                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                            Based on simulated outcomes for selected individuals only.
                        </div>

                        <button
                            onClick={handleSendToFinancials}
                            style={{
                                marginTop: 16,
                                padding: "10px 14px",
                                background: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Use This Scenario in Financial Simulation →
                        </button>
                    </div>
                )}

                {/* ================= SIMULATION CARDS ================= */}
                <section>
                    <h3>What-if Simulation</h3>

                    <p style={{ opacity: 0.75, marginBottom: 16 }}>
                        Select an intervention to explore how individual attrition risk may
                        change under different assumptions.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {people.map((entity) => (
                            <SimulationCard
                                key={entity.id}
                                entity={{
                                    id: entity.id,
                                    name: entity.name,
                                    role: entity.role,
                                    function: entity.function,
                                    currentRiskPct: entity.baselineRiskPct,
                                    riskDrivers: entity.riskDrivers,
                                }}
                                interventions={INTERVENTIONS}
                                onSimulate={handleSimulate}
                            />
                        ))}
                    </div>
                </section>

                {/* ================= CTA ================= */}
                <div style={{ marginTop: 32 }}>
                    <button
                        onClick={() => navigate("/baseline")}
                        style={{
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "1px solid #1d4ed8",
                            borderRadius: 12,
                            padding: "12px 20px",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        ← Home
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
