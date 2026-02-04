import type { StressProfile } from "../components/visuals/motion";

type SimulationState = {
    stress: StressProfile;
    riskReductionPct: number;
    horizonYears: 1 | 3;
};

let simulatedState: SimulationState | null = null;

/* ================= SET ================= */
export function setSimulatedStress(
    stress: StressProfile,
    riskReductionPct: number,
    horizonYears: 1 | 3
) {
    simulatedState = {
        stress,
        riskReductionPct,
        horizonYears,
    };

    console.log("SETTING SIMULATION STATE:", simulatedState);
}

/* ================= GET ================= */
export function getSimulatedStress() {
    return simulatedState;
}

/* ================= RESET ================= */
export function clearSimulatedStress() {
    simulatedState = null;
}
