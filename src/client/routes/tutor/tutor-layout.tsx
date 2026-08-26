import { Outlet, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SessionSidebar } from "./session-sidebar";
import { useWikiConfig } from "@/client/wiki-config";

export function Component() {
  const config = useWikiConfig();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden flex-col">
      <header className="shrink-0 z-50 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between gap-2 px-4 py-3 sm:px-6 transition-all duration-300 relative">
        <Link to="/" className="font-display text-lg text-[var(--foreground)] sm:text-xl">
          {config.siteTitle} <span className="text-zinc-500 font-light ml-2">Tutor</span>
        </Link>
        <Link
          to="/knowledge-center"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-semibold text-white transition-all px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 overflow-hidden group z-10"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #10b981 100%)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <BookOpen className="h-4 w-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">Knowledge Center</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.backToWikiLabel || "Back to Wiki"}
          </Link>
          <Link
            to="/graph"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.graphLabel || "Graph"}
          </Link>
          <Link
            to="/stats"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.statsLabel || "Stats"}
          </Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <SessionSidebar />
        <main className="flex-1 flex flex-col relative h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
