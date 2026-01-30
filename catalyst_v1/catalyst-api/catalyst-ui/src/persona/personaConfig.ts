import type { Persona } from "../types/persona";

export const personaConfig: Record<
  Persona,
  {
    headline: string;
    kpiOrder: (
      | "attrition_risk"
      | "headcount"
      | "annual_attrition_cost_exposure"
    )[];
    narrative: string;
  }
> = {
  CEO: {
    headline: "Enterprise Risk Snapshot",
    kpiOrder: [
      "attrition_risk",
      "annual_attrition_cost_exposure",
      "headcount",
    ],
    narrative:
      "Workforce attrition presents a cross-functional risk with implications for cost, delivery, and organizational stability.",
  },

  CFO: {
    headline: "Financial Risk Exposure",
    kpiOrder: [
      "annual_attrition_cost_exposure",
      "attrition_risk",
      "headcount",
    ],
    narrative:
      "Current attrition levels translate into material annual cost exposure, with downside risk if no action is taken.",
  },

  CHRO: {
    headline: "Workforce Stability Overview",
    kpiOrder: [
      "attrition_risk",
      "headcount",
      "annual_attrition_cost_exposure",
    ],
    narrative:
      "Attrition risk highlights potential workforce instability hotspots that require proactive talent interventions.",
  },
};
