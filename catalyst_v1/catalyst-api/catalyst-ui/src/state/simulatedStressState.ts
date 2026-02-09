import type { StressProfile } from "../components/visuals/motion";

let simulatedStress: StressProfile | null = null;
const listeners = new Set<() => void>();

export function setSimulatedStress(stress: StressProfile | null) {
    console.log("[simulatedStress] setSimulatedStress called with:", stress);

    simulatedStress = stress;
    listeners.forEach((l) => {
        l();
    });
}

export function getSimulatedStress(): StressProfile | null {
    return simulatedStress;
}

export function subscribeSimulatedStress(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
