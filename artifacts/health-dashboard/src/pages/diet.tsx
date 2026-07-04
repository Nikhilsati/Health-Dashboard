import React, { useState, useMemo, useEffect } from "react";
import { 
  ChefHat, 
  Search, 
  RefreshCw, 
  SlidersHorizontal, 
  ShoppingBag, 
  Check, 
  Plus, 
  ArrowRightLeft, 
  Clock, 
  Coins, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  Info,
  Calendar,
  Layers,
  Utensils,
  Dumbbell
} from "lucide-react";
import { meals, Meal } from "@/data/mealsData";
import { toast } from "@/hooks/use-toast";

// Health categories corresponding to Nikhil's data
const HEALTH_CATEGORIES = [
  { id: "heart", label: "Heart health", biomarker: "LDL / Triglycerides", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400" },
  { id: "liver", label: "Liver function", biomarker: "ALT / AST / Bilirubin", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400" },
  { id: "kidney", label: "Kidney function", biomarker: "Uric Acid / Potassium", color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-600 dark:text-teal-400" },
  { id: "diabetes", label: "Metabolic / Glucose", biomarker: "HOMA-IR / HbA1c", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400" },
  { id: "vitamins", label: "Vitamins & Folate", biomarker: "Folate / B12 / D3", color: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-purple-600 dark:text-purple-400" },
  { id: "inflammation", label: "Inflammation", biomarker: "Homocysteine / hsCRP", color: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-600 dark:text-red-400" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DietPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"planner" | "library" | "prep" | "grocery">("planner");
  
  // Intermittent fasting vs Standard schedule
  const [ifSchedule, setIfSchedule] = useState<boolean>(false);
  
  // Nutrition & Prep targets
  const [proteinTarget, setProteinTarget] = useState<number>(80);
  const [fiberTarget, setFiberTarget] = useState<number>(40);
  const [maxPrepTime, setMaxPrepTime] = useState<number>(30);
  const [budgetLimit, setBudgetLimit] = useState<1 | 2 | 3>(3);

  // Selected day for detailed preview
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // Meal swap modal state
  const [activeSwap, setActiveSwap] = useState<{ day: string; slot: string; currentMeal: Meal } | null>(null);
  const [swapSearch, setSwapSearch] = useState<string>("");

  // Auto-generator function
  const generatePlan = (isIF: boolean, maxTime: number, budget: number): Record<string, Record<string, Meal>> => {
    const generated: Record<string, Record<string, Meal>> = {};
    
    DAYS.forEach((day, index) => {
      generated[day] = {};
      
      const dayOffset = index * 3; // Shift index to select different meals per day

      // Helper to find matching meal
      const getMealForSlot = (category: "breakfast" | "lunch" | "dinner" | "snack", offset: number) => {
        const candidates = meals.filter(m => 
          m.category === category && 
          m.prepTime <= maxTime && 
          m.cost <= budget
        );
        const list = candidates.length > 0 ? candidates : meals.filter(m => m.category === category);
        return list[(dayOffset + offset) % list.length];
      };

      if (!isIF) {
        generated[day]["breakfast"] = getMealForSlot("breakfast", 0);
      }
      generated[day]["lunch"] = getMealForSlot("lunch", 1);
      generated[day]["dinner"] = getMealForSlot("dinner", 2);
      generated[day]["snack"] = getMealForSlot("snack", 3);
    });

    return generated;
  };

  // Weekly Plan state
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, Record<string, Meal>>>(() => 
    generatePlan(false, 30, 3)
  );

  // Reset/Regenerate Plan handler
  const handleRegenerate = () => {
    setWeeklyPlan(generatePlan(ifSchedule, maxPrepTime, budgetLimit));
    setCompletedMeals({});
    toast({
      title: "Menu Regenerated",
      description: `Created a new menu matching your targets.`,
    });
  };

  // Sync plan if IF toggle changes
  useEffect(() => {
    setWeeklyPlan(prev => {
      const generated = generatePlan(ifSchedule, maxPrepTime, budgetLimit);
      // Keep existing choices if categories match
      const updated = { ...prev };
      DAYS.forEach(day => {
        updated[day] = {
          ...generated[day],
          ...(prev[day] || {})
        };
        if (ifSchedule) {
          delete updated[day]["breakfast"];
        } else if (!updated[day]["breakfast"]) {
          updated[day]["breakfast"] = generated[day]["breakfast"];
        }
      });
      return updated;
    });
  }, [ifSchedule]);

  // Checklist of eaten meals
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});

  const toggleCompletedMeal = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setCompletedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Swap meal handler
  const executeSwap = (newMeal: Meal) => {
    if (!activeSwap) return;
    const { day, slot } = activeSwap;
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: newMeal
      }
    }));
    setActiveSwap(null);
    setSwapSearch("");
    toast({
      title: "Meal Swapped",
      description: `Replaced with ${newMeal.name} successfully.`,
    });
  };

  // Find swap candidates
  const swapCandidates = useMemo(() => {
    if (!activeSwap) return [];
    const { currentMeal, slot } = activeSwap;
    return meals.filter(m => 
      m.id !== currentMeal.id &&
      m.category === slot &&
      Math.abs(m.protein - currentMeal.protein) <= 6 &&
      Math.abs(m.fiber - currentMeal.fiber) <= 4 &&
      m.prepTime <= maxPrepTime &&
      m.cost <= budgetLimit &&
      (swapSearch === "" || m.name.toLowerCase().includes(swapSearch.toLowerCase()) || m.biomarkers.some(b => b.toLowerCase().includes(swapSearch.toLowerCase())))
    );
  }, [activeSwap, swapSearch, maxPrepTime, budgetLimit]);

  // Inventory Tracker state
  const [inventory, setInventory] = useState<Record<string, boolean>>({
    "Eggs": true,
    "Sourdough Bread": true,
    "Olive Oil": true,
    "Garlic": true,
    "Salt": true,
    "Sea Salt": true,
    "Black Pepper": true,
    "Turmeric": true,
    "Cinnamon": true,
  });

  const toggleInventory = (item: string) => {
    setInventory(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const [customInventoryItem, setCustomInventoryItem] = useState("");
  const addInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInventoryItem.trim()) return;
    setInventory(prev => ({ ...prev, [customInventoryItem.trim()]: true }));
    setCustomInventoryItem("");
    toast({
      title: "Item Added",
      description: `Added "${customInventoryItem.trim()}" to inventory.`,
    });
  };

  // Sunday Prep Checklist state
  const [prepChecklist, setPrepChecklist] = useState<Record<string, boolean>>({
    "Cook a batch of brown lentils for salads": false,
    "Prepare quinoa base for grain bowls": false,
    "Chop spinach, kale, and broccoli for weekly scrambles": false,
    "Pre-portion nuts and dark chocolate snacks": true,
    "Boil eggs for quick snacks": false,
    "Make chia seed jam & portion chia puddings": false,
    "Wash and dry fresh berries and greens": false,
  });

  const togglePrepTask = (task: string) => {
    setPrepChecklist(prev => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  const [customPrepTask, setCustomPrepTask] = useState("");
  const addPrepTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrepTask.trim()) return;
    setPrepChecklist(prev => ({ ...prev, [customPrepTask.trim()]: false }));
    setCustomPrepTask("");
  };

  // Compute daily totals and targets
  const dailyTotals = useMemo(() => {
    const totals: Record<string, { protein: number; fiber: number; prepTime: number; cost: number; categories: Set<string>; biomarkers: Set<string>; totalMeals: number; completedCount: number }> = {};
    
    DAYS.forEach(day => {
      let p = 0;
      let f = 0;
      let t = 0;
      let c = 0;
      const cats = new Set<string>();
      const bios = new Set<string>();
      
      const dayPlan = weeklyPlan[day] || {};
      const slots = Object.keys(dayPlan);
      let completedCount = 0;

      slots.forEach(slot => {
        const meal = dayPlan[slot];
        p += meal.protein;
        f += meal.fiber;
        t += meal.prepTime;
        c += meal.cost;
        meal.benefitsCategories.forEach(cat => cats.add(cat));
        meal.biomarkers.forEach(b => bios.add(b));
        if (completedMeals[`${day}-${slot}`]) {
          completedCount++;
        }
      });

      totals[day] = {
        protein: p,
        fiber: f,
        prepTime: t,
        cost: slots.length > 0 ? parseFloat((c / slots.length).toFixed(1)) : 0,
        categories: cats,
        biomarkers: bios,
        totalMeals: slots.length,
        completedCount
      };
    });

    return totals;
  }, [weeklyPlan, completedMeals]);

  // Active day stats
  const activeDayStats = dailyTotals[selectedDay];

  // Dynamic Nutrition Scorecard computation (1 to 100 based on targets and categories matched)
  const nutritionScore = useMemo(() => {
    let scores: Record<string, number> = {
      heart: 0,
      liver: 0,
      kidney: 0,
      diabetes: 0,
      vitamins: 0,
      inflammation: 0
    };

    const dayPlan = weeklyPlan[selectedDay] || {};
    const slots = Object.keys(dayPlan);
    if (slots.length === 0) return { overall: 0, details: scores };

    slots.forEach(slot => {
      const meal = dayPlan[slot];
      meal.benefitsCategories.forEach(cat => {
        if (cat in scores) {
          scores[cat] += 25; // 25 points per matching meal
        }
      });
    });

    // Cap individual categories at 100
    Object.keys(scores).forEach(k => {
      scores[k] = Math.min(scores[k], 100);
      // Give a base score if eaten/planned meals cover it
      if (scores[k] === 0) scores[k] = 30; // base maintenance score
    });

    // Check protein/fiber goals met
    const pPct = Math.min((activeDayStats.protein / proteinTarget) * 100, 100);
    const fPct = Math.min((activeDayStats.fiber / fiberTarget) * 100, 100);

    const overall = Math.round(
      (Object.values(scores).reduce((a, b) => a + b, 0) / 6) * 0.6 + 
      (pPct * 0.2) + 
      (fPct * 0.2)
    );

    return { overall, details: scores };
  }, [weeklyPlan, selectedDay, activeDayStats, proteinTarget, fiberTarget]);

  // Aggregate and group grocery list dynamically
  const smartGroceryList = useMemo(() => {
    const ingredientsNeeded: Record<string, { name: string; department: "produce" | "dairy" | "pantry" | "frozen"; checked: boolean }> = {};
    
    // Aggregate from all planned meals
    DAYS.forEach(day => {
      const dayPlan = weeklyPlan[day] || {};
      Object.values(dayPlan).forEach(meal => {
        meal.ingredients.forEach(ing => {
          // If we already have this in inventory, skip or mark as in-stock
          if (inventory[ing]) return;

          const dept = meal.departmentMap[ing] || "pantry";
          ingredientsNeeded[ing] = {
            name: ing,
            department: dept,
            checked: false
          };
        });
      });
    });

    // Group by department
    const grouped: Record<string, string[]> = {
      produce: [],
      dairy: [],
      pantry: [],
      frozen: []
    };

    Object.values(ingredientsNeeded).forEach(item => {
      grouped[item.department].push(item.name);
    });

    return grouped;
  }, [weeklyPlan, inventory]);

  // Meal Library State
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCategory, setLibraryCategory] = useState<string>("all");
  const [libraryBiomarker, setLibraryBiomarker] = useState<string>("all");

  const filteredLibrary = useMemo(() => {
    return meals.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(libraryQuery.toLowerCase()) || 
        m.ingredients.some(i => i.toLowerCase().includes(libraryQuery.toLowerCase())) ||
        m.biomarkers.some(b => b.toLowerCase().includes(libraryQuery.toLowerCase()));
      const matchesCategory = libraryCategory === "all" || m.category === libraryCategory;
      const matchesBiomarker = libraryBiomarker === "all" || m.biomarkers.includes(libraryBiomarker);
      return matchesSearch && matchesCategory && matchesBiomarker;
    });
  }, [libraryQuery, libraryCategory, libraryBiomarker]);

  // List of all unique biomarkers in the library for filtering
  const allUniqueBiomarkers = useMemo(() => {
    const bios = new Set<string>();
    meals.forEach(m => m.biomarkers.forEach(b => bios.add(b)));
    return Array.from(bios);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-border/40 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <ChefHat className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Diet & Nutrition Planner</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            A biomarker-driven meal planner that automatically aligns vegetarian recipes with your lipid profile, liver enzyme levels, and vitamin targets.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 z-10">
          <button 
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-background hover:bg-muted text-sm font-medium transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Menu</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/40 pb-px gap-2 overflow-x-auto">
        {(["planner", "library", "prep", "grocery"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 capitalize transition-all shrink-0 -mb-px ${
              activeTab === tab 
                ? "border-primary text-primary font-semibold" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "prep" ? "Sunday Meal Prep" : tab === "grocery" ? "Smart Grocery List" : `${tab} Tab`}
          </button>
        ))}
      </div>

      {/* ----------------- TAB: PLANNER ----------------- */}
      {activeTab === "planner" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Planner Grid & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preference Settings Panel */}
            <div className="p-5 rounded-2xl glass-panel border space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Menu Preferences
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Fasting Mode:</span>
                  <button
                    onClick={() => setIfSchedule(!ifSchedule)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      ifSchedule ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        ifSchedule ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold">{ifSchedule ? "16:8 IF" : "Standard"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Daily Protein</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="50" 
                      max="150" 
                      step="5"
                      value={proteinTarget} 
                      onChange={(e) => setProteinTarget(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-xs font-bold w-10 shrink-0">{proteinTarget}g</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Daily Fiber</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="20" 
                      max="70" 
                      step="5"
                      value={fiberTarget} 
                      onChange={(e) => setFiberTarget(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-xs font-bold w-10 shrink-0">{fiberTarget}g</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Max Prep Time</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="10" 
                      max="60" 
                      step="5"
                      value={maxPrepTime} 
                      onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-xs font-bold w-10 shrink-0">{maxPrepTime}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Calendar Horizontal Slider */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {DAYS.map(day => {
                const isActive = selectedDay === day;
                const stats = dailyTotals[day];
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all min-w-[90px] ${
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-md shadow-primary/20 scale-102"
                        : "bg-card border-border/40 hover:bg-muted text-foreground/80"
                    }`}
                  >
                    <span className="text-xs uppercase opacity-75">{day.slice(0, 3)}</span>
                    <span className="text-lg font-bold my-1">{day === selectedDay ? "•" : stats.protein + "g"}</span>
                    <span className="text-[10px] opacity-90 truncate max-w-full">
                      {stats.completedCount}/{stats.totalMeals} eaten
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Meal Slot List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-primary" />
                  {selectedDay}'s Menu
                </h3>
                <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  {ifSchedule ? "16:8 Fasting Enabled (Breakfast Skipped)" : "Standard 3 Meals + Snack"}
                </span>
              </div>

              {ifSchedule && (
                <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/30 flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse" />
                  <span>Fasting Window Active (10 PM - 2 PM). Breakfast skipped to support insulin sensitivity.</span>
                </div>
              )}

              {Object.entries(weeklyPlan[selectedDay] || {}).map(([slot, meal]) => {
                const isCompleted = completedMeals[`${selectedDay}-${slot}`];
                return (
                  <div 
                    key={slot}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCompleted 
                        ? "bg-primary/5 border-primary/30 shadow-inner" 
                        : "bg-card border-border/40 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Check-off indicator */}
                      <button
                        onClick={() => toggleCompletedMeal(selectedDay, slot)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all shrink-0 mt-1 ${
                          isCompleted
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/40 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted">
                            {slot}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {meal.prepTime} min
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            {Array.from({ length: meal.cost }).map((_, i) => (
                              <Coins key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                            ))}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base">{meal.name}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {meal.biomarkers.map(b => (
                            <span 
                              key={b}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/10"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                      {/* Nutrition stats */}
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="text-center">
                          <div className="text-muted-foreground">Protein</div>
                          <div className="font-bold text-foreground text-sm">{meal.protein}g</div>
                        </div>
                        <div className="text-center border-l pl-4">
                          <div className="text-muted-foreground">Fiber</div>
                          <div className="font-bold text-foreground text-sm">{meal.fiber}g</div>
                        </div>
                      </div>

                      {/* Swap button */}
                      <button
                        onClick={() => setActiveSwap({ day: selectedDay, slot, currentMeal: meal })}
                        className="p-2.5 rounded-xl border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Swap</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Scorecard & Daily Totals */}
          <div className="space-y-6">
            {/* Daily Nutrition Score */}
            <div className="p-6 rounded-2xl glass-panel border relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <h3 className="font-bold text-lg">Nutrition Score</h3>
                <p className="text-xs text-muted-foreground">{selectedDay}'s alignment with biomarkers</p>
              </div>

              {/* Circular Gauge */}
              <div className="flex justify-center py-4">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  {/* SVG background circle */}
                  <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="stroke-muted" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="stroke-primary transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - nutritionScore.overall / 100)}`}
                      strokeLinecap="round"
                      fill="transparent" 
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl font-black">{nutritionScore.overall}</span>
                    <span className="text-xs block text-muted-foreground font-semibold mt-0.5">Score</span>
                  </div>
                </div>
              </div>

              {/* Health categories breakdowns */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Supports health areas</h4>
                <div className="grid grid-cols-1 gap-2">
                  {HEALTH_CATEGORIES.map(cat => {
                    const score = nutritionScore.details[cat.id] || 30;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{cat.label}</span>
                          <span className="text-muted-foreground">{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Daily Macro Progress Cards */}
            <div className="p-5 rounded-2xl glass-panel border space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Daily Macro Targets</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Dumbbell className="h-3.5 w-3.5 text-primary" />
                      Protein Goal
                    </span>
                    <span className="font-bold">{activeDayStats.protein}g / {proteinTarget}g</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        activeDayStats.protein >= proteinTarget ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min((activeDayStats.protein / proteinTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Fiber Goal
                    </span>
                    <span className="font-bold">{activeDayStats.fiber}g / {fiberTarget}g</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        activeDayStats.fiber >= fiberTarget ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min((activeDayStats.fiber / fiberTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Biomarker Benefits Callout */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <h4 className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Targeting Your Biomarkers
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Today's meals are rich in soluble fibers, antioxidants, and sulfur-containing compounds designed to address your critical biomarkers:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from(activeDayStats.biomarkers).slice(0, 4).map(b => (
                  <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: MEAL LIBRARY ----------------- */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl glass-panel border">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search recipe, ingredients, or biomarkers..."
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={libraryCategory}
              onChange={(e) => setLibraryCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Meal Types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>

            {/* Biomarker Filter */}
            <select
              value={libraryBiomarker}
              onChange={(e) => setLibraryBiomarker(e.target.value)}
              className="px-3 py-2 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-xs"
            >
              <option value="all">All Biomarkers</option>
              {allUniqueBiomarkers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Grid Layout of Library */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibrary.map(meal => (
              <div 
                key={meal.id} 
                className="p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {meal.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {meal.prepTime}m
                    </span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1">{meal.name}</h3>

                  <div className="flex flex-wrap gap-1">
                    {meal.biomarkers.map(b => (
                      <span key={b} className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/5">
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground pt-1 line-clamp-2">
                    <span className="font-semibold text-foreground">Ingredients: </span>
                    {meal.ingredients.join(", ")}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
                  <div className="flex gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Protein: </span>
                      <span className="font-bold text-foreground">{meal.protein}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fiber: </span>
                      <span className="font-bold text-foreground">{meal.fiber}g</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    {Array.from({ length: meal.cost }).map((_, i) => (
                      <Coins key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredLibrary.length === 0 && (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Info className="h-8 w-8 mx-auto stroke-1" />
              <p>No meals match your active filters or search terms.</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: MEAL PREP & INVENTORY ----------------- */}
      {activeTab === "prep" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sunday Meal Prep Checklist */}
          <div className="p-6 rounded-2xl glass-panel border space-y-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Sunday Prep Checklist
              </h3>
              <p className="text-xs text-muted-foreground">Complete these quick prep tasks to make weekday cooking frictionless.</p>
            </div>

            <form onSubmit={addPrepTask} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add custom prep task..."
                value={customPrepTask}
                onChange={(e) => setCustomPrepTask(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            <div className="space-y-3">
              {Object.entries(prepChecklist).map(([task, checked]) => (
                <button
                  key={task}
                  onClick={() => togglePrepTask(task)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    checked 
                      ? "bg-muted/50 border-border/40 text-muted-foreground line-through" 
                      : "bg-card border-border/60 hover:border-primary/20"
                  }`}
                >
                  <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                    checked ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                  }`}>
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm font-medium">{task}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pantry & Fridge Inventory Tracker */}
          <div className="p-6 rounded-2xl glass-panel border space-y-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Inventory Tracker
              </h3>
              <p className="text-xs text-muted-foreground">Items checked here are marked "in-stock" and automatically excluded from your Smart Grocery List.</p>
            </div>

            <form onSubmit={addInventoryItem} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add item to inventory (e.g. Avocado, Tofu)..."
                value={customInventoryItem}
                onChange={(e) => setCustomInventoryItem(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(inventory).map(([item, has]) => (
                <button
                  key={item}
                  onClick={() => toggleInventory(item)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    has 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-muted border-border text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  {has ? <Check className="h-3 w-3" /> : <PlusCircle className="h-3 w-3" />}
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: SMART GROCERY LIST ----------------- */}
      {activeTab === "grocery" && (
        <div className="p-6 rounded-2xl glass-panel border relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Smart Grocery List
              </h3>
              <p className="text-xs text-muted-foreground">Aggregated dynamically from your weekly menu (excluding in-stock items).</p>
            </div>
            <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full">
              {Object.values(smartGroceryList).flat().length} items needed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(smartGroceryList) as Array<keyof typeof smartGroceryList>).map(dept => {
              const items = smartGroceryList[dept];
              if (items.length === 0) return null;
              
              return (
                <div key={dept} className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {dept}
                  </h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div 
                        key={item}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/40 text-sm hover:border-primary/20 transition-all group"
                      >
                        <span className="font-medium">{item}</span>
                        <button 
                          onClick={() => toggleInventory(item)}
                          className="text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 px-2 py-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                          Got it
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.values(smartGroceryList).flat().length === 0 && (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto stroke-1 text-emerald-500" />
              <p className="font-semibold text-foreground">You are fully stocked!</p>
              <p className="text-xs">No ingredients needed. All items in the weekly menu are present in your inventory tracker.</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SWAP MEAL MODAL ----------------- */}
      {activeSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveSwap(null)} />
          <div className="relative bg-card border border-border/40 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-bold">Swap {activeSwap.slot} Meal</h2>
                <p className="text-xs text-muted-foreground">Find matching nutritional alternatives for {activeSwap.day}</p>
              </div>
              <button 
                onClick={() => setActiveSwap(null)} 
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Meal Reference */}
            <div className="p-3 bg-muted/50 rounded-xl border border-border/40 text-xs flex justify-between items-center">
              <div>
                <div className="font-bold text-foreground">Current: {activeSwap.currentMeal.name}</div>
                <div className="text-muted-foreground mt-0.5">Biomarkers: {activeSwap.currentMeal.biomarkers.slice(0, 3).join(", ")}</div>
              </div>
              <div className="flex gap-3 text-right">
                <div>
                  <div className="text-muted-foreground">Protein</div>
                  <div className="font-bold">{activeSwap.currentMeal.protein}g</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Fiber</div>
                  <div className="font-bold">{activeSwap.currentMeal.fiber}g</div>
                </div>
              </div>
            </div>

            {/* Swap Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search matching alternatives..."
                value={swapSearch}
                onChange={(e) => setSwapSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Candidate List */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {swapCandidates.map(candidate => (
                <div 
                  key={candidate.id}
                  className="p-3.5 rounded-xl border border-border/40 hover:border-primary/20 transition-all flex items-center justify-between gap-3 bg-card"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">{candidate.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.biomarkers.map(b => (
                        <span key={b} className="text-[9px] px-1.5 py-0.2 bg-primary/10 text-primary rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <div><span className="text-muted-foreground">P:</span> <span className="font-bold">{candidate.protein}g</span></div>
                      <div><span className="text-muted-foreground">F:</span> <span className="font-bold">{candidate.fiber}g</span></div>
                    </div>
                    <button
                      onClick={() => executeSwap(candidate)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Swap
                    </button>
                  </div>
                </div>
              ))}

              {swapCandidates.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No nutritional alternatives match the constraints (protein +/-6g, fiber +/-4g). Try widening your search or adjusting preferences.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
