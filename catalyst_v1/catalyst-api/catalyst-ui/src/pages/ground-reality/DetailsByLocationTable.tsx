type Row = {
    location: string;
    attrits: number;
    cost: number;
};

export default function DetailsByLocationTable({ rows }: { rows: Row[] }) {
    return (
        <div
            style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 20,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Details by Location
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.7 }}>
                        <th style={{ paddingBottom: 8 }}>Location</th>
                        <th style={{ paddingBottom: 8, textAlign: "right" }}>
                            # Attrits (YTD)
                        </th>
                        <th style={{ paddingBottom: 8, textAlign: "right" }}>
                            Total Cost of Attrition
                        </th>
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
                                {r.attrits}
                            </td>
                            <td style={{ padding: "10px 0", textAlign: "right" }}>
                                ${r.cost.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
