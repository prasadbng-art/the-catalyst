import PageShell from "../components/layout/PageShell";
import { getGroundRealitySignal } from "../state/groundRealitysignal";
import ReferenceDump from "./ground-reality/ReferenceDump";
import TopKpis from "./ground-reality/TopKpis";
import SentimentBars from "./ground-reality/SentimentBars";
import LocationTable from "./ground-reality/LocationTable";
import { baseOrgState } from "../state/orgState";
import { useNavigate } from "react-router-dom";

export default function GroundRealityPage() {
    const navigate = useNavigate();
    const signal = getGroundRealitySignal();
    const kpis = [
        { label: "Attrition Cost (Annual)", value: "$15,300,000", accent: "#ef4444", },
        { label: "Attrition Rate", value: "18%", accent: "#ef4444" },
        { label: "Engagement (eNPS", value: baseOrgState.kpis.engagement.toString() },
        { label: "Global Headcount", value: baseOrgState.kpis.headcount.toLocaleString() },
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

    const costByLocation = [
        { location: "Warsaw", value: 3_375_000 },
        { location: "Bangalore", value: 3_060_000 },
        { location: "New York", value: 3_690_000 },
        { location: "Shanghai", value: 2_835_000 },
        { location: "Dubai", value: 2_340_000 },
    ];

    const attritsByLocation = [
        { location: "Warsaw", value: 75 },
        { location: "Bangalore", value: 68 },
        { location: "New York", value: 82 },
        { location: "Shanghai", value: 63 },
        { location: "Dubai", value: 52 },
    ];

    return (

        <PageShell>
            <ReferenceDump>
                <div id="kpi-anchor">
                    <h1 style={{ marginTop: 0 }}>
                        Mapped Metrics
                    </h1>

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

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 24,
                            marginTop: 32,
                        }}
                    >
                        <LocationTable
                            title="Total Cost of Attrition by Location"
                            rows={costByLocation}
                            isMoney
                        />
                        <LocationTable
                            title="Attrits by Location (YTD)"
                            rows={attritsByLocation}
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
                    <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
                        <button
                            onClick={() => navigate("/simulation")}
                            style={{
                                padding: "12px 18px",
                                background: "#1d4ed8",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Financial Simulation →
                        </button>

                        <button
                            onClick={() => navigate("/retention-simulator")}
                            style={{
                                padding: "12px 18px",
                                background: "#1d4ed8",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Retention Intervention Simulation →
                        </button>
                    </div>

                </div>
            </ReferenceDump>
        </PageShell>
    )
}
