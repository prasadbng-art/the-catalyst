import { Canvas, useFrame } from "@react-three/fiber";
import { Octahedron, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import type { StressProfile, Persona } from "./motion";
import { getMotionState, getMotionAnnotation } from "./motion";

/* =====================================================
   Advanced Suspended Octahedral Stress Field
   Phase 1 — Stable Geometry + Motion Mapping
===================================================== */

type MagicCubeProps = {
    stress: StressProfile;
    persona: Persona;
    size?: number;
    showAnnotation?: boolean;
};

function SuspendedOctahedron({
    stress,
    motionState,
}: {
    stress: StressProfile;
    motionState: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Map motion state to rotation behavior
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (motionState === "stable") {
            meshRef.current.rotation.y += delta * 0.2;
        }

        if (motionState === "tension") {
            meshRef.current.rotation.y += delta * 0.15;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.05;
        }

        if (motionState === "overload") {
            meshRef.current.rotation.y += delta * 0.1;
            meshRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 2) * 0.08;
        }
    });

    // Color mapping by motion state
    const emissiveColor =
        motionState === "stable"
            ? "#0891b2"
            : motionState === "tension"
                ? "#f59e0b"
                : "#dc2626";

    return (
        <Octahedron ref={meshRef} args={[1.4, 0]}>
            <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.6}
                metalness={0.2}
                emissive={emissiveColor}
                emissiveIntensity={0.4}
                clearcoat={0.3}
            />
            <Edges scale={1.01} threshold={15}>
                <lineBasicMaterial color={emissiveColor} />
            </Edges>
        </Octahedron>
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
            {/* 3D CANVAS */}
            <div style={{ width: size, height: size }}>
                <Canvas camera={{ position: [0, 0, 4] }}>
                    {/* Radial gradient background */}
                    <color attach="background" args={["#020617"]} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[3, 3, 3]} intensity={1} />
                    <pointLight position={[-3, -3, -3]} intensity={0.6} />

                    <SuspendedOctahedron
                        stress={stress}
                        motionState={motionState}
                    />
                </Canvas>
            </div>

            {/* Annotation Panel (unchanged logic) */}
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