import { useState } from "react";

type InterventionEffect = {
    riskDelta: number
    costDelta: number
}

const INTERVENTION_EFFECTS: Record<string, InterventionEffect> = {
    leadership: { riskDelta: -12, costDelta: 6000 },
    compensation: { riskDelta: -15, costDelta: 18000 },
    mobility: { riskDelta: -10, costDelta: 3000 },
    role_redesign: { riskDelta: -8, costDelta: 1200 },
}

type Intervention = {
    key: string;
    label: string;
};

type SimulationEntity = {
    id: string;
    name: string;
    role: string;
    function: string;
    currentRiskPct: number;
    riskDrivers: readonly string[];
};

type Props = {
    entity: SimulationEntity;
    interventions: Intervention[];
    onSimulate: (
        id: string,
        simulatedRisk: number | null,
        costImpact: number
    ) => void;
};

export default function SimulationCard({
    entity,
    interventions,
    onSimulate,
}: Props) {
    const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null);
    const [selectedIntervention, setSelectedIntervention] = useState("none");

    const calculateImpact = (intervention: string) => {
        if (!INTERVENTION_EFFECTS[intervention]) return null

        const effect = INTERVENTION_EFFECTS[intervention]

        const newRisk = Math.max(
            entity.currentRiskPct + effect.riskDelta,
            0
        )

        return {
            risk: newRisk,
            cost: effect.costDelta
        }
    }

    const displayedRisk = simulatedRisk ?? entity.currentRiskPct;
    const isImproved = simulatedRisk !== null && simulatedRisk < entity.currentRiskPct;

    return (
        <div
            style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 12,
                padding: 18,
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 12
            }}
        >
            {/* Header */}
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#020617" }}>
                    {entity.name}
                </div>

                <div style={{ fontSize: 12, color: "#475569" }}>
                    {entity.role} · {entity.function}
                </div>
            </div>

            {/* Risk Display */}
            <div
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: isImproved ? "#16a34a" : "#dc2626"
                }}
            >
                {displayedRisk}%
            </div>

            {simulatedRisk !== null && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                    Baseline: {entity.currentRiskPct}%
                </div>
            )}

            {/* Drivers */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    gap: 6
                }}
            >
                {entity.riskDrivers.map((driver) => (
                    <span
                        key={driver}
                        style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "#f1f5f9",
                            border: "1px solid #cbd5f1",
                            color: "#334155"
                        }}
                    >
                        {driver}
                    </span>
                ))}
            </div>

            {/* Intervention selector */}
            <select
                value={selectedIntervention}
                onChange={(e) => {
                    const value = e.target.value
                    setSelectedIntervention(value)

                    const impact = calculateImpact(value)

                    if (!impact) {
                        setSimulatedRisk(null)
                        onSimulate(entity.id, null, 0)
                        return
                    }

                    setSimulatedRisk(impact.risk)

                    onSimulate(
                        entity.id,
                        impact.risk,
                        impact.cost
                    )
                }}
                style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd5f5",
                    background: "#ffffff",
                    color: "#020617"
                }}
            >
                {interventions.map((i) => (
                    <option key={i.key} value={i.key}>
                        {i.label}
                    </option>
                ))}
            </select>
        </div>
    )
}