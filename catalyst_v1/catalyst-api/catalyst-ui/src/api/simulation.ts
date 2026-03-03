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
  // -----------------------------
  // Catalyst Simulation Types
  // -----------------------------

}
export type FinancialBand = {
  mean: number;
  p10: number;
  p90: number;
  p2_5: number;
  p97_5: number;
};

export type CatalystSimulationResponse = {
  anchors: {
    peak_psi_quarter: number;
    capital_trough_quarter: number;
    cost_stabilization_quarter: number;
  };

  margin_band: FinancialBand;
  ebitda_band: FinancialBand;
  peak_psi_band: FinancialBand;
  capital_trough_band: FinancialBand;

  steady_state_workforce: number;
};
// -----------------------------
// Catalyst Simulation Call
// -----------------------------

export async function runCatalystSimulation(payload: {
  workforce_size: number;
  avg_cost_per_employee: number;
  revenue_base: number;
  margin_base: number;
  ai_exposure: number;
  leadership_readiness: number;
  margin_buffer: number;
  capital_buffer: number;
  governance_mode: "DEFENSIVE" | "BALANCED" | "AGGRESSIVE";
}): Promise<CatalystSimulationResponse> {
  const res = await fetch("http://127.0.0.1:8000/catalyst/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      simulation_context: "DEMO",
    }),
  });

  if (!res.ok) {
    throw new Error("Catalyst simulation request failed");
  }

  return res.json();
}
