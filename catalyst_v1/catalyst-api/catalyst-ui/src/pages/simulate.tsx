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
      return "Returns are higher than the investment cost and support healthy financial performance.";
    case "Marginal":
      return "Returns are only slightly higher than the cost. Strong execution is needed to avoid losses.";
    case "Value-Eroding":
      return "Financial returns are close to the investment cost. Small problems could lead to losses.";
    case "Capital Destructive":
      return "Expected returns do not recover the investment. This would reduce financial value unless there are strong strategic reasons.";
  }
}

/* ================================
   Component
================================ */

export default function Simulate() {
  // ---- Simulation Inputs ----
  const [attritionReduction, setAttritionReduction] = useState(10); // %
  const [programCost, setProgramCost] = useState(500000); // $
  const [baselineAttritionCost] = useState(1940000); // from baseline page

  // ---- Simulation Math ----
  const projectedBenefit = baselineAttritionCost * (attritionReduction / 100);
  const roiMultiple = getROIMultiple(projectedBenefit, programCost);
  const band = getROIBand(roiMultiple);
  const bandColor = getBandColor(band);

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>

      {/* ================= Simulation Inputs ================= */}
      <section style={{ marginBottom: 32 }}>
        <h2>Simulation Assumptions</h2>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label>
            Attrition Reduction (%)
            <br />
            <input
              type="number"
              value={attritionReduction}
              onChange={(e) => setAttritionReduction(Number(e.target.value))}
            />
          </label>

          <label>
            Program Cost ($)
            <br />
            <input
              type="number"
              value={programCost}
              onChange={(e) => setProgramCost(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      {/* ================= Financial Summary ================= */}
      <section>
        <h2>Financial Impact Summary</h2>
        <p><strong>Projected Benefit:</strong> {USD.format(projectedBenefit)}</p>
        <p><strong>Investment Required:</strong> {USD.format(programCost)}</p>
        <p><strong>ROI Multiple:</strong> {roiMultiple.toFixed(2)}x</p>
      </section>

      {/* ================= ROI Bands ================= */}
      <div style={{ marginTop: 40 }}>
        <h2>CFO ROI Threshold Assessment</h2>

        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {(["Capital Destructive", "Value-Eroding", "Marginal", "Accretive", "Value-Creating"] as ROIBand[])
            .map((b) => (
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
