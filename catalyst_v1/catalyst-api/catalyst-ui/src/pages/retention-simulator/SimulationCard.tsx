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
    onSimulate: (id: string, simulatedRisk: number | null) => void;
};

export default function SimulationCard({
    entity,
    interventions,
    onSimulate,
}: Props) {
    const [selectedIntervention, setSelectedIntervention] =
        useState<string>("none");

    const simulateRisk = (): number | null => {
        if (selectedIntervention === "none") return null;

        switch (selectedIntervention) {
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

    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: 16,
                border: "1px solid #e5e7eb",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: "#020617" }}>
                    {entity.name}
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                    {entity.role} · {entity.function}
                </div>
            </div>

            {/* Risk */}
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#dc2626",
                    marginBottom: 8,
                }}
            >
                {entity.currentRiskPct}%
            </div>

            {/* Drivers */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {entity.riskDrivers.map((driver) => (
                    <span
                        key={driver}
                        style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "#fee2e2",
                            color: "#7f1d1d",
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
                    onSimulate(entity.id, simulateRisk());
                }}
                style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #cbd5f5",
                    background: "#ffffff",
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
