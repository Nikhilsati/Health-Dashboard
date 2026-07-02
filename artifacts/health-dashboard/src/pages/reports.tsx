import { useState } from "react";
import { reports, biomarkers } from "@/data/healthData";
import { formatValue, getStatusColor, getStatusLabel } from "@/data/healthUtils";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export default function Reports() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Pathology Reports</h1>
        <p className="text-muted-foreground mt-1">Your complete testing history, digitized and parsed.</p>
      </motion.div>

      <div className="grid gap-4">
        {reports.slice().reverse().map((report, i) => {
          const isExpanded = expandedReport === report.id;
          // The index in the original array (since we reversed it for display)
          const reportIndex = reports.findIndex(r => r.id === report.id);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={report.id}
              className="bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedReport(isExpanded ? null : report.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{report.lab}</h3>
                    <div className="text-sm text-muted-foreground mt-0.5">{report.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    {report.status}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 p-6">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Extracted Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {biomarkers.map((b) => {
                      const val = b.history[reportIndex];
                      if (val === undefined) return null;
                      
                      return (
                        <div key={b.id} className="bg-card border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{b.name}</div>
                            <div className="text-xs text-muted-foreground">{b.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatValue(val)} <span className="text-xs text-muted-foreground font-normal">{b.unit}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
