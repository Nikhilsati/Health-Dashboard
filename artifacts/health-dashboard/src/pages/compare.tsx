import { useState } from "react";
import { biomarkers, reports } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { motion } from "framer-motion";

export default function Compare() {
  const [reportA, setReportA] = useState(reports.length - 2); // default to prev
  const [reportB, setReportB] = useState(reports.length - 1); // default to latest

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Compare Reports</h1>
        <p className="text-muted-foreground mt-1">Side-by-side analysis of any two pathology reports.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">Baseline Report</label>
          <select 
            className="w-full glass-input border border-border/40 rounded-xl p-3 outline-none text-foreground/90 font-semibold transition-all"
            value={reportA}
            onChange={(e) => setReportA(Number(e.target.value))}
          >
            {reports.map((r, i) => (
              <option key={r.id} value={i} className="bg-background text-foreground">{r.date} ({r.lab})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">Comparison Report</label>
          <select 
            className="w-full glass-input border border-border/40 rounded-xl p-3 outline-none text-foreground/90 font-semibold transition-all"
            value={reportB}
            onChange={(e) => setReportB(Number(e.target.value))}
          >
            {reports.map((r, i) => (
              <option key={r.id} value={i} className="bg-background text-foreground">{r.date} ({r.lab})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card border border-border/40 rounded-2xl overflow-hidden shadow-md overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-primary/5 text-muted-foreground border-b border-border/40">
            <tr>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-foreground/75">Biomarker</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-foreground/75">{reports[reportA].date}</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-foreground/75">{reports[reportB].date}</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-foreground/75">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-foreground/80">
            {biomarkers.map(b => {
              const valA = b.history[reportA];
              const valB = b.history[reportB];
              const diff = valB - valA;
              const pct = valA ? (diff / valA) * 100 : 0;
              
              let diffColor = "text-muted-foreground";
              if (Math.abs(pct) > 5) {
                diffColor = (b.trendDirection === "down" && diff > 0) || (b.trendDirection === "up" && diff < 0) 
                  ? "text-red-500 font-bold" 
                  : "text-green-500 font-bold";
              }

              return (
                <tr key={b.id} className="hover:bg-primary/5 transition-all">
                  <td className="p-4 font-bold text-foreground/90">{b.name}</td>
                  <td className="p-4 font-semibold">{formatValue(valA)}</td>
                  <td className="p-4 font-semibold">{formatValue(valB)}</td>
                  <td className={`p-4 font-semibold ${diffColor}`}>
                    {diff > 0 ? "+" : ""}{formatValue(diff)} ({diff > 0 ? "+" : ""}{pct.toFixed(1)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
