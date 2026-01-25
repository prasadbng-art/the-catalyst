/* ================================
   Types
================================ */
type SimulationResult = {
  totalCost: number;
  totalBenefit: number;
};

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
      return "This initiative generates strong economic surplus and meaningfully expands enterprise value beyond its capital at risk.";
    case "Accretive":
      return "Returns exceed cost of investment with a healthy buffer, supporting disciplined growth and capital efficiency.";
    case "Marginal":
      return "The initiative clears minimum financial thresholds but offers limited upside. Execution discipline will determine value realization.";
    case "Value-Eroding":
      return "Returns are near breakeven. Financial value is fragile and highly sensitive to execution and external volatility.";
    case "Capital Destructive":
      return "Projected returns do not recover invested capital. Proceeding would reduce enterprise value unless strategic non-financial factors dominate.";
  }
}

/* ================================
   Component
================================ */

type Props = {
  result: SimulationResult; // already coming from your existing simulation
};

export default function Simulate({ result }: Props) {
  const roiMultiple = getROIMultiple(result.totalBenefit, result.totalCost);
  const band = getROIBand(roiMultiple);
  const bandColor = getBandColor(band);

  return (
    <div style={{ padding: 24 }}>

      {/* Existing Financial Summary */}
      <h2>Financial Impact Summary</h2>
      <p><strong>Total Cost:</strong> {USD.format(result.totalCost)}</p>
      <p><strong>Total Benefit:</strong> {USD.format(result.totalBenefit)}</p>
      <p><strong>ROI Multiple:</strong> {roiMultiple.toFixed(2)}x</p>

      {/* ================= CFO ROI THRESHOLD BANDS ================= */}
      <div style={{ marginTop: 40 }}>
        <h2>CFO ROI Threshold Assessment</h2>

        {/* Visual Band Bar */}
        <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {(["Capital Destructive", "Value-Eroding", "Marginal", "Accretive", "Value-Creating"] as ROIBand[])
            .map((b) => (
              <div
                key={b}
                style={{
                  flex: 1,
                  background: getBandColor(b),
                  opacity: b === band ? 1 : 0.25,
                  transition: "opacity 0.3s",
                }}
              />
            ))}
        </div>

        {/* Label */}
        <div style={{ fontSize: 18, fontWeight: 600, color: bandColor }}>
          {band}
        </div>

        {/* CFO Narrative */}
        <p style={{ marginTop: 12, maxWidth: 720, lineHeight: 1.6 }}>
          {getCFONarrative(band)}
        </p>

        {/* Board-Safe Interpretation */}
        <div style={{
          marginTop: 16,
          padding: 16,
          background: "#f5f7fa",
          borderLeft: `6px solid ${bandColor}`,
          maxWidth: 720
        }}>
          <strong>Board Interpretation:</strong>
          <p style={{ marginTop: 8 }}>
            This classification is derived from the ratio of projected financial benefit to required investment.
            It does not alter simulation assumptions, only frames financial attractiveness using capital allocation logic.
          </p>
        </div>
      </div>
    </div>
  );
}
