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
      "This view shows the level of workforce pressure the organization is currently carrying. If attrition continues at this level, it can affect delivery timelines, leadership continuity, and overall stability. The figures below estimate the financial impact if no corrective action is taken.",
  },


  CFO: {
    headline: "Financial Risk Exposure",
    kpiOrder: [
      "annual_attrition_cost_exposure",
      "attrition_risk",
      "headcount",
    ],
    narrative:
      "Based on current workforce conditions, attrition is creating ongoing cost exposure. This model estimates the cost that could be avoided if targeted actions reduce exits. The numbers represent reasonable estimates, not guaranteed outcomes.",
  },



  CHRO: {
    headline: "Workforce Stability Overview",
    kpiOrder: [
      "attrition_risk",
      "headcount",
      "annual_attrition_cost_exposure",
    ],
    narrative:
      "Current stress levels indicate higher risk of unwanted employee exits. This view helps identify where intervention can improve retention and workforce stability, while keeping cost impact visible and controlled.",
  },
}