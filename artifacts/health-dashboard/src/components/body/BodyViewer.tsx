import { useState } from "react";
import { biomarkers, categories } from "@/data/healthData";
import bodyImage from "@assets/image.png";

type Status = "normal" | "borderline" | "critical";

function getCategoryStatus(categoryId: string): Status {
  const markers = biomarkers.filter(b => b.category === categoryId);
  if (markers.some(b => b.status === "critical")) return "critical";
  if (markers.some(b => b.status === "borderline")) return "borderline";
  return "normal";
}

function getCategoryScore(categoryId: string): { score: number; total: number } {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? { score: cat.score, total: cat.total } : { score: 10, total: 10 };
}

const STATUS_COLOR: Record<Status, { stroke: string; glow: string; text: string; bg: string }> = {
  normal: { 
    stroke: "#10b981", 
    glow: "rgba(16, 185, 129, 0.4)", 
    text: "text-emerald-400",
    bg: "rgba(16, 185, 129, 0.15)"
  },
  borderline: { 
    stroke: "#f59e0b", 
    glow: "rgba(245, 158, 11, 0.4)", 
    text: "text-amber-400",
    bg: "rgba(245, 158, 11, 0.15)"
  },
  critical: { 
    stroke: "#ef4444", 
    glow: "rgba(239, 68, 68, 0.4)", 
    text: "text-red-400",
    bg: "rgba(239, 68, 68, 0.15)"
  },
};

// Position coordinates and paths mapped precisely to the 1024x1536 image dimensions
const ORGANS = [
  { 
    id: "brain", 
    label: "Brain / Vitamins", 
    cat: "vitamins", 
    x: 512, 
    y: 84,
    path: "M 480,45 C 450,45 440,75 455,105 C 470,123 485,123 485,142 C 485,153 507,157 512,157 C 517,157 539,153 539,142 C 539,123 554,123 569,105 C 584,75 574,45 544,45 Z" 
  },
  { 
    id: "hormones", 
    label: "Hormones", 
    cat: "hormones", 
    x: 512, 
    y: 146,
    path: "M 502,138 C 494,138 494,146 502,154 C 510,161 525,161 532,154 C 540,146 540,138 532,138 Z"
  },
  { 
    id: "thyroid", 
    label: "Thyroid", 
    cat: "thyroid", 
    x: 512, 
    y: 223,
    path: "M 480,210 C 460,217 455,248 480,256 C 490,260 500,248 512,248 C 524,248 534,260 544,256 C 569,248 564,217 544,210 C 524,198 512,220 512,220 C 512,220 500,198 480,210 Z"
  },
  { 
    id: "heart", 
    label: "Heart", 
    cat: "heart", 
    x: 527, 
    y: 369,
    path: "M 527,330 C 497,330 482,360 482,390 C 482,420 512,450 527,465 C 542,450 572,420 572,390 C 572,360 557,330 527,330 Z"
  },
  { 
    id: "liver", 
    label: "Liver", 
    cat: "liver", 
    x: 451, 
    y: 468,
    path: "M 383,453 C 352,453 368,499 398,514 C 429,529 490,499 490,468 C 490,438 413,453 383,453 Z"
  },
  { 
    id: "pancreas", 
    label: "Pancreas", 
    cat: "diabetes", 
    x: 512, 
    y: 545,
    path: "M 458,537 C 427,537 427,560 458,575 C 489,590 550,575 550,552 C 550,529 489,537 458,537 Z"
  },
  { 
    id: "kidney-l", 
    label: "Left Kidney", 
    cat: "kidney", 
    x: 630, 
    y: 599,
    path: "M 614,591 C 622,591 622,614 614,630 C 606,637 591,630 591,607 C 591,591 606,591 614,591 Z"
  },
  { 
    id: "kidney-r", 
    label: "Right Kidney", 
    cat: "kidney", 
    x: 394, 
    y: 599,
    path: "M 394,591 C 402,591 402,614 394,630 C 386,637 371,630 371,607 C 371,591 386,591 394,591 Z"
  },
  {
    id: "inflam",
    label: "Inflammation",
    cat: "inflammation",
    x: 512,
    y: 660,
    path: "M 482,645 C 470,645 470,675 482,675 C 494,675 512,670 512,660 C 512,650 494,645 482,645 Z M 542,645 C 530,645 530,675 542,675 C 554,675 572,670 572,660 C 572,650 554,645 542,645 Z"
  }
];

