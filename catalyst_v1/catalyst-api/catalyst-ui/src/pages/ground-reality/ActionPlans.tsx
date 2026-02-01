export default function ActionPlans() {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 20,
                height: "fit-content",
            }}
        >
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
                Recommended Action Plan
            </h3>

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Initiative 1: Leadership Intervention
                </div>
                <p style={{ fontSize: 13, opacity: 0.8 }}>
                    The data indicates poor management as a primary driver of attrition
                    risk. Implement structured leadership development for managers.
                </p>
                <ul style={{ fontSize: 13, marginTop: 8, paddingLeft: 16 }}>
                    <li>30-day goal: Manager-as-Coach workshop</li>
                    <li>60-day goal: Weekly structured 1:1 check-ins</li>
                </ul>
            </div>

            <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Initiative 2: Technology Modernization
                </div>
                <p style={{ fontSize: 13, opacity: 0.8 }}>
                    Outdated tools are causing daily friction and disengagement. Prioritize
                    targeted technology upgrades.
                </p>
                <ul style={{ fontSize: 13, marginTop: 8, paddingLeft: 16 }}>
                    <li>30-day goal: Conduct technology audit</li>
                    <li>60-day goal: Approve upgrade budget</li>
                </ul>
            </div>
        </div>
    );
}
