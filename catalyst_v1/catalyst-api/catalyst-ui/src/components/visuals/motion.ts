// =======================================================
// Motion State Model — Catalyst Visual Intelligence
// =======================================================

export type Persona = "CEO" | "CFO" | "CHRO";
export type MotionState = "stable" | "tension" | "overload";
export type StressProfile = {
  people: number;     // People / talent pressure (0–100)
  cost: number;       // Cost rigidity / margin pressure (0–100)
  macro: number;      // External volatility (0–100)
  execution: number;  // Execution / operating strain (0–100)
};

/**
 * Computes the motion state of the system based on
 * stress concentration and intensity.
 *
 * This logic is intentionally simple, explainable,
 * and executive-auditable.
 */
export function getMotionState(
  stress: StressProfile
): MotionState {
  const max  = Math.max(
    stress.people,
    stress.cost,
    stress.macro,
    stress.execution
  );
  
  if (max<50) return "stable";
  if (max<70) return "tension";
  return "overload";
}
// =================================
// Persona-aware Annotation
// =================================

export function getMotionAnnotation(
  state: MotionState,
  persona: Persona
): {
  title: string;
  message: string;
} {
  // ============================
  // CEO PERSPECTIVE
  // ============================
  if (persona === "CEO") {
    switch (state) {
      case "stable":
        return {
          title: "System Absorbing Pressure",
          message:
            "Organizational pressure is present but contained. The system is flexing without structural distortion, preserving strategic optionality under current conditions.",
        };

      case "tension":
        return {
          title: "Resilience Under Test",
          message:
            "Pressure is concentrating in specific areas of the organization. While overall stability remains intact, sustained stress may begin to constrain execution flexibility.",
        };

      case "overload":
        return {
          title: "Systemic Strain Emerging",
          message:
            "Multiple stressors are acting simultaneously, reducing organizational resilience. Without intervention, the system’s ability to absorb shocks and pursue strategic change may be compromised.",
        };
    }
  }

  // ============================
  // CFO PERSPECTIVE
  // ============================
  switch (state) {
    case "stable":
      return {
        title: "Risk Contained",
        message:
          "Current stress levels are unlikely to translate into near-term financial exposure. Cost volatility remains buffered under existing operating conditions.",
      };

    case "tension":
      return {
        title: "Risk Concentration Forming",
        message:
          "Stress is localizing in areas that historically precede cost leakage. While immediate impact is limited, continued pressure increases the probability of downstream financial exposure.",
      };

    case "overload":
      return {
        title: "Elevated Financial Exposure",
        message:
          "Multiple stress drivers are active concurrently, increasing the likelihood that operational strain converts into measurable cost impact. Financial risk is no longer fully timing-insulated.",
      };
  }
}

