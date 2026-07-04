import { motion, AnimatePresence } from "framer-motion";
import { biomarkers, categories, reports, type Biomarker } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { useState } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Activity, Info, Calendar } from "lucide-react";

type Status = "normal" | "borderline" | "critical";

// Metadata mapping for categories to add deep health intelligence summaries, quality descriptions, and follow-ups
const CATEGORY_INTELLIGENCE: Record<string, {
  summary: string;
  quality: "Excellent" | "Good" | "Monitor" | "Attention Needed" | "Critical";
  insights: string[];
  followUp: {
    nextTest: string;
    recommendations: string[];
  };
  percentiles: Record<string, string>;
}> = {
  thyroid: {
    summary: "Your thyroid function is excellent. TSH, Free T3 and Free T4 are all within the optimal range with no concerning trends across previous reports.",
    quality: "Excellent",
    insights: ["✓ TSH stable and optimal", "✓ T3 Free within healthy range", "✓ T4 Free unchanged"],
    followUp: {
      nextTest: "12 months",
      recommendations: ["Adequate dietary iodine intake", "Manage chronic stress levels", "Prioritize 7-8 hours sleep"]
    },
    percentiles: { tsh: "56%", t3free: "48%", t4free: "62%" }
  },
  heart: {
    summary: "Cardiovascular profile requires close attention. High LDL and VLDL values suggest elevated lipid buildup risks, though inflammation (hsCRP) is stable.",
    quality: "Attention Needed",
    insights: ["⚠ LDL remains elevated at 134 mg/dL", "✓ hsCRP inflammation reduced by 24%", "⚠ Triglycerides fluctuate above range"],
    followUp: {
      nextTest: "3 months",
      recommendations: ["Limit saturated fatty acids", "30 mins daily zone-2 cardio", "Consider CoQ10 supplementation"]
    },
    percentiles: { cholesterol: "78%", ldl: "89%", hdl: "32%", triglycerides: "82%", vldl: "75%", hscrp: "45%", lpa: "42%" }
  },
  blood: {
    summary: "Hematological metrics are stable with robust oxygen transportation capacity. Minor borderline levels in RBC and MCH warrant routine monitoring.",
    quality: "Good",
    insights: ["✓ Hemoglobin robust and stable", "⚠ RBC count borderline high", "✓ Platelets in optimal range"],
    followUp: {
      nextTest: "6 months",
      recommendations: ["Ensure adequate daily hydration", "Balanced iron-rich food intake", "Moderate endurance workouts"]
    },
    percentiles: { hemoglobin: "68%", rbc: "84%", wbc: "52%", platelets: "55%", mcv: "48%", mch: "81%", hematocrit: "64%" }
  },
  liver: {
    summary: "Liver enzyme indicators (ALT, AST, Bilirubin) are elevated. This suggests metabolic stress or mild liver cell activity requiring active lifestyle adjustments.",
    quality: "Critical",
    insights: ["⚠ ALT elevated at 93 U/L", "⚠ AST spiked to 46 U/L", "⚠ Bilirubin remains above optimal limit"],
    followUp: {
      nextTest: "2 months",
      recommendations: ["Minimize alcohol consumption", "Reduce simple carbohydrates/sugar", "Daily milk thistle extract supplement"]
    },
    percentiles: { alt: "91%", ast: "84%", alp: "48%", bilirubin: "79%", ggt: "82%", total_protein: "55%", albumin: "61%" }
  },
  kidney: {
    summary: "Overall kidney function is normal with excellent filtration rate (eGFR). Elevated Uric Acid and Potassium suggest minor hydration and dietary imbalances.",
    quality: "Monitor",
    insights: ["✓ eGFR stable at 125 mL/min", "⚠ Uric acid elevated at 8.4 mg/dL", "⚠ Potassium borderline high"],
    followUp: {
      nextTest: "3 months",
      recommendations: ["Increase daily water to 3 Liters", "Reduce purine-rich foods (red meat)", "Monitor potassium-heavy meals"]
    },
    percentiles: { creatinine: "58%", egfr: "92%", bun: "48%", uric_acid: "87%", sodium: "52%", potassium: "81%" }
  },
  diabetes: {
    summary: "Glycemic control indicators are normal, but insulin sensitivity index (HOMA-IR) is elevated, reflecting mild early-stage insulin resistance.",
    quality: "Monitor",
    insights: ["✓ Fasting glucose stable at 78 mg/dL", "✓ HbA1c is optimal at 5.3%", "⚠ HOMA-IR elevated at 3.16"],
    followUp: {
      nextTest: "6 months",
      recommendations: ["Reduce processed sugar intake", "Incorporate strength training twice a week", "Maintain high-fiber diet"]
    },
    percentiles: { fasting_glucose: "48%", hba1c: "62%", insulin: "58%", homair: "79%" }
  },
  vitamins: {
    summary: "Vitamin levels are generally sufficient following supplementation. Folate is low-borderline, which should be addressed dietarily.",
    quality: "Good",
    insights: ["✓ Vitamin D robust at 72.5 ng/mL", "✓ B12 improved to 292 pg/mL", "⚠ Folate remains low at 3.64"],
    followUp: {
      nextTest: "6 months",
      recommendations: ["Add Methylated Folate daily", "Continue baseline Vitamin D3", "Include organic dark leafy greens"]
    },
    percentiles: { vitamind: "78%", vitaminb12: "62%", folate: "28%", iron: "52%", ferritin: "58%" }
  },
  inflammation: {
    summary: "Systemic inflammatory markers show high-borderline baseline values due to elevated Homocysteine, though ESR is perfectly normal.",
    quality: "Monitor",
    insights: ["✓ ESR stable at 14 mm/hr", "⚠ Homocysteine elevated at 36.46 μmol/L"],
    followUp: {
      nextTest: "3 months",
      recommendations: ["Supplement B-complex vitamins", "Increase dietary Omega-3 fatty acids", "Incorporate active recovery protocols"]
    },
    percentiles: { esr: "54%", homocysteine: "91%" }
  },
  hormones: {
    summary: "Hormonal profile is balanced and within optimal physiological ranges for age. Vital markers are stable across last 4 reports.",
    quality: "Excellent",
    insights: ["✓ Total Testosterone stable", "✓ DHEA-S in healthy range"],
    followUp: {
      nextTest: "12 months",
      recommendations: ["Prioritize quality sleep (7-8 hours)", "Eat zinc and magnesium rich foods", "High-intensity interval workouts (HIIT)"]
    },
    percentiles: { testosterone: "58%", dheas: "62%" }
  }
};

