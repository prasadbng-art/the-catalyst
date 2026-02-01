export const demoOrganizationState = {
    people: {
        entities: [
            {
                id: "p1",
                name: "A. Kowalski",
                role: "Senior Engineer",
                function: "Engineering",
                locationId: "warsaw",
                baselineRiskPct: 78,
                riskDrivers: [
                    "Long Time Since Promotion",
                    "Poor Manager Score",
                    "Low Engagement",
                ],
            },
            {
                id: "p2",
                name: "D. Lee",
                role: "Client Services Lead",
                function: "Client Services",
                locationId: "warsaw",
                baselineRiskPct: 71,
                riskDrivers: [
                    "Low Compensation Ratio",
                    "Stagnant Performance",
                ],
            },
            {
                id: "p3",
                name: "M. Garcia",
                role: "Data Scientist",
                function: "Data Science",
                locationId: "warsaw",
                baselineRiskPct: 64,
                riskDrivers: [
                    "Tooling Fragmentation",
                    "Low Engagement",
                ],
            },
            {
                id: "p4",
                name: "S. Tanaka",
                role: "Operations Lead",
                function: "Operations",
                locationId: "warsaw",
                baselineRiskPct: 52,
                riskDrivers: [
                    "Role Ambiguity",
                ],
            },
            {
                id: "p5",
                name: "L. Brown",
                role: "HR Partner",
                function: "HR",
                locationId: "warsaw",
                baselineRiskPct: 46,
                riskDrivers: [
                    "Low Compensation Ratio",
                ],
            },
        ],
    },
} as const;
