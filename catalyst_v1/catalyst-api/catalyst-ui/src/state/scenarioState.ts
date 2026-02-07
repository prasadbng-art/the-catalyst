let scenarioAttritionDeltaPct: number | null = null;

export function setScenarioAttritionDelta(deltaPct: number) {
    scenarioAttritionDeltaPct = deltaPct;
}

export function getScenarioAttritionDelta() {
    return scenarioAttritionDeltaPct;
}

export function clearScenarioAttritionDelta() {
    scenarioAttritionDeltaPct = null;
}