// Lifestyle annotations mapped to historical reports
const LIFESTYLE_EVENTS = [
  { date: "2023-03-27", note: "Earliest Healthians report. High cholesterol and ALT/SGPT noted." },
  { date: "2024-06-23", note: "Baseline lab work. Initial evaluation." },
  { date: "2025-05-06", note: "Started regular cardio routine (Zone 2 running)." },
  { date: "2025-07-17", note: "Began Vitamin D supplementation & Strength coaching." },
  { date: "2026-06-30", note: "Dropped 6kg weight. Active nutrition compliance." },
];

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
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "borderline":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "critical":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-muted-foreground bg-white/5 border-white/5";
  }
}

function getStatusLabel(status: Biomarker["status"]) {
  switch (status) {
    case "normal":
      return "Optimal";
    case "borderline":
      return "Borderline";
    case "critical":
      return "Action Needed";
    default:
      return "Unknown";
  }
}

function getReferenceRangeText(ref: Biomarker["referenceRange"]) {
  if (Array.isArray(ref)) {
    return `${ref[0]}–${ref[1]}`;
  }
  const min = (ref as any).min;
  const max = (ref as any).max;
  if (min !== undefined && max !== undefined) return `${min}–${max}`;
  if (min !== undefined) return `>${min}`;
  if (max !== undefined) return `<${max}`;
  return (ref as any).text || "N/A";
}

interface InteractiveTimelineProps {
  history: number[];
  unit: string;
  biomarkerId: string;
  status: Status;
}

