import PageShell from "../components/layout/PageShell";
import { getGroundRealitySignal } from "../state/groundRealitysignal";

export default function GroundRealityPage() {
    const signal = getGroundRealitySignal();

    return (
        <PageShell>
            <div style={{ padding: 32 }}>
                <h1>Ground Reality — Retention Simulator</h1>

                {!signal && (
                    <p style={{ opacity: 0.7 }}>
                        No simulation context received.
                    </p>
                )}

                {signal && (
                    <div style={{ marginTop: 24 }}>
                        <p>
                            Horizon: {signal.horizonMonths} months
                        </p>
                        <p>
                            Cost delta: {signal.costDeltaPct}%
                        </p>
                        <p>
                            Dominant driver: {signal.dominantDriver}
                        </p>
                        <p>
                            Confidence: {signal.interventionConfidence}
                        </p>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
