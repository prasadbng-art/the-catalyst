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
