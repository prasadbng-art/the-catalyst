
import PageShell from "../components/layout/PageShell";
import RetentionSimulatorPanel from "../components/RetentionSimulatorPanel";

export default function RetentionSimulatorPage() {
    return (
        <PageShell>
            <div style={{ maxWidth: 1200, padding: 24 }}>
                <h1>Retention Intervention Simulator</h1>
                <p style={{ opacity: 0.75, marginBottom: 24 }}>
                    Explore hypothetical retention interventions. All outcomes shown are
                    simulated.
                </p>

                <RetentionSimulatorPanel />
            </div>
        </PageShell>
    );
}
