import { useState, useMemo, useEffect } from "react";
import { useLoaderData, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  BookOpen,
  HelpCircle,
  Search,
  Compass,
  ArrowRight,
  Sun,
  Moon,
  GraduationCap,
  Share2,
  BarChart3,
  Brain,
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { TutorFooter } from "@/client/routes/tutor/tutor-footer";
import { fetchJson } from "../api";
import { RouteErrorBoundary } from "../route-error-boundary";

interface HelpData {
  content: string;
}

export async function loader(): Promise<HelpData> {
  try {
    const data = await fetchJson<{ content: string }>("/api/help");
    return data;
  } catch (error) {
    console.warn("Could not load /api/help dynamically, using fallback:", error);
    return {
      content: "# Fad.Wiki & STEAM-IE Help Guide\n\nFailed to load help file from server.",
    };
  }
}

interface NavSection {
  id: string;
  title: string;
  path?: string;
  icon: any;
}

// Hero section quick jump items (top-level anchors)
const HERO_JUMP_SECTIONS: NavSection[] = [
  { id: "1-system-architecture--core-philosophy", title: "Architecture", icon: Brain },
  { id: "2-global-navigation-bar-menu-bar", title: "Global Menu Bar", icon: Compass },
  { id: "3-home-page-", title: "Home Page", path: "/", icon: BookOpen },
  { id: "4-knowledge-center-knowledge-center", title: "Knowledge Center", path: "/knowledge-center", icon: Sparkles },
  { id: "5-fad-tutor-suite-tutor", title: "Fad Tutor Suite", path: "/tutor", icon: GraduationCap },
  { id: "6-global-knowledge-graph-graph", title: "Knowledge Graph", path: "/graph", icon: Share2 },
  { id: "7-analytics--bento-stats-stats", title: "Analytics & Stats", path: "/stats", icon: BarChart3 },
  { id: "8-wiki-document-hub-wikislug", title: "Wiki Hub", icon: BookOpen },
  { id: "9-web-clipper--knowledge-ingestion-workflow", title: "Web Clipper", icon: Sparkles },
  { id: "10-frequently-asked-questions--tips", title: "FAQ & Tips", icon: HelpCircle },
];

// Full sidebar TOC items (including sub-modules)
const QUICK_NAV_SECTIONS: NavSection[] = [
  { id: "1-system-architecture--core-philosophy", title: "1. Architecture & Philosophy", icon: Brain },
  { id: "2-global-navigation-bar-menu-bar", title: "2. Global Menu Bar", icon: Compass },
  { id: "3-home-page-", title: "3. Home Page", path: "/", icon: BookOpen },
  { id: "4-knowledge-center-knowledge-center", title: "4. Knowledge Center", path: "/knowledge-center", icon: Sparkles },
  { id: "5-fad-tutor-suite-tutor", title: "5. Fad Tutor Suite", path: "/tutor", icon: GraduationCap },
  { id: "study-planner--syllabus-tutorplanner", title: "Study Planner", path: "/tutor/planner", icon: Layers },
  { id: "flashcards--active-recall-tutorflashcards", title: "Flashcards Lab", path: "/tutor/flashcards", icon: FileText },
  { id: "interactive-quiz-lab-tutorquiz", title: "Quiz Lab", path: "/tutor/quiz", icon: CheckCircle2 },
  { id: "ai-research-assistant-tutorresearch", title: "AI Research", path: "/tutor/research", icon: Search },
  { id: "co-writer--essay-lab-tutorcowriter", title: "Co-Writer Lab", path: "/tutor/cowriter", icon: FileText },
  { id: "diagram--concept-visualizer-tutorvisualize", title: "Concept Visualizer", path: "/tutor/visualize", icon: Share2 },
  { id: "smart-notebook-tutornotebook", title: "Smart Notebook", path: "/tutor/notebook", icon: BookOpen },
  { id: "mastery-analytics--progress-tutorprogress", title: "Mastery Progress", path: "/tutor/progress", icon: BarChart3 },
  { id: "ai-socratic-chat-companion-tutorchat", title: "Socratic Chat", path: "/tutor/chat", icon: Brain },
  { id: "learner-settings--profile-tutorsettings", title: "Learner Settings", path: "/tutor/settings", icon: Compass },
  { id: "6-global-knowledge-graph-graph", title: "6. Knowledge Graph", path: "/graph", icon: Share2 },
  { id: "7-analytics--bento-stats-stats", title: "7. Analytics & Stats", path: "/stats", icon: BarChart3 },
  { id: "8-wiki-document-hub-wikislug", title: "8. Wiki Document Hub", icon: BookOpen },
  { id: "9-web-clipper--knowledge-ingestion-workflow", title: "9. Web Clipper Workflow", icon: Sparkles },
  { id: "10-frequently-asked-questions--tips", title: "10. FAQ & Tips", icon: HelpCircle },
];

/**
 * Recursively extracts plain text from React nodes (including arrays and child components like `<code>`)
 */
function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText(node.props?.children);
  }
  return "";
}

