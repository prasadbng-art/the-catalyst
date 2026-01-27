import { useState } from "react";

/* ================================
   Types
================================ */
type ROIBand =
  | "Value-Creating"
  | "Accretive"
  | "Marginal"
  | "Value-Eroding"
  | "Capital Destructive";

type Scenario = "Conservative" | "Expected" | "Aggressive" | null;
type Horizon = 1 | 3;

/* ================================
   Helpers
================================ */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getROIMultiple(benefit: number, cost: number): number {
  if (!cost) return 0;
  return benefit / cost;
}

function getROIBand(roiMultiple: number): ROIBand {
  if (roiMultiple >= 3) return "Value-Creating";
  if (roiMultiple >= 2) return "Accretive";
  if (roiMultiple >= 1.2) return "Marginal";
  if (roiMultiple >= 1) return "Value-Eroding";
  return "Capital Destructive";
}

function getBandColor(band: ROIBand): string {
  switch (band) {
    case "Value-Creating": return "#1b5e20";
    case "Accretive": return "#2e7d32";
    case "Marginal": return "#f9a825";
    case "Value-Eroding": return "#ef6c00";
    case "Capital Destructive": return "#b71c1c";
  }
}

function getCFONarrative(band: ROIBand): string {
  switch (band) {
    case "Value-Creating":
      return "This initiative is expected to create strong financial value compared to its cost.";
    case "Accretive":
      return "Returns exceed investment cost and support disciplined capital allocation.";
    case "Marginal":
      return "Returns marginally exceed cost. Execution quality will determine value realization.";
    case "Value-Eroding":
      return "Returns are near breakeven and highly sensitive to execution risk.";
    case "Capital Destructive":
      return "Projected returns do not recover invested capital.";
  }
}

/* ================================
   Component
================================ */

