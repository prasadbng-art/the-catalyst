import PageShell from "../components/layout/PageShell";
import { getGroundRealitySignal } from "../state/groundRealitysignal";
import ReferenceDump from "./ground-reality/ReferenceDump";
import TopKpis from "./ground-reality/TopKpis";
import SentimentBars from "./ground-reality/SentimentBars";

export default function GroundRealityPage() {
    const signal = getGroundRealitySignal();
    const kpis = [
        { label: "Per-Capita Attrition Cost", value: "$124,121", accent: "#ef4444" },
        { label: "Total Attrits (YTD)", value: "429", accent: "#ef4444" },
        { label: "eNPS", value: "-11", accent: "#f59e0b" },
        { label: "Global Headcount", value: "1,888" },
    ];
    const sentimentByRegion = [
        { label: "Americas", value: 5 },
        { label: "EMEA", value: -10 },
        { label: "APAC", value: 8 },
    ];

    const sentimentByCountry = [
        { label: "USA", value: 5 },
        { label: "UK", value: 10 },
        { label: "Germany", value: 15 },
        { label: "Poland", value: -55 },
        { label: "India", value: 12 },
        { label: "Japan", value: 4 },
    ];

    return (

        <PageShell>
            <ReferenceDump>
                <h1>Ground Reality — Retention Simulator</h1>

                <TopKpis items={kpis} />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 24,
                        marginTop: 32,
                    }}
                >
                    <SentimentBars
                        title="Sentiment by Region"
                        data={sentimentByRegion}
                    />
                    <SentimentBars
                        title="Sentiment by Country"
                        data={sentimentByCountry}
                    />
                </div>

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
    )
}
