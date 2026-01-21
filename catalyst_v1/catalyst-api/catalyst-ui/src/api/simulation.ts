// src/api/simulation.ts

type SimulationPayload = {
  risk_reduction_pct: number;
  intervention_cost: number;
};

export async function runSimulation(payload: SimulationPayload) {
  const res = await fetch("http://127.0.0.1:8000/intelligence/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Simulation request failed");
  }

  return res.json();
}
