import { motion, AnimatePresence } from "framer-motion";
import { biomarkers, categories, reports, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useState } from "react";

type Status = "normal" | "borderline" | "critical";

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): Status {
  if (Array.isArray(ref)) {
    if (value < ref[0]) return "borderline";
    if (value > ref[1]) return "critical";
    return "normal";
  }
  const min = (ref as any).min;
  const max = (ref as any).max;
  if (max !== undefined && value > max) return "critical";
  if (min !== undefined && value < min) return "borderline";
  return "normal";
}

function getStatusColorClass(status: Biomarker["status"]) {
  switch (status) {
    case "normal":
      return "text-green-500 bg-green-500/15";
    case "borderline":
      return "text-amber-500 bg-amber-500/15";
    case "critical":
      return "text-red-400 bg-red-500/15";
    default:
      return "text-muted-foreground bg-white/5";
  }
}

function getStatusLabel(status: Biomarker["status"]) {
  switch (status) {
    case "normal":
      return "In Range";
    case "borderline":
      return "Borderline";
    case "critical":
      return "Out of Range";
    default:
      return "Unknown";
  }
}

function BiomarkerRow({ b, isExpanded, onToggle }: { b: Biomarker; isExpanded: boolean; onToggle: () => void }) {
  const data = b.history.map((val) => ({ value: val }));
  const latest = b.history[b.history.length - 1];

  return (
    <div 
      className="p-4 hover:bg-white/[0.02] border-b border-white/5 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-xs text-foreground truncate">{b.name}</h3>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${getStatusColorClass(b.status)}`}>
              {getStatusLabel(b.status)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2">{b.description}</p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-16 h-8 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="currentColor" 
                  strokeWidth={1.5} 
                  dot={false} 
                  className={
                    b.status === "normal" 
                      ? "text-green-500" 
                      : b.status === "critical" 
                      ? "text-red-500" 
                      : "text-amber-500"
                  } 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right w-16">
            <div className="text-sm font-semibold tabular-nums text-foreground">{formatValue(latest)}</div>
            <div className="text-[10px] text-muted-foreground">{b.unit}</div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Historical Readings</h4>
          <div className="grid grid-cols-2 gap-2">
            {b.history.map((val, idx) => (
              <div key={idx} className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                <div className="text-[9px] text-muted-foreground mb-0.5">{reports[idx].date}</div>
                <div className="text-xs font-semibold tabular-nums text-foreground">
                  {formatValue(val)}{" "}
                  <span className="text-[9px] font-normal text-muted-foreground">{b.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface SystemReadingsPanelProps {
  categoryId: string | null;
}

export function SystemReadingsPanel({ categoryId }: SystemReadingsPanelProps) {
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const cat = categories.find(c => c.id === categoryId);
  const markers = biomarkers.filter(b => b.category === categoryId);

  const scorePercent = cat ? (cat.score / cat.total) * 100 : 0;
  const statusColor = scorePercent > 80 ? "bg-green-500" : scorePercent > 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!categoryId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Click an organ to explore</p>
            <p className="text-xs text-muted-foreground/60">Each dot shows your health status for that body system</p>
          </motion.div>
        ) : (
          <motion.div
            key={categoryId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                </div>
                <h2 className="text-base font-semibold text-foreground">{cat?.label ?? categoryId}</h2>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Detailed parameter breakdown and historical performance.
              </p>
            </div>

            {/* Category Score block */}
            <div className="px-5 py-4 border-b border-white/8 bg-white/[0.01] shrink-0">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Category Score</div>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-semibold tabular-nums leading-none text-foreground">{cat?.score}</span>
                <span className="text-muted-foreground text-xs mb-0.5">/ {cat?.total}</span>
              </div>
            </div>

            {/* Biomarker list */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
              {markers.map(b => (
                <BiomarkerRow 
                  key={b.id} 
                  b={b} 
                  isExpanded={selectedBiomarker === b.id}
                  onToggle={() => setSelectedBiomarker(prev => prev === b.id ? null : b.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

