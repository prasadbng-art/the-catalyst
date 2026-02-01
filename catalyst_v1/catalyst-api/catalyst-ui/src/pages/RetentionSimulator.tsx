import PageShell from "../components/layout/PageShell";

export default function RetentionSimulatorPage() {
    return (
        <PageShell>
            <div
                style={{
                    maxWidth: 1200,
                    padding: 24,
                }}
            >
                {/* ================= PAGE HEADER ================= */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ marginTop: 0 }}>
                        Retention Intervention Simulator
                    </h1>
                    <p style={{ opacity: 0.75 }}>
                        This page explores hypothetical retention interventions.
                        All outcomes shown are simulated.
                    </p>
                </div>

                {/* ================= SCOPE SELECTION ================= */}
                <section style={{ marginBottom: 32 }}>
                    <h3>Scope</h3>

                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                        <button
                            style={{
                                padding: "8px 14px",
                                borderRadius: 6,
                                border: "1px solid #2563eb",
                                background: "#2563eb",
                                color: "#ffffff",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Organization
                        </button>

                        <button
                            style={{
                                padding: "8px 14px",
                                borderRadius: 6,
                                border: "1px solid #1e293b",
                                background: "#020617",
                                color: "#cbd5f5",
                                cursor: "pointer",
                            }}
                        >
                            Region
                        </button>

                        <button
                            style={{
                                padding: "8px 14px",
                                borderRadius: 6,
                                border: "1px solid #1e293b",
                                background: "#020617",
                                color: "#cbd5f5",
                                cursor: "pointer",
                            }}
                        >
                            Location
                        </button>
                    </div>

                    <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
                        Select where the intervention assumptions apply.
                    </p>
                </section>


                {/* ================= INTERVENTION LEVERS ================= */}
                <section style={{ marginBottom: 32 }}>
                    <h3>Intervention Levers</h3>
                    <div
                        style={{
                            marginTop: 12,
                            padding: 16,
                            border: "1px dashed #1e293b",
                            borderRadius: 8,
                            opacity: 0.6,
                        }}
                    >
                        Sliders / toggles placeholder
                    </div>
                </section>

                {/* ================= INTERVENTION LEVERS ================= */}
                <section style={{ marginBottom: 32 }}>
                    <h3>Intervention Levers</h3>

                    <div
                        style={{
                            marginTop: 16,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 24,
                        }}
                    >
                        {/* Manager Capability */}
                        <div>
                            <label style={{ fontWeight: 600 }}>
                                Manager Capability
                            </label>
                            <input type="range" min={0} max={100} defaultValue={30} />
                            <p style={{ fontSize: 13, opacity: 0.7 }}>
                                Investment in leadership effectiveness and coaching quality.
                            </p>
                        </div>

                        {/* Career Mobility */}
                        <div>
                            <label style={{ fontWeight: 600 }}>
                                Career Mobility
                            </label>
                            <input type="range" min={0} max={100} defaultValue={25} />
                            <p style={{ fontSize: 13, opacity: 0.7 }}>
                                Internal movement, role clarity, and growth pathways.
                            </p>
                        </div>

                        {/* Tooling & Friction */}
                        <div>
                            <label style={{ fontWeight: 600 }}>
                                Tooling & Friction
                            </label>
                            <input type="range" min={0} max={100} defaultValue={40} />
                            <p style={{ fontSize: 13, opacity: 0.7 }}>
                                Reduction in daily operational friction and system pain.
                            </p>
                        </div>

                        {/* Compensation Hygiene */}
                        <div>
                            <label style={{ fontWeight: 600 }}>
                                Compensation Hygiene
                            </label>
                            <input type="range" min={0} max={100} defaultValue={20} />
                            <p style={{ fontSize: 13, opacity: 0.7 }}>
                                Market alignment and fairness corrections.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================= CONFIDENCE ================= */}
                <section style={{ marginBottom: 32 }}>
                    <h3>Model Confidence</h3>
                    <div
                        style={{
                            marginTop: 12,
                            padding: 16,
                            border: "1px dashed #1e293b",
                            borderRadius: 8,
                            opacity: 0.6,
                        }}
                    >
                        Confidence indicator placeholder
                    </div>
                </section>

                {/* ================= CTA ZONE ================= */}
                <section>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                        }}
                    >
                        <button
                            style={{
                                padding: "10px 16px",
                                borderRadius: 6,
                                border: "1px solid #1e293b",
                                background: "#020617",
                                color: "#e5e7eb",
                                cursor: "pointer",
                                opacity: 0.6,
                            }}
                            disabled
                        >
                            Apply assumptions to Financial Model
                        </button>

                        <button
                            style={{
                                padding: "10px 16px",
                                borderRadius: 6,
                                border: "1px solid #1e293b",
                                background: "#020617",
                                color: "#e5e7eb",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                window.location.href = "/baseline";
                            }}
                        >
                            Home
                        </button>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
