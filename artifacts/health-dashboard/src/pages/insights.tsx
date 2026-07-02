import { biomarkers } from "@/data/healthData";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Insights() {
  // Generate insights based on the difference between last two reports
  const insights = biomarkers.map(b => {
    const latest = b.history[b.history.length - 1];
    const previous = b.history[b.history.length - 2];
    const diff = latest - previous;
    const pct = previous ? (diff / previous) * 100 : 0;
    
    let category = "stable";
    if (b.status === "critical") category = "needs_attention";
    else if (b.status === "normal" && b.trendDirection === "up" && pct > 5) category = "improved";
    else if (b.status === "normal" && b.trendDirection === "down" && pct < -5) category = "improved";
    else if (b.status === "borderline") category = "needs_attention";

    return { ...b, latest, previous, diff, pct, insightCategory: category };
  });

  const needsAttention = insights.filter(i => i.insightCategory === "needs_attention");
  const improved = insights.filter(i => i.insightCategory === "improved");

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground mt-1">Automated analysis comparing your latest results to previous trends.</p>
      </motion.div>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold">Needs Attention</h2>
          </div>
          <div className="grid gap-4">
            {needsAttention.map((item, i) => (
              <div key={item.id} className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently at {item.latest} {item.unit}. {item.diff > 0 ? "Increased" : "Decreased"} by {Math.abs(item.diff).toFixed(1)} since last report.
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${item.diff > 0 ? "text-red-500" : "text-amber-500"}`}>
                    {item.diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(item.pct).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
            {needsAttention.length === 0 && (
              <div className="text-muted-foreground p-4 bg-card border rounded-xl">No parameters currently need immediate attention.</div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 mt-8">
            <Sparkles className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Improvements</h2>
          </div>
          <div className="grid gap-4">
            {improved.map((item, i) => (
              <div key={item.id} className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Moving in the right direction. Currently at {item.latest} {item.unit}.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-green-600">
                    {item.diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(item.pct).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
            {improved.length === 0 && (
              <div className="text-muted-foreground p-4 bg-card border rounded-xl">No significant improvements in this period.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
