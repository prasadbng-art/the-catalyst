import PageShell from "../components/layout/PageShell";
import { demoOrganizationState } from "../demo/demoOrganizationState";
import SimulationCard from "./retention-simulator/SimulationCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTERVENTIONS = [
    { key: "none", label: "No Action" },
    { key: "leadership", label: "Leadership Coaching" },
    { key: "compensation", label: "Compensation Adjustment" },
    { key: "mobility", label: "Internal Mobility Opportunity" },
    { key: "role_redesign", label: "Role Redesign" },
];

export default function RetentionSimulatorPage() {
    const [simulatedRisks, setSimulatedRisks] = useState<
        Record<string, number | null>
    >({});

    const navigate = useNavigate();

    // ================= Aggregation =================
    const baselineAvgRisk =
        demoOrganizationState.people.entities.reduce(
            (sum, e) => sum + e.baselineRiskPct,
            0
        ) / demoOrganizationState.people.entities.length;

    const simulatedValues = Object.values(simulatedRisks).filter(
        (v): v is number => v !== null
    );

    const simulatedAvgRisk =
        simulatedValues.length > 0
            ? simulatedValues.reduce((sum, v) => sum + v, 0) /
            simulatedValues.length
            : null;

    const deltaPct =
        simulatedAvgRisk !== null
            ? Math.round((simulatedAvgRisk - baselineAvgRisk) * 10) / 10
            : null;

    const handleSendToFinancials = () => {
        if (deltaPct === null) return;
        navigate(`/financial-simulation?attritionDelta=${deltaPct}`);
    };

    const handleSimulate = (id: string, simulatedRisk: number | null) => {
        setSimulatedRisks((prev) => ({
            ...prev,
            [id]: simulatedRisk,
        }));
    };

    return (
        <PageShell>
            <div style={{ maxWidth: 1200, padding: 24 }}>

                {/* ================= PAGE HEADER ================= */}
                <div style={{ marginBottom: 24 }}>
                    <h1>Retention Intervention Simulator</h1>
                    <p style={{ opacity: 0.75 }}>
                        This page explores hypothetical retention interventions.
                        All outcomes shown are simulated.
                    </p>
                </div>

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
                            }}
                        >
                            {deltaPct < 0 ? "" : "+"}
                            {deltaPct}% attrition risk change
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                            Based on simulated outcomes for selected individuals only.
                        </div>

                        {/* ✅ NEW: Send to Financial Simulation */}
                        <button
                            onClick={handleSendToFinancials}
                            style={{
                                marginTop: "16px",
                                padding: "10px 14px",
                                background: "#1d4ed8",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
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
                        Select a personalized intervention to explore how individual attrition
                        risk may change under different assumptions.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {demoOrganizationState.people.entities.map((entity) => (
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

                {/* ================= CTA ZONE ================= */}
                <div style={{ marginTop: 32 }}>
                    <button
                        onClick={() => {
                            window.location.href = "/baseline";
                        }}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 6,
                            border: "1px solid #1e293b",
                            background: "#020617",
                            color: "#e5e7eb",
                            cursor: "pointer",
                        }}
                    >
                        Home
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
