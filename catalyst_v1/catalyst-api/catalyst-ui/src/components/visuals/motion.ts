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
  state: MotionState
): {
  title: string;
  message: string;
} {
  switch (state) {
    case "stable":
      return {
        title: "System Absorbing Pressure",
        message:
          "Current organizational stress is present but contained. The system is absorbing pressure without visible strain, suggesting sufficient resilience under current conditions.",
      };

    case "tension":
      return {
        title: "Localized Stress Accumulation",
        message:
          "Pressure is concentrating in specific areas of the organization. While overall stability remains intact, targeted intervention may be required to prevent escalation.",
      };

    case "overload":
      return {
        title: "System Under Strain",
        message:
          "Multiple stressors are acting simultaneously, reducing organizational resilience. Without intervention, the risk of instability and downstream impact increases materially.",
      };

    default:
      return {
        title: "",
        message: "",
      };
  }
}
