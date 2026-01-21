import { apiPost } from "./client";
import type { SimulationRequest, SimulationResponse } from "../types/api";

export function simulate(
  payload: SimulationRequest
): Promise<SimulationResponse> {
  return apiPost<SimulationResponse>("/intelligence/simulate", payload);
}
