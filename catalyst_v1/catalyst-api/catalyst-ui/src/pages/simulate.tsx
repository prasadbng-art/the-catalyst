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
// Simulation constants (v1 scenario-level)
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
// Simulation driver breakdown (v1)
// -----------------------------
  const exitsAvoided =
    riskDelta !== undefined
    ? Math.round((riskDelta / 100) * headcount)
    : undefined;

  const savingsFromExits =
    exitsAvoided !== undefined
    ? exitsAvoided * costPerExit
    : undefined;

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
    CFO: [
      "net_roi",
      "roi_multiple",
      "cost_avoided",
      "intervention_cost",
    ],
    CHRO: [
      "risk_reduction",
      "cost_avoided",
      "net_roi",
    ],
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

      {/* Loading */}
      {loading && <p>Running simulation…</p>}

      {/* Simulation Output */}
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
    fontSize: 14,
    color: "#e5e7eb",
    lineHeight: 1.6,
  }}
>
  <strong>Executive Summary:</strong>{" "}
  {persona === "CFO" ? (
    <>
      Under a{" "}
      <strong>{riskReductionPct}%</strong> attrition risk reduction
      scenario, Catalyst estimates{" "}
      <strong>
        ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
      </strong>{" "}
      in avoided attrition costs, resulting in a net ROI of{" "}
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
      A{" "}
      <strong>{riskReductionPct}%</strong> reduction in attrition risk
      is projected to improve workforce stability and avoid{" "}
      <strong>
        ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
      </strong>{" "}
      in attrition-related losses under the simulated intervention.
    </>
  )}
</div>

{/* Scenario Comparison */}
<div style={{ marginBottom: 32 }}>
  <h3>Scenario Comparison</h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12,
      fontSize: 14,
      color: "#e5e7eb",
    }}
  >
    {/* Header */}
    <div></div>
    <div style={{ fontWeight: 600 }}>Baseline</div>
    <div style={{ fontWeight: 600 }}>Simulated</div>

    {/* Attrition Risk */}
    <div>Attrition Risk</div>
    <div>{baselineAttritionRisk}%</div>
    <div>
      {simulatedRisk !== undefined ? `${simulatedRisk}%` : "—"}
    </div>

    {/* Annual Cost */}
    <div>Annual Attrition Cost</div>
    <div>₹{baselineAnnualCost.toLocaleString()}</div>
    <div>
      {simulatedCost !== undefined
        ? `₹${simulatedCost.toLocaleString()}`
        : "—"}
    </div>

    {/* Financial Impact */}
    <div>Net Financial Impact</div>
    <div>—</div>
    <div>
      ₹{simulation.cfo_impact.net_roi.toLocaleString()}
    </div>
  </div>
</div>

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
          {savingsFromExits !== undefined && (
           <div
            style={{
              fontSize: 13,
              color: "#9ca3af",
              marginBottom: 24,
            }}
         >
            Implied savings from exits avoided: ₹
            {savingsFromExits.toLocaleString()}
          </div>
        )}

          {/* Narrative Insight */}
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
                <strong>{riskDelta}%</strong>, indicating improved
                workforce stability and reduced likelihood of
                regretted exits under the proposed intervention.
              </>
            )}
          </div>

          {/* Persona-ordered KPIs */}
          <h3>CFO Impact</h3>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {kpiOrderByPersona[persona].map((key) => {
              const kpi = kpiDefinitions[key];

              if (!kpi || typeof kpi.value !== "number") return null;

              return (
                <KpiCard
                  key={key} 
                  title={kpi.title}
                  value={kpi.format(kpi.value)}
                />
              );
            })}

          </div>
{simulation && (
  <div style={{ marginTop: 32 }}>
    <h3>Simulation Driver Breakdown</h3>

    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        padding: 16,
        borderRadius: 6,
        fontSize: 14,
        color: "#e5e7eb",
        lineHeight: 1.6,
      }}
    >
      {/* Driver 1 */}
      <div style={{ marginBottom: 12 }}>
        <strong>Risk Reduction Applied</strong>
        <div>
          Attrition risk reduced by{" "}
          <strong>{riskReductionPct}%</strong> through the simulated
          intervention.
        </div>
      </div>

      {/* Driver 2 */}
      <div style={{ marginBottom: 12 }}>
        <strong>Estimated Exits Avoided</strong>
        <div>
          This reduction in risk corresponds to approximately{" "}
          <strong>{exitsAvoided} fewer employee exits</strong> across the
          modeled workforce.
        </div>
      </div>

      {/* Driver 3 */}
      <div style={{ marginBottom: 12 }}>
        <strong>Cost Avoided</strong>
        <div>
          Preventing these exits avoids approximately{" "}
          <strong>
            ₹{simulation.cfo_impact.cost_avoided.toLocaleString()}
          </strong>{" "}
          in attrition-related costs, reducing annual exposure to{" "}
          <strong>
            ₹{simulatedCost?.toLocaleString()}
          </strong>.
        </div>
      </div>

      {/* Driver 4 */}
      <div>
        <strong>ROI Outcome</strong>
        <div>
          Against an intervention cost of{" "}
          <strong>
            ₹{simulation.cfo_impact.intervention_cost.toLocaleString()}
          </strong>
          , this scenario yields a net ROI of{" "}
          <strong>
            ₹{simulation.cfo_impact.net_roi.toLocaleString()}
          </strong>{" "}
          (ROI multiple:{" "}
          <strong>{simulation.cfo_impact.roi_multiple}×</strong>).
        </div>

        {persona === "CHRO" && (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            Financial ROI reflects modeled cost timing; workforce stability
            benefits may extend beyond the simulated period.
          </div>
        )}
      </div>
    </div>
  </div>
)}
      
          {/* Confidence */}
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
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
