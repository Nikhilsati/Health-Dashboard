import { motion, AnimatePresence } from "framer-motion";
import { biomarkers, categories, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

type Status = "normal" | "borderline" | "critical";

function parseRef(ref: Biomarker["referenceRange"]): { min?: number; max?: number } {
  if (Array.isArray(ref)) return { min: ref[0], max: ref[1] };
  return ref as { min?: number; max?: number };
}

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): Status {
  const { min, max } = parseRef(ref);
  if (max !== undefined && value > max) return "critical";
  if (min !== undefined && value < min) return "borderline";
  return "normal";
}

function getRangePct(value: number, ref: Biomarker["referenceRange"]): number {
  const { min, max } = parseRef(ref);
  if (min === undefined && max === undefined) return 0.5;
  if (min === undefined && max !== undefined) {
    return Math.min(1, value / (max * 1.3));
  }
  if (max === undefined && min !== undefined) {
    return Math.max(0, Math.min(1, value / (min * 1.4)));
  }
  const lo = min!;
  const hi = max!;
  const range = hi - lo;
  const extended = range * 0.3;
  return Math.max(0, Math.min(1, (value - (lo - extended)) / (range + 2 * extended)));
}

const STATUS_STYLES: Record<Status, { badge: string; bar: string }> = {
  normal:     { badge: "bg-green-500/15 text-green-500",  bar: "bg-green-500" },
  borderline: { badge: "bg-amber-500/15 text-amber-500",  bar: "bg-amber-500" },
  critical:   { badge: "bg-red-500/15 text-red-400",      bar: "bg-red-500"   },
};
const STATUS_LABEL: Record<Status, string> = {
  normal: "In Range", borderline: "Borderline", critical: "Out of Range",
};

function Sparkline({ history }: { history: number[] }) {
  const data = history.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: 56, height: 30, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 1, left: 1, bottom: 2 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={1.5}
            fill="url(#sparkGrad)" isAnimationActive={false} dot={false} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#e2e8f0" }}>
                  {formatValue(payload[0].value as number)}
                </div>
              ) : null
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BiomarkerRow({ b }: { b: Biomarker }) {
  const latest = b.history[b.history.length - 1];
  const prev = b.history[b.history.length - 2];
  const diff = latest - prev;
  const status = getRangeStatus(latest, b.referenceRange);
  const pct = getRangePct(latest, b.referenceRange);
  const st = STATUS_STYLES[status];

  return (
    <div className="py-3 border-b last:border-0 border-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-foreground truncate">{b.name}</span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${st.badge}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
        <Sparkline history={b.history} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs tabular-nums shrink-0">
          {diff > 0.005
            ? <TrendingUp className="h-3 w-3 text-rose-400" />
            : diff < -0.005
            ? <TrendingDown className="h-3 w-3 text-green-400" />
            : <Minus className="h-3 w-3 text-muted-foreground" />}
          <span className="font-semibold">{formatValue(latest)}</span>
          <span className="text-muted-foreground">{b.unit}</span>
        </div>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${st.bar}`}
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface SystemReadingsPanelProps {
  categoryId: string | null;
}

export function SystemReadingsPanel({ categoryId }: SystemReadingsPanelProps) {
  const cat = categories.find(c => c.id === categoryId);
  const markers = biomarkers.filter(b => b.category === categoryId);

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
            <div className="px-5 py-4 border-b border-white/8">
              <h2 className="text-lg font-semibold text-foreground">{cat?.label ?? categoryId}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {markers.length} biomarkers ·{" "}
                <span className={
                  markers.some(b => getRangeStatus(b.history[b.history.length - 1], b.referenceRange) === "critical")
                    ? "text-red-400" : "text-green-500"
                }>
                  {markers.filter(b => getRangeStatus(b.history[b.history.length - 1], b.referenceRange) === "normal").length} in range
                </span>
              </p>
            </div>

            {/* Biomarker list */}
            <div className="flex-1 overflow-y-auto px-5 scrollbar-hide">
              {markers.map(b => <BiomarkerRow key={b.id} b={b} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
