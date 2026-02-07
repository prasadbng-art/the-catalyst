
import type { PersonEntity } from "../types/persona"
export const demoOrganizationState: {
    people: {
        entities: PersonEntity[];
    };
} = {
    people: {
        entities: [
            {
                id: "p1",
                name: "Sarah Chen",
                role: "Senior Engineer",
                function: "Engineering",
                locationId: "warsaw",
                baselineRiskPct: 87,
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
                baselineRiskPct: 81,
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
                baselineRiskPct: 77,
                riskDrivers: [
                    "Role Ambiguity",
                ],
            },
            {
                id: "p5",
                name: "Lucas Piczcek",
                role: "HR Partner",
                function: "HR",
                locationId: "warsaw",
                baselineRiskPct: 76,
                riskDrivers: [
                    "Low Compensation Ratio",
                ],
            },
            {
                id: "p6",
                name: "Baseline Control",
                role: "Reference",
                function: "-",
                locationId: "warsaw",
                baselineRiskPct: 0,
                riskDrivers: [],
                interventionLocked: true,
            }
        ],
    },
}
