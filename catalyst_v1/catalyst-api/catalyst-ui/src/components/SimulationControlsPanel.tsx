import type { Persona } from "../types/persona";

interface Props {
    persona: Persona;
    onPersonaChange: (p: Persona) => void;
    timeHorizon: 1 | 3;
    onTimeHorizonChange: (y: 1 | 3) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function SimulationControlsPanel({
    persona,
    onPersonaChange,
    timeHorizon,
    onTimeHorizonChange,
    onApply,
    onReset,
}: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                    Persona View
                </div>
                {(["CEO", "CFO", "CHRO"] as Persona[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => onPersonaChange(p)}
                        style={{
                            marginRight: 8,
                            padding: "8px 14px",
                            borderRadius: 6,
                            border:
                                persona === p
                                    ? "2px solid #2563eb"
                                    : "1px solid #1e293b",
                            background:
                                persona === p ? "#2563eb" : "#020617",
                            color:
                                persona === p ? "#ffffff" : "#cbd5f5",
                            fontWeight: persona === p ? 600 : 500,
                            cursor: "pointer",
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                    Time Horizon
                </div>
                {[1, 3].map((y) => (
                    <button
                        key={y}
                        onClick={() => onTimeHorizonChange(y as 1 | 3)}
                        style={{
                            marginRight: 8,
                            padding: "6px 12px",
                            borderRadius: 6,
                            border:
                                timeHorizon === y
                                    ? "2px solid #2563eb"
                                    : "1px solid #1e293b",
                            background:
                                timeHorizon === y ? "#2563eb" : "#020617",
                            color:
                                timeHorizon === y ? "#ffffff" : "#cbd5f5",
                            fontWeight: timeHorizon === y ? 600 : 500,
                            cursor: "pointer",
                        }}
                    >
                        {y} Year{y === 3 ? "s" : ""}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
                <button
                    onClick={onApply}
                    style={{
                        padding: "10px 14px",
                        background: "#2563eb",
                        border: "none",
                        borderRadius: 8,
                        color: "#ffffff",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Apply Simulation
                </button>

                <button
                    onClick={onReset}
                    style={{
                        padding: "10px 14px",
                        background: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        color: "#ffffff",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Reset to Baseline
                </button>
            </div>
        </div>
    );
}
