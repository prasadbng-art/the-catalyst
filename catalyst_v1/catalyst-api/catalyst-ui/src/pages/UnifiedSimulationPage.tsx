import PageShell from "../components/layout/PageShell";

export default function UnifiedSimulationPage() {
    return (
        <PageShell>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "260px 1fr",
                    minHeight: "100vh",
                }}
            >
                {/* Sidebar (already handled by PageShell) */}

                {/* Main Content */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateRows: "1fr auto",
                        padding: "32px",
                        gap: 24,
                    }}
                >
                    {/* Top Area: Left / Center / Right */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "360px 1fr 360px",
                            gap: 32,
                            alignItems: "start",
                        }}
                    >
                        {/* LEFT PANEL */}
                        <div
                            style={{
                                border: "1px dashed #1e293b",
                                borderRadius: 12,
                                padding: 16,
                            }}
                        >
                            <strong>Simulation Controls</strong>
                        </div>

                        {/* CENTER PANEL */}
                        <div
                            style={{
                                border: "1px dashed #1e293b",
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
                                border: "1px dashed #1e293b",
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
                            border: "1px dashed #1e293b",
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <strong>Financial Outcomes (Before / After)</strong>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
