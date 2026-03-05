import { useEffect, useState } from "react";
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

/* =========================================================
   Role cost weighting (replacement cost multiplier)
========================================================= */

const ROLE_COST_WEIGHT: Record<string, number> = {
    CEO: 4.0,
    VP: 3.0,
    Director: 2.2,
    Manager: 1.6,
    Lead: 1.3,
    Senior: 1.2,
    Analyst: 1.0,
    Associate: 0.9,
};

type RetentionSimulatorPanelProps = {
    resetSignal: number;
};

export default function RetentionSimulatorPanel({
    resetSignal,
}: RetentionSimulatorPanelProps) {
    const [simulatedRisks, setSimulatedRisks] = useState<
        Record<string, number | null>
    >({});

    // 🔑 HARD RESET when baseline reset is triggered
    useEffect(() => {
        setSimulatedRisks({});
    }, [resetSignal]);

    const people = demoOrganizationState.people.entities;

    const baselineAvgRisk =
        people.reduce((sum, p) => sum + p.baselineRiskPct, 0) / people.length;

    let weightedRiskSum = 0;
    let weightTotal = 0;

    people.forEach((person) => {

        const simulated = simulatedRisks[person.id];

        const risk =
            simulated !== undefined && simulated !== null
                ? simulated
                : person.baselineRiskPct;

        const weight =
            ROLE_COST_WEIGHT[person.role] ?? 1.0;

        weightedRiskSum += risk * weight;
        weightTotal += weight;

    });

    const simulatedAvgRisk = weightedRiskSum / weightTotal;

    const deltaPct =
        simulatedAvgRisk !== null
            ? Math.round((simulatedAvgRisk - baselineAvgRisk) * 10) / 10
            : null;

    const handleSimulate = (id: string, simulatedRisk: number | null) => {
        setSimulatedRisks((prev) => {
            const next = { ...prev, [id]: simulatedRisk };

            const values = Object.values(next).filter(
                (v): v is number => v !== null
            );

            if (values.length > 0) {
                const avg =
                    values.reduce((sum, v) => sum + v, 0) / values.length;

                const delta =
                    Math.round((avg - baselineAvgRisk) * 10) / 10;

                setScenarioAttritionDelta(Math.round(delta));
            }

            return next;
        });
    };

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 16
            }}
        >
            {/* ================= IMPACT HEADER (PINNED) ================= */}
            {deltaPct !== null && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        marginBottom: 20,
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: "#020617",
                        border: "1px solid #1e293b",
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
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    overflowY: "scroll",
                    paddingRight: 10,
                }}

            >
                {people.map((entity) => (
                    <SimulationCard
                        key={`${entity.id}-${resetSignal}`}
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
