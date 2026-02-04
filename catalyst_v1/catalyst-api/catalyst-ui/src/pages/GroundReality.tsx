import PageShell from "../components/layout/PageShell";
import ReferenceDump from "./ground-reality/ReferenceDump";
import TopKpis from "./ground-reality/TopKpis";
import SentimentBars from "./ground-reality/SentimentBars";
import LocationTable from "./ground-reality/LocationTable";
import { baseOrgState } from "../state/orgState";
import { useNavigate } from "react-router-dom";

/* =========================================================
   Helpers
========================================================= */
function getDominantStress(stress: typeof baseOrgState.stress) {
    return (Object.entries(stress) as [keyof typeof stress, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
}

export default function GroundRealityPage() {
    const navigate = useNavigate();

    /* =========================================================
       KPI derivation
    ========================================================= */
    const TOTAL_HEADCOUNT = 1888;
    const ATTRITION_RATE = Math.round(baseOrgState.stress.people * 100);
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

    const attritsByLocation = [
        { location: "Warsaw", value: 120 },
        { location: "Bangalore", value: 85 },
        { location: "New York", value: 75 },
        { location: "Shanghai", value: 60 },
        { location: "Dubai", value: 35 },
    ];

    const totalAttrits = attritsByLocation.reduce((sum, l) => sum + l.value, 0);

    const costByLocation = attritsByLocation.map((l) => ({
        location: l.location,
        value: Math.round((l.value / totalAttrits) * TOTAL_ATTRITION_COST),
    }));

    const dominantStress = getDominantStress(baseOrgState.stress);

    /* =========================================================
       CTA styles (uniform across app)
    ========================================================= */
    const primaryCTA = {
        padding: "12px 20px",
        background: "#2563eb",
        border: "none",
        borderRadius: 8,
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
        minWidth: 220,
        textAlign: "center" as const,
    };

    return (
        <PageShell>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minHeight: 0,
                }}
            >
                {/* MAIN CONTENT */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4, }}>
                    <ReferenceDump>
                        <div id="kpi-anchor">
                            <h1 style={{ marginTop: 0 }}>Mapped Metrics</h1>

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
                                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>
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
                </div>

                {/* NEXT STEPS */}
                <div
                    style={{
                        marginTop: 80,
                        paddingTop: 32,
                        borderTop: "1px solid #1e293b",
                        display: "flex",
                        justifyContent: "center",
                        gap: 20,
                        flexWrap: "wrap",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => navigate("/simulation")}
                        style={primaryCTA}
                    >
                        Model Financial Impact →
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/retention-simulator")}
                        style={primaryCTA}
                    >
                        Run Retention Scenario →
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/baseline")}
                        style={primaryCTA}
                    >
                        ← Back to Equilibrium Score
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
