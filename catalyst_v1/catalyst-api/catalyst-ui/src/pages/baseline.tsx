import { useEffect, useState } from "react";
import { fetchBaseline } from "../api/baseline";
import type { BaselineResponse } from "../types/api";
import KPIGrid from "../components/kpi/KPIGrid";

export default function BaselinePage() {
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBaseline()
      .then(setData)
      .catch(() => setError("Failed to load baseline"));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading baseline…</p>;

  return (
    <>
      <h1>Baseline KPIs</h1>
      <KPIGrid kpis={data.kpis} />
    </>
  );
}
