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
        padding: "20px",
        width: "260px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: "12px",
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {value}
        </span>

        {unit && (
          <span
            style={{
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {description && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
