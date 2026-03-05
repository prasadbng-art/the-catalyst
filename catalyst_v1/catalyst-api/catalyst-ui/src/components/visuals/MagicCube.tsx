import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";
import type { CatalystSimulationResponse } from "../../api/simulation";

/* =====================================================
   Advanced Suspended Octahedral Stress Field
===================================================== */

type MagicCubeProps = {
    stress: StressProfile;
    rawStress?: StressProfile;
    persona: Persona;
    size?: number;
    showAnnotation?: boolean;
    catalystData?: CatalystSimulationResponse | null;
    baselineStress?: StressProfile;
};

type MotionState = "stable" | "tension" | "overload";

function SuspendedOctahedron({
    stress,
    motionState,
    ghost = false,
}: {
    stress: StressProfile;
    motionState: MotionState;
    ghost?: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    /* ---------------------------------------------
       Dominant Stress
    --------------------------------------------- */
    const dominantKey = useMemo(() => {
        return (Object.entries(stress).sort((a, b) => b[1] - a[1])[0][0] ??
            "people") as keyof StressProfile;
    }, [stress]);
    const interpolatedStress = useRef<StressProfile>({ ...stress });
    /* ---------------------------------------------
       Geometry Deformation
    --------------------------------------------- */
    const geometry = useMemo(() => {
        const geo = new THREE.OctahedronGeometry(1.4, 0);
        const position = geo.attributes.position;
        const vertex = new THREE.Vector3();

        const s = interpolatedStress.current;

        const aggregate = (s.people + s.cost + s.execution + s.macro) / 4;

        const MAX_DEFORMATION = 0.35;

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);

            const direction = vertex.clone().normalize();
            let influence = 0;

            if (direction.x > 0) influence += s.cost;
            if (direction.x < 0) influence += s.macro;
            if (direction.y > 0) influence += s.people;
            if (direction.y < 0) influence += s.execution;

            if (Math.abs(direction.z) > 0.5) {
                influence += aggregate * 0.6;
            }

            influence = influence / 100;
            vertex.multiplyScalar(1 + influence * MAX_DEFORMATION);

            position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        position.needsUpdate = true;
        geo.computeVertexNormals();

        return geo;
    }, []);

    /* ---------------------------------------------
       Motion Behaviour
    --------------------------------------------- */
    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const stressLevel =
            (stress.people +
                stress.cost +
                stress.execution +
                stress.macro) / 400;

        const pulse =
            Math.sin(state.clock.elapsedTime * 2) *
            0.02 *
            stressLevel;

        const BASE_LERP = 4; // higher = faster transition

        // Smooth stress interpolation
        Object.keys(stress).forEach((key) => {
            const k = key as keyof StressProfile;
            const currentValue = interpolatedStress.current[k];
            const weight = 1 + currentValue / 100;
            const speed = BASE_LERP / weight;

            interpolatedStress.current[k] +=
                (stress[k] - currentValue) *
                Math.min(delta * speed, 1);
        });

        // Motion behaviour
        if (motionState === "stable") {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.scale.z = 1 + pulse;
            meshRef.current.position.set(0, 0, 0);
        }

        if (motionState === "tension") {
            meshRef.current.rotation.y += delta * 0.15;
            meshRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime) * 0.04;
            meshRef.current.scale.z = 1 + pulse * 2
            meshRef.current.position.set(0, 0, 0);
        }

        if (motionState === "overload") {
            meshRef.current.rotation.y += delta * 0.1;
            meshRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 3) * 0.09;
            const compression =
                1 - 0.03 * Math.sin(state.clock.elapsedTime * 2) + pulse * 3;
            meshRef.current.scale.z = compression;
            meshRef.current.position.x =
                0.08 * Math.sin(state.clock.elapsedTime * 8);
            meshRef.current.position.y =
                0.08 * Math.cos(state.clock.elapsedTime * 6);
        }
    });

    const emissiveColor =
        motionState === "stable"
            ? "#0891b2"
            : motionState === "tension"
                ? "#f59e0b"
                : "#dc2626";

    /* ---------------------------------------------
       Axis Configuration
    --------------------------------------------- */
    const BASE_DISTANCE = 1.6;     // minimum anchor radius
    const SCALE_FACTOR = 0.8;      // how strongly stress affects extension
    const s = interpolatedStress.current;
    const axes: {
        key: keyof StressProfile;
        position: [number, number, number];
        label: string;
    }[] = [
            {
                key: "people",
                position: [
                    0,
                    BASE_DISTANCE + (s.people / 100) * SCALE_FACTOR,
                    0,
                ],
                label: "People",
            },
            {
                key: "cost",
                position: [
                    BASE_DISTANCE + (s.cost / 100) * SCALE_FACTOR,
                    0,
                    0,
                ],
                label: "Cost",
            },
            {
                key: "execution",
                position: [
                    0,
                    -(BASE_DISTANCE + (s.execution / 100) * SCALE_FACTOR),
                    0,
                ],
                label: "Execution",
            },
            {
                key: "macro",
                position: [
                    -(BASE_DISTANCE + (s.macro / 100) * SCALE_FACTOR),
                    0,
                    0,
                ],
                label: "Macro",
            },
        ];
    return (
        <group>
            {/* Main Octahedron */}
            <mesh ref={meshRef} geometry={geometry}>
                <meshPhysicalMaterial
                    color="#0f172a"
                    roughness={0.6}
                    metalness={0.2}
                    emissive={ghost ? "#334155" : emissiveColor}
                    transparent={ghost}
                    opacity={ghost ? 0.35 : 1}
                    emissiveIntensity={0.5}
                    clearcoat={0.3}
                />
                <Edges scale={1.01}>
                    <lineBasicMaterial color={emissiveColor} />
                </Edges>
            </mesh>

            {/* Axis Anchors */}
            {axes.map((axis) => {
                const isDominant = axis.key === dominantKey;

                return (
                    <group key={axis.key} position={axis.position}>
                        <line>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    array={new Float32Array([
                                        0, 0, 0,
                                        axis.position[0],
                                        axis.position[1], axis.position[2],
                                    ])}
                                    count={2}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial
                                color={isDominant ? "#38bdf8" : "#334155"}
                            />
                        </line>
                        <mesh scale={isDominant ? 1.4 : 1}>
                            <sphereGeometry args={[0.07, 16, 16]} />
                            <meshStandardMaterial
                                color={isDominant ? "#38bdf8" : "#64748b"}
                                emissive={isDominant ? "#38bdf8" : "#000000"}
                                emissiveIntensity={isDominant ? 0.8 : 0}
                            />
                        </mesh>

                        <Html distanceFactor={8}>
                            <div
                                style={{
                                    color: isDominant ? "#e2e8f0" : "#94a3b8",
                                    fontSize: isDominant ? "14px" : "12px",
                                    fontWeight: isDominant ? 600 : 500,
                                    letterSpacing: isDominant ? "0.5px" : "0px",
                                    textAlign: "center",
                                }}
                            >
                                {axis.label}
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
}

export default function MagicCube({
    stress,
    persona,
    size = 260,
    showAnnotation = true,
    catalystData = null,
    baselineStress,
}: MagicCubeProps) {
    const psiMean = catalystData?.peak_psi_band.mean ?? null;
    const capitalMean = catalystData?.capital_trough_band.mean ?? null;
    const effectiveStress: StressProfile = catalystData
        ? {
            ...stress,
            people: Math.min((psiMean ?? 0) * 100, 100),
            macro: Math.min((capitalMean ?? 0) * 100, 100),
        }
        : stress;
    const motionState = getMotionState(stress);
    const annotation = getMotionAnnotation(motionState, persona);
    const stressValues = [
        effectiveStress.people,
        effectiveStress.cost,
        effectiveStress.execution,
        effectiveStress.macro,
    ];
    const average =
        stressValues.reduce((a, b) => a + b, 0) / 4;
    const variance =
        stressValues.reduce((sum, value) => {
            return sum + Math.pow(value - average, 2);
        }, 0) / 4;
    const balanceScore = 1 - Math.min(variance / 2000, 1);

    return (
        <div
            style={{
                width: size,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <div style={{ width: size, height: size }}>
                <Canvas camera={{ position: [0, 0, 4] }}>
                    <color attach="background" args={["#020617"]} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[3, 3, 3]} intensity={1} />
                    <pointLight position={[-3, -3, -3]} intensity={0.6} />

                    {/* System Stress Halo */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[2.25, 2.35, 64]} />
                        <meshBasicMaterial
                            color={
                                (stress.people + stress.cost + stress.execution + stress.macro) / 4 > 60
                                    ? "#dc2626"
                                    : (stress.people + stress.cost + stress.execution + stress.macro) / 4 > 40
                                        ? "#f59e0b"
                                        : "#22c55e"
                            }
                            transparent
                            opacity={
                                0.12 +
                                (
                                    (stress.people +
                                        stress.cost +
                                        stress.execution +
                                        stress.macro) / 400
                                ) * 0.45
                            }
                        />
                    </mesh>

                    {/* Structural Balance Ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[2.35, 2.38, 64]} />
                        <meshBasicMaterial
                            color={balanceScore > 0.7 ? "#10b981" : "#f59e0b"}
                            transparent
                            opacity={0.2 * balanceScore}
                        />
                    </mesh>

                    {baselineStress && (
                        <mesh scale={1.05}>
                            <octahedronGeometry args={[1.4, 0]} />
                            <meshBasicMaterial
                                color="#64748b"
                                wireframe
                                transparent
                                opacity={0.35}
                            />
                        </mesh>
                    )}

                    <SuspendedOctahedron
                        stress={effectiveStress}
                        motionState={motionState}
                    />
                </Canvas>
            </div>

            {showAnnotation && (
                <div
                    style={{
                        marginTop: 12,
                        background: "#020617",
                        border: "1px solid #1e293b",
                        padding: 12,
                        borderRadius: 6,
                        color: "#e5e7eb",
                        fontSize: 13,
                        lineHeight: 1.5,
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            marginBottom: 6,
                        }}
                    >
                        Motion state: <strong>{motionState.toUpperCase()}</strong>
                    </div>
                    <strong>{annotation.title}</strong>
                    <div>{annotation.message}</div>
                </div>
            )}
        </div>
    );
}