export interface KPIValue {
  value: number;
  description?: string;
}

export interface BaselineResponse {
  kpis: Record<string, KPIValue>;
  diagnostics: unknown;
}
