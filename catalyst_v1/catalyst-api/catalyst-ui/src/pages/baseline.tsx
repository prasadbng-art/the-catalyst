import { useEffect, useState } from "react";
import { fetchBaseline } from "../api/baseline";
import type { BaselineResponse } from "../types/api";
import KpiCard from "../components/kpi/KpiCard.tsx";
import DiagnosticsTable from "../components/diagnostics/DiagnosticsTable.tsx";

export default function BaselinePage() {
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBaseline()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading baseline…</div>;

  const { kpis } = data;

  return (
    <div>
      <h1>Baseline</h1>

      {/* KPI Row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <KpiCard
          title="Attrition Risk"
          value={kpis.attrition_risk.value}
          unit={kpis.attrition_risk.unit ?? undefined}
          description={kpis.attrition_risk.description}
        />

        <KpiCard
          title="Headcount"
          value={kpis.headcount.value}
          unit={kpis.headcount.unit ?? undefined}
        />

  <h1>Baseline</h1>

  <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
    {/* KPI cards */}
  </div>

  <h2 style={{ marginTop: "40px", marginBottom: "16px" }}>
    Diagnostics by Location
  </h2>

  <DiagnosticsTable rows={data.diagnostics.by_location} />

        <KpiCard
          title="Annual Attrition Cost Exposure"
          value={kpis.annual_attrition_cost_exposure.value.toLocaleString()}
          unit={kpis.annual_attrition_cost_exposure.unit ?? undefined}
          description={kpis.annual_attrition_cost_exposure.description}
        />

  {/* Diagnostics Section */}
  <div style={{ marginTop: "40px" }}>
    <h2>Diagnostics by Location</h2>

    <DiagnosticsTable rows={data.diagnostics.by_location} />
  </div>

      </div>
    </div>
  );
}
