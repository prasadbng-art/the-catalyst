import KPICard from "./KPICard";
import type { KPIValue } from "../../types/api";

type Props = {
  kpis: Record<string, KPIValue>;
};

export default function KPIGrid({ kpis }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {Object.entries(kpis).map(([key, kpi]) => (
        <KPICard
          key={key}
          label={key.replace(/_/g, " ").toUpperCase()}
          value={kpi.value}
        />
      ))}
    </div>
  );
}
