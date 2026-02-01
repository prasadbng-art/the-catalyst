// src/demo/demoOrganizationState.ts

export const demoOrganizationState = {
    meta: {
        demoName: "Global Enterprise — Retention Stress Demo",
        snapshotDate: "2026-01-01",
        currency: "USD",
        assumptionsNote:
            "Synthetic dataset representing a 1,900-person global enterprise experiencing elevated retention stress in select locations.",
    },

    organization: {
        headcount: 1900,

        regions: [
            { id: "americas", name: "Americas" },
            { id: "emea", name: "EMEA" },
            { id: "apac", name: "APAC" },
        ],

        locations: [
            { id: "new_york", name: "New York", regionId: "americas" },
            { id: "warsaw", name: "Warsaw", regionId: "emea" },
            { id: "london", name: "London", regionId: "emea" },
            { id: "bangalore", name: "Bangalore", regionId: "apac" },
            { id: "tokyo", name: "Tokyo", regionId: "apac" },
        ],
    },

    /* ======================================================
       PEOPLE — PRIMARY STRESS VERTEX
    ====================================================== */
    people: {
        entities: [
            {
                id: "p1",
                name: "A. Kowalski",
                role: "Senior Engineer",
                function: "Engineering",
                locationId: "warsaw",
                baselineRiskPct: 78,
                sentimentScore: -42,
                riskDrivers: [
                    "Long Time Since Promotion",
                    "Poor Manager Score",
                    "Low Engagement",
                ],
            },
            {
                id: "p2",
                name: "M. Nowak",
                role: "Product Analyst",
                function: "Product",
                locationId: "warsaw",
                baselineRiskPct: 71,
                sentimentScore: -35,
                riskDrivers: [
                    "Low Compensation Ratio",
                    "Stagnant Performance",
                ],
            },
            {
                id: "p3",
                name: "R. Sharma",
                role: "Platform Engineer",
                function: "Engineering",
                locationId: "bangalore",
                baselineRiskPct: 64,
                sentimentScore: -18,
                riskDrivers: [
                    "Tooling Fragmentation" as any, // mapped via execution later
                    "Low Engagement",
                ],
            },
            {
                id: "p4",
                name: "S. Tanaka",
                role: "Operations Lead",
                function: "Operations",
                locationId: "tokyo",
                baselineRiskPct: 52,
                sentimentScore: -5,
                riskDrivers: [
                    "Role Ambiguity" as any,
                ],
            },
            {
                id: "p5",
                name: "J. Miller",
                role: "Sales Manager",
                function: "Sales",
                locationId: "new_york",
                baselineRiskPct: 46,
                sentimentScore: 8,
                riskDrivers: [
                    "Low Compensation Ratio",
                ],
            },
        ],
    },

    /* ======================================================
       COST — FINANCIAL STRESS VERTEX
    ====================================================== */
    cost: {
        baselineAttritionRatePct: 18,

        attritionCostPerPerson: 124_000,

        costByLocation: [
            {
                locationId: "warsaw",
                annualAttritionCost: 12_400_000,
            },
            {
                locationId: "bangalore",
                annualAttritionCost: 9_800_000,
            },
            {
                locationId: "new_york",
                annualAttritionCost: 8_400_000,
            },
            {
                locationId: "london",
                annualAttritionCost: 6_500_000,
            },
            {
                locationId: "tokyo",
                annualAttritionCost: 5_600_000,
            },
        ],
    },

    /* ======================================================
       EXECUTION — DELIVERY & FRICTION VERTEX
    ====================================================== */
    execution: {
        executionRiskPct: 47,

        frictionDrivers: [
            "Tooling Fragmentation",
            "Decision Latency",
            "Role Ambiguity",
        ],
    },

    /* ======================================================
       MACRO — EXOGENOUS PRESSURE VERTEX
    ====================================================== */
    macro: {
        macroRiskPct: 58,

        factors: [
            "Labor Market Tightness",
            "Economic Uncertainty",
        ],
    },
} as const;
