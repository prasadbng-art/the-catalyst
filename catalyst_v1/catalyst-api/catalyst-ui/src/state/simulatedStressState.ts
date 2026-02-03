import type { StressProfile } from "../components/visuals/motion";

const KEY = "catalyst_simulated_stress";

export function setSimulatedStress(stress: StressProfile | null) {
    if (stress) {
        sessionStorage.setItem(KEY, JSON.stringify(stress));
    } else {
        sessionStorage.removeItem(KEY);
    }
}

export function getSimulatedStress(): StressProfile | null {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StressProfile) : null;
}
