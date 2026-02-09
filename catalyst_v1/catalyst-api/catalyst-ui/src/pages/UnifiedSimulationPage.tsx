export default function UnifiedSimulationPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#020617", // force page identity
                padding: "32px",
            }}
        >
            {/* TOP GRID: Left / Center / Right */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "360px 1fr 360px",
                    gap: 32,
                    marginBottom: 32,
                }}
            >
                {/* LEFT PANEL */}
                <div
                    style={{
                        border: "2px dashed #38bdf8",
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <strong>Simulation Controls</strong>
                </div>

                {/* CENTER PANEL */}
                <div
                    style={{
                        border: "2px dashed #22c55e",
                        borderRadius: 12,
                        padding: 16,
                        minHeight: 420,
                    }}
                >
                    <strong>Organizational Response</strong>
                </div>

                {/* RIGHT PANEL */}
                <div
                    style={{
                        border: "2px dashed #f97316",
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <strong>Retention Levers</strong>
                </div>
            </div>

            {/* BOTTOM PANEL */}
            <div
                style={{
                    border: "2px dashed #eab308",
                    borderRadius: 12,
                    padding: 16,
                }}
            >
                <strong>Financial Outcomes (Before / After)</strong>
            </div>
        </div>
    );
}
