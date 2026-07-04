import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, FileText, ArrowRight, CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { biomarkers, categories } from "@/data/healthData";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  name: string;
  path: string;
  type: "page" | "category" | "biomarker";
  category?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Pages Navigation
  const pages: SearchItem[] = [
    { name: "Overview Dashboard", path: "/", type: "page" },
    { name: "Health Trends", path: "/trends", type: "page" },
    { name: "Body Viewer", path: "/body", type: "page" },
    { name: "Reports History", path: "/reports", type: "page" },
  ];

  // Filter categories
  const filteredCategories: SearchItem[] = categories
    .filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    .map((c) => ({ name: `${c.label} Category`, path: `/category/${c.id}`, type: "category" }));

  // Filter biomarkers
  const filteredBiomarkers: SearchItem[] = biomarkers
    .filter(
      (b) =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase())
    )
    .map((b) => ({ name: b.name, path: `/category/${b.category}`, type: "biomarker", category: b.category }));

  // Combined Results
  const results: SearchItem[] = [
    ...pages.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    ...filteredCategories,
    ...filteredBiomarkers,
  ].slice(0, 8); // Max 8 results for a clean list

  // Keyboard navigation inside list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (item: typeof results[number]) => {
    setLocation(item.path);
    onClose();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-[6px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d131f]/85 shadow-2xl backdrop-blur-md flex flex-col max-h-[60vh] z-10"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 border-b border-white/5 py-3.5">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search metrics, reports, or pages..."
                className="w-full bg-transparent text-foreground/90 outline-none border-none placeholder-muted-foreground text-sm"
              />
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-muted-foreground px-2 py-0.5 rounded uppercase">
                ESC
              </span>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 select-none">
              {results.length > 0 ? (
                results.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.path + item.name}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleSelect(item)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1"
                          : "hover:bg-white/5 text-foreground/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.type === "page" ? (
                          <FileText className="h-4 w-4 shrink-0 opacity-75" />
                        ) : item.type === "category" ? (
                          <Sparkles className="h-4 w-4 shrink-0 opacity-75" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-teal-400 shrink-0 shadow-sm" />
                        )}
                        <div>
                          <div className="text-xs font-semibold">{item.name}</div>
                          {item.type === "biomarker" && (
                            <span
                              className={`text-[9px] uppercase tracking-wider font-bold opacity-75 ${
                                isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                              }`}
                            >
                              Biomarker in {item.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 opacity-90">
                          <span className="text-[9px] font-mono bg-black/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            Enter
                            <CornerDownLeft className="h-2.5 w-2.5" />
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground text-xs font-medium">
                  No results found matching "{query}"
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="bg-black/20 border-t border-white/5 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
              </div>
              <div>Cmd+K to close</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
