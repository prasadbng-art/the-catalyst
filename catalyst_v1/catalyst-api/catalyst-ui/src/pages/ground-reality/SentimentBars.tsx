type BarDatum = {
    label: string;
    value: number; // -100 to 100
};

function Bar({ label, value }: BarDatum) {
    const positive = value >= 0;
    const width = Math.min(Math.abs(value), 100);

    return (
        <div style={{ marginBottom: 12 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 4,
                    opacity: 0.8,
                }}
            >
                <span>{label}</span>
                <span>{value > 0 ? `+${value}` : value}</span>
            </div>

            <div
                style={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 999,
                    height: 14,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${width}%`,
                        background: positive ? "#22c55e" : "#ef4444",
                    }}
                />
            </div>
        </div>
    );
}

export default function SentimentBars({
    title,
    data,
}: {
    title: string;
    data: BarDatum[];
}) {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 20,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{title}</div>

            {data.map((d) => (
                <Bar key={d.label} {...d} />
            ))}
        </div>
    );
}
