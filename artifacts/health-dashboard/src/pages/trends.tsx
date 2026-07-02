import { biomarkers, reports, categories, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

/* ─── status ─────────────────────────────────────────────────────────── */
type RangeStatus = "high" | "low" | "normal";

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): RangeStatus {
  if (Array.isArray(ref)) {
    if (value < ref[0]) return "low";
    if (value > ref[1]) return "high";
    return "normal";
  }
  const r = ref as { min?: number; max?: number };
  if (r.min !== undefined && value < r.min) return "low";
  if (r.max !== undefined && value > r.max) return "high";
  return "normal";
}

const C: Record<RangeStatus, { stroke: string; fill: string; badge: string; label: string }> = {
  normal: { stroke: "#22c55e", fill: "#22c55e", badge: "bg-green-500/15 text-green-500", label: "In Range" },
  high:   { stroke: "#ef4444", fill: "#ef4444", badge: "bg-red-500/15 text-red-400",    label: "Above Range" },
  low:    { stroke: "#f59e0b", fill: "#f59e0b", badge: "bg-amber-500/15 text-amber-400", label: "Below Range" },
};

/* ─── tooltip ────────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, dates, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs mb-1">{dates?.[label] ?? label}</p>
      <p className="font-semibold">
        {formatValue(payload[0].value)}{" "}
        <span className="font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

/* ─── chart card ─────────────────────────────────────────────────────── */
function BiomarkerChart({ biomarker, index }: { biomarker: Biomarker; index: number }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const status = getRangeStatus(latest, biomarker.referenceRange);
  const color = C[status];

  const gradId = `g-${biomarker.id}`;
  // Use numeric indices — guarantees even categorical spacing in Recharts
  const dates = reports.map(r => r.date);
  const data = biomarker.history.map((value, i) => ({ x: i, value }));

  const ref = biomarker.referenceRange;
  const refMin: number | undefined = Array.isArray(ref) ? ref[0] : (ref as any).min;
  const refMax: number | undefined = Array.isArray(ref) ? ref[1] : (ref as any).max;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="bg-card border rounded-xl p-5 shadow-sm"
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{biomarker.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{biomarker.description}</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold tabular-nums">
            {formatValue(latest)}{" "}
            <span className="text-sm font-normal text-muted-foreground">{biomarker.unit}</span>
          </div>
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${color.badge}`}>
            {color.label}
          </span>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color.fill} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color.fill} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />

            <XAxis
              dataKey="x"
              type="number"
              scale="linear"
              domain={[0, data.length - 1]}
              ticks={data.map((_, i) => i)}
              tickFormatter={(i: number) => dates[i] ?? ""}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              dy={6}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              domain={["auto", "auto"]}
              tickCount={5}
              width={48}
            />
            <Tooltip
              content={<ChartTooltip dates={dates} unit={biomarker.unit} />}
            />

            {refMin != null && (
              <ReferenceLine
                y={refMin}
                stroke={color.stroke}
                strokeOpacity={0.5}
                strokeDasharray="5 3"
                label={{ value: `Min ${refMin}`, position: "insideTopRight", fontSize: 10, fill: color.stroke, opacity: 0.8 }}
              />
            )}
            {refMax != null && (
              <ReferenceLine
                y={refMax}
                stroke={color.stroke}
                strokeOpacity={0.5}
                strokeDasharray="5 3"
                label={{ value: `Max ${refMax}`, position: "insideTopRight", fontSize: 10, fill: color.stroke, opacity: 0.8 }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={color.stroke}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
              dot={{ r: 4, fill: color.stroke, stroke: "var(--color-card)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color.stroke, stroke: "var(--color-card)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────── */
export default function Trends() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const filtered =
    activeCategory === "all" ? biomarkers : biomarkers.filter(b => b.category === activeCategory);

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Biomarker Trends</h1>
        <p className="text-muted-foreground mt-1">Track your health parameters over time across all reports.</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[{ id: "all", label: "All Parameters" }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {filtered.map((b, i) => (
          <BiomarkerChart key={b.id} biomarker={b} index={i} />
        ))}
      </div>
    </div>
  );
}
