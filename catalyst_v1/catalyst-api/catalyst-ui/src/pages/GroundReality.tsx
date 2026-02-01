import PageShell from "../components/layout/PageShell";
import { getGroundRealitySignal } from "../state/groundRealitysignal";
import ReferenceDump from "./ground-reality/ReferenceDump";

export default function GroundRealityPage() {
    const signal = getGroundRealitySignal();

    return (

        <PageShell>
            <ReferenceDump>
                <h1>Ground Reality — Retention Simulator</h1>

                {signal && (
                    <div style={{ marginTop: 24 }}>
                        <p>Horizon: {signal.horizonMonths} months</p>
                        <p>Cost delta: {signal.costDeltaPct}%</p>
                        <p>Dominant driver: {signal.dominantDriver}</p>
                        <p>Confidence: {signal.interventionConfidence}</p>
                    </div>
                )}
            </ReferenceDump>
        </PageShell>
    );
}
