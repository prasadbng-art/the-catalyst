import PageShell from "../../components/layout/PageShell";
import { useNavigate } from "react-router-dom";
import { baseOrgState } from "../../state/orgState";
import MagicCube from "../../components/visuals/MagicCube";
import TopKpis from "./TopKpis";
import SentimentBars from "./SentimentBars";
import ActionPlans from "./ActionPlans";
import { getSimulatedStress } from "../../state/simulatedStressState";
import { PERSONAS } from "../../types/persona";
import DetailsByLocationTable from "./DetailsByLocationTable";

export default function GroundRealityPage() {
    const navigate = useNavigate();
    /* ================= Locations ================= */
    const attritsByLocation = [
        { location: "Warsaw", value: 120 },
        { location: "Bangalore", value: 85 },
        { location: "New York", value: 75 },
        { location: "Shanghai", value: 60 },
        { location: "Dubai", value: 35 },
    ];
    /* ================= KPIs ================= */
    const TOTAL_HEADCOUNT = 1888;
    const ATTRITS_YTD = attritsByLocation.reduce((sum, row) => sum + row.value, 0);
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
        { label: "eNPS", value: "-11", accent: "#f59e0b" },
        {
            label: "Global Headcount",
            value: TOTAL_HEADCOUNT.toLocaleString(),
            accent: "#3b82f6",
        },
    ];

    /* ================= Sentiment ================= */
    const sentimentByRegion = [
        { label: "Americas", positive: 5, negative: 0 },
        { label: "EMEA", positive: 0, negative: 10 },
        { label: "APAC", positive: 8, negative: 0 },
    ];

    const sentimentByCountry = [
        { label: "USA", positive: 5, negative: 0 },
        { label: "UK", positive: 10, negative: 0 },
        { label: "Germany", positive: 15, negative: 0 },
        { label: "Poland", positive: 0, negative: 55 },
        { label: "India", positive: 12, negative: 0 },
        { label: "Japan", positive: 4, negative: 0 },
    ];



    const totalAttrits = attritsByLocation.reduce((s, r) => s + r.value, 0);
    const detailsByLocation = attritsByLocation.map((r) => ({
        location: r.location,
        attrits: r.value,
        cost: Math.round((r.value / totalAttrits) * TOTAL_ATTRITION_COST),
    }));

    /* ================= Cube ================= */
    const stress = getSimulatedStress() ?? baseOrgState.stress;
    const primaryctaStyle: React.CSSProperties = {
        background: "#2563eb",
        border: "1px solid #1e293b",
        borderRadius: 18,
        padding: "12px 18px",
        fontSize: 13,
        fontWeight: 500,
        color: "#ffffff",
        cursor: "pointer",
        transition: "background 0.2s ease",
    };
    return (
        <PageShell>
            <div
                style={{
                    maxWidth: "100%",
                    marginLeft: 0,
                    marginRight: "auto",
                    paddingLeft: 16, paddingRight: 16, paddingTop: 0, paddingBottom: 0,
                    marginBottom: 0,
                    marginTop: 10,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                        gridAutoRows: "min-content",
                        rowGap: 16,
                        columnGap: 24,
                        alignItems: "start",
                    }}
                >

                    {/* ================= Row 1: KPIs ================= */}
                    <div style={{ gridColumn: "1 / 5", gridRow: "1" }}>
                        <TopKpis items={kpis} />
                    </div>

                    {/* ================= Row 2: Sentiment ================= */}
                    <div
                        style={{
                            gridColumn: "1 / 5",
                            gridRow: "2",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 24,
                        }}
                    >
                        <SentimentBars title="Sentiment by Region" data={sentimentByRegion} />
                        <SentimentBars title="Sentiment by Country" data={sentimentByCountry} />
                    </div>


                    <div style={{ gridColumn: "3 / 5", gridRow: "3" }}>
                        <ActionPlans />
                    </div>


                    {/* ================= Row 3: Tables (MOVED UP) ================= */}
                    <div style={{ gridColumn: "1 / 3", gridRow: "3", }}>
                        <DetailsByLocationTable rows={detailsByLocation} />
                    </div>


                    {/* ================= Row 4: Cube ================= */}
                    <div
                        style={{
                            gridColumn: "5 / 6",
                            gridRow: "2 / span 2",
                            background: "#020617",
                            border: "1px solid #1e293b",
                            borderRadius: 20,
                            padding: 24,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: 16,
                            marginTop: 10,
                        }}
                    >
                        {/*Header */}
                        <div style={{ fontWeight: 600, fontSize: 16, }}>
                            System Stress Profile
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>

                            <MagicCube
                                stress={stress}
                                persona={PERSONAS.CEO}
                                size={420}
                            />
                        </div>
                    </div>

                    {/* ================= Row 6: CTAs ================= */}

                    <div
                        style={{
                            gridColumn: "2 / -1",
                            gridRow: "6",
                            display: "flex",
                            gap: 12,

                        }}
                    >
                        <button
                            style={primaryctaStyle}
                            onClick={() => navigate("/simulation")}
                        >
                            Model Financial Impact →
                        </button>

                        <button
                            style={primaryctaStyle}
                            onClick={() => navigate("/retention-simulator")}
                        >
                            Run Retention Scenario →
                        </button>

                        <button
                            style={primaryctaStyle}
                            onClick={() => navigate("/baseline")}
                        >
                            ← Back to Equilibrium Score
                        </button>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
