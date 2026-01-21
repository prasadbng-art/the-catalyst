type LocationDiagnostics = {
  location: string;
  headcount: number;
  recent_attrition_pct: number;
  avg_attrition_risk_pct: number;
};

type DiagnosticsTableProps = {
  rows: LocationDiagnostics[];
};

export default function DiagnosticsTable({ rows }: DiagnosticsTableProps) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "16px",
      }}
    >
      <thead>
        <tr>
          {[
            "Location",
            "Headcount",
            "Recent Attrition (%)",
            "Avg Attrition Risk (%)",
          ].map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                padding: "8px",
                borderBottom: "2px solid #e5e7eb",
                fontSize: "13px",
                color: "#374151",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.location}>
            <td style={cell}>{row.location}</td>
            <td style={cell}>{row.headcount}</td>
            <td style={cell}>{row.recent_attrition_pct}%</td>
            <td style={cell}>{row.avg_attrition_risk_pct}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const cell: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
};
