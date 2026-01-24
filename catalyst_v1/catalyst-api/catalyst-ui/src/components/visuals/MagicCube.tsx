type StressVector = {
  PS: number;
  TME: number;
  CR: number;
  EL: number;
  PE: number;
};

type MagicCubeProps = {
  stress: StressVector;
};

export default function MagicCube({ stress }: MagicCubeProps) {
  // -----------------------------
  // Geometry parameters
  // -----------------------------
  const base = {
    frontLeft: { x: 90, y: 110 },
    frontRight: { x: 210, y: 110 },
    backRight: { x: 230, y: 60 },
    backLeft: { x: 110, y: 60 },
  };

  const depth = 50;
  const maxPull = 30;

  // -----------------------------
  // Apply stress distortion
  // -----------------------------
  const fl = {
    x: base.frontLeft.x - stress.PS * maxPull,
    y: base.frontLeft.y + stress.PE * maxPull,
  };

  const fr = {
    x: base.frontRight.x + stress.TME * maxPull,
    y: base.frontRight.y + stress.PE * maxPull,
  };

  const br = {
    x: base.backRight.x + stress.CR * maxPull,
    y: base.backRight.y - stress.PE * maxPull,
  };

  const bl = {
    x: base.backLeft.x - stress.EL * maxPull,
    y: base.backLeft.y - stress.PE * maxPull,
  };

  // -----------------------------
  // Color intensity (risk proxy)
  // -----------------------------
  const avgStress =
    (stress.PS +
      stress.TME +
      stress.CR +
      stress.EL +
      stress.PE) /
    5;

  const fillColor =
    avgStress > 0.75
      ? "#dc2626"
      : avgStress > 0.5
      ? "#f59e0b"
      : "#16a34a";

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <svg
      width="360"
      height="300"
      viewBox="0 0 360 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="360" height="300" fill="#020617" />

      {/* Back face */}
      <polygon
        points={`${bl.x + depth},${bl.y - depth}
                 ${br.x + depth},${br.y - depth}
                 ${br.x},${br.y}
                 ${bl.x},${bl.y}`}
        fill={fillColor}
        opacity="0.25"
      />

      {/* Left face */}
      <polygon
        points={`${bl.x},${bl.y}
                 ${bl.x + depth},${bl.y - depth}
                 ${fl.x + depth},${fl.y - depth}
                 ${fl.x},${fl.y}`}
        fill={fillColor}
        opacity="0.35"
      />

      {/* Right face */}
      <polygon
        points={`${br.x},${br.y}
                 ${br.x + depth},${br.y - depth}
                 ${fr.x + depth},${fr.y - depth}
                 ${fr.x},${fr.y}`}
        fill={fillColor}
        opacity="0.35"
      />

      {/* Top face */}
      <polygon
        points={`${bl.x + depth},${bl.y - depth}
                 ${br.x + depth},${br.y - depth}
                 ${fr.x + depth},${fr.y - depth}
                 ${fl.x + depth},${fl.y - depth}`}
        fill={fillColor}
        opacity="0.3"
      />

      {/* Front face */}
      <polygon
        points={`${fl.x},${fl.y}
                 ${fr.x},${fr.y}
                 ${br.x},${br.y}
                 ${bl.x},${bl.y}`}
        fill={fillColor}
        opacity="0.45"
      />

      {/* Title */}
      <text
        x="180"
        y="24"
        textAnchor="middle"
        fill="#f9fafb"
        fontSize="14"
        fontWeight="600"
      >
        Organizational Stress Profile
      </text>
    </svg>
  );
}
