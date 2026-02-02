import type { StressProfile } from "../components/visuals/motion";

let simulatedStress: StressProfile | null = null;

export function setSimulatedStress(stress: StressProfile | null) {
    simulatedStress = stress;
}

export function getSimulatedStress(): StressProfile | null {
    return simulatedStress;
}