export default function Simulate() {
  /* ---- Simulation Inputs ---- */
  const [attritionReduction, setAttritionReduction] = useState(10);
  const [programCost, setProgramCost] = useState(500000);
  const [horizon, setHorizon] = useState<Horizon>(1);

  const baselineAttritionCost = 1_940_000;

  /* ---- Scenario State ---- */
  const [activeScenario, setActiveScenario] = useState<Scenario>(null);

  /* ---- Computation ---- */
  const annualBenefit =
    baselineAttritionCost * (attritionReduction / 100);

  const totalBenefit = annualBenefit * horizon;
  const annualizedCost = programCost / horizon;

  const roiMultiple = getROIMultiple(totalBenefit, programCost);
  const band = getROIBand(roiMultiple);
  const bandColor = getBandColor(band);

  const targetROIMultiple = 3;
  const requiredBenefitForValueCreating = programCost * targetROIMultiple;
  const requiredAttritionReduction =
    (requiredBenefitForValueCreating / baselineAttritionCost) * 100;

  /* ---- Button Style Helper ---- */
  const scenarioButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 6,
    border: active ? "2px solid #1e40af" : "1px solid #c7d2fe",
    background: active ? "#dbeafe" : "#eef2ff",
    color: "#0f172a",
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h1>Simulation</h1>

      {/* ===== Scenario Presets ===== */}
      <section style={{ marginBottom: 24 }}>
        <h3>Quick Scenarios</h3>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={scenarioButtonStyle(activeScenario === "Conservative")}
            onClick={() => {
              setAttritionReduction(5);
              setProgramCost(600000);
              setActiveScenario("Conservative");
            }}
          >
            Conservative
          </button>

          <button
            style={scenarioButtonStyle(activeScenario === "Expected")}
            onClick={() => {
              setAttritionReduction(10);
              setProgramCost(500000);
              setActiveScenario("Expected");
            }}
          >
            Expected
          </button>

          <button
            style={scenarioButtonStyle(activeScenario === "Aggressive")}
            onClick={() => {
              setAttritionReduction(18);
              setProgramCost(450000);
              setActiveScenario("Aggressive");
            }}
          >
            Aggressive
          </button>
        </div>
      </section>

      {/* ===== Simulation Controls ===== */}
      <section style={{ marginBottom: 24 }}>
        <h3>Simulation Controls</h3>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label>
            Attrition Reduction (%)
            <br />
            <input
              type="number"
              value={attritionReduction}
              disabled={activeScenario !== null}
              onChange={(e) => {
                setAttritionReduction(Number(e.target.value));
                setActiveScenario(null);
              }}
              style={{ width: 160 }}
            />
          </label>

          <label>
            Program Cost ($)
            <br />
            <input
              type="number"
              value={programCost}
              disabled={activeScenario !== null}
              onChange={(e) => {
                setProgramCost(Number(e.target.value));
                setActiveScenario(null);
              }}
              style={{ width: 160 }}
            />
          </label>
        </div>

        {activeScenario && (
          <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            Manual changes will override the selected scenario.
          </p>
        )}
      </section>

      {/* ===== Time Horizon ===== */}
      <section style={{ marginBottom: 24 }}>
        <h3>Time Horizon</h3>

        {[1, 3].map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h as Horizon)}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              borderRadius: 6,
              border: h === horizon ? "2px solid #1e40af" : "1px solid #c7d2fe",
              background: h === horizon ? "#dbeafe" : "#eef2ff",
              color: h === horizon ? "#0f172a" : "#334155",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {h} Year{h > 1 ? "s" : ""}
          </button>
        ))}
      </section>

      {/* ===== Financial Summary ===== */}
      <section>
        <h2>Financial Impact Summary</h2>
        <p><strong>Projected Benefit:</strong> {USD.format(totalBenefit)}</p>
        <p><strong>Annualized Program Cost:</strong> {USD.format(annualizedCost)}</p>
        <p><strong>ROI Multiple:</strong> {roiMultiple.toFixed(2)}×</p>
      </section>

      {/* ===== ROI Bands ===== */}
      <section style={{ marginTop: 32 }}>
        <h2>CFO ROI Threshold Assessment</h2>

        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden" }}>
          {(
            ["Capital Destructive", "Value-Eroding", "Marginal", "Accretive", "Value-Creating"] as ROIBand[]
          ).map((b) => (
            <div
              key={b}
              style={{
                flex: 1,
                background: getBandColor(b),
                opacity: b === band ? 1 : 0.25,
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: bandColor }}>
          {band}
        </div>

        <p style={{ maxWidth: 720 }}>{getCFONarrative(band)}</p>

        {/* ===== Sensitivity Ladder ===== */}
        <div style={{ marginTop: 24, maxWidth: 720 }}>
          <h4 style={{ marginBottom: 8 }}>
            Sensitivity Check{" "}
            <span style={{ fontWeight: 400, color: "#64748b" }}>
              (downside scenarios)
            </span>
          </h4>

          {[
            { label: "Base case", factor: 1 },
            { label: "–10% benefit", factor: 0.9 },
            { label: "–20% benefit", factor: 0.8 },
          ].map((s) => {
            const adjustedBenefit = totalBenefit * s.factor;
            const adjustedROI = getROIMultiple(adjustedBenefit, programCost);
            const adjustedBand = getROIBand(adjustedROI);

            return (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  marginBottom: 6,
                  background: "#f8fafc",
                  borderLeft: `4px solid ${getBandColor(adjustedBand)}`,
                  color: "#0f172a",
                  fontSize: 13,
                }}
              >
                <span>{s.label}</span>
                <span style={{ fontWeight: 600 }}>
                  {adjustedROI.toFixed(2)}× — {adjustedBand}
                </span>
              </div>
            );
          })}
        </div>

        {band !== "Value-Creating" && (
          <p style={{ maxWidth: 720 }}>
            To reach <strong>Value-Creating</strong>, attrition-related cost would need to fall by approximately{" "}
            <strong>{requiredAttritionReduction.toFixed(1)}%</strong>.
          </p>
        )}
      </section>
    </div>
  );
}
