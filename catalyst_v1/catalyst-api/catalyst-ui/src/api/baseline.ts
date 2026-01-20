import { apiGet } from "./client";
import type { BaselineResponse } from "../types/api.ts";

export function fetchBaseline() {
  return apiGet<BaselineResponse>("/intelligence/baseline");
}
