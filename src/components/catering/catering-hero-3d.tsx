'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group } from 'three';

// Locked to the editorial palette — no external HDR/environment fetches.
const PALETTE = {
  cream: '#F5EFE6',
  parchment: '#E8DFD0',
  ink: '#1C1A17',
  tomato: '#C8472D',
  peach: '#F5B7A3',
  olive: '#6B7548',
};

const INGREDIENTS: Array<{
  position: [number, number, number];
  radius: number;
  color: string;
  speed: number;
}> = [
  { position: [-2.1, 0.9, 0.3], radius: 0.26, color: PALETTE.tomato, speed: 1.6 },
  { position: [2.3, 1.3, -0.6], radius: 0.18, color: PALETTE.olive, speed: 2.1 },
  { position: [1.7, 0.4, 0.9], radius: 0.13, color: PALETTE.peach, speed: 1.9 },
  { position: [-1.4, 1.8, -0.8], radius: 0.11, color: PALETTE.olive, speed: 2.4 },
  { position: [0.6, 2, 0.2], radius: 0.16, color: PALETTE.tomato, speed: 1.4 },
];

const TableScene = () => {
  const groupRef = useRef<Group>(null);

  useFrame(({ pointer }) => {
    const group = groupRef.current;
    if (!group) return;
    // Ease the whole tableau toward the cursor.
    group.rotation.y += (pointer.x * 0.35 - group.rotation.y) * 0.04;
    group.rotation.x += (-0.18 - pointer.y * 0.12 - group.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef} rotation={[-0.18, 0, 0]}>
      {/* Ceramic plate */}
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[2.05, 1.7, 0.16, 64]} />
          <meshStandardMaterial color={PALETTE.cream} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <cylinderGeometry args={[1.55, 1.55, 0.04, 64]} />
          <meshStandardMaterial color={PALETTE.parchment} roughness={0.7} />
        </mesh>
        {/* Tomato glaze ring */}
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.32, 0.028, 16, 100]} />
          <meshStandardMaterial color={PALETTE.tomato} roughness={0.4} />
        </mesh>
      </Float>

      {/* Floating ingredients */}
      {INGREDIENTS.map((item, index) => (
        <Float key={index} speed={item.speed} rotationIntensity={0.6} floatIntensity={1.1}>
          <mesh position={item.position}>
            <sphereGeometry args={[item.radius, 32, 32]} />
            <meshStandardMaterial color={item.color} roughness={0.35} />
          </mesh>
        </Float>
      ))}

      {/* Graphic ink ring */}
      <Float speed={0.9} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0.9, -1.6]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[2.5, 0.012, 12, 120]} />
          <meshStandardMaterial color={PALETTE.ink} roughness={0.8} />
        </mesh>
      </Float>
    </group>
  );
};

/** The catering hero's WebGL moment. Render only behind capability checks. */
const CateringHero3D = () => (
  <Canvas
    dpr={[1, 1.75]}
    camera={{ position: [0, 1.3, 6.4], fov: 32 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    aria-hidden="true"
  >
    <ambientLight intensity={1.1} />
    <directionalLight position={[4, 6, 3]} intensity={1.4} />
    <directionalLight position={[-6, 3, -2]} intensity={0.4} color={PALETTE.peach} />
    <TableScene />
  </Canvas>
);

export default CateringHero3D;
