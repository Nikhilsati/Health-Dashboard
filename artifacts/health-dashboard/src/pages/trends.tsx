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
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

/* ─── types ──────────────────────────────────────────────────────────── */
type RangeStatus = "high" | "low" | "normal";

/* ─── helpers ────────────────────────────────────────────────────────── */
function parseRef(ref: Biomarker["referenceRange"]): { min?: number; max?: number } {
  if (Array.isArray(ref)) return { min: ref[0], max: ref[1] };
  return { min: (ref as any).min, max: (ref as any).max };
}

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): RangeStatus {
  const { min, max } = parseRef(ref);
  if (max !== undefined && value > max) return "high";
  if (min !== undefined && value < min) return "low";
  return "normal";
}

/* ─── zone colors ────────────────────────────────────────────────────── */
const ZONE = {
  high:   { stroke: "#ef4444", fill: "#ef4444", bg: "#ef444414", badge: "bg-red-500/15 text-red-400",    label: "Above Range" },
  normal: { stroke: "#22c55e", fill: "#22c55e", bg: "#22c55e14", badge: "bg-green-500/15 text-green-500", label: "In Range" },
  low:    { stroke: "#f59e0b", fill: "#f59e0b", bg: "#f59e0b14", badge: "bg-amber-500/15 text-amber-400", label: "Below Range" },
};

/* ─── zone fill data builders ────────────────────────────────────────── */
// Each Area fills from its dataKey DOWN to its baseValue.
// We clamp values so each Area only "paints" its own zone.
function buildZoneData(
  history: number[],
  refMin: number | undefined,
  refMax: number | undefined,
  domainMin: number,
) {
  return history.map((value, i) => {
    // high: fills from max(value, refMax) → refMax  (only visible when value > refMax)
    const high = refMax !== undefined ? Math.max(value, refMax) : undefined;
    // normal: fills from clamped value → refMin (or domainMin if no refMin)
    const normalTop =
      refMax !== undefined && refMin !== undefined
        ? Math.min(Math.max(value, refMin), refMax)
        : refMax !== undefined
        ? Math.min(value, refMax)
        : refMin !== undefined
        ? Math.max(value, refMin)
        : value;
    const normal = normalTop;
    // low: fills from min(value, refMin) → domainMin  (only visible when value < refMin)
    const low = refMin !== undefined ? Math.min(value, refMin) : undefined;
    return { x: i, value, high, normal, low };
  });
}

/* ─── tooltip ────────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, dates, unit }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs mb-1">{dates?.[label] ?? label}</p>
      <p className="font-semibold tabular-nums">
        {formatValue(value)}{" "}
        <span className="font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

/* ─── insight logic ──────────────────────────────────────────────────── */
function getBiomarkerInsight(b: Biomarker) {
  const history = b.history;
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const first = history[0];
  const diff = latest - prev;
  const pct = prev ? (diff / prev) * 100 : 0;
  const status = getRangeStatus(latest, b.referenceRange);
  const trendFlat = Math.abs(pct) < 1;
  const { max: refMax } = parseRef(b.referenceRange);
  const movingGood =
    (status === "high" && diff < 0) ||
    (status === "low" && diff > 0) ||
    status === "normal";

  let headline = "";
  let detail = "";
  let sentiment: "good" | "warn" | "neutral" = "neutral";

  if (trendFlat) {
    headline = "Stable";
    detail = `No significant change. ${formatValue(prev)} → ${formatValue(latest)} ${b.unit}.`;
    sentiment = status === "normal" ? "good" : "warn";
  } else if (movingGood) {
    headline = diff > 0 ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
    detail =
      status === "normal"
        ? `Tracking well within range. ${formatValue(prev)} → ${formatValue(latest)} ${b.unit}.`
        : `Trending toward the normal range. Was ${formatValue(first)} ${b.unit} in first report.`;
    sentiment = "good";
  } else {
    headline = diff > 0 ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
    detail =
      status === "high"
        ? `Still above reference range. Monitor closely.`
        : status === "low"
        ? `Still below reference range. Consider supplementation.`
        : `Moving away from optimal. Watch this trend.`;
    sentiment = "warn";
  }

  return { headline, detail, sentiment, diff, pct, latest, prev, status };
}

