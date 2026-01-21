type KpiCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  description?: string | null;
};

export default function KpiCard({
  title,
  value,
  unit,
  description,
}: KpiCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px",
        minWidth: "220px",
      }}
    >
      <div style={{ fontSize: "14px", color: "#6b7280" }}>{title}</div>

      <div style={{ fontSize: "28px", fontWeight: 600, marginTop: "8px" }}>
        {value}
        {unit ? ` ${unit}` : ""}
      </div>

      {description && (
        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
          {description}
        </div>
      )}
    </div>
  );
}
