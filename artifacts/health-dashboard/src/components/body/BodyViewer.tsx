import { useState } from "react";
import { biomarkers } from "@/data/healthData";
import bodyImage from "@assets/image_1783110497483.png";

type Status = "normal" | "borderline" | "critical";

function getCategoryStatus(categoryId: string): Status {
  const markers = biomarkers.filter(b => b.category === categoryId);
  if (markers.some(b => b.status === "critical")) return "critical";
  if (markers.some(b => b.status === "borderline")) return "borderline";
  return "normal";
}

const STATUS_COLOR: Record<Status, { dot: string; ring: string; glow: string }> = {
  normal:     { dot: "#22c55e", ring: "#22c55e55", glow: "0 0 12px #22c55e99, 0 0 24px #22c55e44" },
  borderline: { dot: "#f59e0b", ring: "#f59e0b55", glow: "0 0 12px #f59e0b99, 0 0 24px #f59e0b44" },
  critical:   { dot: "#ef4444", ring: "#ef444455", glow: "0 0 12px #ef444499, 0 0 24px #ef444444" },
};

// Positions as % of the image container (left%, top%)
// Calibrated to match the anatomy image organs
const ORGANS = [
  { id: "brain",      label: "Brain / Vitamins", cat: "vitamins",    x: 49.5, y: 7.2  },
  { id: "hormones",   label: "Hormones",          cat: "hormones",    x: 52.5, y: 14.5 },
  { id: "thyroid",    label: "Thyroid",            cat: "thyroid",     x: 49.5, y: 21.5 },
  { id: "heart",      label: "Heart",              cat: "heart",       x: 42.0, y: 36.5 },
  { id: "liver",      label: "Liver",              cat: "liver",       x: 58.0, y: 41.5 },
  { id: "blood",      label: "Blood",              cat: "blood",       x: 49.5, y: 36.0 },
  { id: "pancreas",   label: "Pancreas",           cat: "diabetes",    x: 44.5, y: 46.5 },
  { id: "kidney-l",   label: "Left Kidney",        cat: "kidney",      x: 38.0, y: 50.5 },
  { id: "kidney-r",   label: "Right Kidney",       cat: "kidney",      x: 61.0, y: 50.5 },
  { id: "inflam",     label: "Inflammation",       cat: "inflammation",x: 54.0, y: 54.0 },
];

interface HotspotProps {
  x: number;
  y: number;
  label: string;
  status: Status;
  selected: boolean;
  onClick: () => void;
}

function Hotspot({ x, y, label, status, selected, onClick }: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const c = STATUS_COLOR[status];
  const dotSize = selected ? 14 : hovered ? 12 : 10;
  const ringSize = selected ? 32 : hovered ? 26 : 22;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        zIndex: 10,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer pulsing ring */}
      <div style={{
        position: "absolute",
        width: ringSize,
        height: ringSize,
        borderRadius: "50%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: c.ring,
        animation: "pulse-ring 2s ease-out infinite",
        border: `1.5px solid ${c.dot}88`,
      }} />
      {/* Second ring (larger, slower) */}
      {(selected || hovered) && (
        <div style={{
          position: "absolute",
          width: ringSize + 14,
          height: ringSize + 14,
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: `1px solid ${c.dot}44`,
          animation: "pulse-ring 2s ease-out infinite 0.5s",
        }} />
      )}
      {/* Inner dot */}
      <div style={{
        width: dotSize,
        height: dotSize,
        borderRadius: "50%",
        background: c.dot,
        boxShadow: selected ? `${c.glow}, 0 0 4px ${c.dot}` : hovered ? `0 0 8px ${c.dot}aa` : `0 0 6px ${c.dot}66`,
        transition: "all 0.2s ease",
        position: "relative",
        zIndex: 2,
      }} />

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(8,13,26,0.92)",
          border: `1px solid ${c.dot}44`,
          borderRadius: 8,
          padding: "4px 10px",
          whiteSpace: "nowrap",
          fontSize: 11,
          fontFamily: "system-ui, sans-serif",
          color: "#e2e8f0",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
          zIndex: 20,
        }}>
          <span style={{ color: c.dot, marginRight: 4 }}>◉</span>{label}
        </div>
      )}
    </div>
  );
}

interface BodyViewerProps {
  selectedCat: string | null;
  onSelect: (cat: string) => void;
}

export function BodyViewer({ selectedCat, onSelect }: BodyViewerProps) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#080d1a",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* CSS keyframe animation */}
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          70%  { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Anatomy image + hotspot overlay */}
      <div style={{
        position: "relative",
        height: "100%",
        aspectRatio: "0.68 / 1",
        maxHeight: "100%",
        maxWidth: "100%",
      }}>
        <img
          src={bodyImage}
          alt="Anatomical body"
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
            display: "block",
          }}
        />

        {/* Hotspot overlay */}
        <div style={{ position: "absolute", inset: 0 }}>
          {ORGANS.map(o => (
            <Hotspot
              key={o.id}
              x={o.x}
              y={o.y}
              label={o.label}
              status={getCategoryStatus(o.cat)}
              selected={selectedCat === o.cat}
              onClick={() => onSelect(o.cat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
