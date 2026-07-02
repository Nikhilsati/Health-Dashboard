import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Activity, Droplet, Heart, ShieldPlus, ActivitySquare, Pill, Flame, Fingerprint, History, Sparkles, Scale, Search, Menu, X, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import { categories } from "@/data/healthData";

const iconMap: Record<string, React.ElementType> = {
  heart: Heart,
  blood: Droplet,
  liver: Activity,
  kidney: ShieldPlus,
  diabetes: ActivitySquare,
  vitamins: Pill,
  inflammation: Flame,
  thyroid: Sparkles,
  hormones: Fingerprint,
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-card flex items-center justify-between px-4 z-50">
        <div className="font-semibold text-primary flex items-center gap-2">
          <ActivitySquare className="h-5 w-5" />
          Health
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-14 md:flex items-center hidden px-6 border-b">
          <div className="font-semibold text-primary flex items-center gap-2">
            <ActivitySquare className="h-5 w-5" />
            Nikhil's Health
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1 mt-14 md:mt-0">
            <NavItem href="/" icon={Activity} label="Overview" active={location === "/"} />
            <NavItem href="/trends" icon={ActivitySquare} label="Trends" active={location === "/trends"} />
            <NavItem href="/reports" icon={History} label="Reports" active={location === "/reports"} />
            <NavItem href="/insights" icon={Sparkles} label="Insights" active={location === "/insights"} />
            <NavItem href="/compare" icon={ArrowLeftRight} label="Compare" active={location === "/compare"} />
            <NavItem href="/search" icon={Search} label="Search" active={location === "/search"} />
          </div>

          <div>
            <div className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Systems</div>
            <div className="space-y-1">
              {categories.map(cat => {
                const Icon = iconMap[cat.id] || Activity;
                return (
                  <NavItem 
                    key={cat.id} 
                    href={`/category/${cat.id}`} 
                    icon={Icon} 
                    label={cat.label} 
                    active={location === `/category/${cat.id}`} 
                  />
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto w-full p-4 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
