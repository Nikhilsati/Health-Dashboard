import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { biomarkers } from "@/data/healthData";
import { OrganMesh } from "./OrganMesh";
import type { Biomarker } from "@/data/healthData";

type Status = "normal" | "borderline" | "critical";

function getCategoryStatus(categoryId: string): Status {
  const markers = biomarkers.filter((b: Biomarker) => b.category === categoryId);
  if (markers.some(b => b.status === "critical")) return "critical";
  if (markers.some(b => b.status === "borderline")) return "borderline";
  return "normal";
}

const ORGANS = [
  { id: "heart",     label: "Heart",        cat: "heart",       pos: [-0.1,  0.28,  0.09] as [number,number,number], r: 0.055 },
  { id: "liver",     label: "Liver",        cat: "liver",       pos: [ 0.16, 0.06,  0.05] as [number,number,number], r: 0.063 },
  { id: "kidney-l",  label: "Left Kidney",  cat: "kidney",      pos: [-0.17,-0.07, -0.06] as [number,number,number], r: 0.038 },
  { id: "kidney-r",  label: "Right Kidney", cat: "kidney",      pos: [ 0.17,-0.07, -0.06] as [number,number,number], r: 0.038 },
  { id: "thyroid",   label: "Thyroid",      cat: "thyroid",     pos: [ 0,    0.64,  0.07] as [number,number,number], r: 0.030 },
  { id: "pancreas",  label: "Pancreas",     cat: "diabetes",    pos: [-0.05,-0.04,  0.08] as [number,number,number], r: 0.042 },
  { id: "brain",     label: "Vitamins",     cat: "vitamins",    pos: [ 0,    0.87,  0   ] as [number,number,number], r: 0.074 },
  { id: "hormones",  label: "Hormones",     cat: "hormones",    pos: [ 0.06, 0.78,  0.05] as [number,number,number], r: 0.024 },
  { id: "blood",     label: "Blood",        cat: "blood",       pos: [ 0,    0.14,  0.03] as [number,number,number], r: 0.014, isTube: true },
  { id: "inflam",    label: "Inflammation", cat: "inflammation",pos: [ 0.13, 0.02,  0.1 ] as [number,number,number], r: 0.038 },
];

/* semi-transparent body silhouette */
function BodySilhouette() {
  const matProps = {
    color: "#4fc3f7",
    transparent: true,
    opacity: 0.11,
    roughness: 0.7,
    metalness: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide,
  } as const;

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.055, 0.068, 0.14, 14]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.26, 0]}>
        <capsuleGeometry args={[0.2, 0.54, 8, 18]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, -0.12, 0]}>
        <capsuleGeometry args={[0.16, 0.1, 8, 14]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Left upper arm */}
      <mesh position={[-0.31, 0.38, 0]} rotation={[0, 0, 0.28]}>
        <capsuleGeometry args={[0.056, 0.26, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Right upper arm */}
      <mesh position={[0.31, 0.38, 0]} rotation={[0, 0, -0.28]}>
        <capsuleGeometry args={[0.056, 0.26, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.37, 0.1, 0.02]} rotation={[0.1, 0, 0.48]}>
        <capsuleGeometry args={[0.046, 0.24, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.37, 0.1, 0.02]} rotation={[0.1, 0, -0.48]}>
        <capsuleGeometry args={[0.046, 0.24, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Left thigh */}
      <mesh position={[-0.11, -0.38, 0]}>
        <capsuleGeometry args={[0.074, 0.3, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Right thigh */}
      <mesh position={[0.11, -0.38, 0]}>
        <capsuleGeometry args={[0.074, 0.3, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Left calf */}
      <mesh position={[-0.11, -0.73, 0]}>
        <capsuleGeometry args={[0.056, 0.28, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Right calf */}
      <mesh position={[0.11, -0.73, 0]}>
        <capsuleGeometry args={[0.056, 0.28, 8, 12]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  );
}

interface BodySceneProps {
  selectedCat: string | null;
  onSelect: (cat: string) => void;
}

function SceneContents({ selectedCat, onSelect }: BodySceneProps) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <color attach="background" args={["#080d1a"]} />
      <fog attach="fog" args={["#080d1a", 4, 12]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 3]} intensity={0.8} color="#a5d8ff" />
      <pointLight position={[-2, 1, 2]} intensity={0.4} color="#818cf8" />
      <pointLight position={[2, -1, 2]} intensity={0.2} color="#34d399" />

      <BodySilhouette />

      {ORGANS.map((o, i) => (
        <OrganMesh
          key={o.id}
          id={o.id}
          label={o.label}
          position={o.pos}
          radius={o.r}
          status={getCategoryStatus(o.cat)}
          selected={selectedCat === o.cat}
          phaseOffset={i * 0.9}
          isTube={o.isTube}
          onClick={() => onSelect(o.cat)}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.2}
        maxDistance={3.5}
        target={[0, 0.1, 0]}
        autoRotate
        autoRotateSpeed={0.6}
      />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function BodyScene({ selectedCat, onSelect }: BodySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 2.4], fov: 45 }}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContents selectedCat={selectedCat} onSelect={onSelect} />
    </Canvas>
  );
}