/**
 * Generates both GitHub-style anchor slug and normalized aliases for a heading
 */
function getHeadingIds(node: any): string[] {
  const rawText = extractText(node);
  const lower = rawText.toLowerCase().trim();

  // 1. GitHub-style anchor: removes non-alphanumeric, preserves spaces as hyphens
  // In GitHub, characters like '&' are stripped, leaving surrounding spaces which turn into '--'
  const githubSlug = lower
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-");

  // 2. Clean single-hyphen slug
  const cleanSlug = lower
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+$/, "");

  // 3. Number-based section slug (e.g. "section-1", "section-2", etc.)
  const numMatch = lower.match(/^(\d+)\./);
  const numSlug = numMatch ? `section-${numMatch[1]}` : "";

  return Array.from(new Set([githubSlug, cleanSlug, numSlug].filter(Boolean)));
}

export function Component() {
  const { content } = useLoaderData() as HelpData;
  const [readerTheme, setReaderTheme] = useState<"light" | "dark">("light");
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  // Calculate reading stats
  const wordsCount = useMemo(() => content.trim().split(/\s+/).length, [content]);
  const estimatedReadTime = useMemo(() => Math.max(1, Math.round(wordsCount / 200)), [wordsCount]);

  // Track scroll position for TOC
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h1[id], h2[id], h3[id]");
      let currentId = "";
      headings.forEach((h) => {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 140) {
          currentId = h.id;
        }
      });
      if (currentId) setActiveHeadingId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Resilient section scroller with multi-stage matching and offset calculation
   */
  const scrollToSection = (targetId: string, title?: string) => {
    if (!targetId && !title) return;

    // 1. Direct ID lookup
    let element = document.getElementById(targetId);

    // 2. Normalized ID lookup (single-hyphen fallback)
    if (!element) {
      const cleanTarget = targetId.replace(/-+/g, "-").replace(/-+$/, "");
      element = document.getElementById(cleanTarget);
    }

    // 3. Search via data-aliases attribute
    if (!element) {
      element = document.querySelector(`[data-aliases*="${targetId}"]`) as HTMLElement;
    }

    // 4. Search headings by title text content
    if (!element && title) {
      const headings = document.querySelectorAll("h1, h2, h3, h4");
      const cleanTitle = title.replace(/^\d+\.\s*/, "").toLowerCase().trim();
      for (const h of headings) {
        const text = (h.textContent || "").toLowerCase().trim();
        if (text.includes(cleanTitle) || cleanTitle.includes(text)) {
          element = h as HTMLElement;
          break;
        }
      }
    }

    // 5. Search headings by leading section number (e.g. "3" for "3. Home Page")
    if (!element) {
      const numMatch = targetId.match(/^(\d+)/);
      if (numMatch) {
        const num = numMatch[1];
        const headings = document.querySelectorAll("h2");
        for (const h of headings) {
          const text = (h.textContent || "").trim();
          if (text.startsWith(`${num}.`) || text.startsWith(`${num} `)) {
            element = h as HTMLElement;
            break;
          }
        }
      }
    }

    if (element) {
      // Calculate scroll offset taking the sticky navbar into account
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      if (element.id) {
        setActiveHeadingId(element.id);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans">
      <Navbar subtitle="User Manual" />

      {/* Hero Header Banner */}
      <div className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/15 via-indigo-900/20 to-purple-900/15 opacity-70 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                System Guide & User Manual
              </div>
              <h1 className="mt-3 text-3xl sm:text-5xl font-extralight tracking-tight text-white font-display">
                Fad.Wiki & <span className="bg-gradient-to-r from-teal-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-normal">STEAM-IE Guide</span>
              </h1>
              <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Extensive documentation describing every section, card, and interactive tool across the platform. Click any highlighted link to navigate directly to that section.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Estimated Read</div>
                  <div className="text-xs font-semibold text-teal-300">
                    {estimatedReadTime} min ({wordsCount.toLocaleString()} words)
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Live Jump Links</div>
                  <div className="text-xs font-semibold text-purple-300">
                    15 Direct Shortcuts
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Pills in Hero */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] shrink-0 mr-1">
              Jump To:
            </span>
            {HERO_JUMP_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id, sec.title)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 hover:border-teal-500/50 text-zinc-300 hover:text-white transition-all text-xs font-medium shadow-sm hover:shadow-teal-500/10 active:scale-95 cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-400" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Documentation Body (Two Columns) */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT COLUMN (4 cols): Sticky Sidebar Navigation & Shortcuts ── */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Live App Navigation Shortcuts Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Direct Section Shortcuts
                  </h3>
                </div>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-mono">
                  Interactive
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any shortcut below to navigate directly to that live section in the application:
              </p>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {QUICK_NAV_SECTIONS.filter((s) => s.path).map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <Link
                      key={sec.title}
                      to={sec.path!}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-teal-500/40 text-xs text-zinc-300 hover:text-white transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="font-medium truncate">{sec.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-teal-300 shrink-0 font-mono">
                        <span>{sec.path}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sticky Table of Contents */}
            <div className="sticky top-20 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Table of Contents
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {QUICK_NAV_SECTIONS.length} Sections
                </span>
              </div>

              <nav className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                {QUICK_NAV_SECTIONS.map((sec) => {
                  const isActive = activeHeadingId === sec.id || activeHeadingId.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id, sec.title)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-teal-400" : "bg-zinc-700"}`} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-zinc-800/80">
                <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-3 text-[11px] text-purple-300 leading-relaxed">
                  💡 <span className="font-semibold text-purple-200">Tip:</span> Click any button above or in the hero banner to smoothly jump to that section.
                </div>
              </div>
            </div>

          </aside>

          {/* ── RIGHT COLUMN (8 cols): Document Reading Pane ── */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Reading Toolbar */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  help.md Document Reader
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={() => setReaderTheme((prev) => (prev === "light" ? "dark" : "light"))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 transition-all shadow-sm cursor-pointer"
                  title={`Switch to ${readerTheme === "light" ? "Dark" : "Light"} reading mode`}
                >
                  {readerTheme === "light" ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Dark view</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light view</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document Content Paper Card */}
            <div
              className={`rounded-3xl shadow-2xl border transition-colors duration-300 p-6 sm:p-12 ${
                readerTheme === "light"
                  ? "bg-white border-slate-200/90 text-zinc-900 shadow-slate-200/50"
                  : "bg-zinc-900/70 border-zinc-800 text-zinc-100"
              }`}
            >
              <article className={`prose-wiki max-w-none pb-12 ${readerTheme === "dark" ? "prose-invert" : ""}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children, ...props }) => {
                      const ids = getHeadingIds(children);
                      const primaryId = ids[0] || "title";
                      return (
                        <h1
                          id={primaryId}
                          data-aliases={ids.join(" ")}
                          className={`text-3xl sm:text-4xl font-display font-light mb-4 mt-8 pb-3 border-b scroll-mt-24 ${
                            readerTheme === "light"
                              ? "text-zinc-900 border-zinc-200"
                              : "text-white border-zinc-800"
                          }`}
                          {...props}
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ children, ...props }) => {
                      const ids = getHeadingIds(children);
                      const primaryId = ids[0] || "section";
                      const text = extractText(children);
                      return (
                        <h2
                          id={primaryId}
                          data-aliases={ids.join(" ")}
                          className={`text-2xl font-display font-normal mb-3 mt-10 pb-2 border-b scroll-mt-24 flex items-center justify-between group ${
                            readerTheme === "light"
                              ? "text-zinc-900 border-zinc-200"
                              : "text-zinc-100 border-zinc-800"
                          }`}
                          {...props}
                        >
                          <span>{children}</span>
                          <a
                            href={`#${primaryId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(primaryId, text);
                            }}
                            className="text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Anchor link"
                          >
                            #
                          </a>
                        </h2>
                      );
                    },
                    h3: ({ children, ...props }) => {
                      const ids = getHeadingIds(children);
                      const primaryId = ids[0] || "sub-section";
                      return (
                        <h3
                          id={primaryId}
                          data-aliases={ids.join(" ")}
                          className={`text-xl font-display font-medium mb-2 mt-6 scroll-mt-24 ${
                            readerTheme === "light" ? "text-zinc-900" : "text-zinc-100"
                          }`}
                          {...props}
                        >
                          {children}
                        </h3>
                      );
                    },
                    h4: ({ ...props }) => (
                      <h4
                        className={`text-base font-semibold mb-2 mt-4 ${
                          readerTheme === "light" ? "text-zinc-900" : "text-zinc-200"
                        }`}
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p
                        className={`mb-4 leading-relaxed text-[15px] ${
                          readerTheme === "light" ? "text-zinc-700" : "text-zinc-300"
                        }`}
                        {...props}
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        className={`mb-4 list-disc pl-6 space-y-1.5 text-[15px] ${
                          readerTheme === "light" ? "text-zinc-700" : "text-zinc-300"
                        }`}
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className={`mb-4 list-decimal pl-6 space-y-1.5 text-[15px] ${
                          readerTheme === "light" ? "text-zinc-700" : "text-zinc-300"
                        }`}
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                    a: ({ href, children, ...props }) => {
                      // Internal TOC hash links
                      if (href && href.startsWith("#")) {
                        const targetId = href.slice(1);
                        const text = extractText(children);
                        return (
                          <a
                            href={href}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(targetId, text);
                            }}
                            className={`font-medium hover:underline cursor-pointer ${
                              readerTheme === "light"
                                ? "text-teal-700 hover:text-teal-900"
                                : "text-teal-400 hover:text-teal-300"
                            }`}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      }

                      // Internal page route links (e.g. /knowledge-center, /tutor)
                      const isInternal = href && href.startsWith("/");
                      if (isInternal) {
                        return (
                          <Link
                            to={href}
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                              readerTheme === "light"
                                ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:text-teal-900"
                                : "bg-teal-950/40 text-teal-300 border-teal-800/60 hover:bg-teal-900/60 hover:text-teal-200"
                            }`}
                            {...props}
                          >
                            <span>{children}</span>
                            <ArrowRight className="w-3 h-3 shrink-0" />
                          </Link>
                        );
                      }

                      // External links
                      return (
                        <a
                          href={href}
                          target={href?.startsWith("http") ? "_blank" : undefined}
                          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                          className={`underline underline-offset-2 font-medium ${
                            readerTheme === "light"
                              ? "text-indigo-600 hover:text-indigo-800"
                              : "text-indigo-400 hover:text-indigo-300"
                          }`}
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className={`border-l-4 my-5 px-4 py-2.5 rounded-r-xl italic ${
                          readerTheme === "light"
                            ? "border-teal-500 bg-teal-50/70 text-zinc-700"
                            : "border-teal-500 bg-teal-950/20 text-zinc-300"
                        }`}
                        {...props}
                      />
                    ),
                    code: ({ ...props }) => (
                      <code
                        className={`rounded px-1.5 py-0.5 text-xs font-mono font-medium border ${
                          readerTheme === "light"
                            ? "bg-zinc-100 border-zinc-200 text-purple-700"
                            : "bg-zinc-900 border-zinc-800 text-purple-300"
                        }`}
                        {...props}
                      />
                    ),
                    pre: ({ ...props }) => (
                      <pre
                        className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl p-5 overflow-x-auto my-5 font-mono text-xs shadow-inner leading-relaxed"
                        {...props}
                      />
                    ),
                    table: ({ ...props }) => (
                      <div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <table className="w-full border-collapse text-sm" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th
                        className={`p-3 text-left font-semibold border-b ${
                          readerTheme === "light"
                            ? "bg-zinc-100 border-zinc-200 text-zinc-900"
                            : "bg-zinc-900 border-zinc-800 text-zinc-200"
                        }`}
                        {...props}
                      />
                    ),
                    td: ({ ...props }) => (
                      <td
                        className={`p-3 border-b ${
                          readerTheme === "light"
                            ? "border-zinc-100 text-zinc-700"
                            : "border-zinc-800/60 text-zinc-300"
                        }`}
                        {...props}
                      />
                    ),
                    hr: ({ ...props }) => (
                      <hr
                        className={`my-8 ${readerTheme === "light" ? "border-zinc-200" : "border-zinc-800"}`}
                        {...props}
                      />
                    ),
                    strong: ({ ...props }) => (
                      <strong
                        className={`font-semibold ${readerTheme === "light" ? "text-zinc-900" : "text-white"}`}
                        {...props}
                      />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            </div>

          </div>

        </div>
      </main>

      <TutorFooter />
    </div>
  );
}

export const ErrorBoundary = RouteErrorBoundary;
