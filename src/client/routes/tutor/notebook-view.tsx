import { useState } from "react";
import { TutorFooter } from "./tutor-footer";

export function Component() {
  const [content, setContent] = useState("# Innovation Strategies in Tech\n\n1. **Design Thinking**: Empathize, Define, Ideate, Prototype, Test.\n2. **Agile Methodology**: Iterative development, continuous feedback.\n\n*Note to self: Ask the tutor about the application of these in Healthcare.*");
  const [currentFilename, setCurrentFilename] = useState("steam_ie_notes.md");
  const [isSaved, setIsSaved] = useState(true);

  // Open Note state
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [notesList, setNotesList] = useState<{ filename: string; title: string; updatedAt: string }[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const handleSave = async () => {
    try {
      const now = new Date().toISOString().split('T')[0];
      // Ensure YAML frontmatter; wrap if content doesn't already have it
      const hasHeader = content.startsWith('---');
      const wrapped = hasHeader ? content : `---\ntitle: ${currentFilename.replace(/\.md$/, '')}\ndate: ${now}\ntags: [notebook]\n---\n\n${content}`;
      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentFilename, content: wrapped })
      });
      if (res.ok) {
        setIsSaved(true);
        window.dispatchEvent(new CustomEvent('tutor-notes-updated'));
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleChange = (val: string) => {
    setContent(val);
    setIsSaved(false);
  };

  const openOpenDialog = async () => {
    setShowOpenDialog(true);
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/tutor/notes');
      const data = await res.json();
      setNotesList(data);
    } catch {
      setNotesList([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpenNote = async (filename: string) => {
    try {
      const res = await fetch(`/api/tutor/notes/${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.content) {
        const stripped = data.content.replace(/^---[\s\S]*?---\n*/, '');
        setContent(stripped);
        setCurrentFilename(filename);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to load note:', err);
    }
    setShowOpenDialog(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col space-y-6">

        <div className="flex items-end justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-display font-light mb-2">Notebook</h1>
            <p className="text-zinc-400">Your personal workspace. The AI Tutor can also read and write to this space.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openOpenDialog}
              className="px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              Open Note
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
                isSaved
                  ? 'bg-zinc-800 text-zinc-500 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                'Save Notes'
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden relative group">
          <div className="bg-zinc-950/50 border-b border-zinc-800 px-4 py-2 flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">{currentFilename}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Markdown Supported</span>
          </div>
          <textarea
            value={content}
            onChange={e => handleChange(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 text-zinc-200 focus:outline-none resize-none leading-relaxed font-mono text-sm"
            placeholder="Start typing your notes here..."
            spellCheck={false}
          />
        </div>

        <TutorFooter />
      </div>

      {/* Open Note Modal */}
      {showOpenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Open Note</h3>
            <p className="text-sm text-zinc-400 mb-5">Select a note from the vault to open for editing.</p>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {isLoadingList ? (
                <div className="text-zinc-500 text-sm p-4 text-center animate-pulse">Loading...</div>
              ) : notesList.length === 0 ? (
                <div className="text-zinc-500 text-sm p-4 text-center italic">No notes found in the vault.</div>
              ) : (
                notesList.map(note => (
                  <button
                    key={note.filename}
                    onClick={() => handleOpenNote(note.filename)}
                    className="w-full text-left p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all group"
                  >
                    <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">{note.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{new Date(note.updatedAt).toLocaleDateString()} · {note.filename}</div>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowOpenDialog(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
