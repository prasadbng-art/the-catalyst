import { useEffect, useState } from "react";
import { runSimulation, type SimulationResponse } from "../api/simulation";
import KpiCard from "../components/kpi/KpiCard";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function SimulatePage() {
  // =========================================================
  // Controls
  // =========================================================
  const [riskReductionPct, setRiskReductionPct] = useState<number>(25);
  const [interventionCost, setInterventionCost] = useState<number>(120000);
  const [persona, setPersona] =
    useState<"CEO" | "CFO" | "CHRO">("CFO");

  // =========================================================
  // State
  // =========================================================
  const [simulation, setSimulation] =
    useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // =========================================================
  // Baseline references (v1 – hardcoded)
  // =========================================================
  const baselineAttritionRisk = 24.2;
  const baselineAnnualCost = 1940;

  // =========================================================
  // Scenario constants (v1)
  // =========================================================
  const headcount = 8;
  const costPerExit = 1_500_000;

  // =========================================================
  // Run simulation (debounced)
  // =========================================================
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

  // =========================================================
  // Derived values
  // =========================================================
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

  // =========================================================
  // Visual diff helper
  // =========================================================
  const renderDelta = (
    delta: number | undefined,
    goodDirection: "up" | "down"
  ) => {
    if (!delta || delta === 0) return null;

    const isPositive =
      (goodDirection === "down" && delta > 0) ||
      (goodDirection === "up" && delta < 0);

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

  // =========================================================
  // Copy / Save / Load / Export helpers
  // =========================================================
  const copyExecutiveSummary = () => {
    if (!simulation) return;

    const text = `
Executive Summary (${persona})

This scenario improves workforce stability but does not materially improve
near-term financial returns under current assumptions.

Primary trade-off: reduced people risk in exchange for higher execution load.
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

  const exportForEmail = () => {
    if (!simulation) return;

    const text = `
Subject: Catalyst Simulation Summary (${persona})

This scenario improves workforce stability by reducing attrition risk.
Financial outcomes remain sensitive to execution quality and scale.
`.trim();

    navigator.clipboard.writeText(text);
  };

  const exportForSlides = () => {
    if (!simulation) return;

    const text = `
CATALYST — SIMULATION SUMMARY

• Risk reduction target: ${riskReductionPct}%
• Strategic intent: Improve resilience
• Key trade-off: Execution capacity vs people risk
`.trim();

    navigator.clipboard.writeText(text);
  };

  // =========================================================
  // Render
  // =========================================================
  return (
    <div>
      <h1>Simulation</h1>

      {/* Persona selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>View as:</label>
        <select
          value={persona}
          onChange={(e) =>
            setPersona(
              e.target.value as "CEO" | "CFO" | "CHRO"
            )
          }
        >
          <option value="CEO">CEO</option>
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
            <h3>Executive Summary</h3>

            {persona === "CEO" && (
              <>
                <p>
                  This scenario improves workforce stability but does
                  not materially improve near-term financial returns
                  under current assumptions.
                </p>
                <p>
                  The intervention redistributes organizational
                  pressure away from people-related risk and toward
                  execution capacity.
                </p>
                <p>
                  <strong>
                    Directionally sound
                  </strong>{" "}
                  if leadership bandwidth is available and resilience
                  is the primary objective.
                </p>
                <ul>
                  <li>Benefits accrue gradually</li>
                  <li>Execution strain increases</li>
                  <li>Value improves beyond higher thresholds</li>
                </ul>
              </>
            )}

            {persona === "CFO" && (
              <>
                <p>
                  Under current assumptions, this intervention reduces
                  attrition-related cost exposure but does not generate
                  a positive net return within the modeled period.
                </p>

                <p>
                  The primary constraint is <strong>scale</strong>:
                  financial returns remain negative because avoided
                  attrition costs do not yet offset the fixed
                  intervention investment.
                </p>

                <p>
                  <strong>Break-even improves materially</strong> if
                  one or more of the following conditions are met:
                </p>

                <ul>
                  <li>
                    Risk reduction exceeds the current scenario
                    assumptions
                  </li>
                  <li>
                    Cost per regretted exit is higher than modeled
                  </li>
                  <li>
                    Intervention costs can be staged or targeted
                  </li>
                </ul>

                <p>
                  <strong>CFO Guidance:</strong> This scenario is best
                  treated as a <em>risk containment investment</em>
                  rather than a near-term cost recovery initiative.
                  Financial viability improves with tighter targeting
                  and phased deployment.
                </p>
              </>
            )}


            {persona === "CHRO" && (
              <>
                <p>
                  Attrition risk declines meaningfully, indicating
                  improved workforce stability under the proposed
                  intervention.
                </p>
                <p>
                  The impact is strongest in high-risk segments,
                  suggesting targeted rather than broad deployment.
                </p>
                <ul>
                  <li>Regretted exits reduced</li>
                  <li>Stability improves before cost recovery</li>
                  <li>Phased rollout recommended</li>
                </ul>
              </>
            )}

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button onClick={copyExecutiveSummary}>
                Copy Summary
              </button>
              <button onClick={exportForEmail}>
                Export Email
              </button>
              <button onClick={exportForSlides}>
                Export Slides
              </button>
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
                <td>
                  <strong>Baseline</strong>
                </td>
                <td>
                  <strong>Simulated</strong>
                </td>
              </tr>

              <tr>
                <td>Attrition Risk</td>
                <td>{baselineAttritionRisk}%</td>
                <td>
                  {simulatedRisk}%{" "}
                  {renderDelta(riskDelta, "down")}
                </td>
              </tr>

              <tr>
                <td>Annual Attrition Cost</td>
                <td>
                  USD.format{baselineAnnualCost.toLocaleString()}
                </td>
                <td>
                  USD.format{simulatedCost?.toLocaleString()}{" "}
                  {renderDelta(costDelta, "down")}
                </td>
              </tr>

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
                  {USD.format(simulation.cfo_impact.net_roi)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Workforce KPIs */}
          <h3>Workforce Impact</h3>

          <div style={{ display: "flex", gap: 16 }}>
            <KpiCard
              title="Attrition Risk"
              value={`USD.format{simulatedRisk}%`}
              delta={riskDelta}
            />
            <KpiCard
              title="Annual Attrition Cost"
              value={`USD.format{simulatedCost?.toLocaleString()}`}
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
