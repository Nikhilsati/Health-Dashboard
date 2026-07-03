import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

type Status = "normal" | "borderline" | "critical";

const STATUS_COLOR: Record<Status, string> = {
  normal:     "#22c55e",
  borderline: "#f59e0b",
  critical:   "#ef4444",
};

interface OrganMeshProps {
  id: string;
  label: string;
  position: [number, number, number];
  radius: number;
  status: Status;
  selected: boolean;
  phaseOffset?: number;
  isTube?: boolean;
  onClick: () => void;
}

export function OrganMesh({
  label, position, radius, status, selected, phaseOffset = 0, isTube = false, onClick,
}: OrganMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLOR[status];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2.4 + phaseOffset) * 0.07;
    const base = selected ? 1.25 : hovered ? 1.1 : 1;
    meshRef.current.scale.setScalar(pulse * base);
  });

  const emissiveIntensity = selected ? 2.2 : hovered ? 1.4 : 0.8;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        castShadow
      >
        {isTube
          ? <cylinderGeometry args={[radius, radius, 0.52, 10]} />
          : <sphereGeometry args={[radius, 18, 18]} />
        }
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={selected ? 0.95 : 0.88}
        />
      </mesh>

      {/* Outer ring when selected */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 1.7, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover tooltip */}
      {hovered && !selected && (
        <Html distanceFactor={4} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(8,13,26,0.92)",
            border: `1px solid ${color}44`,
            borderRadius: 8,
            padding: "4px 10px",
            whiteSpace: "nowrap",
            fontSize: 11,
            fontFamily: "system-ui, sans-serif",
            color: "#e2e8f0",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ color, fontWeight: 600 }}>◉</span>{" "}{label}
          </div>
        </Html>
      )}
    </group>
  );
}
