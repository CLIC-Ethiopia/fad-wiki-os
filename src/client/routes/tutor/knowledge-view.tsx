import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  BookOpen, Clock, Play, Brain, Lightbulb, FlaskConical,
  Cpu, Wrench, Palette, Pi, Rocket, Search, FileText,
  BarChart3, ChevronRight, Settings, Calendar, Sparkles,
  CheckCircle2, AlertCircle, GraduationCap
} from "lucide-react";
import { useTutorStore } from "../../store/tutor-store";

/* ── 7 STEAM-IE Module Definitions ── */

interface SteamModule {
  id: string;
  name: string;
  icon: string;
  lucideIcon: typeof BookOpen;
  color: string;
  gradient: string;
  accentBorder: string;
  vaultCategory: string;
  defaultHours: number;
  description: string;
}

const STEAM_IE_MODULES: SteamModule[] = [
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    lucideIcon: FlaskConical,
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    accentBorder: "border-blue-500/50",
    vaultCategory: "Science",
    defaultHours: 8,
    description: "Biology, Physics, Cognitive Science — foundational disciplines explaining the natural world through observation and experimentation.",
  },
  {
    id: "technology",
    name: "Technology",
    icon: "💻",
    lucideIcon: Cpu,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    accentBorder: "border-violet-500/50",
    vaultCategory: "Technology",
    defaultHours: 8,
    description: "Software, AI, computing systems — the tools extending human capability in the digital age.",
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "⚙️",
    lucideIcon: Wrench,
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    accentBorder: "border-amber-500/50",
    vaultCategory: "Engineering",
    defaultHours: 6,
    description: "Design, systems thinking, and applied science for building solutions to real-world problems.",
  },
  {
    id: "arts",
    name: "Arts",
    icon: "🎨",
    lucideIcon: Palette,
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
    accentBorder: "border-rose-500/50",
    vaultCategory: "Arts",
    defaultHours: 4,
    description: "Creative expression, design thinking, and humanities fueling culture and innovation.",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "📐",
    lucideIcon: Pi,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    accentBorder: "border-emerald-500/50",
    vaultCategory: "Mathematics",
    defaultHours: 6,
    description: "The universal language of patterns, logic, and quantitative reasoning underpinning every discipline.",
  },
  {
    id: "innovation",
    name: "Innovation",
    icon: "💡",
    lucideIcon: Lightbulb,
    color: "yellow",
    gradient: "from-yellow-500 to-amber-600",
    accentBorder: "border-yellow-500/50",
    vaultCategory: "Innovation",
    defaultHours: 8,
    description: "Disruptive technologies, design thinking, R&D management, and strategic innovation frameworks.",
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    icon: "🚀",
    lucideIcon: Rocket,
    color: "fuchsia",
    gradient: "from-fuchsia-500 to-pink-600",
    accentBorder: "border-fuchsia-500/50",
    vaultCategory: "Entrepreneurship",
    defaultHours: 8,
    description: "Lean startup methods, venture capital, product management, and scaling strategies.",
  },
];

/* ── Study Planner Integration Utilities ── */

interface HourAllocation {
  hour: number;
  topic: string;
  activity: string;
}

interface WeekPlan {
  weekNumber: number;
  lessonName: string;
  description: string;
  hoursAllocation: HourAllocation[];
}

interface LessonPlan {
  title: string;
  description: string;
  weeks: WeekPlan[];
}

const KEYWORD_MAP: Record<string, string[]> = {
  science: ["science", "biology", "physics", "chemistry", "cognitive", "scientific", "research method", "hypothesis", "experiment", "natural"],
  technology: ["technology", "software", "ai ", "artificial intelligence", "computing", "digital", "programming", "data", "machine learning", "cyber", "algorithm", "tech"],
  engineering: ["engineering", "design", "systems", "civil", "mechanical", "electrical", "structural", "build", "prototype", "cad"],
  arts: ["art", "creative", "design thinking", "culture", "humanities", "aesthetic", "visual", "music", "literature", "media"],
  mathematics: ["math", "statistics", "calculus", "algebra", "geometry", "probability", "quantitative", "numerical", "logic", "analytical"],
  innovation: ["innovation", "disruptive", "r&d", "research and development", "patent", "ip ", "technology transfer", "open innovation", "design sprint"],
  entrepreneurship: ["entrepreneur", "startup", "venture", "business model", "lean", "mvp", "fundrais", "pitch", "scaling", "growth", "product market"],
};

