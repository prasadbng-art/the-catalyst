export const demoOrganizationState = {
    people: {
        entities: [
            {
                id: "p1",
                name: "Sarah Chen",
                role: "Senior Engineer",
                function: "Engineering",
                locationId: "warsaw",
                baselineRiskPct: 88,
                riskDrivers: [
                    "Long Time Since Promotion",
                    "Poor Manager Score",
                    "Low Engagement",
                ],
            },
            {
                id: "p2",
                name: "Przemeslaw Sabojtnik",
                role: "Client Services Lead",
                function: "Client Services",
                locationId: "warsaw",
                baselineRiskPct: 91,
                riskDrivers: [
                    "Low Compensation Ratio",
                    "Stagnant Performance",
                ],
            },
            {
                id: "p3",
                name: "Miroslav Dzebek",
                role: "Data Scientist",
                function: "Data Science",
                locationId: "warsaw",
                baselineRiskPct: 84,
                riskDrivers: [
                    "Tooling Fragmentation",
                    "Low Engagement",
                ],
            },
            {
                id: "p4",
                name: "Dominic Radek",
                role: "Operations Lead",
                function: "Operations",
                locationId: "warsaw",
                baselineRiskPct: 82,
                riskDrivers: ["Role Ambiguity"],
            },
            {
                id: "p5",
                name: "Lucas Piczcek",
                role: "HR Partner",
                function: "HR",
                locationId: "warsaw",
                baselineRiskPct: 74,
                riskDrivers: ["Low Compensation Ratio"],
            },

            // ✅ NEW DEMO CARD (IDENTICAL SHAPE)
            {
                id: "p6",
                name: "Elena Novak",
                role: "Product Manager",
                function: "Product",
                locationId: "warsaw",
                baselineRiskPct: 85,
                riskDrivers: [
                    "Role Ambiguity",
                    "Stakeholder Overload",
                ],
            },
        ],
    },
} as const;
