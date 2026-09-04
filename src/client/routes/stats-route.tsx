import { useState, useEffect } from "react";
import { useLoaderData, Link, redirect } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  Award, 
  Layers, 
  FileText, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Search, 
  FolderKanban,
  FileCheck2,
  GraduationCap
} from "lucide-react";

import { useWikiConfig } from "@/client/wiki-config";
import { Navbar } from "@/components/navbar";
import type { WikiStats } from "@/lib/wiki-shared";
import { ChangeVaultLink } from "@/components/change-vault-link";
import { useTutorStore } from "@/client/store/tutor-store";
import { TutorFooter } from "@/client/routes/tutor/tutor-footer";

import { fetchJson, isSetupRequiredResponse } from "../api";
import { RouteErrorBoundary } from "../route-error-boundary";

export async function loader() {
  try {
    return await fetchJson<WikiStats>("/api/stats");
  } catch (error) {
    if (isSetupRequiredResponse(error)) {
      throw redirect("/setup");
    }

    throw error;
  }
}

export function Component() {
  const stats = useLoaderData() as WikiStats;
  const config = useWikiConfig();
  const { settings } = useTutorStore();

  // Saved notes from Tutor API
  const [savedNotesCount, setSavedNotesCount] = useState<number>(stats.total_notes || 0);

  // LocalStorage stats for Tutor progress tracking
  const [completedHoursCount, setCompletedHoursCount] = useState<number>(0);
  const [flashcardsStudiedCount, setFlashcardsStudiedCount] = useState<number>(0);
  const [quizAnswersCount, setQuizAnswersCount] = useState<number>(0);

  useEffect(() => {
    // Fetch latest notes count from Tutor API
    fetch('/api/tutor/notes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedNotesCount(data.length);
        }
      })
      .catch(console.error);

    // Read client progress metrics from localStorage
    try {
      const hoursSaved = localStorage.getItem("study_planner_completed_hours");
      if (hoursSaved) {
        const parsed = JSON.parse(hoursSaved);
        setCompletedHoursCount(Object.values(parsed).filter(Boolean).length);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const flashcardsSaved = localStorage.getItem("tutor_flashcards_studied");
      if (flashcardsSaved) {
        const parsed = JSON.parse(flashcardsSaved);
        setFlashcardsStudiedCount(Object.values(parsed).filter(Boolean).length);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const quizSaved = localStorage.getItem("study_planner_quiz_answers");
      if (quizSaved) {
        const parsed = JSON.parse(quizSaved);
        setQuizAnswersCount(Object.keys(parsed).length);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Preserved original stat cards
  const statCards = [
    {
      label: "Pages",
      value: stats.total_pages.toLocaleString(),
      accent: "var(--teal)",
      soft: "var(--teal-soft)",
      icon: BookOpen,
      desc: "Total Vault Markdown Pages"
    },
    {
      label: "Words",
      value: stats.total_words.toLocaleString(),
      accent: "var(--peach)",
      soft: "var(--peach-soft)",
      icon: FileText,
      desc: "Total Synthesized Word Count"
    },
    {
      label: "Avg. Words",
      value: (stats.total_pages > 0
        ? Math.round(stats.total_words / stats.total_pages)
        : 0
      ).toLocaleString(),
      accent: "var(--lavender)",
      soft: "var(--lavender-soft)",
      icon: BarChart3,
      desc: "Average Density per Document"
    },
    {
      label: "Top Links",
      value: (stats.top_backlinks[0]?.count ?? 0).toLocaleString(),
      accent: "var(--teal)",
      soft: "var(--teal-soft)",
      icon: Zap,
      desc: "Max Inbound Backlinks Count"
    },
  ];

  const barAccents = ["var(--teal)", "var(--peach)", "var(--lavender)", "#8b5cf6", "#ec4899", "#10b981"];

  const syllabusProgressPct = Math.min(100, Math.round((completedHoursCount / 48) * 100));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans">
      <Navbar totalPages={stats.total_pages} extraRightContent={<ChangeVaultLink />} />

      <main
        className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 flex-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3rem)" }}
      >
        <div className="space-y-8 animate-in">
          
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-900/40 p-6 sm:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-rose-900/15 opacity-60 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  {config.homepage.labels.statsEyebrow}
                </span>
                <h1 className="mt-3 font-display text-3xl sm:text-5xl font-light tracking-tight text-white">
                  {config.navigation.statsLabel}
                </h1>
                <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                  {config.homepage.labels.statsDescription}
                </p>
              </div>

              {/* Quick Summary Pill Badges */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Active Domain</div>
                    <div className="text-xs font-medium text-purple-300 truncate max-w-[140px]">
                      {settings.industry || "STEAM-IE General"}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Syllabus Progress</div>
                    <div className="text-xs font-medium text-emerald-400">
                      {completedHoursCount} / 48 hrs ({syllabusProgressPct}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BENTO GRID LAYOUT (2 Columns) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT COLUMN (6 cols): Vault & Knowledge Center Metrics ── */}
            <div className="lg:col-span-6 space-y-6">

              {/* 1. Preserved 4 Stat Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Vault Knowledge Metrics
                  </h2>
                  <span className="text-xs text-zinc-600 font-mono">{stats.total_pages} Documents</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {statCards.map((card) => {
                    const IconComp = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-zinc-800/80 bg-zinc-900/60 shadow-lg group hover:bg-zinc-900/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <div
                          aria-hidden
                          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity"
                          style={{ background: card.soft }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: card.accent }}
                              />
                              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                {card.label}
                              </p>
                            </div>
                            <IconComp className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                          </div>
                          <p className="mt-2 font-display text-2xl sm:text-4xl leading-tight text-white font-light">
                            {card.value}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500 font-normal">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. STEAM-IE Category Distribution Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      STEAM-IE Category Breakdown
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {stats.categories?.length ?? 0} Categories
                  </span>
                </div>

                {stats.categories && stats.categories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.categories.map((cat, idx) => {
                      const maxCount = stats.categories![0]?.count || 1;
                      const pct = Math.max(12, Math.round((cat.count / maxCount) * 100));
                      const color = barAccents[idx % barAccents.length];
                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300 font-medium">{cat.name}</span>
                            <span className="text-zinc-500 font-mono">{cat.count} pages</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/60">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-500 italic">
                    Categorized vault pages will appear here.
                  </div>
                )}
              </div>

              {/* 3. Preserved "Most Backlinked Concepts" Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--lavender)] shadow-[0_0_12px_var(--lavender)]" />
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Most Backlinked Concepts
                  </p>
                </div>
                <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
                  {stats.top_backlinks.map((item, index) => {
                    const accent = barAccents[index % barAccents.length];
                    const widthPct = Math.max(
                      10,
                      (item.count / (stats.top_backlinks[0]?.count ?? 1)) * 100,
                    );
                    return (
                      <div
                        key={item.page}
                        className={`relative flex items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4 ${
                          index > 0 ? "border-t border-zinc-800/80" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold text-white shadow-sm"
                            style={{ background: accent }}
                          >
                            {index + 1}
                          </span>
                          <span className="truncate font-display text-[0.95rem] text-zinc-200 sm:text-[1rem]">
                            {item.page}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                          <div className="relative hidden h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800 sm:block sm:w-32">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ width: `${widthPct}%`, background: accent }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-xs font-semibold text-zinc-300 sm:w-10">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (6 cols): Tutor & Industry Intelligence ── */}
            <div className="lg:col-span-6 space-y-6">

              {/* 1. Active Persona & Industry KPI Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      Learner Profile & Industry
                    </h3>
                  </div>
                  <Link 
                    to="/tutor/settings" 
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    Edit Profile →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1">Primary Industry</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {settings.industry || <span className="text-zinc-500 italic">Not set</span>}
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1">Secondary Sub-domain</span>
                    <span className="text-zinc-200 font-semibold text-sm">
                      {settings.secondaryIndustry || <span className="text-zinc-500 italic">Not set</span>}
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1">Target Difficulty</span>
                    <span className="text-rose-300 font-semibold text-sm">
                      {settings.difficulty || "Intermediate"}
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1">Personalized Goal</span>
                    <span className="text-zinc-300 text-xs line-clamp-2" title={settings.goal}>
                      {settings.goal ? `🎯 ${settings.goal}` : <span className="text-zinc-500 italic">No goal set</span>}
                    </span>
                  </div>
                </div>

                {settings.interests && (
                  <div className="bg-purple-950/20 border border-purple-800/30 p-3 rounded-2xl text-xs text-purple-300">
                    <span className="text-purple-400 font-semibold">Interests Context:</span> {settings.interests}
                  </div>
                )}
              </div>

              {/* 2. Study Roadmap & Syllabus Mastery Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      Study Roadmap & Syllabus
                    </h3>
                  </div>
                  <Link 
                    to="/tutor/planner" 
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    Open Planner →
                  </Link>
                </div>

                <div className="flex items-center gap-6">
                  {/* Circular Progress Gauge */}
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500 transition-all duration-700"
                        strokeDasharray={`${syllabusProgressPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-base font-extrabold text-white">{syllabusProgressPct}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs text-zinc-400">
                      Syllabus Hours Completed: <span className="text-emerald-400 font-semibold">{completedHoursCount} / 48 hrs</span>
                    </div>
                    <div className="text-xs text-zinc-500 leading-relaxed">
                      12-Week AI Smart Curriculum customized to your profile.
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <Link 
                        to="/tutor/progress" 
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                        Mastery Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Flashcards & Practice Performance Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      Practice & Active Recall
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/tutor/flashcards" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Flashcards
                    </Link>
                    <span className="text-zinc-700">•</span>
                    <Link to="/tutor/quiz" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Quizzes
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Flashcards Reviewed</div>
                      <div className="text-2xl font-light text-blue-400 mt-1">{flashcardsStudiedCount}</div>
                    </div>
                    <Layers className="w-6 h-6 text-blue-500/20" />
                  </div>

                  <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Quiz Questions Answered</div>
                      <div className="text-2xl font-light text-emerald-400 mt-1">{quizAnswersCount}</div>
                    </div>
                    <FileCheck2 className="w-6 h-6 text-emerald-500/20" />
                  </div>
                </div>
              </div>

              {/* 4. Research & Workspace Activity Card */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      Vault Notes & Workspace Activity
                    </h3>
                  </div>
                  <Link to="/tutor/notebook" className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
                    Open Notebook →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Saved Vault Notes</div>
                    <div className="text-2xl font-light text-rose-400 mt-1">{savedNotesCount}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Stored in notes/</div>
                  </div>

                  <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Interactive Tools</div>
                      <div className="text-xs text-zinc-300 mt-1 font-medium">Research, Co-Writer & Visualize</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link to="/tutor/research" className="text-[11px] text-purple-400 hover:underline">Research</Link>
                      <span className="text-zinc-700">•</span>
                      <Link to="/tutor/cowriter" className="text-[11px] text-emerald-400 hover:underline">Co-Writer</Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <TutorFooter />
    </div>
  );
}

export const ErrorBoundary = RouteErrorBoundary;
