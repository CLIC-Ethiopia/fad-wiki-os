import { useState, useEffect, type ReactNode } from "react";
import { Link, useRevalidator } from "react-router-dom";
import {
  BookOpen,
  Brain,
  GraduationCap,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { useWikiConfig } from "@/client/wiki-config";
import { WebClipperModal } from "./web-clipper-modal";
import { RecommenderModal } from "./recommender-modal";

export interface NavbarProps {
  totalPages?: number;
  subtitle?: string;
  hideBrandTitle?: boolean;
  onBrandClick?: (event: React.MouseEvent) => void;
  extraRightContent?: ReactNode;
}

export function Navbar({
  totalPages,
  subtitle,
  hideBrandTitle = false,
  onBrandClick,
  extraRightContent,
}: NavbarProps) {
  const config = useWikiConfig();
  const { revalidate, state: revalidationState } = useRevalidator();

  const [showWebClipper, setShowWebClipper] = useState(false);
  const [clipperInitialUrl, setClipperInitialUrl] = useState("");
  const [clipperInitialFolder, setClipperInitialFolder] = useState("/");
  const [showRecommender, setShowRecommender] = useState(false);

  const [articlesCount, setArticlesCount] = useState<number | null>(
    totalPages ?? null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update articlesCount when totalPages prop changes
  useEffect(() => {
    if (totalPages !== undefined) {
      setArticlesCount(totalPages);
    }
  }, [totalPages]);

  // Fetch initial articles count if not provided
  useEffect(() => {
    if (articlesCount !== null) return;

    let isMounted = true;
    fetch("/api/home")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.totalPages != null) {
          setArticlesCount(data.totalPages);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [articlesCount]);

  const isRevalidating = revalidationState === "loading";
  const refreshBusy = isRefreshing || isRevalidating;

  const handleRefresh = async () => {
    if (refreshBusy) return;
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/admin/reindex", { method: "POST" });
      const data = await response.json();
      if (data?.totalPages != null) {
        setArticlesCount(data.totalPages);
      }
      revalidate();
    } catch {
      revalidate();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {showWebClipper && (
        <WebClipperModal
          onClose={() => {
            setShowWebClipper(false);
            setClipperInitialUrl("");
            setClipperInitialFolder("/");
          }}
          onRefresh={handleRefresh}
          initialUrl={clipperInitialUrl}
          initialFolder={clipperInitialFolder}
          isStacked={showRecommender}
        />
      )}
      {showRecommender && (
        <RecommenderModal
          onClose={() => setShowRecommender(false)}
          onClipSource={(url, folder) => {
            setClipperInitialUrl(url);
            setClipperInitialFolder(folder);
            setShowWebClipper(true);
          }}
        />
      )}

      <header className="sticky top-0 z-50 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between gap-2 px-4 py-3 sm:px-6 transition-all duration-300 relative shrink-0">
        {/* Left Group */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Logo Button: Fad.Wiki */}
          <Link
            to="/"
            onClick={onBrandClick}
            className="flex items-center gap-2 font-display text-sm sm:text-base font-bold text-white transition-all bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:via-teal-500 hover:to-indigo-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg active:scale-95 border border-white/10 shrink-0 group"
            title="Return to Home Page"
          >
            <Brain className="h-4 w-4 text-cyan-200 shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className="tracking-wide">{config.siteTitle}</span>
            {subtitle && (
              <span className="text-cyan-200/80 font-light text-xs ml-1 border-l border-white/20 pl-2 hidden md:inline">
                {subtitle}
              </span>
            )}
          </Link>

          {/* Button 1: Add new source */}
          <button
            type="button"
            onClick={() => setShowWebClipper(true)}
            className="flex items-center gap-2 text-sm font-medium text-white transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 rounded-lg shadow-md hover:shadow-lg active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add new source</span>
          </button>

          {/* Button 2: Recommender Engine */}
          <button
            type="button"
            onClick={() => setShowRecommender(true)}
            className="flex items-center gap-2 text-sm font-medium text-white transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 rounded-lg shadow-md hover:shadow-lg active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Recommender Engine</span>
          </button>
        </div>

        {/* Center Item - Button 3: Knowledge Center */}
        <Link
          to="/knowledge-center"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-semibold text-white transition-all px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 overflow-hidden group z-10"
          style={{
            background:
              "linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #10b981 100%)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <BookOpen className="h-4 w-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">
            Knowledge Center
          </span>
        </Link>

        {/* Right Group */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Button 4: Fad.Tutor */}
          <Link
            to="/tutor"
            className="flex items-center gap-2 rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Fad.Tutor</span>
          </Link>

          {/* Button 5: Articles Count / Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshBusy}
            title="Refresh wiki count"
            className="flex items-center gap-1.5 rounded-lg text-white transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 text-xs shadow-md hover:shadow-lg active:scale-95 disabled:cursor-wait disabled:opacity-75 sm:gap-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-white ${
                refreshBusy ? "animate-spin" : ""
              }`}
            />
            <span className="font-semibold tabular-nums">
              {articlesCount !== null ? articlesCount.toLocaleString() : "..."}
            </span>
            <span className="hidden sm:inline">Articles</span>
          </button>

          {/* Button 6: Graph */}
          <Link
            to="/graph"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.graphLabel || "Graph"}
          </Link>

          {/* Button 7: Stats */}
          <Link
            to="/stats"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-3.5 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.statsLabel || "Stats"}
          </Link>

          {/* Button 8: Help Guide */}
          <Link
            to="/help"
            className="flex items-center gap-1.5 rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 px-3.5 py-2 shadow-md hover:shadow-lg active:scale-95 border border-white/10"
            title="System Documentation & Navigation Manual"
          >
            <HelpCircle className="h-4 w-4 text-cyan-200" />
            <span className="hidden sm:inline">Help</span>
          </Link>

          {extraRightContent}
        </div>
      </header>
    </>
  );
}
