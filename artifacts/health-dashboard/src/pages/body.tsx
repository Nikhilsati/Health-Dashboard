import { useState } from "react";
import { BodyViewer } from "@/components/body/BodyViewer";
import { SystemReadingsPanel } from "@/components/body/SystemReadingsPanel";

export default function BodyPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Anatomy viewer — left 55% */}
      <div className="relative" style={{ flex: "0 0 55%" }}>
        <BodyViewer
          selectedCat={selectedCat}
          onSelect={(cat) => setSelectedCat(prev => prev === cat ? null : cat)}
        />
        {!selectedCat && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="text-xs text-slate-400/70 bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Click an organ to explore
            </div>
          </div>
        )}
      </div>

      {/* Readings panel — right 45% */}
      <div
        className="flex-1 border-l overflow-hidden flex flex-col"
        style={{ background: "var(--color-card, #0f172a)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <SystemReadingsPanel categoryId={selectedCat} />
      </div>
    </div>
  );
}
