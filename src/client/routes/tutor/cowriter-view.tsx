import { useState, useRef, useEffect } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { MarkdownRenderer } from "./markdown-renderer";

export function Component() {
  const { settings, cowriterDocument: document, setCowriterDocument: setDocument } = useTutorStore();
  const [prompt, setPrompt] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [assistantSuggestion, setAssistantSuggestion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Save / Open state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilename, setSaveFilename] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);

  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [notesList, setNotesList] = useState<{ filename: string; title: string; updatedAt: string }[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const suggestionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isWriting && suggestionEndRef.current) {
      suggestionEndRef.current.scrollTop = suggestionEndRef.current.scrollHeight;
    }
  }, [assistantSuggestion, isWriting]);

  const handleAskTutor = async (promptTextOverride?: string) => {
    const textToSend = promptTextOverride || prompt;
    if (!textToSend.trim()) return;

    setIsWriting(true);
    setAssistantSuggestion("");

    try {
      const response = await fetch('/api/tutor/cowriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, document })
      });

      if (!response.body) throw new Error('No response body from cowriter');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentResult = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;
          const lines = eventBlock.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.substring(6);
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'token') {
              currentResult += data;
              setAssistantSuggestion(currentResult);
            } else if (eventType === 'error') {
              throw new Error(data);
            }
          } catch (jsonErr) {
            console.error('SSE parsing error:', jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.error('Co-writer error:', err);
      setAssistantSuggestion(`**Error:** ${err.message || 'Failed to generate writing suggestion.'}`);
    } finally {
      setIsWriting(false);
      if (!promptTextOverride) {
        setPrompt("");
      }
    }
  };

  const handleInsertAtEnd = () => {
    if (!assistantSuggestion) return;
    setDocument(prev => prev ? `${prev}\n\n${assistantSuggestion}` : assistantSuggestion);
  };

  const handleReplaceDraft = () => {
    if (!assistantSuggestion) return;
    setDocument(assistantSuggestion);
  };

  const handleCopySuggestion = () => {
    if (!assistantSuggestion) return;
    navigator.clipboard.writeText(assistantSuggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Save Note conforming to Template.md ──
  const openSaveDialog = () => {
    const firstLine = document.split('\n').find(l => l.trim().length > 0) || 'untitled';
    const defaultName = firstLine
      .replace(/^#+\s*/, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 60)
      .toLowerCase() || 'untitled-draft';
    setSaveFilename(defaultName);
    setSaveStatus(null);
    setShowSaveDialog(true);
  };

  const handleSaveNote = async () => {
    if (!saveFilename.trim()) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString().split('T')[0];
      const hasFrontmatter = document.trim().startsWith('---');
      const tagsList = ['cowriter', 'draft'];
      if (settings.industry) tagsList.push(settings.industry.replace(/\s+/g, ''));
      if (settings.secondaryIndustry) tagsList.push(settings.secondaryIndustry.replace(/\s+/g, ''));

      let content = document;
      if (!hasFrontmatter) {
        content = `---\ntitle: ${saveFilename.trim()}\ndate: ${now}\ntags:\n${tagsList.map(t => `  - ${t}`).join('\n')}\ntype: cowriter-document\ndescription: Collaborative document drafted with Fad Tutor\naliases:\n  - ${saveFilename.trim()}\n---\n\n${document}`;
      }

      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: saveFilename.trim(), content })
      });
      if (res.ok) {
        setSaveStatus('saved');
        window.dispatchEvent(new CustomEvent('tutor-notes-updated'));
        setTimeout(() => {
          setShowSaveDialog(false);
          setSaveStatus(null);
        }, 1200);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Open Note ──
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
        // Strip YAML frontmatter if present before loading into editor
        const stripped = data.content.replace(/^---[\s\S]*?---\n*/, '');
        setDocument(stripped);
      }
    } catch (err) {
      console.error('Failed to load note:', err);
    }
    setShowOpenDialog(false);
  };

  const suggestionPrompts = [
    "Expand on the core value proposition and technical execution",
    "Make this section more professional and industry-grade",
    "Add a structured comparison table with trade-offs",
    "Check for logical gaps and strengthen arguments",
    "Draft an executive summary based on this content"
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 p-6 sm:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-light">Co-Writer</h1>
              {settings.industry && (
                <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                  {settings.industry}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm">
              Collaboratively draft proposals, research papers, and business plans with live AI assistance.
            </p>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Document Editor Side */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="bg-zinc-950/70 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-zinc-300 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Draft Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={openOpenDialog}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  Open Note
                </button>
                <button
                  onClick={openSaveDialog}
                  disabled={!document.trim()}
                  className="text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Note
                </button>
              </div>
            </div>
            <textarea 
              value={document}
              onChange={e => setDocument(e.target.value)}
              placeholder="# Write your draft here in markdown...&#10;&#10;Use the AI Assistant on the right to brainstorm, expand sections, or draft new ideas."
              className="flex-1 w-full bg-transparent p-6 text-zinc-200 focus:outline-none resize-none leading-relaxed text-sm md:text-base font-sans"
              spellCheck={false}
            />
          </div>

          {/* AI Tutor Assistant Side */}
          <div className="w-full lg:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col overflow-hidden shrink-0">
            <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-emerald-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Assistant
              </span>
              {isWriting && (
                <span className="text-xs text-emerald-400 animate-pulse font-mono">Generating...</span>
              )}
            </div>
            
            {/* Assistant Output / Suggestions Area */}
            <div 
              ref={suggestionEndRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[160px]"
            >
              {assistantSuggestion ? (
                <div className="space-y-3">
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 shadow-inner">
                    <MarkdownRenderer content={assistantSuggestion} />
                  </div>
                  
                  {/* Action buttons on suggestion */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleInsertAtEnd}
                      className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Insert at End
                    </button>
                    <button
                      onClick={handleReplaceDraft}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                    >
                      Replace Draft
                    </button>
                    <button
                      onClick={handleCopySuggestion}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-zinc-400">
                  <p>Type a prompt below or click a quick action to have the tutor co-write with you.</p>
                  <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800 space-y-2">
                    <span className="text-zinc-300 font-medium block">Quick Actions:</span>
                    <div className="space-y-1.5">
                      {suggestionPrompts.map((s, idx) => (
                        <button
                          key={idx}
                          disabled={isWriting}
                          onClick={() => handleAskTutor(s)}
                          className="w-full text-left p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors border border-zinc-800/80 leading-relaxed block"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ask the tutor for additions, edits, or feedback..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors text-xs sm:text-sm min-h-[70px] resize-none mb-3"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskTutor();
                  }
                }}
              />
              <button 
                onClick={() => handleAskTutor()}
                disabled={isWriting || !prompt.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {isWriting ? 'Thinking & Writing...' : 'Ask AI Tutor'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Save Note Modal ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Save Note</h3>
            <p className="text-sm text-zinc-400 mb-5">
              Saves draft with frontmatter into <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">steam-ie-vault/notes/</code>
            </p>
            <label className="block text-sm text-zinc-300 mb-2">File name</label>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={saveFilename}
                onChange={e => setSaveFilename(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
              />
              <span className="text-zinc-500 text-sm">.md</span>
            </div>
            {saveStatus === 'saved' && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Saved successfully!
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mb-4 p-3 rounded-lg bg-rose-900/30 border border-rose-800 text-rose-300 text-sm">
                Failed to save. Please try again.
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving || !saveFilename.trim()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Open Note Modal ── */}
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
