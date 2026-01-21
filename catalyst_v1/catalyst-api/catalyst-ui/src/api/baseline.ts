import { apiGet } from "./client";
import type { BaselineResponse } from "../types/api";

export function fetchBaseline(): Promise<BaselineResponse> {
  return apiGet<BaselineResponse>("/intelligence/baseline");
}
