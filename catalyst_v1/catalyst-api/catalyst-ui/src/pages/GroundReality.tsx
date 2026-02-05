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

    const ctaStyle: React.CSSProperties = {
        padding: "12px 22px",
        background: "#2563eb",
        border: "none",
        borderRadius: 10,
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
        minWidth: 240,
        textAlign: "center",
    };

    return (
        <PageShell>
            <div
                style={{
                    minHeight: "100vh",
                    background: "#020617",
                    color: "#e5e7eb",
                }}
            >
                {/* ===== SINGLE LAYOUT CONTAINER (SAME AS BASELINE) ===== */}
                <div
                    style={{
                        maxWidth: 1400,
                        margin: "0 auto",
                        padding: "32px",
                    }}
                >
                    {/* ===== HEADER ===== */}
                    <header
                        style={{
                            textAlign: "center",
                            marginBottom: 48,
                        }}
                    >
                        <h1
                            style={{
                                fontSize: 36,
                                fontWeight: 400,
                                letterSpacing: "0.04em",
                            }}
                        >
                            Mapped Metrics
                        </h1>
                    </header>

                    {/* ===== MAIN GRID (3 / 6 / 3) ===== */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "320px minmax(1,2fr) 360px",
                            gap: 48,
                            alignItems: "start",
                            marginBottom: 64,
                        }}
                    >
                        {/* LEFT PANEL */}
                        <aside>
                            <ReferenceDump>
                                <TopKpis items={kpis} />
                            </ReferenceDump>
                        </aside>

                        {/* CENTER PANEL */}
                        <main>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 24,
                                    rowGap: 32,
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
                        </main>

                        {/* RIGHT PANEL */}
                        <aside>
                            <div
                                style={{
                                    background: "#0f172a",
                                    border: "1px solid #1e293b",
                                    borderRadius: 12,
                                    padding: 16,
                                    lineHeight: 1.6,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.6,
                                        marginBottom: 8,
                                    }}
                                >
                                    DOMINANT STRESS DRIVER
                                </div>

                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: "#fb923c",
                                        textTransform: "uppercase",
                                        marginBottom: 12,
                                    }}
                                >
                                    {dominantStress}
                                </div>

                                Workforce pressure is currently concentrated in this dimension,
                                reflected consistently across enterprise KPIs and regions.
                            </div>
                        </aside>
                    </div>

                    {/* ===== CTA ROW ===== */}
                    <footer style={{ textAlign: "center" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                gap: 20,
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                style={ctaStyle}
                                onClick={() => navigate("/simulation")}
                            >
                                Model Financial Impact →
                            </button>

                            <button
                                style={ctaStyle}
                                onClick={() => navigate("/retention-simulator")}
                            >
                                Run Retention Scenario →
                            </button>

                            <button
                                style={ctaStyle}
                                onClick={() => navigate("/baseline")}
                            >
                                ← Back to Equilibrium Score
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </PageShell>
    );
}
