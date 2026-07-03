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

/* ─── gradient stops builder ─────────────────────────────────────────── */
interface GradientStops {
  id: string;
  stops: Array<{ offset: string; color: string; opacity: number }>;
}

function buildZoneGradient(
  id: string,
  domainMin: number,
  domainMax: number,
  refMin: number | undefined,
  refMax: number | undefined,
): GradientStops {
  const span = domainMax - domainMin;
  const frac = (v: number) => `${((1 - (v - domainMin) / span) * 100).toFixed(2)}%`;

  const stops: GradientStops["stops"] = [];

  if (refMax !== undefined && refMin !== undefined) {
    // Three zones: red (above max) | green (between) | amber (below min)
    const maxF = frac(refMax);
    const minF = frac(refMin);
    stops.push(
      { offset: "0%",  color: ZONE.high.fill,   opacity: 0.55 },
      { offset: maxF,  color: ZONE.high.fill,   opacity: 0.55 },
      { offset: maxF,  color: ZONE.normal.fill, opacity: 0.45 },
      { offset: minF,  color: ZONE.normal.fill, opacity: 0.45 },
      { offset: minF,  color: ZONE.low.fill,    opacity: 0.55 },
      { offset: "100%", color: ZONE.low.fill,   opacity: 0.55 },
    );
  } else if (refMax !== undefined) {
    // Two zones: red (above max) | green (below max)
    const maxF = frac(refMax);
    stops.push(
      { offset: "0%",   color: ZONE.high.fill,   opacity: 0.55 },
      { offset: maxF,   color: ZONE.high.fill,   opacity: 0.55 },
      { offset: maxF,   color: ZONE.normal.fill, opacity: 0.45 },
      { offset: "100%", color: ZONE.normal.fill, opacity: 0.45 },
    );
  } else if (refMin !== undefined) {
    // Two zones: green (above min) | amber (below min)
    const minF = frac(refMin);
    stops.push(
      { offset: "0%",   color: ZONE.normal.fill, opacity: 0.45 },
      { offset: minF,   color: ZONE.normal.fill, opacity: 0.45 },
      { offset: minF,   color: ZONE.low.fill,    opacity: 0.55 },
      { offset: "100%", color: ZONE.low.fill,    opacity: 0.55 },
    );
  } else {
    stops.push(
      { offset: "0%",   color: ZONE.normal.fill, opacity: 0.45 },
      { offset: "100%", color: ZONE.normal.fill, opacity: 0.02 },
    );
  }

  return { id, stops };
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
  const histMin = Math.min(...history);
  const histMax = Math.max(...history);
  const span = histMax - histMin || 1;

  return (
    <div className="flex flex-col justify-between h-full bg-muted/30 rounded-xl border p-4 gap-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${zc.badge}`}>{zc.label}</span>
        <SentimentIcon className={`h-4 w-4 shrink-0 ${sentimentCls}`} />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Last change</div>
        <div className="flex items-center gap-1.5">
          {insight.diff > 0.005 ? (
            <TrendingUp className="h-4 w-4 text-rose-500 shrink-0" />
          ) : insight.diff < -0.005 ? (
            <TrendingDown className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold tabular-nums text-sm">
            {insight.diff > 0 ? "+" : ""}{formatValue(insight.diff)} {biomarker.unit}
          </span>
          <span className="text-xs text-muted-foreground">
            ({insight.pct > 0 ? "+" : ""}{insight.pct.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">All readings</div>
        <div className="flex items-end gap-1 h-9">
          {history.map((v, i) => {
            const h = Math.max(16, ((v - histMin) / span) * 100);
            return (
              <div key={i} className="flex-1 flex items-end">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${h}%`,
                    backgroundColor: zc.fill,
                    opacity: i === history.length - 1 ? 1 : 0.3 + i * 0.15,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">{formatValue(history[0])}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium">{formatValue(history[history.length - 1])} {biomarker.unit}</span>
        </div>
      </div>

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
  const latestStatus = getRangeStatus(latest, biomarker.referenceRange);
  const { min: refMin, max: refMax } = parseRef(biomarker.referenceRange);
  const gradId = `zone-grad-${biomarker.id}`;
  const dates = reports.map(r => r.date);
  const data = biomarker.history.map((value, i) => ({ x: i, value }));

  // Compute Y domain with padding (include reference lines in domain)
  const allVals = [
    ...biomarker.history,
    ...(refMin !== undefined ? [refMin] : []),
    ...(refMax !== undefined ? [refMax] : []),
  ];
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.18 || rawMax * 0.15 || 1;
  const domainMin = Math.max(0, rawMin - pad);
  const domainMax = rawMax + pad;

  const gradient = buildZoneGradient(gradId, domainMin, domainMax, refMin, refMax);

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
      <div className="grid grid-cols-[1fr_168px] gap-4">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  {gradient.stops.map((s, i) => (
                    <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
                  ))}
                </linearGradient>
              </defs>

              {/* Background zone shading */}
              {refMax !== undefined && (
                <ReferenceArea
                  y1={refMax}
                  y2={domainMax}
                  fill={ZONE.high.bg}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              {refMin !== undefined && refMax !== undefined && (
                <ReferenceArea
                  y1={refMin}
                  y2={refMax}
                  fill={ZONE.normal.bg}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              {refMin !== undefined && refMax === undefined && (
                <ReferenceArea
                  y1={refMin}
                  y2={domainMax}
                  fill={ZONE.normal.bg}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              {refMin !== undefined && (
                <ReferenceArea
                  y1={domainMin}
                  y2={refMin}
                  fill={ZONE.low.bg}
                  fillOpacity={1}
                  stroke="none"
                />
              )}
              {refMin === undefined && refMax !== undefined && (
                <ReferenceArea
                  y1={domainMin}
                  y2={refMax}
                  fill={ZONE.normal.bg}
                  fillOpacity={1}
                  stroke="none"
                />
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
                width={36}
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

              <Area
                type="monotone"
                dataKey="value"
                stroke={ZONE[latestStatus].stroke}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
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
