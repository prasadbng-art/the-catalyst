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
  // Simulation constants
  // -----------------------------
  const headcount = 8;
  const costPerExit = 1_500_000;

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
  // Copy Executive Summary
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

Baseline → Simulated
Attrition Risk: ${baselineAttritionRisk}% → ${simulatedRisk}%
Annual Cost: ₹${baselineAnnualCost.toLocaleString()} → ₹${simulatedCost}
`.trim();

    navigator.clipboard.writeText(text);
  };

  // -----------------------------
  // KPI Definitions
  // -----------------------------
  const kpiDefinitions = {
    net_roi: {
      title: "Net ROI",
      value: simulation?.cfo_impact.net_roi,
      format: (v: number) => `₹${v.toLocaleString()}`,
    },
    roi_multiple: {
      title: "ROI Multiple",
      value: simulation?.cfo_impact.roi_multiple,
      format: (v: number) => `${v}×`,
    },
    cost_avoided: {
      title: "Cost Avoided",
      value: simulation?.cfo_impact.cost_avoided,
      format: (v: number) => `₹${v.toLocaleString()}`,
    },
    intervention_cost: {
      title: "Intervention Cost",
      value: simulation?.cfo_impact.intervention_cost,
      format: (v: number) => `₹${v.toLocaleString()}`,
    },
    risk_reduction: {
      title: "Risk Reduction",
      value: riskDelta,
      format: (v: number) => `${v}%`,
    },
  };

  const kpiOrderByPersona: Record<
    "CFO" | "CHRO",
    (keyof typeof kpiDefinitions)[]
  > = {
    CFO: ["net_roi", "roi_multiple", "cost_avoided", "intervention_cost"],
    CHRO: ["risk_reduction", "cost_avoided", "net_roi"],
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
                Under a <strong>{riskReductionPct}%</strong> attrition risk
                reduction scenario, Catalyst estimates{" "}
                <strong>
                  ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
                </strong>{" "}
                in reduced attrition-related cost exposure, resulting in a
                net capital impact of{" "}
                <strong>
                  ₹{simulation.cfo_impact.net_roi.toLocaleString()}
                </strong>{" "}
                at{" "}
                <strong>
                  {Math.round(
                    simulation.confidence.confidence_level * 100
                  )}
                  %
                </strong>{" "}
                confidence.
              </>
            ) : (
              <>
                A <strong>{riskReductionPct}%</strong> reduction in
                attrition risk is projected to improve workforce
                stability and reduce the likelihood of regretted exits,
                avoiding{" "}
                <strong>
                  ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
                </strong>{" "}
                in attrition-related losses.
              </>
            )}

            <div style={{ marginTop: 10 }}>
              <button onClick={copyExecutiveSummary}>
                Copy Summary
              </button>
            </div>
          </div>

          {/* Scenario Comparison */}
          <h3>Scenario Comparison</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div></div>
            <div><strong>Baseline</strong></div>
            <div><strong>Simulated</strong></div>

            <div>Attrition Risk</div>
            <div>{baselineAttritionRisk}%</div>
            <div>{simulatedRisk}%</div>

            <div>Annual Attrition Cost</div>
            <div>₹{baselineAnnualCost.toLocaleString()}</div>
            <div>₹{simulatedCost?.toLocaleString()}</div>

            <div>{persona === "CFO" ? "Net Capital Impact" : "Net Workforce Cost Impact"}</div>
            <div>—</div>
            <div>₹{simulation.cfo_impact.net_roi.toLocaleString()}</div>
          </div>

          {/* Workforce KPIs */}
          <h3>Workforce Impact</h3>
          <div style={{ display: "flex", gap: 16 }}>
            <KpiCard title="Attrition Risk" value={`${simulatedRisk}%`} delta={riskDelta} />
            <KpiCard title="Annual Attrition Cost" value={`₹${simulatedCost?.toLocaleString()}`} delta={costDelta} />
          </div>

          {savingsFromExits && (
            <p>Implied savings from exits avoided: ₹{savingsFromExits.toLocaleString()}</p>
          )}

          {/* Driver Breakdown */}
          <h3>Simulation Driver Breakdown</h3>
          <p>Risk reduction → exits avoided → cost avoided → ROI impact.</p>

          {/* Confidence */}
          <p style={{ marginTop: 16, color: "#6b7280" }}>
            Estimated confidence range: ₹
            {simulation.confidence.low.toLocaleString()} – ₹
            {simulation.confidence.high.toLocaleString()} (
            {Math.round(simulation.confidence.confidence_level * 100)}%
            confidence)
          </p>
        </>
      )}
    </div>
  );
}
