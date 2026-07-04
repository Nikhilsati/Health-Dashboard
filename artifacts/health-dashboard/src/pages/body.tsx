import { useState } from "react";
import { BodyViewer } from "@/components/body/BodyViewer";
import { SystemReadingsPanel } from "@/components/body/SystemReadingsPanel";
import { categories } from "@/data/healthData";
import { Heart, Droplet, Activity, ShieldPlus, ActivitySquare, Pill, Flame, Sparkles, Fingerprint } from "lucide-react";

const iconMap: Record<string, any> = {
  heart: Heart,
  blood: Droplet,
  liver: Activity,
  kidney: ShieldPlus,
  diabetes: ActivitySquare,
  vitamins: Pill,
  inflammation: Flame,
  thyroid: Sparkles,
  hormones: Fingerprint,
};

export default function BodyPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070b13]">
      {/* Category List Sidebar (Left 25% on desktop, collapsible or smaller on narrow displays) */}
      <div 
        className="w-80 border-r border-white/5 flex flex-col shrink-0"
        style={{ background: "rgba(10, 16, 28, 0.4)", backdropFilter: "blur(12px)" }}
      >
        <div className="p-5 border-b border-white/5">
          <h2 className="text-base font-semibold text-white/90">Systems Summary</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Overall status and biomarker completion.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.id] || Activity;
            const isSelected = selectedCat === cat.id;
            const scorePercent = (cat.score / cat.total) * 100;
            const isOptimal = scorePercent > 80;
            const isCritical = scorePercent < 60;
            const statusColor = isOptimal ? "bg-emerald-500" : isCritical ? "bg-red-500" : "bg-amber-500";
            const textColor = isOptimal ? "text-emerald-400" : isCritical ? "text-red-400" : "text-amber-400";
            
            // Format dynamic bar representation: e.g. "████████░░"
            const filledBlocks = Math.round(scorePercent / 10);
            const emptyBlocks = 10 - filledBlocks;
            const barString = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(isSelected ? null : cat.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-primary/10 border-primary/30 text-white shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                    : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 hover:border-white/10 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide">{cat.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${textColor}`}>
                    {cat.score}/{cat.total}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Styled Bar representation */}
                  <span className="font-mono text-[9px] tracking-tight leading-none text-slate-500 flex-1">
                    <span className={textColor}>{barString.substring(0, filledBlocks)}</span>
                    <span>{barString.substring(filledBlocks)}</span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 shrink-0">
                    {Math.round(scorePercent)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anatomy viewer — middle 45% */}
      <div className="relative flex-1 flex flex-col h-full bg-[#080d17]">
        <BodyViewer
          selectedCat={selectedCat}
          onSelect={(cat) => setSelectedCat(prev => prev === cat ? null : cat)}
        />
        {!selectedCat && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="text-[10px] tracking-wider uppercase font-semibold text-slate-400/50 bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full">
              Select an organ to inspect details
            </div>
          </div>
        )}
      </div>

      {/* Readings panel — right 35% */}
      <div
        className="w-[28rem] border-l overflow-hidden flex flex-col shrink-0"
        style={{ background: "rgba(11, 17, 30, 0.95)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <SystemReadingsPanel categoryId={selectedCat} />
      </div>
    </div>
  );
}
