import { profile, categories, reports, biomarkers } from "@/data/healthData";
import { getStatusColor, formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

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
        
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-6 shadow-sm">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Health Score</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-primary">{profile.healthScore}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="h-12 w-px bg-border"></div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Profile</div>
            <div className="font-medium">{profile.name}</div>
            <div className="text-sm text-muted-foreground">{profile.age} yrs • {profile.gender}</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Systems Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const scorePercent = (cat.score / cat.total) * 100;
            const statusColor = scorePercent > 80 ? "bg-green-500" : scorePercent > 60 ? "bg-amber-500" : "bg-red-500";
            
            return (
              <Link key={cat.id} href={`/category/${cat.id}`}>
                <div className="bg-card hover:bg-accent/5 border rounded-xl p-5 cursor-pointer transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg">{cat.label}</h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${statusColor} rounded-full`} style={{ width: `${scorePercent}%` }} />
                    </div>
                    <div className="text-sm font-medium">{cat.score}/{cat.total}</div>
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
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Requires Attention</h2>
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            {criticalBiomarkers.length > 0 ? (
              <div className="divide-y divide-border">
                {criticalBiomarkers.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-600 dark:text-red-400">{b.name}</div>
                      <div className="text-sm text-muted-foreground">{b.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{formatValue(b.history[b.history.length - 1])}</div>
                      <div className="text-xs text-muted-foreground">{b.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                All parameters are within normal range.
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Timeline</h2>
          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
            {reports.slice().reverse().map((report, i) => (
              <div key={report.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2"></div>
                <div className="w-full md:w-[calc(50%-2.5rem)] ml-6 md:ml-0 p-4 rounded-xl border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{report.date}</div>
                    <div className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{report.status}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{report.lab}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
