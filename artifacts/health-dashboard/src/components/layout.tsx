import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Activity, Droplet, Heart, ShieldPlus, ActivitySquare, Pill, Flame, Fingerprint, History, Sparkles, Scale, Search, Menu, X, User, Pencil, Check, ScanLine } from "lucide-react";
import { useState, useEffect } from "react";
import { categories, profile as defaultProfile } from "@/data/healthData";

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

type ProfileData = {
  name: string;
  dob: string;
  gender: string;
  age: number;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  function openProfile() {
    setEditData(profileData);
    setIsProfileOpen(true);
  }

  function saveProfile() {
    // Recompute age from dob
    const dob = new Date(editData.dob);
    const age = new Date().getFullYear() - dob.getFullYear();
    setProfileData({ ...editData, age });
    setIsProfileOpen(false);
  }

  const initials = profileData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[120px] animate-float pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-[120px] animate-float-reverse pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] pointer-events-none z-0" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b glass-panel flex items-center justify-between px-4 z-50">
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
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 glass-panel border-r flex flex-col transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-14 md:flex items-center hidden px-6 border-b border-border/40">
          <div className="font-semibold text-primary flex items-center gap-2">
            <ActivitySquare className="h-5 w-5" />
            Nikhil's Health
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1.5 mt-14 md:mt-0">
            <NavItem href="/" icon={Activity} label="Overview" active={location === "/"} />
            <NavItem href="/trends" icon={ActivitySquare} label="Trends" active={location === "/trends"} />
            <NavItem href="/body" icon={ScanLine} label="Body Viewer" active={location === "/body"} />
            <NavItem href="/reports" icon={History} label="Reports" active={location === "/reports"} />
            <NavItem href="/search" icon={Search} label="Search" active={location === "/search"} />
          </div>
        </div>

        {/* Profile card — pinned at bottom */}
        <div className="border-t border-border/40 px-3 py-3 shrink-0">
          <button
            onClick={openProfile}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/20 border border-transparent transition-all group text-left"
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profileData.name}</div>
              <div className="text-xs text-muted-foreground">{profileData.age} yrs · {profileData.gender}</div>
            </div>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto pt-14 md:pt-0 z-10">
        {location === "/body" ? (
          <div className="flex-1 h-full overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>
            {children}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full p-4 md:p-8">
            {children}
          </div>
        )}
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Profile dialog */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative bg-card border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">Your personal information</p>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
                {editData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{editData.name}</p>
                <p className="text-sm text-muted-foreground">{editData.gender}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <Field
                label="Full Name"
                value={editData.name}
                onChange={(v) => setEditData(d => ({ ...d, name: v }))}
              />
              <Field
                label="Date of Birth"
                type="date"
                value={editData.dob}
                onChange={(v) => setEditData(d => ({ ...d, dob: v }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map(g => (
                    <button
                      key={g}
                      onClick={() => setEditData(d => ({ ...d, gender: g }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${editData.gender === g ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="flex-1 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
      />
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 border border-primary/20 scale-[1.02]" : "text-foreground/80 hover:bg-primary/10 hover:text-primary hover:translate-x-1"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
