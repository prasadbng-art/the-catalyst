type Kpi = {
    label: string;
    value: string;
    accent?: string;
};

export default function TopKpis({ items }: { items: Kpi[] }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 16,
                marginTop: 24,
            }}
        >
            {items.map((k) => (
                <div
                    key={k.label}
                    style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{k.label}</div>
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 600,
                            marginTop: 8,
                            color: k.accent ?? "#e5e7eb",
                        }}
                    >
                        {k.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
