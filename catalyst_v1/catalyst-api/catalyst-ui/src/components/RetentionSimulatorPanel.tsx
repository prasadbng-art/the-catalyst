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

type RetentionSimulatorPanelProps = {
    resetSignal: number;
};

export default function RetentionSimulatorPanel({
    resetSignal,
}: RetentionSimulatorPanelProps) {
    const people = demoOrganizationState.people.entities;

    const [simulatedRisks, setSimulatedRisks] =
        useState<Record<string, number | null>>({});

    const [costImpacts, setCostImpacts] =
        useState<Record<string, number>>({});

    /* Reset simulation */
    useEffect(() => {
        setSimulatedRisks({});
    }, [resetSignal]);

    /* Baseline average risk */
    const baselineAvgRisk =
        people.reduce((sum, p) => sum + p.baselineRiskPct, 0) /
        people.length;

    /* Simulated average risk */
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

    const totalInterventionCost =
        Object.values(costImpacts).reduce((a, b) => a + b, 0)

    /* Push delta into global scenario state */
    useEffect(() => {
        if (deltaPct !== null) {
            setScenarioAttritionDelta(Math.round(deltaPct));
            (window as any).scenarioInterventionCost = totalInterventionCost
        }
    }, [deltaPct]);

    /* Simulation handler */
    const handleSimulate = (
        id: string,
        simulatedRisk: number | null,
        costImpact: number
    ) => {
        setSimulatedRisks((prev) => ({
            ...prev,
            [id]: simulatedRisk,
        }));
        setCostImpacts(prev => ({
            ...prev,
            [id]: costImpact
        }))
    };

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* Impact header */}
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
                        }}
                    >
                        {deltaPct < 0 ? "" : "+"}
                        {deltaPct}% attrition risk change
                    </div>
                </div>
            )}

            {/* Retention cards */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    height: 710,
                    overflowY: "auto",
                    paddingRight: 6,
                    scrollBehavior: "smooth",
                    scrollbarWidth: "thin"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18
                    }}
                ></div>
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