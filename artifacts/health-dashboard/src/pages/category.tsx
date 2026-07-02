import { useParams } from "wouter";
import { categories, biomarkers, reports } from "@/data/healthData";
import { formatValue, getStatusColor, getStatusLabel } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useState } from "react";

export default function Category() {
  const params = useParams();
  const slug = params.slug;
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  
  const category = categories.find(c => c.id === slug);
  const categoryBiomarkers = biomarkers.filter(b => b.category === slug);

  if (!category) {
    return <div className="p-8 text-center text-muted-foreground">Category not found</div>;
  }

  const scorePercent = (category.score / category.total) * 100;
  const statusColor = scorePercent > 80 ? "bg-green-500" : scorePercent > 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className={`h-3 w-3 rounded-full ${statusColor}`} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{category.label}</h1>
        </div>
        <p className="text-muted-foreground mt-1">Detailed parameter breakdown and historical performance.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b bg-muted/20">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Category Score</div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-semibold">{category.score}</span>
            <span className="text-muted-foreground mb-1">/ {category.total}</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {categoryBiomarkers.map((b, i) => {
            const data = b.history.map((val, idx) => ({ value: val }));
            const isExpanded = selectedBiomarker === b.id;

            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                key={b.id} 
                className="p-4 sm:p-6 hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => setSelectedBiomarker(isExpanded ? null : b.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{b.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="w-24 h-10 hidden sm:block opacity-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <YAxis domain={['auto', 'auto']} hide />
                          <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} dot={false} className={b.status === "normal" ? "text-green-500" : b.status === "critical" ? "text-red-500" : "text-amber-500"} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-right w-24">
                      <div className="text-2xl font-semibold">{formatValue(b.history[b.history.length - 1])}</div>
                      <div className="text-xs text-muted-foreground">{b.unit}</div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 pt-6 border-t overflow-hidden"
                  >
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Historical Readings</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {b.history.map((val, idx) => (
                        <div key={idx} className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">{reports[idx].date}</div>
                          <div className="font-medium">{formatValue(val)} <span className="text-xs font-normal text-muted-foreground">{b.unit}</span></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
