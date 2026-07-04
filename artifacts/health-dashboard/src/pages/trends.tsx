import { biomarkers, reports, categories, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2,
} from "lucide-react";

/* ─── clinical groups ────────────────────────────────────────────────── */
const CLINICAL_GROUPS: Array<{ label: string; ids: string[]; cols: number }> = [
  { label: "Lipid Panel",           ids: ["cholesterol","ldl","hdl","triglycerides","vldl"],                     cols: 3 },
  { label: "Cardiac Risk Markers",  ids: ["hscrp","lpa"],                                                        cols: 2 },
  { label: "Complete Blood Count",  ids: ["hemoglobin","rbc","wbc","platelets","hematocrit","mcv","mch"],         cols: 4 },
  { label: "Liver Enzymes",         ids: ["alt","ast","alp","ggt"],                                              cols: 4 },
  { label: "Liver Panel",           ids: ["bilirubin","total_protein","albumin"],                                cols: 3 },
  { label: "Kidney Function",       ids: ["creatinine","egfr","bun","uric_acid"],                                cols: 4 },
  { label: "Electrolytes",          ids: ["sodium","potassium"],                                                 cols: 2 },
  { label: "Thyroid Panel",         ids: ["tsh","t3free","t4free"],                                              cols: 3 },
  { label: "Vitamins",              ids: ["vitamind","vitaminb12","folate"],                                     cols: 3 },
  { label: "Iron Studies",          ids: ["iron","ferritin"],                                                    cols: 2 },
  { label: "Diabetes Panel",        ids: ["fasting_glucose","hba1c","insulin","homair"],                         cols: 4 },
  { label: "Inflammatory Markers",  ids: ["esr","homocysteine"],                                                cols: 2 },
  { label: "Hormones",              ids: ["testosterone","dheas"],                                               cols: 2 },
];
const GROUPED_IDS = new Set(CLINICAL_GROUPS.flatMap(g => g.ids));

/* ─── helpers ────────────────────────────────────────────────────────── */
type RangeStatus = "high" | "low" | "normal";

function parseRef(ref: Biomarker["referenceRange"]): { min?: number; max?: number } {
  if (Array.isArray(ref)) return { min: ref[0], max: ref[1] };
  return { min: (ref as any).min, max: (ref as any).max };
}

function formatRefRange(ref: Biomarker["referenceRange"]): string {
  if (Array.isArray(ref)) return `${ref[0]}–${ref[1]}`;
  if (typeof ref === "object" && ref !== null) {
    if ((ref as any).text) return (ref as any).text;
    const min = (ref as any).min;
    const max = (ref as any).max;
    if (min !== undefined && max !== undefined) return `${min}–${max}`;
    if (min !== undefined) return `≥ ${min}`;
    if (max !== undefined) return `< ${max}`;
  }
  return "N/A";
}

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): RangeStatus {
  const { min, max } = parseRef(ref);
  if (max !== undefined && value > max) return "high";
  if (min !== undefined && value < min) return "low";
  return "normal";
}

