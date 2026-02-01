import PageShell from "../components/layout/PageShell";
import { getGroundRealitySignal } from "../state/groundRealitysignal";
import ReferenceDump from "./ground-reality/ReferenceDump";
import TopKpis from "./ground-reality/TopKpis";

export default function GroundRealityPage() {
    const signal = getGroundRealitySignal();
    const kpis = [
        { label: "Per-Capita Attrition Cost", value: "$124,121", accent: "#ef4444" },
        { label: "Total Attrits (YTD)", value: "429", accent: "#ef4444" },
        { label: "eNPS", value: "-11", accent: "#f59e0b" },
        { label: "Global Headcount", value: "1,888" },
    ];

    return (

        <PageShell>
            <ReferenceDump>
                <h1>Ground Reality — Retention Simulator</h1>
                <TopKpis items={kpis} />
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
