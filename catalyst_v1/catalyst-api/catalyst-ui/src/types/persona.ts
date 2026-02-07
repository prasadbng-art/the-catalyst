export type Persona = "CEO" | "CFO" | "CHRO";

export const PERSONAS = {
    CEO: "CEO",
    CFO: "CFO",
    CHRO: "CHRO",
} as const;

export interface PersonEntity {
    id: string;
    name: string;
    role: string;
    function: string;
    locationId: string;
    baselineRiskPct: number;
    riskDrivers: string[];
    interventionLocked?: boolean;
}

export interface ReferenceEntity {
    id: string;
    name: string;
    role: "Reference";
    isReference: true;
}

export type OrgnizationPerson = PersonEntity | ReferenceEntity;