/* ─── insight card ───────────────────────────────────────────────────── */
function InsightCard({ biomarker }: { biomarker: Biomarker }) {
  const insight = getBiomarkerInsight(biomarker);
  const zc = ZONE[insight.status];
  const SentimentIcon =
    insight.sentiment === "good" ? CheckCircle2 : insight.sentiment === "warn" ? AlertCircle : Minus;
  const sentimentCls =
    insight.sentiment === "good" ? "text-green-500" : insight.sentiment === "warn" ? "text-amber-500" : "text-muted-foreground";

  const history = biomarker.history;

  return (
    <div className="flex flex-col gap-2.5 h-full bg-muted/30 rounded-xl border px-3 py-3">
      {/* badge + sentiment */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${zc.badge}`}>{zc.label}</span>
        <SentimentIcon className={`h-3.5 w-3.5 shrink-0 ${sentimentCls}`} />
      </div>

      {/* delta */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        {insight.diff > 0.005 ? (
          <TrendingUp className="h-3.5 w-3.5 text-rose-500 shrink-0 self-center" />
        ) : insight.diff < -0.005 ? (
          <TrendingDown className="h-3.5 w-3.5 text-green-500 shrink-0 self-center" />
        ) : (
          <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0 self-center" />
        )}
        <span className="font-semibold tabular-nums text-sm leading-none">
          {insight.diff > 0 ? "+" : ""}{formatValue(insight.diff)} {biomarker.unit}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {insight.pct > 0 ? "+" : ""}{insight.pct.toFixed(1)}%
        </span>
      </div>

      {/* readings row */}
      <div className="flex items-center gap-1 text-[10px]">
        {history.map((v, i) => (
          <span key={i} className={i === history.length - 1 ? "font-semibold" : "text-muted-foreground"}>
            {formatValue(v)}{i < history.length - 1 ? <span className="mx-0.5 text-muted-foreground/50">›</span> : ""}
          </span>
        ))}
        <span className="text-muted-foreground ml-0.5">{biomarker.unit}</span>
      </div>

      {/* divider + insight */}
      <div className="border-t pt-2">
        <p className="text-[10px] font-semibold text-foreground/80 mb-0.5">{insight.headline}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.detail}</p>
      </div>
    </div>
  );
}

/* ─── chart ──────────────────────────────────────────────────────────── */
function BiomarkerChart({ biomarker, index }: { biomarker: Biomarker; index: number }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const latestStatus = getRangeStatus(latest, biomarker.referenceRange);
  const { min: refMin, max: refMax } = parseRef(biomarker.referenceRange);
  const dates = reports.map(r => r.date);

  // Compute Y domain so reference lines always have visible breathing room
  const allVals = [
    ...biomarker.history,
    ...(refMin !== undefined ? [refMin] : []),
    ...(refMax !== undefined ? [refMax] : []),
  ];
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.12 || rawMax * 0.08 || 1;

  let domainMin = Math.max(0, rawMin - pad);
  let domainMax = rawMax + pad;

  // Guarantee the healthy side of every reference line occupies ≥15% of the chart
  const firstSpan = domainMax - domainMin;
  if (refMax !== undefined) domainMin = Math.min(domainMin, refMax - firstSpan * 0.15);
  if (refMin !== undefined) domainMax = Math.max(domainMax, refMin + firstSpan * 0.15);
  // Re-clamp to zero if all real data is non-negative
  if (domainMin < 0 && Math.min(...biomarker.history) >= 0) domainMin = 0;

  const data = buildZoneData(biomarker.history, refMin, refMax, domainMin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="bg-card border rounded-xl px-4 pt-3 pb-4 shadow-sm"
    >
      {/* header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold text-sm leading-tight">{biomarker.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{biomarker.description}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="text-lg font-bold tabular-nums">
            {formatValue(latest)}{" "}
            <span className="text-xs font-normal text-muted-foreground">{biomarker.unit}</span>
          </div>
        </div>
      </div>

      {/* 2-col: chart + insight */}
      <div className="grid grid-cols-[1fr_156px] gap-3">
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>

              {/* Background zone shading */}
              {refMax !== undefined && (
                <ReferenceArea y1={refMax} y2={domainMax} fill={ZONE.high.bg} fillOpacity={1} stroke="none" />
              )}
              {(refMin !== undefined || refMax !== undefined) && (
                <ReferenceArea
                  y1={refMin ?? domainMin}
                  y2={refMax ?? domainMax}
                  fill={ZONE.normal.bg}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              {refMin !== undefined && (
                <ReferenceArea y1={domainMin} y2={refMin} fill={ZONE.low.bg} fillOpacity={1} stroke="none" />
              )}

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.07} />

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
                domain={[domainMin, domainMax]}
                tickCount={4}
                width={38}
                tickFormatter={(v: number) =>
                  v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2)
                }
              />
              <Tooltip content={<ChartTooltip dates={dates} unit={biomarker.unit} />} />

              {/* Dashed reference lines */}
              {refMax !== undefined && (
                <ReferenceLine
                  y={refMax}
                  stroke={ZONE.high.stroke}
                  strokeOpacity={0.7}
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{ value: `Max ${refMax}`, position: "right", fontSize: 8, fill: ZONE.high.stroke, dx: -2 }}
                />
              )}
              {refMin !== undefined && (
                <ReferenceLine
                  y={refMin}
                  stroke={ZONE.low.stroke}
                  strokeOpacity={0.7}
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{ value: `Min ${refMin}`, position: "right", fontSize: 8, fill: ZONE.low.stroke, dx: -2 }}
                />
              )}

              {/* Zone fill areas — each clamped to its zone, no gradient needed */}
              {refMax !== undefined && (
                <Area
                  type="monotone"
                  dataKey="high"
                  baseValue={refMax}
                  stroke="none"
                  fill={ZONE.high.fill}
                  fillOpacity={0.4}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              )}
              <Area
                type="monotone"
                dataKey="normal"
                baseValue={refMin ?? domainMin}
                stroke="none"
                fill={ZONE.normal.fill}
                fillOpacity={0.35}
                isAnimationActive={false}
                dot={false}
                activeDot={false}
                legendType="none"
              />
              {refMin !== undefined && (
                <Area
                  type="monotone"
                  dataKey="low"
                  baseValue={domainMin}
                  stroke="none"
                  fill={ZONE.low.fill}
                  fillOpacity={0.45}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              )}

              {/* Stroke line on top */}
              <Area
                type="monotone"
                dataKey="value"
                stroke={ZONE[latestStatus].stroke}
                strokeWidth={2.5}
                fill="none"
                isAnimationActive={false}
                dot={{ r: 4, fill: ZONE[latestStatus].stroke, stroke: "var(--color-card)", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: ZONE[latestStatus].stroke, stroke: "var(--color-card)", strokeWidth: 2 }}
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
        <p className="text-muted-foreground mt-1">
          Track your health parameters over time. Green zone is the healthy range.
        </p>
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