function parseStudyPlanHours(lessonPlan: LessonPlan | null): Record<string, number> {
  const hours: Record<string, number> = {};
  STEAM_IE_MODULES.forEach(m => { hours[m.id] = 0; });

  if (!lessonPlan?.weeks) return hours;

  for (const week of lessonPlan.weeks) {
    if (!week.hoursAllocation) continue;
    for (const alloc of week.hoursAllocation) {
      const topicLower = (alloc.topic + " " + alloc.activity).toLowerCase();
      let matched = false;
      for (const [moduleId, keywords] of Object.entries(KEYWORD_MAP)) {
        if (keywords.some(kw => topicLower.includes(kw))) {
          hours[moduleId] += 1;
          matched = true;
          break;
        }
      }
      // If no keyword match, distribute to the module with fewest hours
      if (!matched) {
        const minModule = Object.entries(hours).reduce((a, b) => a[1] <= b[1] ? a : b);
        hours[minModule[0]] += 1;
      }
    }
  }

  return hours;
}

function getCompletedHoursForModule(
  completedHours: Record<string, boolean>,
  lessonPlan: LessonPlan | null,
  moduleId: string,
): number {
  if (!lessonPlan?.weeks || !completedHours) return 0;

  let count = 0;
  for (const week of lessonPlan.weeks) {
    if (!week.hoursAllocation) continue;
    for (const alloc of week.hoursAllocation) {
      const key = `${week.weekNumber}_${alloc.hour}`;
      if (!completedHours[key]) continue;

      const topicLower = (alloc.topic + " " + alloc.activity).toLowerCase();
      const keywords = KEYWORD_MAP[moduleId] || [];
      if (keywords.some(kw => topicLower.includes(kw))) {
        count++;
      }
    }
  }
  return count;
}

/* ── Difficulty Badge ── */

function DifficultyBadge({ level }: { level: string }) {
  const config = {
    Beginner: { bg: "bg-green-500/15 border-green-500/30", text: "text-green-300" },
    Intermediate: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300" },
    Expert: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-300" },
  }[level] || { bg: "bg-zinc-800 border-zinc-700", text: "text-zinc-400" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {level}
    </span>
  );
}

/* ── Progress Ring ── */

function ProgressRing({ completed, total, size = 36, color }: { completed: number; total: number; size?: number; color: string }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? Math.min(completed / total, 1) : 0;
  const offset = circumference * (1 - progress);

  const strokeColor = {
    blue: "#3b82f6", violet: "#8b5cf6", amber: "#f59e0b", rose: "#f43f5e",
    emerald: "#10b981", yellow: "#eab308", fuchsia: "#d946ef",
  }[color] || "#6b7280";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth={3}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zinc-300">
        {Math.round(progress * 100)}%
      </span>
    </div>
  );
}

/* ── Main Component ── */