const ZONE = {
  high:   { stroke: "#ef4444", fill: "#ef4444", bg: "#ef444408", badge: "bg-red-500/10 text-red-400 border border-red-500/20",    label: "Above Range" },
  normal: { stroke: "#22c55e", fill: "#22c55e", bg: "#22c55e08", badge: "bg-green-500/10 text-green-400 border border-green-500/20", label: "In Range" },
  low:    { stroke: "#f59e0b", fill: "#f59e0b", bg: "#f59e0b08", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Below Range" },
};

function formatAxisDate(dateStr?: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const year = parts[0].slice(-2);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[monthIdx] || "";
  return `${monthName} '${year}`;
}

function getBriefInsight(biomarker: Biomarker): string {
  const h = biomarker.history;
  if (h.length < 2) return "Stable and within range.";
  const latest = h[h.length - 1];
  const prev = h[h.length - 2];
  const diff = latest - prev;
  const pct = prev ? (diff / prev) * 100 : 0;
  const status = getRangeStatus(latest, biomarker.referenceRange);
  
  if (status === "normal") {
    if (Math.abs(pct) < 1) {
      return "Stable and within the normal range over the last 2 years.";
    }
    return `Improved by ${Math.abs(pct).toFixed(1)}% since your previous test.`;
  }
  if (status === "high") {
    if (diff < 0) {
      return `Improving: decreased by ${Math.abs(pct).toFixed(1)}% since previous test, trending toward normal.`;
    }
    return `Elevated by ${Math.abs(pct).toFixed(1)}% above optimal levels. Monitor closely.`;
  }
  if (status === "low") {
    if (diff > 0) {
      return `Improving: increased by ${Math.abs(pct).toFixed(1)}% since previous test, trending toward normal.`;
    }
    return `Below optimal range by ${Math.abs(pct).toFixed(1)}%. Consider supplementation.`;
  }
  return "Stable over the last 2 years.";
}

function AnimatedValue({ value, unit, className }: { value: number; unit: string; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    let frameId: number;
    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      setDisplayValue(start + ease * (end - start));
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return (
    <span className={className}>
      {formatValue(displayValue)}
      {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
    </span>
  );
}

function buildZoneData(history: number[], refMin?: number, refMax?: number, domainMin = 0) {
  return history.map((value, i) => {
    const high = refMax !== undefined ? Math.max(value, refMax) : undefined;
    const normalTop =
      refMax !== undefined && refMin !== undefined ? Math.min(Math.max(value, refMin), refMax)
      : refMax !== undefined ? Math.min(value, refMax)
      : refMin !== undefined ? Math.max(value, refMin)
      : value;
    const low = refMin !== undefined ? Math.min(value, refMin) : undefined;
    return { x: i, value, high, normal: normalTop, low };
  });
}

function computeDomain(history: number[], refMin?: number, refMax?: number) {
  const allVals = [
    ...history,
    ...(refMin !== undefined ? [refMin] : []),
    ...(refMax !== undefined ? [refMax] : []),
  ];
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.12 || rawMax * 0.08 || 1;
  let dMin = Math.max(0, rawMin - pad);
  let dMax = rawMax + pad;
  const span = dMax - dMin;
  if (refMax !== undefined) dMin = Math.min(dMin, refMax - span * 0.15);
  if (refMin !== undefined) dMax = Math.max(dMax, refMin + span * 0.15);
  if (dMin < 0 && Math.min(...history) >= 0) dMin = 0;
  return { dMin, dMax };
}

/* ─── tooltip ────────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, dates, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-border/40 rounded-xl px-3 py-2 shadow-lg text-xs backdrop-blur-md">
      <p className="text-muted-foreground text-[10px] mb-0.5">{dates?.[label] ?? label}</p>
      <p className="font-bold tabular-nums text-foreground/90">
        {formatValue(payload[0].value)}{" "}
        <span className="font-normal text-muted-foreground text-[10px]">{unit}</span>
      </p>
    </div>
  );
}

/* ─── shared chart body ──────────────────────────────────────────────── */
function ZoneAreaChart({
  biomarker, height, showXLabels = true,
}: { biomarker: Biomarker; height: number; showXLabels?: boolean }) {
  const { min: refMin, max: refMax } = parseRef(biomarker.referenceRange);
  const latest = biomarker.history[biomarker.history.length - 1];
  const { dMin, dMax } = computeDomain(biomarker.history, refMin, refMax);
  const dates = reports.map(r => r.date);

  const [isHovered, setIsHovered] = useState(false);

  const range = dMax - dMin || 1;
  const maxPct = refMax !== undefined ? Math.max(0, Math.min(100, 100 - ((refMax - dMin) / range) * 100)) : 0;
  const minPct = refMin !== undefined ? Math.max(0, Math.min(100, 100 - ((refMin - dMin) / range) * 100)) : 100;

  const data = biomarker.history.map((val, i) => ({ x: i, value: val }));

  const renderCustomDot = (props: any) => {
    const { cx, cy, index, payload } = props;
    const isLatest = index === data.length - 1;
    const val = payload.value;
    const status = getRangeStatus(val, biomarker.referenceRange);
    const color = ZONE[status].stroke;

    if (isLatest) {
      return (
        <g key={`dot-${index}`}>
          <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.3} />
          <circle cx={cx} cy={cy} r={5} fill={color} stroke="var(--color-card)" strokeWidth={1.5} />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill="var(--color-foreground)"
            fontSize="10"
            fontWeight="700"
            className="tabular-nums font-sans"
          >
            {formatValue(val)}
          </text>
        </g>
      );
    }

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill={color}
        stroke="var(--color-card)"
        strokeWidth={1}
        opacity={0.4}
      />
    );
  };

  return (
    <div 
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 18, right: 35, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`stroke-${biomarker.id}`} x1="0" y1="0" x2="0" y2="1">
              {refMax !== undefined && (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset={`${maxPct}%`} stopColor="#ef4444" />
                  <stop offset={`${maxPct}%`} stopColor="#22c55e" />
                </>
              )}
              {refMin !== undefined ? (
                <>
                  <stop offset={`${minPct}%`} stopColor="#22c55e" />
                  <stop offset={`${minPct}%`} stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </>
              ) : (
                <stop offset="100%" stopColor="#22c55e" />
              )}
            </linearGradient>

            <linearGradient id={`fill-${biomarker.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={refMax !== undefined ? "#ef4444" : "#22c55e"} stopOpacity={0.25} />
              {refMax !== undefined && (
                <stop offset={`${maxPct}%`} stopColor="#ef4444" stopOpacity={0.2} />
              )}
              <stop offset={`${refMin !== undefined ? minPct : 50}%`} stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor={refMin !== undefined ? "#f59e0b" : "#22c55e"} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {refMax !== undefined && (
            <ReferenceArea y1={refMax} y2={dMax} fill={ZONE.high.bg} fillOpacity={1} stroke="none" />
          )}
          {(refMin !== undefined || refMax !== undefined) && (
            <ReferenceArea
              y1={refMin ?? dMin} y2={refMax ?? dMax}
              fill={ZONE.normal.bg} fillOpacity={1} stroke="none"
            />
          )}
          {refMin !== undefined && (
            <ReferenceArea y1={dMin} y2={refMin} fill={ZONE.low.bg} fillOpacity={1} stroke="none" />
          )}

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />

          <XAxis
            dataKey="x" type="number" scale="linear"
            domain={[0, data.length - 1]}
            ticks={data.map((_, i) => i)}
            tickFormatter={(i: number) => {
              if (!showXLabels) return "";
              if (i === 0) return "First Test";
              if (i === data.length - 1) return "Latest";
              return formatAxisDate(dates[i]);
            }}
            axisLine={false} tickLine={false}
            tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }}
            dy={3} interval={0}
            height={showXLabels ? 18 : 4}
          />
          <YAxis
            axisLine={false} tickLine={false}
            tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }}
            domain={[dMin, dMax]} tickCount={3} width={30}
            tickFormatter={(v: number) =>
              v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2)
            }
          />
          <Tooltip 
            content={<ChartTooltip dates={dates} unit={biomarker.unit} />}
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }}
          />

          {isHovered && refMax !== undefined && (
            <ReferenceLine y={refMax} stroke="#ef4444" strokeOpacity={0.5}
              strokeDasharray="4 3" strokeWidth={1.2}
              label={{ value: `Max: ${refMax}`, fill: "var(--color-muted-foreground)", fontSize: 8, position: "right", offset: 5 }} />
          )}
          {isHovered && refMin !== undefined && (
            <ReferenceLine y={refMin} stroke="#f59e0b" strokeOpacity={0.5}
              strokeDasharray="4 3" strokeWidth={1.2}
              label={{ value: `Min: ${refMin}`, fill: "var(--color-muted-foreground)", fontSize: 8, position: "right", offset: 5 }} />
          )}

          <Area type="monotone" dataKey="value"
            stroke={`url(#stroke-${biomarker.id})`} strokeWidth={3} strokeLinecap="round"
            fill={`url(#fill-${biomarker.id})`} isAnimationActive={true}
            animationDuration={800} animationEasing="ease-in-out"
            dot={renderCustomDot}
            activeDot={{ r: 6, fill: "var(--color-card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── mini chart (inside group card) ────────────────────────────────── */
function MiniChart({ biomarker }: { biomarker: Biomarker }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const prev = biomarker.history[biomarker.history.length - 2];
  const diff = latest - prev;
  const pct = prev ? (diff / prev) * 100 : 0;
  const status = getRangeStatus(latest, biomarker.referenceRange);
  const zc = ZONE[status];
  const briefInsight = getBriefInsight(biomarker);

  return (
    <div className="glass-card border border-border/40 rounded-xl px-4 py-3 flex flex-col gap-2 isomorphic-lift">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold leading-tight text-foreground/90">{biomarker.name}</div>
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${zc.badge}`}>
          {zc.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <AnimatedValue value={latest} unit={biomarker.unit} className="text-xl font-bold tabular-nums text-foreground/95" />
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium">
          {diff > 0.005 ? "↑" : diff < -0.005 ? "↓" : "→"}{" "}
          {Math.abs(pct).toFixed(1)}% ({diff > 0 ? "+" : ""}{formatValue(diff)})
        </span>
      </div>

      <ZoneAreaChart biomarker={biomarker} height={115} showXLabels={true} />

      <div className="border-t border-border/20 pt-2 flex flex-col gap-1">
        <div className="text-[9px] text-muted-foreground">
          Normal Range: <span className="font-semibold text-foreground/80">{formatRefRange(biomarker.referenceRange)}</span> {biomarker.unit}
        </div>
        <p className="text-[10px] text-muted-foreground/90 leading-normal italic">
          {briefInsight}
        </p>
      </div>
    </div>
  );
}

/* ─── group card ─────────────────────────────────────────────────────── */
function GroupCard({
  label, biomarkerList, index,
}: { label: string; biomarkerList: Biomarker[]; index: number }) {
  const statuses = biomarkerList.map(b =>
    getRangeStatus(b.history[b.history.length - 1], b.referenceRange)
  );
  const numHigh = statuses.filter(s => s !== "normal").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="py-2 space-y-3"
    >
      {/* section header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-md font-bold text-foreground/90">{label}</h3>
        {numHigh > 0
          ? <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{numHigh} out of range</span>
          : <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">All in range</span>
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {biomarkerList.map(b => <MiniChart key={b.id} biomarker={b} />)}
      </div>
    </motion.div>
  );
}

/* ─── full individual chart + insight (used in category view) ────────── */
function InsightCard({ biomarker }: { biomarker: Biomarker }) {
  const insight = (() => {
    const h = biomarker.history;
    const latest = h[h.length - 1]; const prev = h[h.length - 2];
    const diff = latest - prev;
    const pct = prev ? (diff / prev) * 100 : 0;
    const status = getRangeStatus(latest, biomarker.referenceRange);
    const trendFlat = Math.abs(pct) < 1;
    const movingGood = (status === "high" && diff < 0) || (status === "low" && diff > 0) || status === "normal";
    let headline = ""; let detail = ""; let sentiment: "good"|"warn"|"neutral" = "neutral";
    if (trendFlat) {
      headline = "Stable"; detail = `No significant change. ${formatValue(prev)} → ${formatValue(latest)} ${biomarker.unit}.`;
      sentiment = status === "normal" ? "good" : "warn";
    } else if (movingGood) {
      headline = diff > 0 ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
      detail = status === "normal"
        ? `Tracking well within range. ${formatValue(prev)} → ${formatValue(latest)} ${biomarker.unit}.`
        : `Trending toward the normal range. Was ${formatValue(h[0])} ${biomarker.unit} in first report.`;
      sentiment = "good";
    } else {
      headline = diff > 0 ? `Up ${Math.abs(pct).toFixed(1)}%` : `Down ${Math.abs(pct).toFixed(1)}%`;
      detail = status === "high" ? `Still above reference range. Monitor closely.`
        : status === "low" ? `Still below reference range. Consider supplementation.`
        : `Moving away from optimal. Watch this trend.`;
      sentiment = "warn";
    }
    return { headline, detail, sentiment, diff, pct, latest, status };
  })();

  const zc = ZONE[insight.status];
  const SentimentIcon = insight.sentiment === "good" ? CheckCircle2 : insight.sentiment === "warn" ? AlertCircle : Minus;
  const sentimentCls = insight.sentiment === "good" ? "text-green-500" : insight.sentiment === "warn" ? "text-amber-500" : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-2.5 h-full bg-primary/5 dark:bg-primary/10 rounded-xl border border-border/40 px-3 py-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${zc.badge}`}>{zc.label}</span>
        <SentimentIcon className={`h-3.5 w-3.5 shrink-0 ${sentimentCls}`} />
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        {insight.diff > 0.005 ? <TrendingUp className="h-3.5 w-3.5 text-rose-500 shrink-0 self-center" />
          : insight.diff < -0.005 ? <TrendingDown className="h-3.5 w-3.5 text-green-500 shrink-0 self-center" />
          : <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0 self-center" />}
        <span className="font-semibold tabular-nums text-sm leading-none">
          {insight.diff > 0 ? "+" : ""}{formatValue(insight.diff)} {biomarker.unit}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {insight.pct > 0 ? "+" : ""}{insight.pct.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-0.5 flex-wrap text-[10px]">
        {biomarker.history.map((v, i) => (
          <span key={i} className={i === biomarker.history.length - 1 ? "font-semibold" : "text-muted-foreground"}>
            {formatValue(v)}{i < biomarker.history.length - 1 && <span className="mx-0.5 opacity-40">›</span>}
          </span>
        ))}
        <span className="text-muted-foreground ml-0.5">{biomarker.unit}</span>
      </div>
      <div className="border-t pt-2">
        <p className="text-[10px] font-semibold text-foreground/80 mb-0.5">{insight.headline}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.detail}</p>
      </div>
    </div>
  );
}

function BiomarkerChart({ biomarker, index }: { biomarker: Biomarker; index: number }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const prev = biomarker.history[biomarker.history.length - 2];
  const diff = latest - prev;
  const pct = prev ? (diff / prev) * 100 : 0;
  const status = getRangeStatus(latest, biomarker.referenceRange);
  const zc = ZONE[status];
  const briefInsight = getBriefInsight(biomarker);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="glass-card border border-border/40 rounded-2xl p-5 shadow-md isomorphic-lift flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm leading-tight text-foreground/90">{biomarker.name}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{biomarker.description}</p>
        </div>
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${zc.badge}`}>
          {zc.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <AnimatedValue value={latest} unit={biomarker.unit} className="text-2xl font-black tabular-nums text-foreground/95" />
        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground font-semibold">
          {diff > 0.005 ? "↑" : diff < -0.005 ? "↓" : "→"}{" "}
          {Math.abs(pct).toFixed(1)}% ({diff > 0 ? "+" : ""}{formatValue(diff)})
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_160px] gap-4 items-end">
        <ZoneAreaChart biomarker={biomarker} height={120} showXLabels={true} />
        <InsightCard biomarker={biomarker} />
      </div>

      <div className="border-t border-border/20 pt-2.5 flex flex-col gap-1">
        <div className="text-[10px] text-muted-foreground">
          Normal Range: <span className="font-semibold text-foreground/80">{formatRefRange(biomarker.referenceRange)}</span> {biomarker.unit}
        </div>
        <p className="text-[11px] text-muted-foreground/90 leading-normal italic">
          {briefInsight}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────── */
export default function Trends() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Build lookup
  const byId = Object.fromEntries(biomarkers.map(b => [b.id, b]));

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
            className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary/20 shadow-md shadow-primary/20 scale-[1.03]"
                : "bg-white/40 dark:bg-black/10 text-foreground border-border/40 hover:bg-primary/10 hover:text-primary backdrop-blur-sm"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {activeCategory === "all" ? (
        /* Grouped view */
        <div className="space-y-6">
          {CLINICAL_GROUPS.map((group, gi) => {
            const list = group.ids.map(id => byId[id]).filter(Boolean);
            if (!list.length) return null;
            return (
              <GroupCard
                key={group.label}
                label={group.label}
                biomarkerList={list}
                index={gi}
              />
            );
          })}
          {/* Ungrouped fallback */}
          {biomarkers.filter(b => !GROUPED_IDS.has(b.id)).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {biomarkers
                .filter(b => !GROUPED_IDS.has(b.id))
                .map((b, i) => <BiomarkerChart key={b.id} biomarker={b} index={i} />)}
            </div>
          )}
        </div>
      ) : (
        /* Category detail view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {biomarkers
            .filter(b => b.category === activeCategory)
            .map((b, i) => <BiomarkerChart key={b.id} biomarker={b} index={i} />)}
        </div>
      )}
    </div>
  );
}
