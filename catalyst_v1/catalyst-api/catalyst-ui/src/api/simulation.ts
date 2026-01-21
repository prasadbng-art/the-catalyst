export type CFOImpact = {
  intervention_cost: number;
  cost_avoided: number;
  net_roi: number;
  roi_multiple: number | null;
};

export type ConfidenceBand = {
  low: number;
  high: number;
  confidence_level: number;
};

export type SimulationResponse = {
  baseline_cost: number;
  simulated_cost: number;
  avoided_cost: number;
  risk_reduction_pct: number;

  cfo_impact: CFOImpact;
  confidence: ConfidenceBand;

  simulated_kpis: Record<string, any>;
  diagnostics: Record<string, any>;
};

export async function runSimulation(payload: {
  risk_reduction_pct: number;
  intervention_cost: number;
}): Promise<SimulationResponse> {
  const res = await fetch("http://127.0.0.1:8000/intelligence/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Simulation request failed");
  }

  return res.json();
}