export function Component() {
  const settings = useTutorStore((s) => s.settings);

  // Active module selection
  const [activeModuleId, setActiveModuleId] = useState<string>("science");
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<any | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Graph data for vault pages
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(true);

  // Study planner data
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [completedHours, setCompletedHours] = useState<Record<string, boolean>>({});

  const activeModule = STEAM_IE_MODULES.find(m => m.id === activeModuleId) || STEAM_IE_MODULES[0];
  const isConfigured = settings.industry.trim().length > 0 || settings.goal.trim().length > 0;

  // Load graph data
  useEffect(() => {
    setLoadingGraph(true);
    fetch("/api/graph")
      .then(r => r.json())
      .then(data => { setGraphData(data); setLoadingGraph(false); })
      .catch(() => setLoadingGraph(false));
  }, []);

  // Load study planner data from localStorage
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem("study_planner_lesson_plan");
      if (savedPlan) setLessonPlan(JSON.parse(savedPlan));
    } catch { /* ignore */ }
    try {
      const savedHours = localStorage.getItem("study_planner_completed_hours");
      if (savedHours) setCompletedHours(JSON.parse(savedHours));
    } catch { /* ignore */ }
  }, []);

  // Compute per-module hour allocations
  const moduleHours = useMemo(() => {
    if (lessonPlan) return parseStudyPlanHours(lessonPlan);
    // Fallback defaults
    const fallback: Record<string, number> = {};
    STEAM_IE_MODULES.forEach(m => { fallback[m.id] = m.defaultHours; });
    return fallback;
  }, [lessonPlan]);

  // Compute completed hours per module
  const moduleCompleted = useMemo(() => {
    const result: Record<string, number> = {};
    STEAM_IE_MODULES.forEach(m => {
      result[m.id] = getCompletedHoursForModule(completedHours, lessonPlan, m.id);
    });
    return result;
  }, [completedHours, lessonPlan]);

  // Filter vault pages for the active module
  const modulePages = useMemo(() => {
    if (!graphData) return [];
    const cat = activeModule.vaultCategory.toLowerCase();
    return graphData.nodes.filter((n: any) =>
      n.categories?.some((c: string) => c.toLowerCase() === cat)
    );
  }, [graphData, activeModule]);

  const filteredPages = useMemo(() => {
    if (!sidebarSearch.trim()) return modulePages;
    const q = sidebarSearch.toLowerCase();
    return modulePages.filter((p: any) =>
      p.title.toLowerCase().includes(q) || (p.summary || "").toLowerCase().includes(q)
    );
  }, [modulePages, sidebarSearch]);

  // Auto-select first page when module changes
  useEffect(() => {
    if (modulePages.length > 0) {
      setSelectedPageSlug(modulePages[0].slug);
    } else {
      setSelectedPageSlug(null);
      setPageContent(null);
    }
    setSidebarSearch("");
  }, [activeModuleId, modulePages.length]);

  // Fetch page content
  useEffect(() => {
    if (!selectedPageSlug) { setPageContent(null); return; }
    setLoadingContent(true);
    fetch(`/api/wiki/${selectedPageSlug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setPageContent(data); setLoadingContent(false); })
      .catch(() => { setPageContent(null); setLoadingContent(false); });
  }, [selectedPageSlug]);

  // Total progress
  const totalAllocated = Object.values(moduleHours).reduce((a, b) => a + b, 0);
  const totalCompleted = Object.values(moduleCompleted).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto">

      {/* ── Hero Banner (Info-tab style) ── */}
      <div className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-zinc-950 to-rose-900/40" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10 max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                STEAM-IE Learning Modules
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                {isConfigured ? (
                  <>
                    Your Learning Path:{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
                      {settings.industry || "STEAM-IE"}
                    </span>
                  </>
                ) : (
                  <>
                    Knowledge{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
                      Base
                    </span>
                  </>
                )}
              </h1>
              <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                {isConfigured
                  ? `Personalized for ${settings.difficulty} level · ${settings.goal ? `Goal: ${settings.goal}` : "Explore all STEAM-IE modules"}`
                  : "7 interdisciplinary modules covering 48 hours of structured learning across STEAM, Innovation & Entrepreneurship."
                }
              </p>
            </div>

            {/* Global Progress Summary */}
            <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <ProgressRing completed={totalCompleted} total={totalAllocated} size={44} color="violet" />
              <div>
                <p className="text-xs text-zinc-400 font-medium">Overall Progress</p>
                <p className="text-sm font-bold text-white">{totalCompleted} / {totalAllocated}h completed</p>
                <p className="text-[10px] text-zinc-500">{lessonPlan ? "Linked to Study Planner" : "Default allocation"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Unconfigured Settings Callout ── */}
      {!isConfigured && (
        <div className="mx-6 sm:mx-10 max-w-5xl xl:mx-auto mt-2 mb-0">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-300 font-semibold text-sm mb-1">Personalize Your Learning Path</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Head to{" "}
                <Link to="/tutor/settings" className="text-amber-200 underline hover:text-amber-100">Settings</Link>{" "}
                to set your industry, goals, and difficulty level. Then use the{" "}
                <Link to="/tutor/planner" className="text-amber-200 underline hover:text-amber-100">Study Planner</Link>{" "}
                to generate an AI study plan that dynamically allocates hours across these 7 modules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main 2-Column Layout ── */}
      <div className="flex h-[calc(100vh-4rem)]">

        {/* Left Sidebar: Module Navigator */}
        <aside className="w-72 border-r border-zinc-800/60 flex flex-col min-h-0 bg-zinc-900/20 shrink-0">
          <div className="p-4 border-b border-zinc-800/40 shrink-0">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Modules</h3>
            <p className="text-[10px] text-zinc-600">12 weeks · {totalAllocated}h total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {STEAM_IE_MODULES.map((mod) => {
              const isActive = activeModuleId === mod.id;
              const allocated = moduleHours[mod.id] || mod.defaultHours;
              const completed = moduleCompleted[mod.id] || 0;
              const Icon = mod.lucideIcon;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`group relative w-full text-left rounded-xl p-3 border transition-all duration-300 overflow-hidden ${
                    isActive
                      ? `bg-zinc-900/90 border-zinc-700 shadow-md`
                      : "bg-transparent border-transparent hover:bg-zinc-900/40 hover:border-zinc-800/60"
                  }`}
                >
                  {/* Active rail */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${mod.gradient} transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-zinc-300"}`}>
                          {mod.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-500">{allocated}h allocated</span>
                        <span className="text-[10px] text-zinc-600">·</span>
                        <span className="text-[10px] text-zinc-500">{completed}h done</span>
                      </div>
                    </div>
                    <ProgressRing completed={completed} total={allocated} size={30} color={mod.color} />
                  </div>
                  {/* Progress bar underneath */}
                  <div className="relative z-10 mt-2 h-1 bg-zinc-800/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${mod.gradient} transition-all duration-700 rounded-full`}
                      style={{ width: `${allocated > 0 ? Math.min((completed / allocated) * 100, 100) : 0}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom links */}
          <div className="p-3 border-t border-zinc-800/40 space-y-1.5 shrink-0">
            <Link
              to="/tutor/planner"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              Open Study Planner
            </Link>
            <Link
              to="/knowledge-center"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open Knowledge Center
            </Link>
          </div>
        </aside>

        {/* Right Main Panel */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Module Header Bar */}
          <div className="px-6 py-4 border-b border-zinc-800/40 bg-zinc-900/20 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeModule.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{activeModule.name}</h2>
                <p className="text-xs text-zinc-500">{activeModule.description.slice(0, 80)}…</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DifficultyBadge level={settings.difficulty || "Intermediate"} />
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                <Clock className="w-3 h-3" />
                {moduleHours[activeModule.id] || activeModule.defaultHours}h allocated
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 flex min-h-0">

            {/* Concepts list panel */}
            <div className="w-64 border-r border-zinc-800/40 flex flex-col min-h-0 shrink-0">
              <div className="p-3 border-b border-zinc-800/30 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Search concepts..."
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-600 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingGraph ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-900 rounded-lg h-14" />
                  ))
                ) : filteredPages.length > 0 ? (
                  filteredPages.map((page: any) => {
                    const isActive = selectedPageSlug === page.slug;
                    return (
                      <button
                        key={page.slug}
                        onClick={() => setSelectedPageSlug(page.slug)}
                        className={`group relative w-full text-left rounded-lg p-3 border transition-all duration-200 ${
                          isActive
                            ? "bg-zinc-900/90 border-zinc-700"
                            : "bg-transparent border-transparent hover:bg-zinc-900/40"
                        }`}
                      >
                        <div className={`absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b ${activeModule.gradient} transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                        <h4 className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-zinc-400"}`}>
                          {page.title}
                        </h4>
                        {page.summary && (
                          <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-1">{page.summary}</p>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-zinc-600 text-xs">
                    {sidebarSearch ? `No results for "${sidebarSearch}"` : "No vault content yet for this module."}
                  </div>
                )}
              </div>
            </div>

            {/* Reading Canvas */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingContent ? (
                <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
                  <div className="h-8 w-2/3 bg-zinc-900 rounded-lg" />
                  <div className="h-4 w-1/4 bg-zinc-900 rounded" />
                  <div className="h-px bg-zinc-900 my-6" />
                  <div className="h-4 w-full bg-zinc-900 rounded" />
                  <div className="h-4 w-full bg-zinc-900 rounded" />
                  <div className="h-4 w-5/6 bg-zinc-900 rounded" />
                </div>
              ) : pageContent ? (
                <div className="max-w-3xl mx-auto space-y-6">

                  {/* AI Personalization Insight Card */}
                  {isConfigured && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/8 to-rose-500/8 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-purple-300 font-semibold text-xs mb-1">AI Learning Insight</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed">
                            As a <span className="text-purple-200 font-medium">{settings.difficulty}</span> learner
                            {settings.industry && <> in <span className="text-rose-200 font-medium">{settings.industry}</span></>}
                            {settings.goal && <>, working toward <span className="text-amber-200 font-medium">"{settings.goal}"</span></>}
                            — focus on understanding how <span className="text-white font-medium">{pageContent.title}</span> connects to your industry applications and innovation strategy.
                            {settings.interests && <> Your interests in <span className="text-cyan-200 font-medium">{settings.interests}</span> will find direct relevance here.</>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Article Content */}
                  <article className="prose-wiki prose-invert">
                    <h1 className="text-3xl font-display font-light text-white mb-2 leading-tight">
                      {pageContent.title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.max(1, Math.round((pageContent.contentMarkdown?.split(/\s+/).length || 0) / 200))} min read</span>
                      <span>·</span>
                      <span>{(pageContent.contentMarkdown?.split(/\s+/).length || 0).toLocaleString()} words</span>
                      <span>·</span>
                      <DifficultyBadge level={settings.difficulty || "Intermediate"} />
                      <span>·</span>
                      <Link to={`/wiki/${pageContent.slug}`} className="underline text-purple-400 hover:text-purple-300">
                        Open in Wiki →
                      </Link>
                    </div>

                    <div className="h-px bg-zinc-800/80 mb-8" />

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ ...props }) => <h1 className="text-2xl font-display font-light mb-4 mt-8 text-white border-b border-zinc-800/60 pb-2" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-xl font-display font-light mb-3 mt-6 text-zinc-100" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-lg font-display font-light mb-2 mt-5 text-zinc-200" {...props} />,
                        p: ({ ...props }) => <p className="mb-4 text-zinc-300 leading-relaxed text-sm" {...props} />,
                        ul: ({ ...props }) => <ul className="mb-4 list-disc pl-5 space-y-1 text-sm text-zinc-300" {...props} />,
                        ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-1 text-sm text-zinc-300" {...props} />,
                        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                        a: ({ ...props }) => <a className="text-purple-400 hover:text-purple-300 underline" {...props} />,
                        blockquote: ({ ...props }) => <blockquote className="border-l-2 border-purple-500/40 pl-4 my-4 text-zinc-400 italic text-sm" {...props} />,
                        code: ({ ...props }) => <code className="bg-zinc-900 border border-zinc-800 text-purple-300 rounded px-1.5 py-0.5 text-xs font-mono" {...props} />,
                        pre: ({ ...props }) => <pre className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 overflow-x-auto my-4 font-mono text-xs text-zinc-300" {...props} />,
                      }}
                    >
                      {pageContent.contentMarkdown}
                    </ReactMarkdown>
                  </article>

                  {/* ── Rich Media & Action Cards ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">

                    {/* Video Lecture Card */}
                    <div className="group relative rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer">
                      <div className={`h-28 bg-gradient-to-br ${activeModule.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%]">
                        <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-white mb-1">Video Lecture</h4>
                        <p className="text-[11px] text-zinc-500">Foundations of {pageContent.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">~12 min</span>
                          <span className="text-[10px] text-zinc-600">Coming soon</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Diagram Card */}
                    <Link
                      to="/tutor/visualize"
                      className="group relative rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all hover:shadow-lg hover:shadow-rose-500/5"
                    >
                      <div className="h-28 bg-gradient-to-br from-rose-500/15 to-fuchsia-500/15 group-hover:from-rose-500/25 group-hover:to-fuchsia-500/25 transition-colors flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-rose-400/40 group-hover:text-rose-400/60 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-white mb-1">Visual Diagram</h4>
                        <p className="text-[11px] text-zinc-500">Generate a concept map for {pageContent.title}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium mt-2">
                          Open Visualize → <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>

                    {/* Quiz Shortcut */}
                    <Link
                      to="/tutor/quiz"
                      className="group rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 p-4 transition-all hover:shadow-lg hover:shadow-green-500/5 flex items-start gap-3"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Test Your Knowledge</h4>
                        <p className="text-[11px] text-zinc-500">Take a quiz on {activeModule.name} concepts</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-medium mt-1">
                          Open Quiz → <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>

                    {/* Flashcards Shortcut */}
                    <Link
                      to="/tutor/flashcards"
                      className="group rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 p-4 transition-all hover:shadow-lg hover:shadow-indigo-500/5 flex items-start gap-3"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Create Flashcards</h4>
                        <p className="text-[11px] text-zinc-500">Practice active recall on {activeModule.name}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-medium mt-1">
                          Open Flashcards → <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 text-center pb-8">
                    <div className="inline-flex items-center gap-2 text-zinc-600 text-xs">
                      <span className="w-8 h-px bg-zinc-800" />
                      Fad Tutor · {activeModule.name} Module · STEAM-IE
                      <span className="w-8 h-px bg-zinc-800" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state — no page selected */
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600">
                  <BookOpen className="w-10 h-10 mb-4 text-zinc-700" />
                  <p className="text-sm font-medium mb-1">No content available</p>
                  <p className="text-xs">
                    {modulePages.length === 0
                      ? `No vault pages found for the ${activeModule.name} category. Add markdown files to the "${activeModule.vaultCategory}" folder in your vault.`
                      : "Select a concept from the list to begin reading."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
