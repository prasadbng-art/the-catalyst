// 1️⃣ KPI primitive
export type KPIValue = {
  value: number;
  unit?: string | null;
  description?: string | null;
};

// 2️⃣ Diagnostics types
export type LocationDiagnostics = {
  location: string;
  headcount: number;
  recent_attrition_pct: number;
  avg_attrition_risk_pct: number;
};

export type Diagnostics = {
  by_location: LocationDiagnostics[];
};

// 3️⃣ Baseline response
export type BaselineResponse = {
  kpis: {
    attrition_risk: KPIValue;
    headcount: KPIValue;
    annual_attrition_cost_exposure: KPIValue;
  };
  diagnostics: Diagnostics;
};

export type SimulationRequest = {
  risk_reduction_pct: number;
};

export type SimulationResponse = {
  kpis: {
    attrition_risk: KPIValue;
    annual_attrition_cost_exposure: KPIValue;
  };
};
