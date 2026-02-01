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
    riskDrivers: RiskDriver[];
};

type InterventionOption = {
    key: string;
    label: string;
};

type Props = {
    entity: SimulationEntity;
    interventions: InterventionOption[];
};

export default function SimulationCard({ entity, interventions }: Props) {
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
                    style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        background: "#ffffff",
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>
                        Choose an intervention…
                    </option>

                    {interventions.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= SIMULATED OUTCOME (PLACEHOLDER) ================= */}
            <div
                style={{
                    fontSize: 12,
                    opacity: 0.5,
                    fontStyle: "italic",
                }}
            >
                Simulated outcome will appear here after selection
            </div>
        </div>
    );
}
