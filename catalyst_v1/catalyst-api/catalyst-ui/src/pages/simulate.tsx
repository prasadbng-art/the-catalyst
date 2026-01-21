import { useEffect, useState } from "react";
import { runSimulation, type SimulationResponse } from "../api/simulation";
import KpiCard from "../components/kpi/KpiCard";

export default function SimulatePage() {
  // -----------------------------
  // Controls
  // -----------------------------
  const [riskReductionPct, setRiskReductionPct] = useState<number>(25);
  const [interventionCost, setInterventionCost] = useState<number>(120000);
  const [persona, setPersona] = useState<"CHRO" | "CFO">("CFO");

  // -----------------------------
  // State
  // -----------------------------
  const [simulation, setSimulation] =
    useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // -----------------------------
  // Baseline references (v1 hardcoded)
  // -----------------------------
  const baselineAttritionRisk = 24.2;
  const baselineAnnualCost = 1940;

  // -----------------------------
  // Run simulation (debounced)
  // -----------------------------
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

  // -----------------------------
  // Derived simulated values
  // -----------------------------
  const simulatedRisk =
    simulation?.simulated_kpis?.attrition_risk?.value;

  const simulatedCost =
    simulation?.simulated_kpis?.annual_attrition_cost_exposure?.value;

  // -----------------------------
  // Deltas (directional intelligence)
  // -----------------------------
  const riskDelta =
    simulatedRisk !== undefined
      ? Math.round(baselineAttritionRisk - simulatedRisk)
      : undefined;

  const costDelta =
    simulatedCost !== undefined
      ? Math.round(baselineAnnualCost - simulatedCost)
      : undefined;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div>
      <h1>Simulation</h1>
    <div style={{ marginBottom: 16 }}>
  <label style={{ marginRight: 12 }}>View as:</label>
  <select
    value={persona}
    onChange={(e) => setPersona(e.target.value as "CHRO" | "CFO")}
  >
    <option value="CFO">CFO</option>
    <option value="CHRO">CHRO</option>
  </select>
</div>

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

      {/* Simulation KPIs */}
      {simulation && (
        <>
          <h3>Workforce Impact</h3>

          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <KpiCard
              title="Attrition Risk"
              value={
                simulatedRisk !== undefined
                  ? `${simulatedRisk}%`
                  : "—"
              }
              delta={riskDelta}
              deltaDirection={
                riskDelta === undefined
                  ? undefined
                  : riskDelta > 0
                  ? "down"
                  : riskDelta < 0
                  ? "up"
                  : "neutral"
              }
            />

            <KpiCard
              title="Annual Attrition Cost"
              value={
                simulatedCost !== undefined
                  ? `₹${simulatedCost.toLocaleString()}`
                  : "—"
              }
              delta={costDelta}
              deltaDirection={
                costDelta === undefined
                  ? undefined
                  : costDelta > 0
                  ? "down"
                  : costDelta < 0
                  ? "up"
                  : "neutral"
              }
            />
          </div>
{simulation && (
  <div
    style={{
      background: "#111827",
      border: "1px solid #1f2937",
      padding: 16,
      marginBottom: 24,
      borderRadius: 6,
      fontSize: 14,
      color: "#d1d5db",
    }}
  >
    {persona === "CFO" ? (
      <>
        <strong>Executive Insight:</strong>{" "}
        This intervention is projected to avoid{" "}
        <strong>
          ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
        </strong>{" "}
        in attrition-related losses, delivering a net ROI of{" "}
        <strong>
          ₹{simulation.cfo_impact.net_roi.toLocaleString()}
        </strong>{" "}
        with a confidence level of{" "}
        {Math.round(
          simulation.confidence.confidence_level * 100
        )}
        %.
      </>
    ) : (
      <>
        <strong>People Insight:</strong>{" "}
        Attrition risk is projected to decline by{" "}
        <strong>{riskDelta}%</strong>, indicating improved workforce
        stability and reduced likelihood of regretted exits under the
        proposed intervention.
      </>
    )}
  </div>
)}
      
          <h3>CFO Impact</h3>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
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
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: "#6b7280" }}>
            Estimated confidence range: ₹
            {simulation.confidence.low.toLocaleString()} – ₹
            {simulation.confidence.high.toLocaleString()} (
            {Math.round(
              simulation.confidence.confidence_level * 100
            )}
            % confidence)
          </p>
        </>
      )}
    </div>
  );
}
