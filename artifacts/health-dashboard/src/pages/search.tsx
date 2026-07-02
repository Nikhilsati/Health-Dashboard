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
          className="w-full bg-card border rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary shadow-sm text-lg"
          autoFocus
        />
      </div>

      {query.trim() !== "" && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
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
                  <div className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center group shadow-sm">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{b.name}</h3>
                      <div className="text-sm text-muted-foreground capitalize mt-0.5">{b.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold">{formatValue(b.history[b.history.length - 1])} <span className="text-sm text-muted-foreground font-normal">{b.unit}</span></div>
                      <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {results.length === 0 && (
              <div className="p-8 text-center bg-card border rounded-xl text-muted-foreground">
                No biomarkers found matching "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
