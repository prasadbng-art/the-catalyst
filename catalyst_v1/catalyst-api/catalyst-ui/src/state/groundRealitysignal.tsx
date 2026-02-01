export type GroundRealitySignal = {
  horizonMonths: number
  attritionDeltaPct: number
  costDeltaPct: number
  dominantDriver: "PEOPLE" | "COST" | "EXECUTION" | "MACRO"
  interventionConfidence: number
}

let signal: GroundRealitySignal | null = null

export function setGroundRealitySignal(next: GroundRealitySignal) {
  signal = next
}

export function getGroundRealitySignal() {
  return signal
}
