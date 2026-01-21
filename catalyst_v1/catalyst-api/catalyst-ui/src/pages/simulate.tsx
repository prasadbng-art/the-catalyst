import { useEffect, useState } from "react";
import { fetchBaseline } from "../api/baseline";
import { simulate } from "../api/simulation";
import type { BaselineResponse, SimulationResponse } from "../types/api";
import KpiCard from "../components/kpi/KpiCard";

export default function SimulationPage() {
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [riskReduction, setRiskReduction] = useState<number>(5);

  useEffect(() => {
    fetchBaseline().then(setBaseline);
  }, []);

  if (!baseline) return <div>Loading…</div>;

  const runSimulation = async () => {
    const res = await simulate({ risk_reduction_pct: riskReduction });
    setResult(res);
  };

  const baseRisk = baseline.kpis.attrition_risk.value;
  const baseCost = baseline.kpis.annual_attrition_cost_exposure.value;

  return (
    <div>
      <h1>Simulation</h1>

      {/* Controls */}
      <div style={{ margin: "16px 0" }}>
        <label>
          Reduce attrition risk by: <strong>{riskReduction}%</strong>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={riskReduction}
          onChange={(e) => setRiskReduction(Number(e.target.value))}
          style={{ width: "320px", display: "block", marginTop: "8px" }}
        />
        <button onClick={runSimulation} style={{ marginTop: "12px" }}>
          Run simulation
        </button>
      </div>

      {/* Baseline */}
      <h3>Baseline</h3>
      <div style={{ display: "flex", gap: "16px" }}>
        <KpiCard title="Attrition Risk" value={baseRisk} unit="%" />
        <KpiCard
          title="Annual Attrition Cost Exposure"
          value={baseCost.toLocaleString()}
          unit="USD"
        />
      </div>

      {/* Results */}
      {result && (
        <>
          <h3 style={{ marginTop: "24px" }}>After Simulation</h3>
          <div style={{ display: "flex", gap: "16px" }}>
            <KpiCard
              title="Attrition Risk"
              value={result.kpis.attrition_risk.value}
              unit="%"
              description={`Δ ${(
                result.kpis.attrition_risk.value - baseRisk
              ).toFixed(1)}%`}
            />
            <KpiCard
              title="Annual Attrition Cost Exposure"
              value={result.kpis.annual_attrition_cost_exposure.value.toLocaleString()}
              unit="USD"
              description={`Δ ${(
                result.kpis.annual_attrition_cost_exposure.value - baseCost
              ).toLocaleString()} USD`}
            />
          </div>
        </>
      )}
    </div>
  );
}
