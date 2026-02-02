import type { StressProfile } from "../components/visuals/motion";

export type OrgState = {
    stress: StressProfile;
    kpis: {
        attritionRate: number;
        attritionCost: number;
        engagement: number;
        headcount: number;
    };
};

export const baseOrgState: OrgState = {
    stress: {
        people: 0.65,
        cost: 0.7,
        execution: 0.45,
        macro: 0.6,
    },
    kpis: {
        attritionRate: 18,
        attritionCost: 1_940_000,
        engagement: -11,
        headcount: 1888,
    },
};
