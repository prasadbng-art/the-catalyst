import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

/* =====================================================
   Advanced Suspended Octahedral Stress Field
===================================================== */

type MagicCubeProps = {
    stress: StressProfile;
    persona: Persona;
    size?: number;
    showAnnotation?: boolean;
};

type MotionState = "stable" | "tension" | "overload";

function SuspendedOctahedron({
    stress,
    motionState,
}: {
    stress: StressProfile;
    motionState: MotionState;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    /* ---------------------------------------------
       Dominant Stress
    --------------------------------------------- */
    const dominantKey = useMemo(() => {
        return (Object.entries(stress).sort((a, b) => b[1] - a[1])[0][0] ??
            "people") as keyof StressProfile;
    }, [stress]);

    /* ---------------------------------------------
       Geometry Deformation
    --------------------------------------------- */
    const geometry = useMemo(() => {
        const geo = new THREE.OctahedronGeometry(1.4, 0);
        const position = geo.attributes.position;
        const vertex = new THREE.Vector3();

        const aggregate =
            (stress.people +
                stress.cost +
                stress.execution +
                stress.macro) /
            4;

        const MAX_DEFORMATION = 0.08;

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);

            const direction = vertex.clone().normalize();
            let influence = 0;

            if (direction.x > 0) influence += stress.cost;
            if (direction.x < 0) influence += stress.macro;
            if (direction.y > 0) influence += stress.people;
            if (direction.y < 0) influence += stress.execution;

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
    }, [stress]);

    /* ---------------------------------------------
       Motion Behaviour
    --------------------------------------------- */
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (motionState === "stable") {
            meshRef.current.rotation.y += delta * 0.2;
        }

        if (motionState === "tension") {
            meshRef.current.rotation.y += delta * 0.15;
            meshRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime) * 0.04;
        }

        if (motionState === "overload") {
            meshRef.current.rotation.y += delta * 0.1;
            meshRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 2) * 0.07;
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

    const axes: {
        key: keyof StressProfile;
        position: [number, number, number];
        label: string;
    }[] = [
            {
                key: "people",
                position: [
                    0,
                    BASE_DISTANCE + (stress.people / 100) * SCALE_FACTOR,
                    0,
                ],
                label: "People",
            },
            {
                key: "cost",
                position: [
                    BASE_DISTANCE + (stress.cost / 100) * SCALE_FACTOR,
                    0,
                    0,
                ],
                label: "Cost",
            },
            {
                key: "execution",
                position: [
                    0,
                    -(BASE_DISTANCE + (stress.execution / 100) * SCALE_FACTOR),
                    0,
                ],
                label: "Execution",
            },
            {
                key: "macro",
                position: [
                    -(BASE_DISTANCE + (stress.macro / 100) * SCALE_FACTOR),
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
                    emissive={emissiveColor}
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
                        <mesh>
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
                                    fontSize: "12px",
                                    fontWeight: 500,
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
}: MagicCubeProps) {
    const motionState = getMotionState(stress);
    const annotation = getMotionAnnotation(motionState, persona);

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

                    <ambientLight intensity={0.5} />
                    <directionalLight position={[3, 3, 3]} intensity={1} />
                    <pointLight position={[-3, -3, -3]} intensity={0.6} />

                    <SuspendedOctahedron
                        stress={stress}
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