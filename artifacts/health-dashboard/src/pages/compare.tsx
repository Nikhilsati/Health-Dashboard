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
          <label className="text-sm font-medium mb-1 block">Baseline Report</label>
          <select 
            className="w-full bg-card border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50"
            value={reportA}
            onChange={(e) => setReportA(Number(e.target.value))}
          >
            {reports.map((r, i) => (
              <option key={r.id} value={i}>{r.date} ({r.lab})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Comparison Report</label>
          <select 
            className="w-full bg-card border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50"
            value={reportB}
            onChange={(e) => setReportB(Number(e.target.value))}
          >
            {reports.map((r, i) => (
              <option key={r.id} value={i}>{r.date} ({r.lab})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="p-4 font-medium">Biomarker</th>
              <th className="p-4 font-medium">{reports[reportA].date}</th>
              <th className="p-4 font-medium">{reports[reportB].date}</th>
              <th className="p-4 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {biomarkers.map(b => {
              const valA = b.history[reportA];
              const valB = b.history[reportB];
              const diff = valB - valA;
              const pct = valA ? (diff / valA) * 100 : 0;
              
              let diffColor = "text-muted-foreground";
              if (Math.abs(pct) > 5) {
                diffColor = (b.trendDirection === "down" && diff > 0) || (b.trendDirection === "up" && diff < 0) 
                  ? "text-red-500" 
                  : "text-green-500";
              }

              return (
                <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4">{formatValue(valA)}</td>
                  <td className="p-4">{formatValue(valB)}</td>
                  <td className={`p-4 font-medium ${diffColor}`}>
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
