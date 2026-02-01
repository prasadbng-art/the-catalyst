type Row = {
    location: string;
    value: number;
};

export default function LocationTable({
    title,
    rows,
    isMoney = false,
}: {
    title: string;
    rows: Row[];
    isMoney?: boolean;
}) {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 20,
                marginTop: 32,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.7 }}>
                        <th style={{ paddingBottom: 8 }}>Location</th>
                        <th style={{ paddingBottom: 8, textAlign: "right" }}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr
                            key={r.location}
                            style={{ borderTop: "1px solid #1e293b" }}
                        >
                            <td style={{ padding: "10px 0" }}>{r.location}</td>
                            <td style={{ padding: "10px 0", textAlign: "right" }}>
                                {isMoney
                                    ? `$${Math.round(r.value).toLocaleString()}`
                                    : r.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
