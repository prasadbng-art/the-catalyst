export interface SentimentDatum {
    label: string;
    positive: number;
    negative: number;
}

interface SentimentBarsProps {
    title: string;
    data: SentimentDatum[];
}

const SENTIMENT_DOMAIN = 50; // +/- 50% fixed scale

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function normalize(value: number) {
    return clamp(value, -SENTIMENT_DOMAIN, SENTIMENT_DOMAIN) / SENTIMENT_DOMAIN;
}

export default function SentimentBars({ title, data }: SentimentBarsProps) {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 10,
                marginTop: 10,
                marginBottom: 0
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.map((item) => {
                    const net = item.positive - item.negative;
                    const normalized = normalize(net);

                    return (
                        <div key={item.label}>
                            {/* label row */}
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
                                <span>{net > 0 ? `+${net}%` : `${net}%`}</span>
                            </div>

                            {/* bar */}
                            <div
                                style={{
                                    position: "relative",
                                    height: 8,
                                    borderRadius: 6,
                                    background: "#020617",
                                    overflow: "hidden",
                                }}
                            >
                                {/* zero baseline */}
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: 0,
                                        bottom: 0,
                                        width: 1,
                                        background: "rgba(148,163,184,0.4)",
                                    }}
                                />

                                {/* sentiment bar */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        bottom: 0,
                                        left:
                                            normalized >= 0
                                                ? "50%"
                                                : `${50 + normalized * 50}%`,
                                        width: `${Math.abs(normalized) * 50}%`,
                                        background:
                                            normalized >= 0
                                                ? "linear-gradient(90deg,#10b981,#34d399)"
                                                : "linear-gradient(90deg,#ef4444,#fb7185)",
                                        borderRadius: 6,
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
