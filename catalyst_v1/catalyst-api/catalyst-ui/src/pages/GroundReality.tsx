import PageShell from "../components/layout/PageShell";
import ReferenceDump from "./ground-reality/ReferenceDump";
import TopKpis from "./ground-reality/TopKpis";
import SentimentBars from "./ground-reality/SentimentBars";
import LocationTable from "./ground-reality/LocationTable";

import { baseOrgState } from "../state/orgState";
import { getSimulatedStress } from "../state/simulatedStressState";

/* =========================================================
   Helpers
========================================================= */
function getDominantStress(stress: typeof baseOrgState.stress) {
    return (Object.entries(stress) as [keyof typeof stress, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
}

export default function GroundRealityPage() {
    /* =========================================================
       Stress source (single truth)
    ========================================================= */
    const simulated = getSimulatedStress();
    const stress = simulated ?? baseOrgState.stress;

    console.log("GROUND REALITY — STRESS SOURCE:", stress);

    const dominantStress = getDominantStress(stress);

    /* =========================================================
       KPI derivation (aligned, non-nonsensical)
    ========================================================= */
    const TOTAL_HEADCOUNT = 1888;
    const ATTRITION_RATE = Math.round(stress.people * 100); // proxy
    const ATTRITS_YTD = Math.round((ATTRITION_RATE / 100) * TOTAL_HEADCOUNT);
    const COST_PER_ATTRIT = 124_121;

    const TOTAL_ATTRITION_COST = ATTRITS_YTD * COST_PER_ATTRIT;

    const kpis = [
        {
            label: "Per-Capita Attrition Cost",
            value: `$${COST_PER_ATTRIT.toLocaleString()}`,
            accent: "#ef4444",
        },
        {
            label: "Total Attrits (YTD)",
            value: ATTRITS_YTD.toLocaleString(),
            accent: "#ef4444",
        },
        {
            label: "eNPS",
            value: "-11",
            accent: "#f59e0b",
        },
        {
            label: "Global Headcount",
            value: TOTAL_HEADCOUNT.toLocaleString(),
        },
    ];

    /* =========================================================
       Regional sentiment (static for now)
    ========================================================= */
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

    /* =========================================================
       Location-level costs (aligned with totals)
    ========================================================= */
    const attritsByLocation = [
        { location: "Warsaw", value: 120 },
        { location: "Bangalore", value: 85 },
        { location: "New York", value: 75 },
        { location: "Shanghai", value: 60 },
        { location: "Dubai", value: 35 },
    ];

    const totalAttrits = attritsByLocation.reduce(
        (sum, l) => sum + l.value,
        0
    );

    const costByLocation = attritsByLocation.map((l) => ({
        location: l.location,
        value: Math.round(
            (l.value / totalAttrits) * TOTAL_ATTRITION_COST
        ),
    }));

    /* =========================================================
       Render
    ========================================================= */
    return (
        <PageShell>
            <ReferenceDump>
                <div id="kpi-anchor">
                    <h1 style={{ marginTop: 0 }}>Mapped Metrics</h1>

                    {simulated && (
                        <div
                            style={{
                                marginBottom: 16,
                                fontSize: 12,
                                color: "#38bdf8",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}
                        >
                            Simulated scenario reflected
                        </div>
                    )}

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

                    <div style={{ marginTop: 32 }}>
                        <div
                            style={{
                                fontSize: 12,
                                opacity: 0.6,
                                marginBottom: 6,
                            }}
                        >
                            DOMINANT STRESS DRIVER
                        </div>

                        <div
                            style={{
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                color: "#fb923c",
                                marginBottom: 8,
                                textTransform: "uppercase",
                            }}
                        >
                            {dominantStress}
                        </div>

                        <div style={{ maxWidth: 520, lineHeight: 1.6 }}>
                            Workforce pressure is currently concentrated in the{" "}
                            <strong>{dominantStress.toLowerCase()}</strong> dimension.
                            This is reflected consistently across enterprise-level KPIs
                            and regional metrics.
                        </div>
                    </div>
                </div>
            </ReferenceDump>
        </PageShell>
    );
}
