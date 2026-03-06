import { useState } from "react";

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
    onSimulate: (id: string, simulatedRisk: number | null, intervention: string) => void;
};

export default function SimulationCard({
    entity,
    interventions,
    onSimulate,
}: Props) {
    const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null);
    const [selectedIntervention, setSelectedIntervention] = useState("none");

    const calculateRisk = (intervention: string): number | null => {
        switch (intervention) {
            case "leadership":
                return Math.max(entity.currentRiskPct - 12, 0);
            case "compensation":
                return Math.max(entity.currentRiskPct - 15, 0);
            case "mobility":
                return Math.max(entity.currentRiskPct - 10, 0);
            case "role_redesign":
                return Math.max(entity.currentRiskPct - 8, 0);
            default:
                return null;
        }
    };

    const displayedRisk = simulatedRisk ?? entity.currentRiskPct;
    const isImproved = simulatedRisk !== null && simulatedRisk < entity.currentRiskPct;

    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: 22,
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 12
            }}

        >
            {/* Header */}
            <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#020617" }}>
                    {entity.name}
                </div>
                <div style={{ fontSize: 10, color: "#475569" }}>
                    {entity.role} · {entity.function}
                </div>
            </div>

            {/* Risk Display */}
            <div
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: isImproved ? "#16a34a" : "#dc2626",
                    marginBottom: 4,
                }}
            >
                {displayedRisk}%
            </div>

            {simulatedRisk !== null && (
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>
                    Baseline: {entity.currentRiskPct}%
                </div>
            )}

            {/* Drivers */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {entity.riskDrivers.map((driver) => (
                    <span
                        key={driver}
                        style={{
                            fontSize: 10,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "#f1f5f9",
                            border: "1px solid #cbd5f1",
                            color: "#334155",
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
                    const value = e.target.value;
                    setSelectedIntervention(value);

                    const newRisk = calculateRisk(value);
                    setSimulatedRisk(newRisk);
                    onSimulate(entity.id, newRisk, value);
                }}
                style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5f5",
                    background: "#ffffff",
                    color: "#020617",
                }}
            >
                {interventions.map((i) => (
                    <option key={i.key} value={i.key}>
                        {i.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
