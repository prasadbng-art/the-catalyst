type Props = {
  label: string;
  value: number;
};

export default function KPICard({ label, value }: Props) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 16 }}>
      <h3>{label}</h3>
      <strong>{value}</strong>
    </div>
  );
}
