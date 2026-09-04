import { useState, useRef, useEffect } from "react";
import { Composer } from "./composer";
import { ToolActivity } from "./tool-activity";
import { useTutorStore } from "../../store/tutor-store";
import { MarkdownRenderer } from "./markdown-renderer";
import { TutorFooter } from "./tutor-footer";

export function Component() {
  const { settings, chatMessages: messages, setChatMessages: setMessages, chatSessionId: activeSessionId, setChatSessionId: setActiveSessionId } = useTutorStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save / Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilename, setSaveFilename] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedNotes, setSavedNotes] = useState<{ filename: string; title: string; updatedAt: string }[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSessionId) {
      fetch('/api/tutor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New chat', capability: 'chat' })
      })
      .then(r => r.json())
      .then(s => setActiveSessionId(s.id))
      .catch(console.error);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (text: string) => {
    if (!activeSessionId) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/tutor/sessions/${activeSessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let currentContent = '';
      let currentTools: any[] = [];
      setMessages(prev => [...prev, { role: 'assistant', content: '', toolCalls: [] }]);

      let buffer = '';

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
              currentContent += data;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = currentContent;
                return newMsgs;
              });
            } else if (eventType === 'tool_start') {
              currentTools.push({ name: data.name, arguments: data.args });
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].toolCalls = [...currentTools];
                return newMsgs;
              });
            } else if (eventType === 'tool_result') {
              const lastTool = currentTools[currentTools.length - 1];
              if (lastTool && lastTool.name === data.name) {
                lastTool.result = data.content;
              }
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].toolCalls = [...currentTools];
                return newMsgs;
              });
            } else if (eventType === 'error') {
              throw new Error(data);
            }
          } catch (jsonErr) {
            console.error('SSE JSON parse error:', jsonErr);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred while connecting to the AI Tutor.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Convert messages to markdown conforming to Template.md ──
  const messagesToMarkdown = (): string => {
    const now = new Date().toISOString().split('T')[0];
    const tagsList = ['tutor', 'chat'];
    if (settings.industry) tagsList.push(settings.industry.replace(/\s+/g, ''));
    if (settings.secondaryIndustry) tagsList.push(settings.secondaryIndustry.replace(/\s+/g, ''));

    let md = `---\ntitle: ${saveFilename.trim() || 'Tutor Chat'}\ndate: ${now}\ntags:\n${tagsList.map(t => `  - ${t}`).join('\n')}\ntype: chat-transcript\ndescription: AI Tutor interactive conversation on ${settings.industry || 'STEAM-IE'}\naliases:\n  - ${saveFilename.trim()}\n---\n\n# ${saveFilename.trim() || 'Tutor Chat'}\n\n`;
    for (const m of messages) {
      if (m.role === 'user') {
        md += `## 🧑 You\n\n${m.content}\n\n`;
      } else if (m.role === 'assistant') {
        md += `## 🤖 Tutor\n\n${m.content}\n\n`;
      }
    }
    return md.trim() + '\n';
  };

  // ── Open save dialog ──
  const openSaveDialog = () => {
    const now = new Date();
    const defaultName = `tutor-chat-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setSaveFilename(defaultName);
    setShowSaveDialog(true);
    setSaveStatus(null);
  };

  // ── Perform save ──
  const handleSaveChat = async () => {
    if (!saveFilename.trim()) return;
    setIsSaving(true);
    try {
      const content = messagesToMarkdown();
      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: saveFilename.trim(), content })
      });
      if (res.ok) {
        setSaveStatus('saved');
        // Dispatch event so sidebar refreshes
        window.dispatchEvent(new CustomEvent('tutor-notes-updated'));
        setTimeout(() => {
          setShowSaveDialog(false);
          setSaveStatus(null);
        }, 1200);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Open load dialog & fetch list ──
  const openLoadDialog = async () => {
    setShowLoadDialog(true);
    setIsLoadingNotes(true);
    try {
      const res = await fetch('/api/tutor/notes');
      const data = await res.json();
      setSavedNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // ── Load a saved chat ──
  const loadNote = async (filename: string) => {
    try {
      const res = await fetch(`/api/tutor/notes/${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.content) {
        // Parse markdown back into messages
        const parsed: any[] = [];
        const sections = data.content.split(/^## /m).filter(Boolean);
        for (const section of sections) {
          if (section.startsWith('🧑 You')) {
            parsed.push({ role: 'user', content: section.replace('🧑 You\n\n', '').trim() });
          } else if (section.startsWith('🤖 Tutor')) {
            parsed.push({ role: 'assistant', content: section.replace('🤖 Tutor\n\n', '').trim() });
          }
        }
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load note:', err);
    }
    setShowLoadDialog(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-zinc-950">
      {/* Top toolbar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-zinc-800 shrink-0">
        <button
          onClick={openLoadDialog}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Load Chat
        </button>
        <button
          onClick={openSaveDialog}
          disabled={messages.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-4 rounded-xl max-w-3xl leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap' 
                : 'bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800 shadow-md'
            }`}>
              {m.role === 'user' ? (
                m.content
              ) : (
                <MarkdownRenderer content={m.content} />
              )}
            </div>
            {(m.toolCalls?.length ?? 0) > 0 && <ToolActivity tools={m.toolCalls} />}
          </div>
        ))}
        {isGenerating && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-start">
            <div className="p-4 rounded-xl bg-zinc-800 text-zinc-400 rounded-tl-sm border border-zinc-700 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <TutorFooter />
        <div ref={messagesEndRef} />
      </div>

      {/* Premade Prompts */}
      {messages.length === 0 && (
        <div className="px-4 pb-4 bg-zinc-950">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
            {(() => {
              const isSettingsEmpty = !settings.industry && !settings.interests && !settings.learningNeeds && !settings.goal;
              const prompts = [];
              if (isSettingsEmpty) {
                prompts.push(
                  "How do I use this app?",
                  "What is the STEAM-IE framework?",
                  "What can Fad Tutor do for me?",
                  "How do I set up my personal persona?",
                  "Tell me about the connection between Arts and Engineering."
                );
              } else {
                if (settings.industry) {
                  prompts.push(`What are the latest innovations in ${settings.industry}?`);
                  prompts.push(`How can I apply STEAM-IE concepts to ${settings.industry}?`);
                }
                if (settings.interests) {
                  const firstInterest = settings.interests.split(',')[0].trim();
                  prompts.push(`Can you explain a complex topic using my interest in ${firstInterest}?`);
                }
                if (settings.goal) {
                  prompts.push(`What steps should I take to achieve: ${settings.goal}?`);
                }
                if (settings.difficulty) {
                  prompts.push(`Give me a ${settings.difficulty.toLowerCase()}-level challenge related to my field.`);
                }
                prompts.push("Can you quiz me on my recent topics?");
                prompts.push("Summarize the most important skills I need for my career.");
              }
              return prompts.slice(0, 6).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  disabled={isGenerating}
                  className="bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded-full px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <Composer onSend={handleSend} disabled={isGenerating} />
        </div>
      </div>

      {/* ── Save Dialog Modal ── */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Save Chat to Notes</h3>
            <p className="text-sm text-zinc-400 mb-5">This will save the conversation as a markdown file in <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">steam-ie-vault/notes/</code></p>
            <label className="block text-sm text-zinc-300 mb-2">File name</label>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={saveFilename}
                onChange={e => setSaveFilename(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveChat()}
              />
              <span className="text-zinc-500 text-sm">.md</span>
            </div>
            {saveStatus === 'saved' && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
                onClick={handleSaveChat}
                disabled={isSaving || !saveFilename.trim()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Load Dialog Modal ── */}
      {showLoadDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Load Saved Chat</h3>
            <p className="text-sm text-zinc-400 mb-5">Select a previously saved conversation from notes.</p>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {isLoadingNotes ? (
                <div className="text-zinc-500 text-sm p-4 text-center animate-pulse">Loading...</div>
              ) : savedNotes.length === 0 ? (
                <div className="text-zinc-500 text-sm p-4 text-center italic">No saved chats found in notes.</div>
              ) : (
                savedNotes.map(note => (
                  <button
                    key={note.filename}
                    onClick={() => loadNote(note.filename)}
                    className="w-full text-left p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all group"
                  >
                    <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">{note.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{new Date(note.updatedAt).toLocaleDateString()} · {note.filename}</div>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowLoadDialog(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
