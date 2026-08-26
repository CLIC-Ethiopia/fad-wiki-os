import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTutorStore } from "../../store/tutor-store";

const navItems = [
  { path: "/tutor", label: "ℹ️ Info" },
  { path: "/tutor/settings", label: "⚙️ Settings" },
  { path: "/tutor/chat", label: "💬 Chat" },
  { path: "/tutor/quiz", label: "📝 Quiz & Practice" },
  { path: "/tutor/research", label: "🔍 Research Assistant" },
  { path: "/tutor/visualize", label: "📊 Visualize Concepts" },
  { path: "/tutor/knowledge", label: "🧠 Knowledge Base" },
  { path: "/tutor/notebook", label: "📓 Notebook" },
  { path: "/tutor/cowriter", label: "✍️ Co-writer" },
  { path: "/tutor/progress", label: "📈 Progress Tracker" },
  { path: "/tutor/planner", label: "🗓️ Study Planner" },
  { path: "/tutor/flashcards", label: "🗂️ Flashcards" },
];

export function SessionSidebar() {
  const { settings, clearSession } = useTutorStore();
  const [savedNotes, setSavedNotes] = useState<{ filename: string; title: string; updatedAt: string }[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchNotes = () => {
    fetch('/api/tutor/notes')
      .then(res => res.json())
      .then(data => setSavedNotes(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Refresh whenever a note is saved anywhere in the tutor
  useEffect(() => {
    const handler = () => fetchNotes();
    window.addEventListener('tutor-notes-updated', handler);
    return () => window.removeEventListener('tutor-notes-updated', handler);
  }, []);

  const hasPersona = settings.industry || settings.interests;

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto p-4">

        {/* Active Persona Indicator */}
        {hasPersona && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Active Persona</span>
            </div>
            {settings.industry && (
              <div className="text-sm text-zinc-200 font-medium truncate">
                {settings.industry}
                {settings.secondaryIndustry && <span className="text-zinc-400"> / {settings.secondaryIndustry}</span>}
              </div>
            )}
            {settings.difficulty && (
              <div className="text-xs text-zinc-400 mt-0.5">
                Level: <span className="text-rose-300">{settings.difficulty}</span>
              </div>
            )}
            {settings.goal && (
              <div className="text-xs text-zinc-500 mt-1 truncate" title={settings.goal}>
                🎯 {settings.goal}
              </div>
            )}
          </div>
        )}

        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tools</h3>
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/tutor"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Notes</h3>
          <span className="text-xs text-zinc-600">{savedNotes.length}</span>
        </div>
        <div className="space-y-1">
          {savedNotes.map(note => (
            <div
              key={note.filename}
              title={note.filename}
              className="px-3 py-2 hover:bg-zinc-800/50 rounded-md transition-colors group cursor-default"
            >
              <div className="text-sm text-zinc-400 group-hover:text-white truncate transition-colors">
                📄 {note.title}
              </div>
              <div className="text-xs text-zinc-600 mt-0.5">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {savedNotes.length === 0 && (
            <div className="px-3 py-2 text-sm text-zinc-600 italic">No notes yet</div>
          )}
        </div>
      </div>

      {/* Clear Session Button */}
      <div className="p-4 border-t border-zinc-800">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-purple-800/40 to-rose-800/40 border border-purple-500/20 text-purple-200 hover:from-purple-700/50 hover:to-rose-700/50 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Session
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 text-center">Clear all tab data?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearSession(); setShowClearConfirm(false); }}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

