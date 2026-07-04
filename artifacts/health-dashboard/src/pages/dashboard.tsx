import { profile, categories, reports, biomarkers } from "@/data/healthData";
import { getStatusColor, formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ChevronRight, ArrowUpRight, CheckCircle2, AlertTriangle, 
  Sparkles, Calendar, Activity, Zap, TrendingUp, TrendingDown 
} from "lucide-react";

export default function Dashboard() {
  const latestReport = reports[reports.length - 1];

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
            Good morning, Nikhil.
          </h1>
          <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Your health operating system is online. Data updated on {latestReport.date}.
          </p>
        </div>
        
        {/* Premium Health Score Card */}
        <div className="glass-card border-border/40 rounded-2xl p-5 flex items-center gap-6 shadow-xl isomorphic-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Health Score</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-primary drop-shadow-[0_2px_10px_rgba(20,184,166,0.25)]">
                {profile.healthScore}
              </span>
              <span className="text-xs text-muted-foreground font-medium">/100</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +6 since last report
            </div>
          </div>
          <div className="h-12 w-px bg-border/40"></div>
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Status</div>
            <div className="font-semibold text-foreground/90 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Improving
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Next retest: Oct 2026</div>
          </div>
        </div>
      </motion.div>

      {/* Main Pillars: Health Score Breakdown, Priority, Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Things Improving & Needs Attention */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Things Improving */}
          <div className="glass-card border-border/40 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground/90 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Things improving
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  3 markers
                </span>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">hsCRP (Inflammation)</div>
                      <div className="text-[10px] text-muted-foreground">Moving to normal range</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-500">↓ 24%</span>
                    <div className="text-[9px] text-muted-foreground">1.25 mg/L</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">HbA1c (Diabetes)</div>
                      <div className="text-[10px] text-muted-foreground">Excellent metabolic stability</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-500">Stable</span>
                    <div className="text-[9px] text-muted-foreground">5.3%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Vitamin D (Nutrition)</div>
                      <div className="text-[10px] text-muted-foreground">Optimal level achieved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-500">Improving</span>
                    <div className="text-[9px] text-muted-foreground">72.5 ng/mL</div>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/trends" className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
              View longitudinal trends <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Needs Attention */}
          <div className="glass-card border-border/40 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:border-red-500/20 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground/90 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                  Needs attention
                </h3>
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                  2 critical
                </span>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">LDL (Cholesterol)</div>
                      <div className="text-[10px] text-muted-foreground">Increased since last test</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-red-500">134 mg/dL</span>
                    <div className="text-[9px] text-muted-foreground">Target &lt;100</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Folate (Vitamin B9)</div>
                      <div className="text-[10px] text-muted-foreground">Deficiency persists</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-red-500">3.64 ng/mL</span>
                    <div className="text-[9px] text-muted-foreground">Target &gt;5.40</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">ALT (Liver Enzyme)</div>
                      <div className="text-[10px] text-muted-foreground">Elevated enzyme activity</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-500">93 U/L</span>
                    <div className="text-[9px] text-muted-foreground">Target &lt;40</div>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/missions" className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
              Start healing missions <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Column 2: Highest Priority Focus */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card border-border/40 rounded-3xl p-6 shadow-lg bg-gradient-to-b from-primary/10 via-primary/5 to-transparent relative overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all duration-300"
        >
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary fill-primary/30" />
              <h3 className="font-bold text-lg text-foreground/90">Highest Priority</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-sm">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Focus Area</div>
                <div className="text-base font-bold mt-1 text-foreground/90">Take folate consistently for 30 days</div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Daily intake will rebuild methyl reserves and normalize cellular metabolism.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Expected Impact</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border/40">
                    <div className="text-[10px] text-muted-foreground">Homocysteine</div>
                    <div className="text-sm font-extrabold text-emerald-500 mt-0.5">↓ Normalize</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border/40">
                    <div className="text-[10px] text-muted-foreground">Cardio Risk</div>
                    <div className="text-sm font-extrabold text-emerald-500 mt-0.5">↓ Substantial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href="/tracking" className="mt-6 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5">
            Log Folate Supplement
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* Predictions Engine & AI Doctor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Predictions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card border-border/40 rounded-3xl p-6 shadow-lg lg:col-span-2 hover:border-primary/20 transition-all duration-300"
        >
          <h3 className="font-bold text-lg mb-4 text-foreground/90 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            AI Health Projections
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider">Scenario A: No Changes</div>
              <div className="text-sm font-bold mt-2">LDL Cholesterol Projection</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-extrabold">134</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-lg font-extrabold text-red-500">138 mg/dL</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-medium">Expected in 6 months · 73% confidence</div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Scenario B: 150m Exercise/Wk</div>
              <div className="text-sm font-bold mt-2">Estimated LDL Response</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-extrabold">134</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-lg font-extrabold text-emerald-500">110 mg/dL</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-medium">Potential to drop by 18% · 85% clinical likelihood</div>
            </div>
          </div>
        </motion.div>

        {/* AI Doctor Notes */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card border-border/40 rounded-3xl p-6 shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground/90 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Clinical Summary
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed italic bg-secondary/30 p-4 rounded-2xl border border-border/20">
              "Persistent elevation in ALT (93 U/L) and GGT (58 U/L) may indicate metabolic fatty liver loading. Combined with elevated triglycerides (182 mg/dL) and insulin resistance index HOMA-IR (3.16), this pattern warrants lifestyle intervention and repeat testing within three months."
            </p>
          </div>
          <Link href="/copilot" className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Discuss with health copilot <ArrowUpRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>

      {/* Systems Status Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4 tracking-tight text-foreground/90 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          Biological Systems Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
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
    </div>
  );
}
