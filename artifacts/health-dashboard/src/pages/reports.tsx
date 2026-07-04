import { useState, useRef } from "react";
import { reports, biomarkers } from "@/data/healthData";
import { formatValue } from "@/data/healthUtils";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, ChevronDown, ChevronUp, Upload, X, Clock } from "lucide-react";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  status: "processing" | "done";
};

export default function Reports() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type !== "application/pdf") return;
      const entry: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        status: "processing",
      };
      setUploadedFiles((prev) => [entry, ...prev]);
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "done" } : f))
        );
      }, 2200);
    });
  }

  function removeFile(id: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Pathology Reports</h1>
        <p className="text-muted-foreground mt-1">Your complete testing history, digitized and parsed.</p>
      </motion.div>

      {/* Upload Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Upload New Report</h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none shadow-sm
            ${isDragging
              ? "border-primary bg-primary/10 scale-[0.99] shadow-inner"
              : "border-border/40 bg-white/20 dark:bg-black/10 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground/95">Drop a PDF report here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports Orange Health, Tata 1mg, and other lab formats</p>
            </div>
          </div>
        </div>

        {/* In-progress / processed uploads */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {uploadedFiles.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 glass-card border border-border/40 rounded-xl px-4 py-3 shadow-md"
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground/90">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  {f.status === "processing" ? (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      Processing
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Parsed
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Existing Reports */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Imported Reports</h2>
        <div className="grid gap-4">
          {reports.slice().reverse().map((report, i) => {
            const isExpanded = expandedReport === report.id;
            const reportIndex = reports.findIndex(r => r.id === report.id);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                key={report.id}
                className="glass-card border border-border/40 rounded-2xl shadow-md isomorphic-lift group overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer flex items-center justify-between"
                  onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground/90">{report.lab}</h3>
                      <div className="text-xs text-muted-foreground mt-0.5">{report.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      {report.status}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/40 bg-primary/5 p-6">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Extracted Parameters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {biomarkers.map((b) => {
                            const val = b.history[reportIndex];
                            if (val === undefined) return null;
                            return (
                              <div key={b.id} className="glass-input border border-border/40 rounded-xl p-3 flex justify-between items-center hover:scale-[1.03] transition-transform">
                                <div>
                                  <div className="font-bold text-sm text-foreground/90">{b.name}</div>
                                  <div className="text-[10px] text-muted-foreground font-semibold capitalize mt-0.5">{b.category}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-foreground/90">{formatValue(val)} <span className="text-xs text-muted-foreground font-normal">{b.unit}</span></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
