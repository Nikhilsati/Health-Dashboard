import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, Activity, Sparkles, Brain, CheckSquare, 
  HelpCircle, Calendar, ChevronRight, CheckCircle2, ChevronLeft 
} from "lucide-react";

type Habit = {
  id: string;
  name: string;
  targetMarker: string;
  completed: boolean;
  streak: number;
};

export default function Tracking() {
  // 1. Habit Tracking State
  const [habits, setHabits] = useState<Habit[]>([
    { id: "h1", name: "Walk 30 mins (Zone 2)", targetMarker: "ALT & Triglycerides", completed: false, streak: 5 },
    { id: "h2", name: "35g Soluble Fiber Intake", targetMarker: "LDL Cholesterol", completed: true, streak: 3 },
    { id: "h3", name: "Folate Supplement (B9)", targetMarker: "Homocysteine", completed: false, streak: 12 },
    { id: "h4", name: "Omega-3 Fish Oil Capsule", targetMarker: "Triglycerides & LDL", completed: true, streak: 8 },
    { id: "h5", name: "Sleep 7.5+ Hours", targetMarker: "hsCRP Inflammation", completed: false, streak: 2 },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextCompleted = !h.completed;
        return { 
          ...h, 
          completed: nextCompleted, 
          streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1) 
        };
      }
      return h;
    }));
  };

  // 2. AI Weekly Check-in State
  const [step, setStep] = useState(1);
  const [exerciseDays, setExerciseDays] = useState(4);
  const [outsideMeals, setOutsideMeals] = useState(3);
  const [weight, setWeight] = useState(61);
  const [sleepHrs, setSleepHrs] = useState(7);
  const [checkinResult, setCheckinResult] = useState<string | null>(null);

  const handleCheckinSubmit = () => {
    // Generate AI assessment
    const ldlChance = exerciseDays >= 5 && outsideMeals <= 2 ? 88 : exerciseDays >= 4 && outsideMeals <= 3 ? 72 : 45;
    const feedback = `Based on your logs:
    • Exercise: ${exerciseDays} days (Target: 5 days)
    • Dining Out: ${outsideMeals} meals (Target: < 2)
    • Weight: ${weight} kg (Stable)
    • Sleep: ${sleepHrs} hrs/night (Optimal)

    AI Analysis: Adherence score is 78%. Your likelihood of achieving your target LDL level of 110 mg/dL within the 3-month window is currently estimated at ${ldlChance}%. Reducing outside meals by 1 more session will lower saturated fat ingestion and accelerate ALT enzyme normalization.`;
    
    setCheckinResult(feedback);
    setStep(5);
  };

  const resetCheckin = () => {
    setStep(1);
    setCheckinResult(null);
  };

  // 3. Symptom Journal State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const symptomsList = ["Feeling Tired / Fatigue", "Brain Fog / Poor Focus", "Bloating / Digestion", "Muscle/Joint Stiffness"];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Habits & Journal</h1>
        <p className="text-muted-foreground mt-1">
          Log daily metrics to feed the AI predictions engine and correlate physiological symptoms.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Habit Checklist & Symptom Journal (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Habit Log */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border border-border/40 rounded-3xl p-6 shadow-md"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/90">
              <CheckSquare className="h-5 w-5 text-primary" />
              Daily Biomarker-Linked Habits
            </h2>

            <div className="space-y-3.5">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                    habit.completed 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-background border-border/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={habit.completed}
                      readOnly
                      className="rounded border-border/60 text-primary focus:ring-primary/40 h-5 w-5 pointer-events-none" 
                    />
                    <div>
                      <div className={`text-sm font-bold ${habit.completed ? "line-through text-muted-foreground" : "text-foreground/90"}`}>
                        {habit.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Target marker: <span className="font-bold text-primary">{habit.targetMarker}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      🔥 {habit.streak} day streak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Symptom Journal */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card border border-border/40 rounded-3xl p-6 shadow-md"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/90">
              <Brain className="h-5 w-5 text-purple-500" />
              Symptom Journal & AI Correlator
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Select symptoms you've felt today to analyze potential correlation with your parsed biomarker deficiencies.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {symptomsList.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 ${
                      isSelected 
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400" 
                        : "bg-background border-border/40 hover:bg-secondary/40 text-foreground/80"
                    }`}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>

            {/* AI Symptom Correlation Panel */}
            <AnimatePresence>
              {selectedSymptoms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-3">
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      AI Symptom Correlation Report
                    </div>

                    <div className="space-y-3 divide-y divide-purple-500/10">
                      {selectedSymptoms.map((symptom) => (
                        <div key={symptom} className="text-xs pt-2 first:pt-0 leading-relaxed text-muted-foreground">
                          <span className="font-bold text-foreground">{symptom}:</span>{" "}
                          {symptom.includes("Tired") && (
                            <span>Possible physiological links identified. Your Folate is severely low (**3.64 ng/mL**, target &gt;5.4) and Vitamin B12 is at the lower boundary (**292 pg/mL**). Both deficiencies impede normal red blood cell maturation, leading to micro-fatigue. Average sleep of 6.5h log also compounds this.</span>
                          )}
                          {symptom.includes("Fog") && (
                            <span>Correlates directly with the methylation cycle bottleneck caused by **Folate deficiency (3.64 ng/mL)**. Methylation is required for synthesis of key neurotransmitters (dopamine, serotonin). Lowering Homocysteine (currently **36.46 μmol/L**) will improve cerebral blood flow.</span>
                          )}
                          {symptom.includes("Bloating") && (
                            <span>Elevated liver enzymes ALT (**93 U/L**) and GGT (**58 U/L**) suggest systemic hepatic burden. When the liver is congested, bile secretion decreases, which can lead to delayed gut transit and fermentation bloating. Recommend reducing lipid loading.</span>
                          )}
                          {symptom.includes("Stiffness") && (
                            <span>Elevated Uric Acid (**8.4 mg/dL**, target &lt;7.2) is present in your kidney/metabolic panel. Higher uric acid levels crystallize in joints, leading to micro-inflammation and morning muscle/joint stiffness. Hydrate with 2.5L water/day.</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* AI Weekly Check-in (Right 1 Column) */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card border border-border/40 rounded-3xl p-6 shadow-md bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/90">
              <Calendar className="h-5 w-5 text-primary" />
              AI Weekly Check-in
            </h2>

            {step === 1 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  Step 1 of 4: How many days did you perform zone 2 cardiorespiratory exercise this week?
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Adherence</span>
                    <span className="text-primary">{exerciseDays} days</span>
                  </div>
                  <input 
                    type="range" min="0" max="7" 
                    value={exerciseDays} 
                    onChange={(e) => setExerciseDays(Number(e.target.value))}
                    className="w-full accent-primary bg-secondary h-1.5 rounded-full outline-none"
                  />
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full mt-2 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  Step 2 of 4: How many times did you eat restaurant meals or fried takeout food this week?
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Dining Out</span>
                    <span className="text-primary">{outsideMeals} times</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={outsideMeals} 
                    onChange={(e) => setOutsideMeals(Number(e.target.value))}
                    className="w-full accent-primary bg-secondary h-1.5 rounded-full outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  Step 3 of 4: Log your current weight.
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button 
                    onClick={() => setStep(4)}
                    className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-muted-foreground leading-relaxed">
                  Step 4 of 4: Average sleep hours per night this week.
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Sleep duration</span>
                    <span className="text-primary">{sleepHrs} hours</span>
                  </div>
                  <input 
                    type="range" min="4" max="10" step="0.5"
                    value={sleepHrs} 
                    onChange={(e) => setSleepHrs(Number(e.target.value))}
                    className="w-full accent-primary bg-secondary h-1.5 rounded-full outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-1 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button 
                    onClick={handleCheckinSubmit}
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-1"
                  >
                    Submit <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && checkinResult && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                  <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Check-in Completed
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-medium">
                    {checkinResult}
                  </p>
                </div>
                <button 
                  onClick={resetCheckin}
                  className="w-full py-2.5 rounded-xl bg-secondary border border-border/60 text-xs font-bold transition-all"
                >
                  Start New Check-in
                </button>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
