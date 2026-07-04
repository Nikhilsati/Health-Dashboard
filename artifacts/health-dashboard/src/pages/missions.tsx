import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, ShieldCheck, ChevronRight, Sparkles, AlertTriangle, 
  ArrowRight, Heart, Brain, Activity, Compass, Flame, Info
} from "lucide-react";

type Mission = {
  id: string;
  name: string;
  progress: number;
  startDate: string;
  expectedCompletion: string;
  status: "active" | "completed";
  tasks: { name: string; completed: boolean }[];
  color: string;
};

type Journey = {
  id: string;
  name: string;
  startDate: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  expectedWeeks: number;
  status: "active" | "completed";
  symptoms?: string[];
};

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "m1",
      name: "Lower LDL Cholesterol",
      progress: 42,
      startDate: "July 4, 2026",
      expectedCompletion: "October 2026",
      status: "active",
      color: "from-blue-500/20 to-indigo-500/20 hover:border-blue-500/40",
      tasks: [
        { name: "35g daily soluble fiber (oat bran, chia seeds)", completed: true },
        { name: "150 mins zone 2 aerobic exercise weekly", completed: true },
        { name: "Limit saturated fat intake to <15g daily", completed: false },
        { name: "Take Omega-3 fish oil supplement daily", completed: false },
        { name: "Retest Lipid Panel booked", completed: false },
      ]
    },
    {
      id: "m2",
      name: "Reduce Liver Inflammation (ALT)",
      progress: 25,
      startDate: "June 30, 2026",
      expectedCompletion: "September 2026",
      status: "active",
      color: "from-amber-500/20 to-red-500/20 hover:border-amber-500/40",
      tasks: [
        { name: "Eliminate high fructose corn syrup and simple sugars", completed: true },
        { name: "Daily walking of at least 30 mins to boost insulin sensitivity", completed: false },
        { name: "Swap butter/ghee cooking fats for extra virgin olive oil", completed: false },
        { name: "Retest Liver Function panel", completed: false },
      ]
    }
  ]);

  const [journeys, setJourneys] = useState<Journey[]>([
    {
      id: "j1",
      name: "Fix Folate Deficiency",
      startDate: "July 2026",
      current: 3.64,
      target: 5.40,
      unit: "ng/mL",
      progress: 65,
      expectedWeeks: 6,
      status: "active",
      symptoms: ["Fatigue & low energy", "Brain fog", "Mouth sores"]
    },
    {
      id: "j2",
      name: "Achieve Optimal Vitamin D",
      startDate: "June 2025",
      current: 72.5,
      target: 30.0,
      unit: "ng/mL",
      progress: 100,
      expectedWeeks: 12,
      status: "completed",
      symptoms: ["Muscle weakness", "Bone pain", "Low immunity"]
    }
  ]);

  const toggleTask = (missionId: string, taskIdx: number) => {
    setMissions(prevMissions => prevMissions.map(m => {
      if (m.id === missionId) {
        const newTasks = [...m.tasks];
        newTasks[taskIdx].completed = !newTasks[taskIdx].completed;
        const completedCount = newTasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / newTasks.length) * 100);
        return { ...m, tasks: newTasks, progress: newProgress };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Introduction */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Missions & Journeys</h1>
        <p className="text-muted-foreground mt-1">
          Turn abnormal biomarkers into clear, interactive blueprints for recovery.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Missions (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
            <Target className="h-5 w-5 text-primary" />
            Active Missions
          </h2>
          
          <div className="space-y-6">
            {missions.map((mission) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card bg-gradient-to-br ${mission.color} border border-border/40 rounded-3xl p-6 shadow-md transition-all duration-300`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground/95">{mission.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started {mission.startDate} · Expected completion: {mission.expectedCompletion}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-primary">{mission.progress}%</span>
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Progress</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-secondary/80 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${mission.progress}%` }} />
                </div>

                {/* Task Checklist */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Action Checklist</div>
                  {mission.tasks.map((task, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleTask(mission.id, idx)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                        task.completed 
                          ? "bg-primary/5 border-primary/20 text-muted-foreground" 
                          : "bg-background border-border/40 hover:bg-secondary/40 text-foreground/90 font-medium"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        readOnly
                        className="rounded border-border/60 text-primary focus:ring-primary/40 h-4.5 w-4.5 pointer-events-none" 
                      />
                      <span className="text-xs">{task.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journeys & Deficiencies (Right 1 col) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
            <Compass className="h-5 w-5 text-indigo-500" />
            Abnormal Journeys
          </h2>

          <div className="space-y-4">
            {journeys.map((j) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-border/40 rounded-3xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-foreground/90">{j.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Started {j.startDate}</p>
                  </div>
                  {j.status === "completed" ? (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Restored
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {j.expectedWeeks} weeks left
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/20">
                    <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Current</div>
                    <div className="text-base font-extrabold mt-0.5 text-foreground/90">{j.current} <span className="text-[10px] font-normal text-muted-foreground">{j.unit}</span></div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/20">
                    <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Target</div>
                    <div className="text-base font-extrabold mt-0.5 text-foreground/90">{j.target > j.current ? ">" : "<"} {j.target} <span className="text-[10px] font-normal text-muted-foreground">{j.unit}</span></div>
                  </div>
                </div>

                {/* Tiny progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                    <span>Deficiency Gap</span>
                    <span>{j.progress}% corrected</span>
                  </div>
                  <div className="h-2 bg-secondary/80 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${j.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${j.progress}%` }} />
                  </div>
                </div>

                {/* Associated Symptoms */}
                {j.symptoms && j.symptoms.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                      {j.status === "completed" ? "Resolved symptoms:" : "Common deficiency symptoms:"}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {j.symptoms.map((s, idx) => (
                        <span key={idx} className={`text-[9px] font-medium px-2 py-0.5 rounded border ${
                          j.status === "completed" 
                            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10 dark:text-emerald-400" 
                            : "bg-red-500/5 text-red-500 border-red-500/10"
                        }`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Biomarker Relationships Graph */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card border border-border/40 rounded-3xl p-6 shadow-lg hover:border-primary/20 transition-all duration-300"
      >
        <h3 className="font-bold text-lg text-foreground/90 flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Biomarker Path Relationships
        </h3>

        <div className="p-6 rounded-2xl bg-secondary/20 border border-border/20 overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-between px-6 py-4">
            
            {/* Node 1 */}
            <div className="glass-card border-red-500/30 p-4 rounded-2xl w-44 text-center shadow-md relative group">
              <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Root Cause</span>
              <div className="font-bold text-sm mt-1">Low Folate</div>
              <div className="text-xs text-red-500 font-extrabold mt-0.5">3.64 ng/mL</div>
            </div>

            {/* Arrow 1 */}
            <div className="flex flex-col items-center flex-1 mx-2">
              <span className="text-[10px] text-muted-foreground font-semibold mb-1">stalls methylation</span>
              <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-amber-500 relative">
                <ArrowRight className="h-3 w-3 text-amber-500 absolute right-0 -top-1" />
              </div>
            </div>

            {/* Node 2 */}
            <div className="glass-card border-amber-500/30 p-4 rounded-2xl w-44 text-center shadow-md relative group">
              <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Elevates</span>
              <div className="font-bold text-sm mt-1">Homocysteine</div>
              <div className="text-xs text-amber-500 font-extrabold mt-0.5">36.46 μmol/L</div>
            </div>

            {/* Arrow 2 */}
            <div className="flex flex-col items-center flex-1 mx-2">
              <span className="text-[10px] text-muted-foreground font-semibold mb-1">irritates arteries</span>
              <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-indigo-500 relative">
                <ArrowRight className="h-3 w-3 text-indigo-500 absolute right-0 -top-1" />
              </div>
            </div>

            {/* Node 3 */}
            <div className="glass-card border-indigo-500/30 p-4 rounded-2xl w-44 text-center shadow-md relative group">
              <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider">Escalates</span>
              <div className="font-bold text-sm mt-1">Cardio Risk</div>
              <div className="text-[10px] text-indigo-500 font-extrabold mt-0.5">High Potential</div>
            </div>
            
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
            <Info className="h-4 w-4 text-primary shrink-0" />
            Co-presence of <span className="font-bold text-foreground">High LDL (134 mg/dL)</span> compounds total vascular risk. Addressing Folate deficiency first lowers Homocysteine directly.
          </div>
        </div>
      </motion.div>

      {/* AI Insights Engine */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card border border-border/40 rounded-3xl p-6 shadow-lg hover:border-primary/20 transition-all duration-300"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <h3 className="font-bold text-lg text-foreground/90">AI Multi-Biomarker Analysis</h3>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-foreground/90 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              Early Metabolic Syndrome Pattern detected
            </div>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
              Confidence: High
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Your results show co-elevated **LDL (134 mg/dL)**, **Triglycerides (182 mg/dL)**, and an insulin resistance factor **HOMA-IR of 3.16**. Together, this lipid-glucose-insulin alignment is indicative of metabolic dysfunction and hepatic fatty loading.
          </p>

          <div className="flex gap-2 flex-wrap pt-1.5">
            <span className="text-[10px] px-2 py-1 rounded-lg bg-card border border-border/40 font-semibold text-foreground/80">LDL: 134 ↑</span>
            <span className="text-[10px] px-2 py-1 rounded-lg bg-card border border-border/40 font-semibold text-foreground/80">Triglycerides: 182 ↑</span>
            <span className="text-[10px] px-2 py-1 rounded-lg bg-card border border-border/40 font-semibold text-foreground/80">HOMA-IR: 3.16 ↑</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
