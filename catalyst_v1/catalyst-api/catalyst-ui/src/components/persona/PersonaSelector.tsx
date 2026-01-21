import type { Persona } from "../../types/persona.ts";

type Props = {
  value: Persona;
  onChange: (p: Persona) => void;
};

export default function PersonaSelector({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{ marginRight: "12px", fontWeight: 500 }}>
        Persona:
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Persona)}
        style={{ padding: "6px 10px" }}
      >
        <option value="CHRO">CHRO</option>
        <option value="CFO">CFO</option>
        <option value="CEO">CEO</option>
      </select>
    </div>
  );
}
