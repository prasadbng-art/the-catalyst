export type KPIValue = {
  value: number;
  unit?: string | null;
  description?: string | null;
};


export interface BaselineResponse {
  kpis: Record<string, KPIValue>;
  diagnostics: unknown;
}
