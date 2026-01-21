import { useEffect, useState } from "react";
import { runSimulation, type SimulationResponse } from "../api/simulation";
import KpiCard from "../components/kpi/KpiCard";

export default function SimulatePage() {
  const [riskReductionPct, setRiskReductionPct] = useState(25);
  const [interventionCost, setInterventionCost] = useState(120000);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await runSimulation({
          risk_reduction_pct: riskReductionPct,
          intervention_cost: interventionCost,
        });
        setSimulation(result);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [riskReductionPct, interventionCost]);

  return (
    <div>
      <h1>Simulation</h1>

      {/* Controls */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div>
          <label>Risk Reduction (%)</label>
          <input
            type="number"
            value={riskReductionPct}
            onChange={(e) => setRiskReductionPct(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Intervention Cost</label>
          <input
            type="number"
            value={interventionCost}
            onChange={(e) => setInterventionCost(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && <p>Running simulation…</p>}

      {/* CFO Impact */}
      {simulation && (
        <div>
          <h3>CFO Impact</h3>

          <KpiCard
            title="Net ROI"
            value={`₹${simulation.cfo_impact.net_roi.toLocaleString()}`}
          />

          <KpiCard
            title="ROI Multiple"
            value={
              simulation.cfo_impact.roi_multiple
                ? `${simulation.cfo_impact.roi_multiple}×`
                : "—"
            }
          />

          <KpiCard
            title="Cost Avoided"
            value={`₹${simulation.cfo_impact.cost_avoided.toLocaleString()}`}
          />

          <KpiCard
            title="Intervention Cost"
            value={`₹${simulation.cfo_impact.intervention_cost.toLocaleString()}`}
          />

          <p style={{ marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            Estimated confidence range: ₹
            {simulation.confidence.low.toLocaleString()} – ₹
            {simulation.confidence.high.toLocaleString()} (
            {Math.round(simulation.confidence.confidence_level * 100)}%
            confidence)
          </p>
        </div>
      )}
    </div>
  );
}
