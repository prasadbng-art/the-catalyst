import PageShell from "../components/layout/PageShell";
import { demoOrganizationState } from "../demo/demoOrganizationState";
import SimulationCard from "./retention-simulator/SimulationCard";

const INTERVENTIONS = [
    { key: "none", label: "No Action" },
    { key: "leadership", label: "Leadership Coaching" },
    { key: "compensation", label: "Compensation Adjustment" },
    { key: "mobility", label: "Internal Mobility Opportunity" },
    { key: "role_redesign", label: "Role Redesign" },
];

export default function RetentionSimulatorPage() {
    return (
        <PageShell>
            <div style={{ maxWidth: 1200, padding: 24 }}>
                {/* ================= PAGE HEADER ================= */}
                <div style={{ marginBottom: 24 }}>
                    <h1>Retention Intervention Simulator</h1>
                    <p style={{ opacity: 0.75 }}>
                        This page explores hypothetical retention interventions.
                        All outcomes shown are simulated.
                    </p>
                </div>

                {/* ================= SIMULATION CARDS ================= */}
                <section>
                    <h3>What-if Simulation</h3>

                    <p style={{ opacity: 0.75, marginBottom: 16 }}>
                        Select a personalized intervention to explore how individual attrition
                        risk may change under different assumptions.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {demoOrganizationState.people.entities.map((entity) => (
                            <SimulationCard
                                key={entity.id}
                                entity={{
                                    ...entity,
                                    currentRiskPct: entity.baselineRiskPct,
                                }}
                                interventions={INTERVENTIONS}
                            />
                        ))}
                    </div>
                </section>

                {/* ================= CTA ZONE ================= */}
                <div style={{ marginTop: 32 }}>
                    <button
                        onClick={() => {
                            window.location.href = "/baseline";
                        }}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 6,
                            border: "1px solid #1e293b",
                            background: "#020617",
                            color: "#e5e7eb",
                            cursor: "pointer",
                        }}
                    >
                        Home
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
