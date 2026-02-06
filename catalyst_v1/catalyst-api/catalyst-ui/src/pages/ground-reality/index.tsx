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

    /* ================= KPIs ================= */
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

    /* ================= Locations ================= */
    const attritsByLocation = [
        { location: "Warsaw", value: 120 },
        { location: "Bangalore", value: 85 },
        { location: "New York", value: 75 },
        { location: "Shanghai", value: 60 },
        { location: "Dubai", value: 35 },
    ];

    const totalAttrits = attritsByLocation.reduce((s, r) => s + r.value, 0);
    const detailsByLocation = attritsByLocation.map((r) => ({
        location: r.location,
        attrits: r.value,
        cost: Math.round((r.value / totalAttrits) * TOTAL_ATTRITION_COST),
    }));

    /* ================= Cube ================= */
    const stress = getSimulatedStress() ?? baseOrgState.stress;



    return (
        <PageShell>
            <div
                style={{
                    maxWidth: "100%",
                    marginLeft: 0,
                    marginRight: "auto",
                    paddingLeft: 16, paddingRight: 16
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5,minmax(0,1fr))",
                        gridAutoRows: "min-content",
                        gap: 24,
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
                            gridColumn: "1 / 3",
                            gridRow: "2",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 24,
                        }}
                    >
                        <SentimentBars title="Sentiment by Region" data={sentimentByRegion} />
                        <SentimentBars title="Sentiment by Country" data={sentimentByCountry} />
                    </div>


                    <div style={{ gridColumn: "1 / 3", gridRow: "3" }}>
                        <ActionPlans />
                    </div>


                    {/* ================= Row 3: Tables (MOVED UP) ================= */}
                    <div style={{ gridColumn: "3 / 6", gridRow: "2" }}>
                        <DetailsByLocationTable rows={detailsByLocation} />
                    </div>


                    {/* ================= Row 4: Cube ================= */}
                    <div
                        style={{
                            gridColumn: "3 / 4",
                            gridRow: "3",

                            justifyContent: "center",

                        }}
                    >
                        <MagicCube
                            stress={stress}
                            persona={PERSONAS.CEO}
                            size={420}
                        />
                    </div>

                    {/* ================= Row 5: Dominant Stress ================= */}
                    <div style={{ gridColumn: "1 / 3" }}>
                        <div
                            style={{
                                gridColumn: "3 / 4",
                                gridRow: "4",
                                background: "#020617",
                                border: "1px solid #1e293b",
                                borderRadius: 16,
                                padding: 20,
                            }}
                        >
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                                Dominant Stress Driver
                            </div>

                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                System Absorbing Pressure
                            </div>

                            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
                                Workforce pressure is currently concentrated in this dimension,
                                reflected consistently across enterprise KPIs and regions.
                            </p>


                        </div>
                    </div>

                    {/* ================= Row 6: CTAs ================= */}
                    <div
                        style={{
                            gridColumn: "1 / 4",
                            gridRow: "5",
                            display: "flex",
                            gap: 12,

                        }}
                    >
                        <button
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium"
                            onClick={() => navigate("/simulation")}
                        >
                            Model Financial Impact →
                        </button>

                        <button
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium"
                            onClick={() => navigate("/retention-simulator")}
                        >
                            Run Retention Scenario →
                        </button>

                        <button
                            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-medium"
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
