import { useEffect, useState } from "react";
import { runSimulation, type SimulationResponse } from "../api/simulation";
import KpiCard from "../components/kpi/KpiCard";

/* =========================================================
   Currency (US$ canonical)
========================================================= */
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/* =========================================================
   Page
========================================================= */

export default function SimulatePage() {
  // ---------------------------------------------------------
  // Controls
  // ---------------------------------------------------------
  const [riskReductionPct, setRiskReductionPct] = useState(25);
  const [interventionCost, setInterventionCost] = useState(120000);
  const [persona, setPersona] = useState<"CFO" | "CHRO">("CFO");

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------
  const [simulation, setSimulation] =
    useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // Baseline (v1 hardcoded – must match backend)
  // ---------------------------------------------------------
  const baselineAttritionRisk = 24.2;
  const baselineAnnualCost = 1940;

  // ---------------------------------------------------------
  // Run simulation (debounced)
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------
  const simulatedRisk =
    simulation?.simulated_kpis?.attrition_risk?.value;

  const simulatedCost =
    simulation?.simulated_kpis?.annual_attrition_cost_exposure?.value;

  const riskDelta =
    simulatedRisk !== undefined
      ? +(baselineAttritionRisk - simulatedRisk).toFixed(1)
      : undefined;

  const costDelta =
    simulatedCost !== undefined
      ? baselineAnnualCost - simulatedCost
      : undefined;

  // ---------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------
  const renderDelta = (
    delta: number | undefined,
    goodDirection: "up" | "down"
  ) => {
    if (delta === undefined || delta === 0) return null;

    const positive =
      (goodDirection === "down" && delta > 0) ||
      (goodDirection === "up" && delta < 0);

    return (
      <span
        style={{
          marginLeft: 6,
          fontSize: 12,
          color: positive ? "#22c55e" : "#ef4444",
        }}
      >
        {positive ? "▲" : "▼"} {Math.abs(delta)}
      </span>
    );
  };

  // ---------------------------------------------------------
  // Copy / Export
  // ---------------------------------------------------------
  const copyExecutiveSummary = () => {
    if (!simulation) return;

    const text = `
Executive Summary (${persona})

Risk reduction: ${riskReductionPct}%
Cost avoided: ${USD.format(simulation.cfo_impact.cost_avoided)}
Net ROI: ${USD.format(simulation.cfo_impact.net_roi)}
Confidence: ${Math.round(
      simulation.confidence.confidence_level * 100
    )}%
`.trim();

    navigator.clipboard.writeText(text);
  };

  const exportForEmail = () => {
    if (!simulation) return;

    const text = `
Subject: Catalyst Simulation Summary (${persona})

Under a ${riskReductionPct}% attrition risk reduction scenario,
Catalyst estimates ${USD.format(
      simulation.cfo_impact.cost_avoided
    )} in avoided attrition-related costs,
resulting in a net ROI of ${USD.format(
      simulation.cfo_impact.net_roi
    )}.
`.trim();

    navigator.clipboard.writeText(text);
  };

  const exportForSlides = () => {
    if (!simulation) return;

    const text = `
CATALYST — SIMULATION SUMMARY

• Risk reduction: ${riskReductionPct}%
• Cost avoided: ${USD.format(simulation.cfo_impact.cost_avoided)}
• Net ROI: ${USD.format(simulation.cfo_impact.net_roi)}
• Confidence: ${Math.round(
      simulation.confidence.confidence_level * 100
    )}%
`.trim();

    navigator.clipboard.writeText(text);
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <div>
      <h1>Simulation</h1>

      {/* Persona selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>View as:</label>
        <select
          value={persona}
          onChange={(e) =>
            setPersona(e.target.value as "CFO" | "CHRO")
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
          <label>Intervention Cost (USD)</label>
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
        <>
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
              <>
                Under a <strong>{riskReductionPct}%</strong> attrition
                risk reduction scenario, Catalyst estimates{" "}
                <strong>
                  {USD.format(simulation.cfo_impact.cost_avoided)}
                </strong>{" "}
                in avoided costs, resulting in a net ROI of{" "}
                <strong>
                  {USD.format(simulation.cfo_impact.net_roi)}
                </strong>
                .
              </>
            ) : (
              <>
                A <strong>{riskReductionPct}%</strong> reduction in
                attrition risk is projected to improve workforce
                stability and reduce the likelihood of regretted
                exits.
              </>
            )}

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button onClick={copyExecutiveSummary}>
                Copy Summary
              </button>
              <button onClick={exportForEmail}>
                Export Email
              </button>
              <button onClick={exportForSlides}>
                Export Slides
              </button>
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

              <tr>
                <td>Attrition Risk</td>
                <td>{baselineAttritionRisk}%</td>
                <td>
                  {simulatedRisk !== undefined
                    ? `${simulatedRisk}%`
                    : "—"}
                  {renderDelta(riskDelta, "down")}
                </td>
              </tr>

              <tr>
                <td>Annual Attrition Cost</td>
                <td>{USD.format(baselineAnnualCost)}</td>
                <td>
                  {simulatedCost !== undefined
                    ? USD.format(simulatedCost)
                    : "—"}
                  {renderDelta(costDelta, "down")}
                </td>
              </tr>

              <tr>
                <td>Net Capital Impact</td>
                <td>—</td>
                <td
                  style={{
                    color:
                      simulation.cfo_impact.net_roi >= 0
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {USD.format(simulation.cfo_impact.net_roi)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Workforce Impact */}
          <h3>Workforce Impact</h3>

          <div style={{ display: "flex", gap: 16 }}>
            <KpiCard
              title="Attrition Risk"
              value={
                simulatedRisk !== undefined
                  ? `${simulatedRisk}%`
                  : "—"
              }
              delta={riskDelta}
            />
            <KpiCard
              title="Annual Attrition Cost"
              value={
                simulatedCost !== undefined
                  ? USD.format(simulatedCost)
                  : "—"
              }
              delta={costDelta}
            />
          </div>

          {/* Confidence */}
          <p style={{ marginTop: 16, color: "#6b7280" }}>
            Estimated confidence range:{" "}
            {USD.format(simulation.confidence.low)} –{" "}
            {USD.format(simulation.confidence.high)} (
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
