import { biomarkers, reports, categories } from "@/data/healthData";
import { formatValue, getStatusColor, getStatusLabel } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { useState } from "react";

export default function Trends() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredBiomarkers = activeCategory === "all" 
    ? biomarkers 
    : biomarkers.filter(b => b.category === activeCategory);

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Biomarker Trends</h1>
        <p className="text-muted-foreground mt-1">Track your health parameters over time across all reports.</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveCategory("all")}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
        >
          All Parameters
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredBiomarkers.map((biomarker, i) => {
          const data = biomarker.history.map((val, idx) => ({
            report: reports[idx].date,
            value: val
          }));

          const minRef = 'min' in biomarker.referenceRange ? biomarker.referenceRange.min : Array.isArray(biomarker.referenceRange) ? biomarker.referenceRange[0] : 0;
          const maxRef = 'max' in biomarker.referenceRange ? biomarker.referenceRange.max : Array.isArray(biomarker.referenceRange) ? biomarker.referenceRange[1] : undefined;

          return (
            <motion.div 
              key={biomarker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
              className="bg-card border rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{biomarker.name}</h3>
                  <p className="text-sm text-muted-foreground">{biomarker.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">
                    {formatValue(biomarker.history[biomarker.history.length - 1])} <span className="text-sm text-muted-foreground font-normal">{biomarker.unit}</span>
                  </div>
                  <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(biomarker.status)}`}>
                    {getStatusLabel(biomarker.status)}
                  </div>
                </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="report" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
                    />
                    
                    {minRef !== undefined && maxRef !== undefined && (
                      <ReferenceArea y1={minRef} y2={maxRef} fill="var(--color-primary)" fillOpacity={0.05} />
                    )}
                    {minRef !== undefined && maxRef === undefined && (
                      <ReferenceArea y1={minRef} y2={minRef * 2} fill="var(--color-primary)" fillOpacity={0.05} />
                    )}
                    {minRef === 0 && maxRef !== undefined && (
                      <ReferenceArea y1={0} y2={maxRef} fill="var(--color-primary)" fillOpacity={0.05} />
                    )}

                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-card)' }}
                      activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
