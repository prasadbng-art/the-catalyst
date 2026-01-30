import { useEffect, useState } from "react";
import type { Persona } from "../types/persona";
import { personaConfig } from "../persona/personaConfig";
import MagicCube from "../components/visuals/MagicCube";
import type { StressProfile } from "../components/visuals/motion";

type SimulationResponse = {
  baseline_cost: number;
  simulated_cost: number;
  cost_avoided: number;
  roi: number;
  confidence: number;
};

export default function SimulatePage() {
  const [persona, setPersona] = useState<Persona>("CFO");

  const stress: StressProfile = {
    people: 0.26,
    cost: 0.31,
    macro: 0.18,
    execution: 0.22,
  };

  const [riskReductionPct, setRiskReductionPct] = useState(15);
  const [interventionCost, setInterventionCost] = useState(250000);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSimulation() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/intelligence/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          stress,
          risk_reduction_pct: riskReductionPct,
          intervention_cost: interventionCost,
        }),
      });

      if (!res.ok) {
        throw new Error("Simulation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Unable to run financial simulation.");
    } finally {
      setLoading(false);
    }
  }

  const copy = personaConfig[persona];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "32px 40px", overflowY: "auto" }}>
        <h1>{copy.headline}</h1>
        <p style={{ opacity: 0.75 }}>
          Model the financial impact of reducing organizational stress and attrition risk.
        </p>

        <div style={{ margin: "24px 0" }}>
          {(["CEO", "CFO", "CHRO"] as Persona[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              style={{
                marginRight: 8,
                padding: "6px 12px",
                borderRadius: 6,
                border: persona === p ? "2px solid #4f46e5" : "1px solid #d1d5db",
                background: persona === p ? "#eef2ff" : "#ffffff",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div>
            <label>Risk Reduction (%)</label>
            <input
              type="number"
              value={riskReductionPct}
              onChange={(e) => setRiskReductionPct(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>

          <div>
            <label>Intervention Cost</label>
            <input
              type="number"
              value={interventionCost}
              onChange={(e) => setInterventionCost(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6 }}
            />
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: "#4f46e5",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Running Model…" : "Recalculate Impact"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 32 }}>
            <h2>Financial Impact</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              <Metric label="Cost Avoided" value={`$${result.cost_avoided.toLocaleString()}`} />
              <Metric label="ROI" value={`${Math.round(result.roi)}%`} />
              <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
            </div>

            <p style={{ marginTop: 24, opacity: 0.85 }}>{copy.narrative}</p>
          </div>
        )}
      </div>

      <div
        style={{
          borderLeft: "1px solid #e5e7eb",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <MagicCube stress={stress} persona={persona} />

        <p style={{ fontSize: 13, opacity: 0.7 }}>
          The cube reflects normalized stress across people, cost, macro, and execution.
        </p>

        <a href="/resolution/retention_simulator.html" target="_blank" rel="noreferrer">
          <button style={{ width: "100%" }}>
            Open Retention Simulator
          </button>
        </a>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
