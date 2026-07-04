import { useState } from "react";
import { biomarkers } from "@/data/healthData";
import { formatValue, getStatusColor, getStatusLabel } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { Link } from "wouter";

export default function Search() {
  const [query, setQuery] = useState("");

  const results = query.trim() === "" 
    ? [] 
    : biomarkers.filter(b => 
        b.name.toLowerCase().includes(query.toLowerCase()) || 
        b.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1">Find specific biomarkers across all your reports.</p>
      </motion.div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search for Cholesterol, HbA1c, Iron..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full glass-input border border-border/40 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary shadow-md text-lg text-foreground/90 font-medium transition-all"
          autoFocus
        />
      </div>

      {query.trim() !== "" && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {results.length} Results
          </h2>
          
          <div className="grid gap-3">
            {results.map((b, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                key={b.id}
              >
                <Link href={`/category/${b.category}`}>
                  <div className="glass-card border border-border/40 rounded-2xl p-5 cursor-pointer flex justify-between items-center group shadow-md isomorphic-lift">
                    <div>
                      <h3 className="font-bold text-lg text-foreground/90 group-hover:text-primary transition-colors">{b.name}</h3>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{b.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground/90">{formatValue(b.history[b.history.length - 1])} <span className="text-xs text-muted-foreground font-normal">{b.unit}</span></div>
                      <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1.5 ${
                        b.status === "normal" ? "bg-green-500/10 text-green-500 border-green-500/20" : b.status === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {getStatusLabel(b.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {results.length === 0 && (
              <div className="p-8 text-center glass-card border border-border/40 rounded-2xl text-muted-foreground text-sm font-medium">
                No biomarkers found matching "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
