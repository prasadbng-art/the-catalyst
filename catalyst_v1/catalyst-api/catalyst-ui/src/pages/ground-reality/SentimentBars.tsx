export interface SentimentDatum {
    label: string;
    positive: number;
    negative: number;
}

interface SentimentBarsProps {
    title: string;
    data: SentimentDatum[];
}

export default function SentimentBars({ title, data }: SentimentBarsProps) {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 20,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.map((item) => {
                    const total = item.positive + item.negative || 1;
                    const posPct = (item.positive / total) * 100;
                    const negPct = (item.negative / total) * 100;

                    return (
                        <div key={item.label}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 12,
                                    marginBottom: 6,
                                    opacity: 0.85,
                                }}
                            >
                                <span>{item.label}</span>
                                <span>
                                    +{item.positive}% / -{item.negative}%
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    height: 8,
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    background: "#020617",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${posPct}%`,
                                        background: "linear-gradient(90deg,#10b981,#34d399)",
                                    }}
                                />
                                <div
                                    style={{
                                        width: `${negPct}%`,
                                        background: "linear-gradient(90deg,#ef4444,#fb7185)",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
