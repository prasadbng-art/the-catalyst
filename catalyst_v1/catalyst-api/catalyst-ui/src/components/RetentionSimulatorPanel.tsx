import { useState } from "react";
import { demoOrganizationState } from "../demo/demoOrganizationState";
import SimulationCard from "../pages/retention-simulator/SimulationCard";
import { setScenarioAttritionDelta } from "../state/scenarioState";

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

export default function RetentionSimulatorPanel() {
    const [simulatedRisks, setSimulatedRisks] = useState<
        Record<string, number | null>
    >({});

    const people = demoOrganizationState.people.entities;

    const baselineAvgRisk =
        people.reduce((sum, p) => sum + p.baselineRiskPct, 0) / people.length;

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

    const handleSimulate = (id: string, simulatedRisk: number | null) => {
        setSimulatedRisks((prev) => {
            const next = { ...prev, [id]: simulatedRisk };

            // 🔑 PUBLISH SCENARIO DELTA HERE
            if (deltaPct !== null) {
                setScenarioAttritionDelta(Math.round(deltaPct));
            }

            return next;
        });
    };

    return (
        <div>
            {/* ================= IMPACT HEADER (PINNED) ================= */}
            {deltaPct !== null && (
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        marginBottom: 16,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#020617",
                        border: "1px solid #1e293b",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            opacity: 0.6,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                        }}
                    >
                        Simulated Organization Impact
                    </div>

                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: deltaPct < 0 ? "#16a34a" : "#dc2626",
                            marginTop: 4,
                        }}
                    >
                        {deltaPct < 0 ? "" : "+"}
                        {deltaPct}% attrition risk change
                    </div>
                </div>
            )}

            {/* ================= RETENTION LEVERS ================= */}
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
        </div>
    );
}
