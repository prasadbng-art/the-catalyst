const INTERVENTION_DELTAS: Record<string, number> = {
    none: 0,
    leadership: 8,
    compensation: 12,
    mobility: 6,
    role_redeign: 5,
};

type RiskDriver =
    | "Long Time Since Promotion"
    | "Low Compensation Ratio"
    | "Stagnant Performance"
    | "Poor Manager Score"
    | "Low Engagement";

type SimulationEntity = {
    id: string;
    name: string;
    role: string;
    function: string;
    currentRiskPct: number;
    riskDrivers: readonly RiskDriver[];
};

type InterventionOption = {
    key: string;
    label: string;
};

type Props = {
    entity: SimulationEntity;
    interventions: InterventionOption[];
};
import { useState } from "react";

export default function SimulationCard({ entity, interventions }: Props) {
    const [selectedIntervention, setSelectedIntervention] =
        useState<string>("none");

    const delta =
        INTERVENTION_DELTAS[selectedIntervention] ?? 0;

    const simulatedRiskPct =
        selectedIntervention === "none"
            ? null
            : Math.max(0, entity.currentRiskPct - delta);

    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 10,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            {/* ================= IDENTITY ================= */}
            <div>
                <div style={{ fontWeight: 600 }}>{entity.name}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {entity.role} | {entity.function}
                </div>
            </div>

            {/* ================= CURRENT RISK ================= */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ fontSize: 12, opacity: 0.7 }}>Current Risk</div>
                <div
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#dc2626",
                    }}
                >
                    {entity.currentRiskPct}%
                </div>
            </div>

            {/* ================= RISK DRIVERS ================= */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {entity.riskDrivers.map((driver) => (
                    <span
                        key={driver}
                        style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "#fee2e2",
                            color: "#991b1b",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {driver}
                    </span>
                ))}
            </div>

            {/* ================= INTERVENTION SELECTOR ================= */}
            <div>
                <label
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "block",
                    }}
                >
                    Select a Personalized Intervention
                </label>

                <select
                    value={selectedIntervention}
                    onChange={(e) => setSelectedIntervention(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        background: "#ffffff",
                    }}
                >

                    <option value="none">No Action</option>

                    {interventions.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= SIMULATED OUTCOME (PLACEHOLDER) ================= */}
            {simulatedRiskPct !== null && (
                <div
                    style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #e5e7eb",
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Simulated Risk
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#16a34a",
                        }}
                    >
                        {simulatedRiskPct}%
                    </div>
                </div>
            )}

        </div>
    );
}
