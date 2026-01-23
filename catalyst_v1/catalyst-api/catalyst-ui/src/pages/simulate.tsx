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
  // Baseline references
  // -----------------------------
  const baselineAttritionRisk = 24.2;
  const baselineAnnualCost = 1940;

  // -----------------------------
  // Simulation constants
  // -----------------------------
  const headcount = 8;
  const costPerExit = 1_500_000;

  // -----------------------------
  // Run simulation
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
  // Derived values
  // -----------------------------
  const simulatedRisk =
    simulation?.simulated_kpis?.attrition_risk?.value;

  const simulatedCost =
    simulation?.simulated_kpis?.annual_attrition_cost_exposure?.value;

  const riskDelta =
    simulatedRisk !== undefined
      ? Math.round(baselineAttritionRisk - simulatedRisk)
      : undefined;

  const costDelta =
    simulatedCost !== undefined
      ? Math.round(baselineAnnualCost - simulatedCost)
      : undefined;

  const exitsAvoided =
    riskDelta !== undefined
      ? Math.round((riskDelta / 100) * headcount)
      : undefined;

  const savingsFromExits =
    exitsAvoided !== undefined
      ? exitsAvoided * costPerExit
      : undefined;

  // -----------------------------
  // Copy / Save / Load helpers
  // -----------------------------
  const copyExecutiveSummary = () => {
    if (!simulation) return;

    const text = `
Executive Summary (${persona})

Risk Reduction: ${riskReductionPct}%
Cost Avoided: ₹${simulation.cfo_impact.cost_avoided.toLocaleString()}
Net ROI: ₹${simulation.cfo_impact.net_roi.toLocaleString()}
Confidence: ${Math.round(
      simulation.confidence.confidence_level * 100
    )}%
`.trim();

    navigator.clipboard.writeText(text);
  };

  const saveScenario = () => {
    if (!simulation) return;

    localStorage.setItem(
      "catalyst_saved_scenario",
      JSON.stringify({
        riskReductionPct,
        interventionCost,
        simulation,
      })
    );
  };

  const loadScenario = () => {
    const saved = localStorage.getItem("catalyst_saved_scenario");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setRiskReductionPct(parsed.riskReductionPct);
    setInterventionCost(parsed.interventionCost);
    setSimulation(parsed.simulation);
  };

  // -----------------------------
// Visual diff helpers
// -----------------------------
const renderDelta = (
  delta: number | undefined,
  direction: "up" | "down"
) => {
  if (delta === undefined || delta === 0) return null;

  const isPositive =
    (direction === "down" && delta > 0) ||
    (direction === "up" && delta < 0);

  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: 12,
        color: isPositive ? "#22c55e" : "#ef4444",
      }}
    >
      {isPositive ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
};

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div>
      <h1>Simulation</h1>

      {/* Persona selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>View as:</label>
        <select
          value={persona}
          onChange={(e) =>
            setPersona(e.target.value as "CHRO" | "CFO")
          }
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
            onChange={(e) =>
              setRiskReductionPct(Number(e.target.value))
            }
          />
        </div>

        <div>
          <label>Intervention Cost</label>
          <input
            type="number"
            value={interventionCost}
            onChange={(e) =>
              setInterventionCost(Number(e.target.value))
            }
          />
        </div>
      </div>

      {loading && <p>Running simulation…</p>}

      {simulation && (
        <div>
          {/* Executive Summary */}
          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              padding: 16,
              marginBottom: 24,
              borderRadius: 6,
              color: "#e5e7eb",
            }}
          >
            <strong>Executive Summary:</strong>{" "}
            {persona === "CFO" ? (
              <span>
                Under a {riskReductionPct}% attrition risk reduction
                scenario, Catalyst estimates ₹
                {simulation.cfo_impact.cost_avoided.toLocaleString()} in
                avoided costs, resulting in a net ROI of ₹
                {simulation.cfo_impact.net_roi.toLocaleString()}.
              </span>
            ) : (
              <span>
                A {riskReductionPct}% reduction in attrition risk is
                projected to improve workforce stability and reduce
                regretted exits.
              </span>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button onClick={copyExecutiveSummary}>Copy</button>
              <button onClick={saveScenario}>Save</button>
              <button onClick={loadScenario}>Load</button>
            </div>
          </div>

          {/* Scenario Comparison */}
          
          <h3>Scenario Comparison</h3>

<table style={{ marginBottom: 24 }}>
  <tbody>
    <tr>
      <td></td>
      <td><strong>Baseline</strong></td>
      <td><strong>Simulated</strong></td>
    </tr>

    {/* Attrition Risk */}
    <tr>
      <td>Attrition Risk</td>
      <td>{baselineAttritionRisk}%</td>
      <td>
        {simulatedRisk}%
        {renderDelta(riskDelta, "down")}
      </td>
    </tr>

    {/* Annual Cost */}
    <tr>
      <td>Annual Attrition Cost</td>
      <td>₹{baselineAnnualCost.toLocaleString()}</td>
      <td>
        ₹{simulatedCost?.toLocaleString()}
        {renderDelta(costDelta, "down")}
      </td>
    </tr>

    {/* Net Impact */}
    <tr>
      <td>
        {persona === "CFO"
          ? "Net Capital Impact"
          : "Net Workforce Cost Impact"}
      </td>
      <td>—</td>
      <td
        style={{
          color:
            simulation.cfo_impact.net_roi >= 0
              ? "#22c55e"
              : "#ef4444",
        }}
      >
        ₹{simulation.cfo_impact.net_roi.toLocaleString()}
      </td>
    </tr>
  </tbody>
</table>

          {/* KPIs */}
          <h3>Workforce Impact</h3>
          <div style={{ display: "flex", gap: 16 }}>
            <KpiCard
              title="Attrition Risk"
              value={`${simulatedRisk}%`}
              delta={riskDelta}
            />
            <KpiCard
              title="Annual Attrition Cost"
              value={`₹${simulatedCost?.toLocaleString()}`}
              delta={costDelta}
            />
          </div>

          {savingsFromExits && (
            <p>
              Implied savings from exits avoided: ₹
              {savingsFromExits.toLocaleString()}
            </p>
          )}

          {/* Confidence */}
          <p style={{ marginTop: 16, color: "#6b7280" }}>
            Confidence range: ₹
            {simulation.confidence.low.toLocaleString()} – ₹
            {simulation.confidence.high.toLocaleString()} (
            {Math.round(
              simulation.confidence.confidence_level * 100
            )}
            %)
          </p>
        </div>
      )}
    </div>
  );
}
