import { biomarkers, reports, categories, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, CartesianGrid,
} from "recharts";
import { useState } from "react";
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

function getRangeStatus(value: number, ref: Biomarker["referenceRange"]): RangeStatus {
  const { min, max } = parseRef(ref);
  if (max !== undefined && value > max) return "high";
  if (min !== undefined && value < min) return "low";
  return "normal";
}

const ZONE = {
  high:   { stroke: "#ef4444", fill: "#ef4444", bg: "#ef444414", badge: "bg-red-500/15 text-red-400",    label: "Above Range" },
  normal: { stroke: "#22c55e", fill: "#22c55e", bg: "#22c55e14", badge: "bg-green-500/15 text-green-500", label: "In Range" },
  low:    { stroke: "#f59e0b", fill: "#f59e0b", bg: "#f59e0b14", badge: "bg-amber-500/15 text-amber-400", label: "Below Range" },
};

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
    <div className="bg-card border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs mb-1">{dates?.[label] ?? label}</p>
      <p className="font-semibold tabular-nums">
        {formatValue(payload[0].value)}{" "}
        <span className="font-normal text-muted-foreground">{unit}</span>
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
  const latestStatus = getRangeStatus(latest, biomarker.referenceRange);
  const { dMin, dMax } = computeDomain(biomarker.history, refMin, refMax);
  const data = buildZoneData(biomarker.history, refMin, refMax, dMin);
  const dates = reports.map(r => r.date);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
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

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.07} />

          <XAxis
            dataKey="x" type="number" scale="linear"
            domain={[0, data.length - 1]}
            ticks={data.map((_, i) => i)}
            tickFormatter={(i: number) => showXLabels ? (dates[i]?.slice(0, 7) ?? "") : ""}
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
          <Tooltip content={<ChartTooltip dates={dates} unit={biomarker.unit} />} />

          {refMax !== undefined && (
            <ReferenceLine y={refMax} stroke={ZONE.high.stroke} strokeOpacity={0.6}
              strokeDasharray="4 3" strokeWidth={1.2} />
          )}
          {refMin !== undefined && (
            <ReferenceLine y={refMin} stroke={ZONE.low.stroke} strokeOpacity={0.6}
              strokeDasharray="4 3" strokeWidth={1.2} />
          )}

          {refMax !== undefined && (
            <Area type="monotone" dataKey="high" baseValue={refMax}
              stroke="none" fill={ZONE.high.fill} fillOpacity={0.4}
              isAnimationActive={false} dot={false} activeDot={false} legendType="none" />
          )}
          <Area type="monotone" dataKey="normal" baseValue={refMin ?? dMin}
            stroke="none" fill={ZONE.normal.fill} fillOpacity={0.35}
            isAnimationActive={false} dot={false} activeDot={false} legendType="none" />
          {refMin !== undefined && (
            <Area type="monotone" dataKey="low" baseValue={dMin}
              stroke="none" fill={ZONE.low.fill} fillOpacity={0.45}
              isAnimationActive={false} dot={false} activeDot={false} legendType="none" />
          )}
          <Area type="monotone" dataKey="value"
            stroke={ZONE[latestStatus].stroke} strokeWidth={2}
            fill="none" isAnimationActive={false}
            dot={{ r: 3, fill: ZONE[latestStatus].stroke, stroke: "var(--color-card)", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: ZONE[latestStatus].stroke, stroke: "var(--color-card)", strokeWidth: 1.5 }}
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

  return (
    <div className="bg-card border rounded-xl px-3 pt-2.5 pb-3 flex flex-col gap-1.5">
      {/* top row: name + badge */}
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="text-xs font-semibold leading-tight">{biomarker.name}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{biomarker.description}</div>
        </div>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${zc.badge}`}>
          {zc.label}
        </span>
      </div>

      {/* value + delta */}
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold tabular-nums">
          {formatValue(latest)}
          <span className="text-[10px] font-normal text-muted-foreground ml-1">{biomarker.unit}</span>
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          {diff > 0.005
            ? <TrendingUp className="h-3 w-3 text-rose-500" />
            : diff < -0.005
            ? <TrendingDown className="h-3 w-3 text-green-500" />
            : <Minus className="h-3 w-3" />}
          {diff > 0 ? "+" : ""}{formatValue(diff)} ({pct > 0 ? "+" : ""}{pct.toFixed(1)}%)
        </span>
      </div>

      {/* chart */}
      <ZoneAreaChart biomarker={biomarker} height={90} showXLabels={false} />
    </div>
  );
}

/* ─── group card ─────────────────────────────────────────────────────── */
function GroupCard({
  label, biomarkerList, index, cols,
}: { label: string; biomarkerList: Biomarker[]; index: number; cols: number }) {
  const statuses = biomarkerList.map(b =>
    getRangeStatus(b.history[b.history.length - 1], b.referenceRange)
  );
  const numHigh = statuses.filter(s => s !== "normal").length;

  const colClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="bg-muted/20 border rounded-2xl px-4 pt-3 pb-4 shadow-sm"
    >
      {/* section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        {numHigh > 0
          ? <span className="text-[10px] font-medium text-amber-500">{numHigh} out of range</span>
          : <span className="text-[10px] font-medium text-green-500">All in range</span>
        }
      </div>

      <div className={`grid gap-3 ${colClass[Math.min(cols, biomarkerList.length)] ?? "grid-cols-3"}`}>
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
    <div className="flex flex-col gap-2.5 h-full bg-muted/30 rounded-xl border px-3 py-3">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="bg-card border rounded-xl px-4 pt-3 pb-4 shadow-sm"
    >
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
      <div className="grid grid-cols-[1fr_156px] gap-3">
        <ZoneAreaChart biomarker={biomarker} height={140} showXLabels={true} />
        <InsightCard biomarker={biomarker} />
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

      {activeCategory === "all" ? (
        /* Grouped view */
        <div className="space-y-4">
          {CLINICAL_GROUPS.map((group, gi) => {
            const list = group.ids.map(id => byId[id]).filter(Boolean);
            if (!list.length) return null;
            return (
              <GroupCard
                key={group.label}
                label={group.label}
                biomarkerList={list}
                index={gi}
                cols={group.cols}
              />
            );
          })}
          {/* Ungrouped fallback */}
          {biomarkers
            .filter(b => !GROUPED_IDS.has(b.id))
            .map((b, i) => <BiomarkerChart key={b.id} biomarker={b} index={i} />)}
        </div>
      ) : (
        /* Category detail view */
        <div className="space-y-4">
          {biomarkers
            .filter(b => b.category === activeCategory)
            .map((b, i) => <BiomarkerChart key={b.id} biomarker={b} index={i} />)}
        </div>
      )}
    </div>
  );
}
