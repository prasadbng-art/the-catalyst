import { useState } from "react";
import { runSimulation } from "../api/simulation";

export default function SimulationPage() {
  const [riskReduction, setRiskReduction] = useState(20);
    const [interventionCost, setInterventionCost] = useState(120000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    const res = await runSimulation({
      risk_reduction_pct: riskReduction,
      intervention_cost: interventionCost,
    });
    setResult(res);
    setLoading(false);
  };

    return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: "24px" }}>
      
      {/* CONTROLS */}
      <div>
        <h3>Intervention</h3>

        <label>Risk Reduction (%)</label>
        <input
          type="range"
          min={0}
          max={40}
          value={riskReduction}
          onChange={(e) => setRiskReduction(Number(e.target.value))}
        />
        <div>{riskReduction}%</div>

        <label style={{ marginTop: "16px" }}>Intervention Cost</label>
        <input
          type="number"
          value={interventionCost}
          onChange={(e) => setInterventionCost(Number(e.target.value))}
        />

        <button onClick={handleSimulate} disabled={loading} style={{ marginTop: "16px" }}>
          {loading ? "Running..." : "Run Simulation"}
        </button>
      </div>

      {/* BEFORE vs AFTER */}
      <div>
        <h2>Impact</h2>

        {!result && <p>Run a simulation to see impact.</p>}

        {result && (
          <table width="100%">
            <tbody>
              <Row
                label="Attrition Risk"
                baseline={`${result.baseline_kpis.attrition_risk.value}%`}
                simulated={`${result.simulated_kpis.attrition_risk.value}%`}
              />
              <Row
                label="Annual Attrition Cost"
                baseline={`$${result.baseline_cost.toLocaleString()}`}
                simulated={`$${result.simulated_cost.toLocaleString()}`}
              />
            </tbody>
          </table>
        )}
      </div>

      {/* ROI VERDICT */}
      <div>
        <h3>ROI</h3>

        {result && (
          <>
            <BigNumber value={`$${result.avoided_cost.toLocaleString()}`} label="Cost Avoided" />
            <BigNumber
              value={`${(result.avoided_cost / interventionCost).toFixed(1)}×`}
              label="ROI Multiple"
            />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, baseline, simulated }: any) {
  return (
    <tr>
      <td>{label}</td>
      <td>{baseline}</td>
      <td>{simulated}</td>
    </tr>
  );
}

function BigNumber({ value, label }: any) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "28px", fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#9ca3af" }}>{label}</div>
    </div>
  );
}
