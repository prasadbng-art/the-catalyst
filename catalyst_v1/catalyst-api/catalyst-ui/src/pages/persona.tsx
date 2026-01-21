import { useEffect, useState } from "react";
import { fetchBaseline } from "../api/baseline";
import type { BaselineResponse } from "../types/api";

import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import PersonaSelector from "../components/persona/PersonaSelector";

import KpiCard from "../components/kpi/KpiCard";

/* ✅ INSERT THIS HERE — outside the component */
type KPIKey = keyof BaselineResponse["kpis"];

export default function PersonaPage() {
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [persona, setPersona] = useState<Persona>("CHRO");

  useEffect(() => {
    fetchBaseline().then(setData);
  }, []);

  if (!data) return <div>Loading…</div>;

  const config = personaConfig[persona];
  const { kpis } = data;

  return (
    <div>
      <h1>{config.headline}</h1>

      <PersonaSelector value={persona} onChange={setPersona} />

      <p style={{ maxWidth: "720px", marginBottom: "24px" }}>
        {config.narrative}
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        {config.kpiOrder.map((key: KPIKey) => {
          const kpi = kpis[key];

          return (
            <KpiCard
              key={key}
              title={key.replaceAll("_", " ").toUpperCase()}
              value={kpi.value.toLocaleString()}
              unit={kpi.unit ?? undefined}
              description={kpi.description}
            />
          );
        })}
      </div>
    </div>
  );
}
