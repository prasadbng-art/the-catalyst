export const aiDiagnosticQuestions = [

    {
        id: "task_structure",
        dimension: "Workforce Exposure",
        question: "What proportion of your workforce performs repetitive or rule-based digital tasks?",
        options: [
            { label: "0–20%", value: 20 },
            { label: "20–40%", value: 40 },
            { label: "40–60%", value: 60 },
            { label: "60–80%", value: 80 },
            { label: "80–100%", value: 100 }
        ]
    },

    {
        id: "cognitive_complexity",
        dimension: "Workforce Exposure",
        question: "How much of the work requires judgement, creativity, or negotiation?",
        options: [
            { label: "Very High", value: 20 },
            { label: "High", value: 40 },
            { label: "Moderate", value: 60 },
            { label: "Low", value: 80 },
            { label: "Very Low", value: 100 }
        ]
    },

    {
        id: "role_fragmentation",
        dimension: "Workforce Exposure",
        question: "How fragmented are roles into narrow, repetitive tasks?",
        options: [
            { label: "Highly integrated roles", value: 20 },
            { label: "Mostly integrated", value: 40 },
            { label: "Mixed", value: 60 },
            { label: "Fragmented", value: 80 },
            { label: "Highly fragmented", value: 100 }
        ]
    },

    {
        id: "data_infrastructure",
        dimension: "AI Readiness",
        question: "How mature is your organization's data infrastructure?",
        options: [
            { label: "Fragmented systems", value: 20 },
            { label: "Partially integrated", value: 40 },
            { label: "Central data warehouse", value: 60 },
            { label: "Advanced analytics platform", value: 80 },
            { label: "Real-time enterprise data layer", value: 100 }
        ]
    },

    {
        id: "ai_capability",
        dimension: "AI Readiness",
        question: "Does your organization have internal AI or data science capability?",
        options: [
            { label: "None", value: 20 },
            { label: "Experimental pilots", value: 40 },
            { label: "Small AI team", value: 60 },
            { label: "AI embedded in functions", value: 80 },
            { label: "Enterprise AI capability", value: 100 }
        ]
    },

    {
        id: "change_velocity",
        dimension: "AI Readiness",
        question: "How quickly does your organization adopt new technologies?",
        options: [
            { label: "Very slow adoption", value: 20 },
            { label: "Slow", value: 40 },
            { label: "Moderate", value: 60 },
            { label: "Fast", value: 80 },
            { label: "Very fast", value: 100 }
        ]
    },

    {
        id: "competitive_ai_pressure",
        dimension: "Industry Velocity",
        question: "How actively are competitors adopting AI?",
        options: [
            { label: "Rare adoption", value: 20 },
            { label: "Early experimentation", value: 40 },
            { label: "Growing adoption", value: 60 },
            { label: "Common across industry", value: 80 },
            { label: "Industry standard", value: 100 }
        ]
    },

    {
        id: "industry_digitization",
        dimension: "Industry Velocity",
        question: "How digitized is the industry value chain?",
        options: [
            { label: "Mostly manual", value: 20 },
            { label: "Partially digitized", value: 40 },
            { label: "Moderately digital", value: 60 },
            { label: "Highly digital", value: 80 },
            { label: "Fully digital ecosystem", value: 100 }
        ]
    },

    {
        id: "regulation_environment",
        dimension: "Industry Velocity",
        question: "Do regulations encourage or slow automation?",
        options: [
            { label: "Strong barriers", value: 20 },
            { label: "Moderate barriers", value: 40 },
            { label: "Neutral", value: 60 },
            { label: "Supports automation", value: 80 },
            { label: "Strongly pro-automation", value: 100 }
        ]
    },

    {
        id: "labor_cost_pressure",
        dimension: "Macro Environment",
        question: "How rapidly are labor costs rising relative to revenue?",
        options: [
            { label: "Declining", value: 20 },
            { label: "Stable", value: 40 },
            { label: "Moderate growth", value: 60 },
            { label: "Rapid growth", value: 80 },
            { label: "Very rapid growth", value: 100 }
        ]
    },

    {
        id: "talent_availability",
        dimension: "Macro Environment",
        question: "How difficult is it to hire skilled workers?",
        options: [
            { label: "Very easy", value: 20 },
            { label: "Easy", value: 40 },
            { label: "Moderate", value: 60 },
            { label: "Difficult", value: 80 },
            { label: "Very difficult", value: 100 }
        ]
    },

    {
        id: "economic_outlook",
        dimension: "Macro Environment",
        question: "What is the economic outlook for your industry?",
        options: [
            { label: "Strong contraction", value: 20 },
            { label: "Weak outlook", value: 40 },
            { label: "Stable", value: 60 },
            { label: "Growth expected", value: 80 },
            { label: "Strong growth", value: 100 }
        ]
    }

];