import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Sparkles, User, MessageSquare, Bot, AlertTriangle, 
  HelpCircle, ArrowUpRight, ShoppingCart, Info 
} from "lucide-react";
import { profile, biomarkers } from "@/data/healthData";

type Message = {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  references?: { name: string; value: string; status: string }[];
  actionPlan?: string[];
  explanation?: string;
};

const SUGGESTIONS = [
  { text: "Why is my liver score low?", icon: AlertTriangle, color: "text-amber-500" },
  { text: "What changed since last year?", icon: Info, color: "text-primary" },
  { text: "What are the 3 focus areas this month?", icon: Sparkles, color: "text-purple-500" },
  { text: "Can I improve LDL without medication?", icon: HelpCircle, color: "text-blue-500" },
  { text: "Why is homocysteine high if B12 is normal?", icon: AlertTriangle, color: "text-red-500" },
  { text: "Create a grocery list for my deficiencies.", icon: ShoppingCart, color: "text-emerald-500" },
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: "Hi Nikhil! I am your AI Health Copilot. I have analyzed your parsed lab reports from Tata 1mg & Orange Health, your longitudinal trends, and your current health goals.\n\nAsk me anything about your biomarkers, clinical patterns, or ask for a personalized plan.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let responseText = "";
      let references: Message["references"] = [];
      let actionPlan: string[] = [];
      let explanation = "";

      const normalized = text.toLowerCase();

      if (normalized.includes("liver") || normalized.includes("alt") || normalized.includes("ast")) {
        responseText = "Your liver enzymes (ALT: 93 U/L, AST: 46 U/L, GGT: 58 U/L) are significantly elevated above the clinical reference ranges. When combined with your elevated Triglycerides (182 mg/dL) and high insulin resistance (HOMA-IR: 3.16), this pattern is highly suggestive of metabolic liver strain (early-stage fatty liver loading).";
        references = [
          { name: "ALT", value: "93 U/L (Target <40)", status: "critical" },
          { name: "AST", value: "46 U/L (Target <40)", status: "critical" },
          { name: "HOMA-IR", value: "3.16 (Target <2.5)", status: "critical" }
        ];
        actionPlan = [
          "Walk 30 minutes daily (increases insulin sensitivity directly)",
          "Replace saturated cooking fats (butter, ghee) with cold-pressed olive oil",
          "Limit simple carbs and sugars to ease triglyceride assembly in the liver",
          "Retest liver panel (ALT/AST/GGT) and metabolic profile in 3 months"
        ];
        explanation = "Why ALT? ALT is an enzyme concentrated in hepatocytes. When liver cells experience inflammation or lipid accumulation, ALT leaks into the bloodstream, showing up as elevated in your report.";
      } else if (normalized.includes("changed") || normalized.includes("last year") || normalized.includes("trends")) {
        responseText = "Comparing your latest report (June 2026) to last year's (July 2025), we see a mix of substantial improvements and some areas that require immediate course correction:";
        references = [
          { name: "Vitamin D", value: "72.5 ng/mL (Was 25.0)", status: "normal" },
          { name: "hsCRP", value: "1.25 mg/L (Was 1.71)", status: "normal" },
          { name: "LDL", value: "134 mg/dL (Was 104)", status: "critical" },
          { name: "ALT", value: "93 U/L (Was 52)", status: "critical" }
        ];
        actionPlan = [
          "Maintain current Vitamin D maintenance dose",
          "Implement high-fiber nutrition (35g/day) to reverse the LDL spike",
          "Address metabolic strain to bring ALT down"
        ];
      } else if (normalized.includes("focus") || normalized.includes("important") || normalized.includes("priority")) {
        responseText = "Based on your clinical markers, here are the three highest-priority focus areas for this month to achieve the maximum systemic health improvement:";
        references = [
          { name: "Folate", value: "3.64 ng/mL (Deficient)", status: "critical" },
          { name: "Homocysteine", value: "36.46 μmol/L (Highly Elevated)", status: "critical" },
          { name: "LDL", value: "134 mg/dL (Elevated)", status: "critical" }
        ];
        actionPlan = [
          "Take folate (L-methylfolate) consistently for 30 days to clear the methylation bottleneck",
          "Consume 35g of fiber daily (including 5 servings of oats/week) to clear LDL",
          "Incorporate 150 minutes of Zone 2 exercise weekly to improve liver enzymes and insulin sensitivity"
        ];
        explanation = "Improving folate deficiency will directly lower Homocysteine, reducing cardiovascular and endothelial risk factors significantly within 4-6 weeks.";
      } else if (normalized.includes("ldl") || normalized.includes("cholesterol") || normalized.includes("without medication")) {
        responseText = "Yes, you can absolutely lower your LDL cholesterol without medication. Clinical data shows four primary dietary/lifestyle levers that yield substantial LDL reduction:";
        references = [
          { name: "LDL", value: "134 mg/dL (Target <100)", status: "critical" },
          { name: "Total Cholesterol", value: "214 mg/dL (Target <200)", status: "borderline" }
        ];
        actionPlan = [
          "Soluble Fiber (35g/day): Binds bile acids in the gut, forcing the liver to pull LDL from circulation to create more bile.",
          "Limit Saturated Fat: Keep saturated fat under 15g/day. Replace butter and animal fat with olive oil and avocado.",
          "Oats & Barley: Eat oats 5 times a week; they contain beta-glucan which lowers LDL.",
          "Aerobic Exercise: 30 minutes of brisk walking or cycling daily increases HDL size and lowers circulating LDL."
        ];
      } else if (normalized.includes("homocysteine") || normalized.includes("folate") || normalized.includes("b12")) {
        responseText = "This is a classic biochemical bottleneck. Your Homocysteine is high (36.46 μmol/L) despite normal Vitamin B12 (292 pg/mL) because your Folate (B9) is severely deficient (3.64 ng/mL).\n\nHomocysteine recycling into Methionine requires both Folate and B12 working in synergy. Without sufficient Folate, the pathway stalls, leading to a build-up of cardiovascular-disruptive Homocysteine.";
        references = [
          { name: "Homocysteine", value: "36.46 μmol/L", status: "critical" },
          { name: "Folate", value: "3.64 ng/mL", status: "critical" },
          { name: "Vitamin B12", value: "292 pg/mL", status: "normal" }
        ];
        actionPlan = [
          "Supplement L-methylfolate (the active form of folate) daily",
          "Eat folate-rich dark leafy greens (spinach, kale, asparagus)",
          "Re-test Homocysteine and Folate in 6 weeks to confirm reduction"
        ];
        explanation = "A deficiency in B9 disrupts the folate cycle, preventing the transfer of methyl groups needed to convert homocysteine. High homocysteine irritates blood vessel linings, increasing risk of thrombosis and atherosclerosis.";
      } else if (normalized.includes("grocery") || normalized.includes("food") || normalized.includes("eat") || normalized.includes("diet")) {
        responseText = "Here is your personalized, biomarker-targeted grocery list designed to address folate deficiency, lower LDL, and reduce liver enzymes:";
        references = [
          { name: "Folate", value: "3.64 ng/mL", status: "critical" },
          { name: "LDL", value: "134 mg/dL", status: "critical" },
          { name: "ALT", value: "93 U/L", status: "critical" }
        ];
        actionPlan = [
          "Folate Boosters: Organic baby spinach, asparagus, dark lentils, edamame, and avocados.",
          "LDL-Lowering Soluble Fiber: Steel-cut oats, organic barley, chia seeds, and Brussels sprouts.",
          "Heart-Healthy Lipids: Extra virgin olive oil, raw walnuts, and wild-caught salmon.",
          "Avoid: Commercial baked goods, heavy creams, butter, and highly processed vegetable oils."
        ];
      } else {
        responseText = `I analyzed your health profile. Based on your current parameters, the primary anomalies are your low Folate (${biomarkers.find(b => b.id === 'folate')?.history.slice(-1)[0]} ng/mL) and elevated LDL (${biomarkers.find(b => b.id === 'ldl')?.history.slice(-1)[0]} mg/dL). I recommend asking about these specifically or logging your daily habits to stay on track.`;
      }

      const copilotMessage: Message = {
        id: Math.random().toString(),
        sender: "copilot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        references: references.length ? references : undefined,
        actionPlan: actionPlan.length ? actionPlan : undefined,
        explanation: explanation || undefined
      };

      setMessages((prev) => [...prev, copilotMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-4 max-w-4xl mx-auto">
      {/* Copilot Header */}
      <div className="flex items-center justify-between p-4 glass-card border border-border/40 rounded-2xl shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold">Health Copilot</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grounded in Nikhil's Health Records
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold bg-secondary border border-border/40 px-2 py-1 rounded-lg">
            Model: Gemini Clinical-3.5
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "copilot" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className={`max-w-[85%] space-y-3 ${msg.sender === "user" ? "bg-primary text-primary-foreground p-4 rounded-3xl rounded-tr-sm shadow-md" : "glass-card border border-border/40 p-5 rounded-3xl rounded-tl-sm shadow-md"}`}>
                <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                  {msg.text}
                </div>

                {/* Grounding References */}
                {msg.references && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Info className="h-3 w-3 text-primary" />
                      Biomarkers referenced
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.references.map((ref, idx) => (
                        <div key={idx} className="text-xs px-2.5 py-1 rounded-xl bg-secondary/80 border border-border/40 flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${ref.status === "critical" ? "bg-red-500" : "bg-emerald-500"}`} />
                          <span className="font-semibold">{ref.name}:</span>
                          <span className="text-muted-foreground">{ref.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Action Plan */}
                {msg.actionPlan && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                      AI Action Plan
                    </div>
                    <ul className="space-y-1.5">
                      {msg.actionPlan.map((action, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medical Explainability */}
                {msg.explanation && (
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
                    <div className="text-[9px] font-bold text-primary uppercase tracking-wider">Clinical Context</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{msg.explanation}</p>
                  </div>
                )}

                <div className={`text-[9px] text-right font-medium mt-1 ${msg.sender === "user" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="glass-card border border-border/40 p-4 rounded-3xl rounded-tl-sm shadow-md flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
          {SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.text)}
              className="glass-card hover:bg-primary/5 hover:border-primary/30 border border-border/40 p-3 rounded-2xl text-left transition-all duration-200 isomorphic-lift flex items-center gap-2 group"
            >
              <chip.icon className={`h-4.5 w-4.5 shrink-0 ${chip.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[11px] font-semibold text-foreground/80 leading-snug">{chip.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="glass-card border border-border/40 p-3 rounded-2xl shadow-lg shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Ask Health Copilot (e.g., 'Why is my homocysteine high?')"
          className="flex-1 bg-transparent text-sm focus:outline-none px-2 text-foreground/90 font-medium placeholder-muted-foreground"
        />
        <button
          onClick={() => handleSend(input)}
          className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center shadow-md transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