function InteractiveTimeline({ history, unit, biomarkerId, status }: InteractiveTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Status-based colors
  const strokeColor = status === "normal" ? "#10b981" : status === "critical" ? "#ef4444" : "#f59e0b";

  return (
    <div className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Activity className="h-3 w-3 text-primary" />
        Longitudinal Health Timeline
      </h4>
      
      {/* 2x Larger Timeline Visualizer */}
      <div className="relative h-24 w-full bg-white/[0.01] rounded-xl border border-white/5 p-4 flex items-center justify-between mb-4">
        {/* Horizontal Connective Line */}
        <div 
          className="absolute left-8 right-8 h-[2px] opacity-40"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
        />
        
        {/* Connecting progress line */}
        <div 
          className="absolute left-8 h-[2px] transition-all duration-500"
          style={{ 
            backgroundColor: strokeColor,
            width: `${(history.length - 1) > 0 ? (history.length - 1) * 30 : 0}%`,
            boxShadow: `0 0 10px ${strokeColor}77`
          }}
        />

        {history.map((val, idx) => {
          const isHovered = hoveredIndex === idx;
          const report = reports[idx];
          const lifestyle = LIFESTYLE_EVENTS.find(e => e.date === report.date);

          return (
            <div 
              key={idx}
              className="relative flex flex-col items-center flex-1 z-10 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Timeline Point Node */}
              <div 
                className="w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-all duration-300 hover:scale-125"
                style={{ 
                  borderColor: isHovered ? strokeColor : "rgba(255, 255, 255, 0.2)",
                  boxShadow: isHovered ? `0 0 12px ${strokeColor}` : "none"
                }}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{ backgroundColor: isHovered ? strokeColor : "rgba(255, 255, 255, 0.4)" }}
                />
              </div>

              {/* Date text */}
              <span className="text-[9px] text-slate-500 mt-2 font-medium">
                {report.date.split("-")[0]}
              </span>

              {/* Hover Bubble Card */}
              {isHovered && (
                <div 
                  className="absolute bottom-6 z-30 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1 w-44"
                  style={{ 
                    background: "rgba(10, 16, 28, 0.96)", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)" 
                  }}
                >
                  <div className="text-[9px] text-slate-400 font-bold flex justify-between">
                    <span>{report.date}</span>
                    <span className="text-primary font-medium">{report.lab.substring(0, 7)}</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {formatValue(val)} <span className="text-[9px] font-semibold text-slate-400">{unit}</span>
                  </div>
                  {lifestyle && (
                    <div className="text-[8px] text-emerald-400 font-medium border-t border-white/5 pt-1 mt-0.5 leading-tight">
                      ✦ {lifestyle.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid of history cards */}
      <div className="grid grid-cols-2 gap-2">
        {history.map((val, idx) => {
          const lifestyle = LIFESTYLE_EVENTS.find(e => e.date === reports[idx].date);
          return (
            <div 
              key={idx} 
              className={`rounded-xl p-3 border transition-all duration-300 bg-white/[0.01] ${
                hoveredIndex === idx 
                  ? "border-primary/40 bg-primary/5 translate-y-[-2px] shadow-sm" 
                  : "border-white/5"
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1">
                <span className="font-semibold">{reports[idx].date}</span>
                <span>{reports[idx].lab}</span>
              </div>
              <div className="text-xs font-bold text-white">
                {formatValue(val)}{" "}
                <span className="text-[9px] font-normal text-slate-400">{unit}</span>
              </div>
              {lifestyle && (
                <p className="text-[8px] text-emerald-400/90 leading-tight mt-1 line-clamp-1">
                  {lifestyle.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BiomarkerRow({ 
  b, 
  isExpanded, 
  onToggle, 
  percentile 
}: { 
  b: Biomarker; 
  isExpanded: boolean; 
  onToggle: () => void; 
  percentile: string 
}) {
  const latest = b.history[b.history.length - 1];

  return (
    <div 
      className={`border-b border-white/5 transition-all duration-300 ${
        isExpanded ? "bg-white/[0.02] p-5" : "p-4 hover:bg-white/[0.01] cursor-pointer"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-xs text-white/90 truncate">{b.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColorClass(b.status)}`}>
              {getStatusLabel(b.status)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{b.description}</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right w-20">
            <div className="text-sm font-bold tabular-nums text-white">{formatValue(latest)}</div>
            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">{b.unit}</div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Detailed Context Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Ref Range</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">{getReferenceRangeText(b.referenceRange)}</div>
            </div>
            <div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Percentile</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">{percentile || "50%"}</div>
            </div>
            <div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Trend</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5 capitalize flex items-center gap-1">
                {b.trendDirection === "up" ? "↗ Upward" : b.trendDirection === "down" ? "↘ Downward" : "→ Stable"}
              </div>
            </div>
          </div>

          {/* Double-sized Timeline */}
          <InteractiveTimeline 
            history={b.history} 
            unit={b.unit} 
            biomarkerId={b.id} 
            status={b.status} 
          />
        </div>
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
  
  // Custom metadata information
  const intelligence = categoryId ? CATEGORY_INTELLIGENCE[categoryId] : null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0a0f1d]/90">
      <AnimatePresence mode="wait">
        {!categoryId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/60 animate-pulse">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white/80">Interactive Systems Panel</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Click an organ outline on the body viewer or select a system from the sidebar to display deep clinical insights, timeline metrics, and actionable protocols.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={categoryId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col overflow-y-auto divide-y divide-white/5 scrollbar-hide"
          >
            {/* 1. Header with glassmorphism */}
            <div className="px-5 py-5 bg-white/[0.01] relative shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{cat?.label ?? categoryId} Health</h2>
                  <p className="text-[10px] text-slate-400 font-medium">System analysis & clinical recommendations</p>
                </div>
              </div>
            </div>

            {/* 2. Radial Gauge Score Widget & Clinical Quality */}
            <div className="p-5 flex items-center justify-between gap-6 bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="flex-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Category Health Score</div>
                <div className="text-2xl font-bold text-white">
                  {intelligence?.quality || "Excellent"}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  All markers are validated against standard reference ranges.
                </p>
              </div>

              {/* Glowing Radial Progress Arc */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer Background ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="3.2"
                  />
                  {/* Dynamic colored progress arc */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="url(#radial-gradient-color)"
                    strokeWidth="3.2"
                    strokeDasharray={`${scorePercent} ${100 - scorePercent}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="radial-gradient-color" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={scorePercent > 80 ? "#10b981" : scorePercent > 60 ? "#f59e0b" : "#ef4444"} />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score value absolute overlay */}
                <div className="absolute text-center">
                  <div className="text-base font-extrabold text-white leading-none">{cat?.score}</div>
                  <div className="text-[8px] text-slate-500 font-bold mt-0.5">/ {cat?.total}</div>
                </div>
              </div>
            </div>

            {/* 3. Clinical Summary block */}
            <div className="p-5 space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clinical Assessment</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {intelligence?.summary || "Clinical assessment pending biomarker evaluation."}
              </p>
            </div>

            {/* 4. Actionable Follow-up section */}
            <div className="p-5 bg-white/[0.01] space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actionable Protocol</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Recommended Retest:
                  </span>
                  <span className="font-bold text-white">{intelligence?.followUp.nextTest || "12 months"}</span>
                </div>
                
                <div className="space-y-1.5 mt-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Key Interventions:</div>
                  {intelligence?.followUp.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                      <span className="text-primary mt-0.5">✦</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Key Insights */}
            <div className="p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Insights</h3>
              <div className="grid grid-cols-1 gap-2">
                {intelligence?.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Biomarkers list */}
            <div className="p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Biomarker Details</h3>
              <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20">
                {markers.map(b => (
                  <BiomarkerRow 
                    key={b.id} 
                    b={b} 
                    isExpanded={selectedBiomarker === b.id}
                    onToggle={() => setSelectedBiomarker(prev => prev === b.id ? null : b.id)}
                    percentile={intelligence?.percentiles[b.id] || "50%"}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
