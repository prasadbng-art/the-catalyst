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
  const baselineAttritionCost = 1_940_000;

  /* ---- Scenario State ---- */
  const [activeScenario, setActiveScenario] = useState<Scenario>(null);

  /* ---- Computation ---- */
  const projectedBenefit =
    baselineAttritionCost * (attritionReduction / 100);

  const roiMultiple = getROIMultiple(projectedBenefit, programCost);
  const band = getROIBand(roiMultiple);
  const bandColor = getBandColor(band);

  const targetROIMultiple = 3;
  const requiredBenefitForValueCreating = programCost * targetROIMultiple;
  const requiredAttritionReduction = (requiredBenefitForValueCreating / baselineAttritionCost) * 100;

  /* ---- Button Style Helper ---- */
  const scenarioButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 6,
    border: active ? "2px solid #1e40af" : "1px solid #c7d2fe",
    background: active ? "#dbeafe" : "#eef2ff",
    color: "#0f172a",
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
  });

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>

      {/* ===== Scenario Presets ===== */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Quick Scenarios</h3>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={scenarioButtonStyle(activeScenario === "Conservative")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              activeScenario === "Conservative" ? "#dbeafe" : "#eef2ff")
            }
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              activeScenario === "Expected" ? "#dbeafe" : "#eef2ff")
            }
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              activeScenario === "Aggressive" ? "#dbeafe" : "#eef2ff")
            }
            onClick={() => {
              setAttritionReduction(18);
              setProgramCost(450000);
              setActiveScenario("Aggressive");
            }}
          >
            Aggressive
          </button>
        </div>

        {activeScenario && (
          <div style={{ marginTop: 8 }}>
            <button
              style={{
                fontSize: 12,
                background: "transparent",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={() => setActiveScenario(null)}
            >
              Customize assumptions
            </button>
          </div>
        )}
      </section>

      {/* ===== Simulation Inputs ===== */}
      <section style={{ marginBottom: 32 }}>
        <h2>Simulation Assumptions</h2>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label>
            Attrition Reduction (%)
            <br />
            <input
              type="number"
              value={attritionReduction}
              disabled={activeScenario !== null}
              onChange={(e) =>
                setAttritionReduction(Number(e.target.value))
              }
            />
          </label>

          <label>
            Program Cost ($)
            <br />
            <input
              type="number"
              value={programCost}
              disabled={activeScenario !== null}
              onChange={(e) =>
                setProgramCost(Number(e.target.value))
              }
            />
          </label>
        </div>
      </section>

      {/* ===== Financial Summary ===== */}
      <section>
        <h2>Financial Impact Summary</h2>
        <p><strong>Projected Benefit:</strong> {USD.format(projectedBenefit)}</p>
        <p><strong>Investment Required:</strong> {USD.format(programCost)}</p>
        <p><strong>ROI Multiple:</strong> {roiMultiple.toFixed(2)}x</p>

      </section>

      {/* ===== ROI Bands ===== */}
      <div style={{ marginTop: 40 }}>
        <h2>CFO ROI Threshold Assessment</h2>

        <div
          style={{
            display: "flex",
            height: 16,
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {(
            [
              "Capital Destructive",
              "Value-Eroding",
              "Marginal",
              "Accretive",
              "Value-Creating",
            ] as ROIBand[]
          ).map((b) => {
            return (
              <div
                key={b}
                style={{
                  flex: 1,
                  background: getBandColor(b),
                  opacity: b === band ? 1 : 0.25,
                }}
              />
            );
          })}
        </div>

        {band !== "Value-Creating" && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "#f8fafc",
              borderLeft: "4px solid #1e40af",
              maxWidth: 720,
              fontSize: 14,
              lineHeight: 1.5,
              color: "#0f172a",
            }}
          >
            <strong>What would it take to reach “Value-Creating”?</strong>
            <p style={{ marginTop: 6 }}>
              At the current investment level, this would require approximately{" "}
              <strong>{requiredAttritionReduction.toFixed(1)}%</strong> reduction
              in attrition-related cost, assuming all other factors remain unchanged.
            </p>
            <p style={{ marginTop: 6 }}>
              Outcomes at this level typically depend on multi-year impact,
              targeted critical roles, or structural cost advantages.
            </p>
          </div>
        )}

        {/* ===== Sensitivity Ladder ===== */}
        <div style={{ marginTop: 24, maxWidth: 720 }}>
          <h4 style={{ marginBottom: 8 }}>Sensitivity Check</h4>

          {[
            { label: "Base case", factor: 1 },
            { label: "–10% benefit", factor: 0.9 },
            { label: "–20% benefit", factor: 0.8 },
          ].map((s) => {
            const adjustedBenefit = projectedBenefit * s.factor;
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
                  fontSize: 14,
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

        <div style={{ fontSize: 18, fontWeight: 600, color: bandColor }}>
          {band}
        </div>

        <p style={{ marginTop: 12, maxWidth: 720, lineHeight: 1.6 }}>
          {getCFONarrative(band)}
        </p>
      </div>
    </div>
  );
}