interface BodyViewerProps {
  selectedCat: string | null;
  onSelect: (cat: string) => void;
}

export function BodyViewer({ selectedCat, onSelect }: BodyViewerProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // Return coordinates of selected organ center to draw connector line
  const activeOrgan = ORGANS.find(o => o.cat === selectedCat);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-4">
      {styleDefinitions}

      {/* Anatomy Container with Subtle Breathing effect */}
      <div 
        className="relative h-full max-h-full max-w-full aspect-[1024/1536]"
        style={{
          animation: "svg-breathing 8s ease-in-out infinite",
        }}
      >
        <img
          src={bodyImage}
          alt="Anatomical silhouette outline"
          className="w-full h-full object-contain pointer-events-none opacity-40 select-none mix-blend-screen"
        />

        {/* Interactive SVG Overlay */}
        <svg 
          viewBox="0 0 1024 1536" 
          className="absolute inset-0 w-full h-full overflow-visible z-10 select-none"
        >
          <defs>
            {/* Soft Glow filter */}
            <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* High-intensity Glow filter */}
            <filter id="glow-high" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circulation System / Blood Pathways */}
          <g opacity={selectedCat === "blood" || selectedCat === "heart" || hoveredCat === "blood" ? 0.85 : 0.2} className="transition-all duration-300">
            {/* Major Arterial paths */}
            <path
              d="M 527,369 C 527,230 480,180 512,84"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="16 8"
              style={{ animation: "flow-circulation 15s linear infinite" }}
            />
            <path
              d="M 527,369 C 470,410 440,430 451,468"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="16 12"
              style={{ animation: "flow-circulation-rev 12s linear infinite" }}
            />
            <path
              d="M 527,369 C 527,490 610,540 630,599"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="16 8"
              style={{ animation: "flow-circulation 10s linear infinite" }}
            />
            {/* Venous system paths */}
            <path
              d="M 512,84 C 530,180 540,230 527,369"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeDasharray="24 8"
              style={{ animation: "flow-circulation-rev 20s linear infinite" }}
            />
            <path
              d="M 394,599 C 394,520 512,460 527,369"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeDasharray="20 12"
              style={{ animation: "flow-circulation 14s linear infinite" }}
            />
          </g>

          {/* Endocrine / Hormonal network pathways */}
          <g opacity={selectedCat === "hormones" || hoveredCat === "hormones" ? 0.9 : 0.12} className="transition-all duration-300">
            <path
              d="M 512,84 C 512,110 512,125 512,146 C 512,170 512,200 512,223 C 512,275 527,300 527,369 C 527,430 480,490 512,545"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              strokeDasharray="12 16"
              style={{ animation: "flow-circulation 8s linear infinite" }}
            />
          </g>

          {/* Organs outlines & glows */}
          {ORGANS.map(o => {
            const status = getCategoryStatus(o.cat);
            const color = STATUS_COLOR[status];
            const isSelected = selectedCat === o.cat;
            const isHovered = hoveredCat === o.cat;

            return (
              <g 
                key={o.id} 
                className="cursor-pointer"
                onClick={() => onSelect(o.cat)}
                onMouseEnter={() => setHoveredCat(o.cat)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                {/* Organ glowing background contour */}
                {o.path && (
                  <path
                    d={o.path}
                    fill={isSelected ? color.stroke : isHovered ? color.stroke : "transparent"}
                    fillOpacity={isSelected ? 0.35 : isHovered ? 0.15 : 0.03}
                    stroke={isSelected ? color.stroke : isHovered ? color.stroke : color.stroke}
                    strokeWidth={isSelected ? 10 : isHovered ? 6 : 3}
                    strokeOpacity={isSelected ? 1.0 : isHovered ? 0.8 : 0.35}
                    filter={isSelected ? "url(#glow-high)" : isHovered ? "url(#glow-effect)" : "none"}
                    style={{ transition: "all 0.3s ease" }}
                  />
                )}
                
                {/* Hotspot center dot */}
                <circle
                  cx={o.x}
                  cy={o.y}
                  r={isSelected ? 16 : isHovered ? 12 : 9}
                  fill="#ffffff"
                  stroke={color.stroke}
                  strokeWidth="4"
                  className="transition-all duration-300"
                />

                {/* Pulsing selection circle */}
                {isSelected && (
                  <circle
                    cx={o.x}
                    cy={o.y}
                    r="15"
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="3"
                  >
                    <animate
                      attributeName="r"
                      values="15;48;15"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values="0.9;0.1;0.9"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Floating Badges (Score preview always visible) */}
                <g 
                  transform={`translate(${o.x - 180}, ${o.y - 20})`}
                  className="transition-all duration-300"
                  opacity={isSelected ? 1.0 : isHovered ? 0.95 : 0.5}
                >
                  {/* Glass indicator pill */}
                  <rect
                    x="0"
                    y="0"
                    width="145"
                    height="38"
                    rx="19"
                    fill="rgba(8, 14, 26, 0.85)"
                    stroke={isSelected ? color.stroke : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth="2.5"
                    style={{ backdropFilter: "blur(4px)" }}
                  />
                  {/* Category text preview */}
                  <text
                    x="20"
                    y="24"
                    fill={isSelected ? "#ffffff" : "#cbd5e1"}
                    fontSize="15"
                    fontWeight={isSelected ? "bold" : "normal"}
                    fontFamily="system-ui, sans-serif"
                  >
                    {o.label.split(" / ")[0].substring(0, 8)}
                  </text>
                  {/* Category Score pill */}
                  <text
                    x="125"
                    y="24"
                    fill={color.stroke}
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {getCategoryScore(o.cat).score}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Connector Line overlay from active organ center to detail panel border */}
          {activeOrgan && (
            <g className="transition-all duration-300">
              <path
                d={`M ${activeOrgan.x},${activeOrgan.y} L 1000,${activeOrgan.y}`}
                fill="none"
                stroke={STATUS_COLOR[getCategoryStatus(activeOrgan.cat)].stroke}
                strokeWidth="4"
                strokeOpacity="0.75"
                strokeDasharray="16 12"
                style={{ animation: "flow-circulation 6s linear infinite" }}
              />
              {/* Pulsing indicator at panel boundary */}
              <circle
                cx="1000"
                cy={activeOrgan.y}
                r="10"
                fill={STATUS_COLOR[getCategoryStatus(activeOrgan.cat)].stroke}
                filter="url(#glow-effect)"
              >
                <animate
                  attributeName="r"
                  values="8;16;8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  values="0.6;1;0.6"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}
        </svg>

        {/* Hover score tooltip overlay details */}
        {hoveredCat && !selectedCat && (
          <div 
            className="absolute z-20 pointer-events-none rounded-xl border p-2.5 flex flex-col gap-0.5"
            style={{
              left: `${ORGANS.find(o => o.cat === hoveredCat)!.x / 10.24}%`,
              top: `${ORGANS.find(o => o.cat === hoveredCat)!.y / 15.36 - 6}%`,
              transform: "translateX(-50%)",
              background: "rgba(10, 16, 30, 0.95)",
              borderColor: STATUS_COLOR[getCategoryStatus(hoveredCat)].stroke + "44",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[getCategoryStatus(hoveredCat)].stroke }} />
              <span className="text-xs font-semibold text-white">{ORGANS.find(o => o.cat === hoveredCat)!.label}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Category Score: <span className="font-bold text-white">{getCategoryScore(hoveredCat).score}/{getCategoryScore(hoveredCat).total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Embedded custom styles for body visualization animations
const styleDefinitions = (
  <style>{`
    @keyframes svg-breathing {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes flow-circulation {
      to {
        stroke-dashoffset: -160;
      }
    }
    @keyframes flow-circulation-rev {
      to {
        stroke-dashoffset: 160;
      }
    }
  `}</style>
);
