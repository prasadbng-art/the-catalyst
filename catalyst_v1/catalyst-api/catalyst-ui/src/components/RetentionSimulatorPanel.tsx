import { useState } from "react";
import { demoOrganizationState } from "../demo/demoOrganizationState";
import SimulationCard from "../pages/retention-simulator/SimulationCard";
//import { baseOrgState } from "../state/orgState";
//import { setSimulatedStress } from "../state/simulatedStressState";

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
        setSimulatedRisks((prev) => ({
            ...prev,
            [id]: simulatedRisk,
        }));
    };

    return (
        <div>
            {deltaPct !== null && (
                <div
                    style={{
                        marginBottom: 24,
                        padding: 16,
                        borderRadius: 8,
                        background: "#020617",
                        border: "1px solid #1e293b",
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
                </div>
            )}

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
