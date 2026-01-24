// =======================================================
// Motion State Model — Catalyst Visual Intelligence
// =======================================================

export type MotionState = "stable" | "tension" | "overload";

export type StressProfile = {
  peopleRisk: number;
  costPressure: number;
  executionStrain: number;
  macroVolatility: number;
};

/**
 * Computes the motion state of the system based on
 * stress concentration and intensity.
 *
 * This logic is intentionally simple, explainable,
 * and executive-auditable.
 */
export function computeMotionState(
  stress: StressProfile
): MotionState {
  const values = Object.values(stress);

  const highStressCount = values.filter(
    (v) => v >= 0.65
  ).length;

  const maxStress = Math.max(...values);

  // Overload: multiple stressors or extreme single stress
  if (highStressCount >= 2 || maxStress >= 0.8) {
    return "overload";
  }

  // Tension: localized pressure
  if (highStressCount === 1) {
    return "tension";
  }

  // Stable: stress is present but absorbed
  return "stable";
}
export function getMotionAnnotation(
  state: MotionState,
  persona: "CEO" | "CFO"
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

