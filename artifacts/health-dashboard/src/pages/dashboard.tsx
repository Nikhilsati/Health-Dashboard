import { profile, categories, reports, biomarkers } from "@/data/healthData";
import { getStatusColor, formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

function parseRef(ref: any): { min?: number; max?: number } {
  if (Array.isArray(ref)) return { min: ref[0], max: ref[1] };
  if (typeof ref === "object" && ref !== null) {
    return { min: ref.min, max: ref.max };
  }
  return {};
}

export default function Dashboard() {
  const latestReport = reports[reports.length - 1];
  
  // Find critical biomarkers from latest report
  const criticalBiomarkers = biomarkers.filter(b => b.status === "critical");
  
  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Latest data from {latestReport.date} ({latestReport.lab})</p>
        </div>
        
        <div className="glass-card border-border/40 rounded-2xl p-5 flex items-center gap-6 shadow-md isomorphic-lift relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Health Score</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-primary drop-shadow-[0_2px_10px_rgba(20,184,166,0.2)]">{profile.healthScore}</span>
              <span className="text-xs text-muted-foreground font-medium">/100</span>
            </div>
          </div>
          <div className="h-12 w-px bg-border/40"></div>
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Profile</div>
            <div className="font-semibold text-foreground/90">{profile.name}</div>
            <div className="text-xs text-muted-foreground">{profile.age} yrs • {profile.gender}</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold mb-4 tracking-tight text-foreground/90 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          Systems Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const scorePercent = (cat.score / cat.total) * 100;
            const statusColor = scorePercent > 80 ? "bg-emerald-500" : scorePercent > 60 ? "bg-amber-500" : "bg-red-500";
            const glowColor = scorePercent > 80 ? "rgba(16,185,129,0.3)" : scorePercent > 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";
            
            return (
              <Link key={cat.id} href={`/category/${cat.id}`}>
                <div className="glass-card isomorphic-lift border-border/40 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-lg pointer-events-none opacity-20" style={{ backgroundColor: scorePercent > 80 ? '#10b981' : scorePercent > 60 ? '#f59e0b' : '#ef4444' }} />
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-foreground/90 text-md group-hover:text-primary transition-colors">{cat.label}</h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-secondary/60 rounded-full overflow-hidden">
                        <div className={`h-full ${statusColor} rounded-full transition-all`} style={{ width: `${scorePercent}%`, boxShadow: `0 0 8px ${glowColor}` }} />
                      </div>
                      <div className="text-xs font-bold text-foreground/80">{cat.score}/{cat.total}</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div>
          <h2 className="text-xl font-bold mb-4 tracking-tight text-foreground/90">Requires Attention</h2>
          <div className="glass-card border-border/40 rounded-2xl overflow-hidden shadow-md">
            {criticalBiomarkers.length > 0 ? (
              <div className="divide-y divide-border/40">
                {criticalBiomarkers.map(b => {
                  const val = b.history[b.history.length - 1];
                  const { min, max } = parseRef(b.referenceRange);
                  let deviationText = "";
                  let isHigher = false;
                  
                  if (max !== undefined && val > max) {
                    const diff = val - max;
                    const pct = (diff / max) * 100;
                    deviationText = `Higher by ${formatValue(diff)} ${b.unit} (+${formatValue(pct)}%)`;
                    isHigher = true;
                  } else if (min !== undefined && val < min) {
                    const diff = min - val;
                    const pct = (diff / min) * 100;
                    deviationText = `Lower by ${formatValue(diff)} ${b.unit} (-${formatValue(pct)}%)`;
                  }
                  
                  return (
                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors">
                      <div>
                        <div className="font-semibold text-red-600 dark:text-red-400">{b.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{b.description}</div>
                        {deviationText && (
                          <div className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-md inline-block border ${
                            isHigher 
                              ? "bg-red-500/10 text-red-500 border-red-500/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {deviationText}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground/90">{formatValue(val)}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">{b.unit}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                All parameters are within normal range.
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 tracking-tight text-foreground/90">Timeline</h2>
          <div className="relative border-l-2 border-border/40 ml-4 pl-6 space-y-6">
            {reports.slice().reverse().map((report, i) => (
              <div key={report.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[33px] top-4 w-4.5 h-4.5 rounded-full border-4 border-background bg-primary shadow-md transition-all group-hover:scale-125"></div>
                
                {/* Card */}
                <div className="p-4 rounded-2xl border border-border/40 glass-card isomorphic-lift shadow-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-foreground/90">{report.date}</div>
                    <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{report.status}</div>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{report.lab}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
