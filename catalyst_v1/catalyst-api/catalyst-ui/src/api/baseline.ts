import { apiGet } from "./client";
import { BaselineResponse } from "../types/api";

export function fetchBaseline() {
  return apiGet<BaselineResponse>("/intelligence/baseline");
}
