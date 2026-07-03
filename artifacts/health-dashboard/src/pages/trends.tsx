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
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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

/* ─── insight generator ──────────────────────────────────────────────── */
function getBiomarkerInsight(b: Biomarker) {
  const history = b.history;
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const first = history[0];
  const diff = latest - prev;
  const pct = prev ? (diff / prev) * 100 : 0;
  const totalDiff = latest - first;
  const totalPct = first ? (totalDiff / first) * 100 : 0;

  const status = getRangeStatus(latest, b.referenceRange);

  // Trend direction of last change
  const trendUp = diff > 0;
  const trendFlat = Math.abs(pct) < 1;

  // For "max only" biomarkers, going up is bad; for "min only", going down is bad
  const ref = b.referenceRange;
  const hasMax = !Array.isArray(ref) && (ref as any).max !== undefined;
  const hasMin = !Array.isArray(ref) && (ref as any).min !== undefined && !(ref as any).max;

  // Movement is "good" if moving toward normal
  const movingGood = (status === "high" && !trendUp) || (status === "low" && trendUp) || (status === "normal");

  // Build insight text
  let headline = "";
  let detail = "";
  let sentiment: "good" | "warn" | "neutral" = "neutral";

  if (trendFlat) {
    headline = "Stable";
    detail = `No significant change since last report (${formatValue(prev)} → ${formatValue(latest)} ${b.unit}).`;
    sentiment = status === "normal" ? "good" : "warn";
  } else if (movingGood) {
    headline = trendUp ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
    detail = status === "normal"
      ? `Moving in the right direction. ${formatValue(prev)} → ${formatValue(latest)} ${b.unit}.`
      : `Trending toward normal range. Was ${formatValue(first)} ${b.unit} in first report.`;
    sentiment = "good";
  } else {
    headline = trendUp ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
    detail = status === "high"
      ? `Still above the reference range. Down ${Math.abs(totalPct).toFixed(0)}% from first report.`
      : status === "low"
      ? `Still below the reference range. Continued monitoring advised.`
      : `Moving away from optimal range. Watch this trend.`;
    sentiment = "warn";
  }

  // Overall progress across all reports
  const improving = (hasMax && totalDiff < 0) || (hasMin && totalDiff > 0) || (Array.isArray(ref) && ((ref[1] - latest) > (ref[1] - first)));

  return { headline, detail, sentiment, diff, pct, latest, prev, improving, status };
}

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

/* ─── insight card ───────────────────────────────────────────────────── */
function InsightCard({ biomarker }: { biomarker: Biomarker }) {
  const insight = getBiomarkerInsight(biomarker);
  const status = insight.status;
  const color = C[status];

  const SentimentIcon = insight.sentiment === "good" ? CheckCircle2 : insight.sentiment === "warn" ? AlertCircle : Minus;
  const sentimentColor = insight.sentiment === "good"
    ? "text-green-500"
    : insight.sentiment === "warn"
    ? "text-amber-500"
    : "text-muted-foreground";

  // Mini history bars
  const history = biomarker.history;
  const histMax = Math.max(...history);
  const histMin = Math.min(...history);
  const span = histMax - histMin || 1;

  return (
    <div className="flex flex-col justify-between h-full bg-muted/30 rounded-xl border p-4 gap-4">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color.badge}`}>
          {color.label}
        </span>
        <SentimentIcon className={`h-4 w-4 ${sentimentColor}`} />
      </div>

      {/* Last change */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Last change</div>
        <div className="flex items-center gap-2">
          {insight.diff > 0.005
            ? <TrendingUp className="h-4 w-4 text-rose-500 shrink-0" />
            : insight.diff < -0.005
            ? <TrendingDown className="h-4 w-4 text-green-500 shrink-0" />
            : <Minus className="h-4 w-4 text-muted-foreground shrink-0" />}
          <span className="font-semibold tabular-nums text-sm">
            {insight.diff > 0 ? "+" : ""}{formatValue(insight.diff)} {biomarker.unit}
          </span>
          <span className="text-xs text-muted-foreground">
            ({insight.pct > 0 ? "+" : ""}{insight.pct.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Mini progression — all 4 readings */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">All readings</div>
        <div className="flex items-end gap-1 h-8">
          {history.map((v, i) => {
            const heightPct = ((v - histMin) / span) * 100;
            const isLatest = i === history.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max(20, heightPct)}%`,
                    backgroundColor: color.stroke,
                    opacity: isLatest ? 1 : 0.35 + i * 0.15,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{formatValue(history[0])}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium">{formatValue(history[history.length - 1])} {biomarker.unit}</span>
        </div>
      </div>

      {/* Insight text */}
      <div className="border-t pt-3">
        <p className="text-xs font-semibold mb-0.5">{insight.headline}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
      </div>
    </div>
  );
}

/* ─── chart ──────────────────────────────────────────────────────────── */
function BiomarkerChart({ biomarker, index }: { biomarker: Biomarker; index: number }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const status = getRangeStatus(latest, biomarker.referenceRange);
  const color = C[status];
  const gradId = `g-${biomarker.id}`;

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
      {/* header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-base leading-tight">{biomarker.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{biomarker.description}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-xl font-bold tabular-nums">
            {formatValue(latest)}{" "}
            <span className="text-xs font-normal text-muted-foreground">{biomarker.unit}</span>
          </div>
        </div>
      </div>

      {/* 2-col: chart + insight */}
      <div className="grid grid-cols-[1fr_160px] gap-3">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
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
                tickFormatter={(i: number) => dates[i]?.slice(0, 7) ?? ""}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                dy={4}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                domain={["auto", "auto"]}
                tickCount={4}
                width={36}
              />
              <Tooltip content={<ChartTooltip dates={dates} unit={biomarker.unit} />} />
              {refMin != null && (
                <ReferenceLine y={refMin} stroke={color.stroke} strokeOpacity={0.45} strokeDasharray="4 3" />
              )}
              {refMax != null && (
                <ReferenceLine y={refMax} stroke={color.stroke} strokeOpacity={0.45} strokeDasharray="4 3" />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke={color.stroke}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                isAnimationActive={false}
                dot={{ r: 3, fill: color.stroke, stroke: "var(--color-card)", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: color.stroke, stroke: "var(--color-card)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* insight panel */}
        <InsightCard biomarker={biomarker} />
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
        <p className="text-muted-foreground mt-1">Track your health parameters over time, with inline insights for each marker.</p>
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

      <div className="space-y-4">
        {filtered.map((b, i) => (
          <BiomarkerChart key={b.id} biomarker={b} index={i} />
        ))}
      </div>
    </div>
  );
}
