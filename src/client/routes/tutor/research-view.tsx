import { useState, useEffect, useRef } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { MarkdownRenderer } from "./markdown-renderer";

interface ToolStep {
  name: string;
  args: any;
  status: 'running' | 'completed';
}

// Reusable save-to-notes modal hook helper
function useSaveDialog() {
  const [show, setShow] = useState(false);
  const [filename, setFilename] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  return { show, setShow, filename, setFilename, saving, setSaving, status, setStatus };
}

function useSaveNoteModal() {
  const d = useSaveDialog();
  const open = (defaultName: string) => {
    d.setFilename(defaultName);
    d.setStatus(null);
    d.setShow(true);
  };
  const save = async (content: string, onDone?: () => void) => {
    if (!d.filename.trim()) return;
    d.setSaving(true);
    try {
      const hasFrontmatter = content.trim().startsWith('---');
      let finalContent = content;
      if (!hasFrontmatter) {
        const now = new Date().toISOString().split('T')[0];
        finalContent = `---\ntitle: ${d.filename.trim()}\ndate: ${now}\ntags:\n  - research\n  - steam-ie\ntype: research-report\ndescription: Comprehensive AI Deep Research report\naliases:\n  - ${d.filename.trim()}\n---\n\n${content}`;
      }

      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: d.filename.trim(), content: finalContent })
      });
      if (res.ok) {
        d.setStatus('saved');
        window.dispatchEvent(new CustomEvent('tutor-notes-updated'));
        setTimeout(() => { d.setShow(false); d.setStatus(null); onDone?.(); }, 1200);
      } else {
        d.setStatus('error');
      }
    } catch {
      d.setStatus('error');
    } finally {
      d.setSaving(false);
    }
  };
  return { ...d, open, save };
}

export function Component() {
  const {
    settings,
    researchTopic: topic,
    setResearchTopic: setTopic,
    researchReport: report,
    setResearchReport: setReport,
  } = useTutorStore();

  const [isResearching, setIsResearching] = useState(false);
  const [activeTools, setActiveTools] = useState<ToolStep[]>([]);
  const [researchStage, setResearchStage] = useState<string>("Initializing research...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const saveDialog = useSaveNoteModal();

  useEffect(() => {
    if (isResearching && reportContainerRef.current) {
      reportContainerRef.current.scrollTop = reportContainerRef.current.scrollHeight;
    }
  }, [report, isResearching]);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    setIsResearching(true);
    setReport("");
    setActiveTools([]);
    setErrorMessage(null);
    setResearchStage("Connecting to research agents...");

    try {
      const response = await fetch('/api/tutor/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.body) throw new Error('No response body from research endpoint');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedReport = '';

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
              accumulatedReport += data;
              setReport(accumulatedReport);
              setResearchStage("Synthesizing and generating markdown report...");
            } else if (eventType === 'tool_start') {
              const toolName = data.name;
              let description = `Running ${toolName}...`;
              if (toolName === 'rag') description = `Searching STEAM-IE vault for: "${data.args?.query || topic}"`;
              if (toolName === 'web_search') description = `Searching web for: "${data.args?.query || topic}"`;
              if (toolName === 'web_fetch') description = `Reading article at: ${data.args?.url || ''}`;
              if (toolName === 'reason') description = `Reasoning & structuring report synthesis...`;

              setResearchStage(description);
              setActiveTools(prev => [...prev, { name: toolName, args: data.args, status: 'running' }]);
            } else if (eventType === 'tool_result') {
              setActiveTools(prev => {
                const next = [...prev];
                if (next.length > 0) {
                  next[next.length - 1].status = 'completed';
                }
                return next;
              });
            } else if (eventType === 'error') {
              throw new Error(data);
            }
          } catch (jsonErr) {
            console.error('SSE JSON error:', jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.error('Deep research failed:', err);
      setErrorMessage(err.message || 'Research generation encountered an error.');
    } finally {
      setIsResearching(false);
      setResearchStage("Research complete");
    }
  };

  const openSaveDialog = () => {
    const slug = topic.trim().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 60).toLowerCase() || 'research-report';
    const date = new Date().toISOString().split('T')[0];
    saveDialog.open(`research-${date}-${slug}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-6 sm:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6 h-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-display font-light">Deep Research</h1>
              <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                Multi-Agent Synthesis
              </span>
            </div>
            <p className="text-zinc-400 text-sm">
              Generate comprehensive, cited research reports formatted to Template.md standards.
            </p>
          </div>

          {report && !isResearching && (
            <div className="flex items-center gap-2">
              <button
                onClick={openSaveDialog}
                className="flex items-center gap-2 text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save as Note
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([`"Section","Content"\n"Topic","${topic.replace(/"/g, '""')}"\n"Report","${(report || '').replace(/"/g, '""')}"`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `research-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3.5 py-2 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => { setReport(null); setTopic(""); }}
                className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-lg transition-colors"
              >
                New Research
              </button>
            </div>
          )}
        </div>

        {/* Setup & Prompt Form (When not researching and no report) */}
        {!isResearching && !report && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-medium text-zinc-200">Start a New Deep Research Investigation</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Research Topic or Thesis</label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="E.g., How are AI-driven foundation models transforming clinical workflows and patient monitoring in telemedicine?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[120px] resize-y text-sm leading-relaxed"
                />
              </div>

              {settings.industry && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-800/80">
                  <span className="text-emerald-400 font-medium">Personalized for:</span> {settings.industry} {settings.secondaryIndustry ? `(${settings.secondaryIndustry})` : ''} · {settings.difficulty}
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleResearch}
                  disabled={isResearching || !topic.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-colors flex items-center gap-2 text-sm"
                >
                  Start Deep Research
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Streaming or Final Report Display */}
        {(isResearching || report) && (
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            
            {/* Live Progress Bar & Tool Activity Header */}
            {isResearching && (
              <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-zinc-300 font-medium text-xs sm:text-sm">{researchStage}</span>
                  </div>
                  <span className="text-xs text-emerald-400 animate-pulse font-mono">Live Research Stream</span>
                </div>

                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {/* Tool Activity Badges */}
            {activeTools.length > 0 && (
              <div className="flex flex-wrap gap-2 py-1">
                {activeTools.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300 shadow-sm"
                  >
                    <span className={`w-2 h-2 rounded-full ${t.status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                    <span className="font-mono text-emerald-400">{t.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Markdown Report Content Container */}
            <div
              ref={reportContainerRef}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-y-auto"
            >
              {report ? (
                <MarkdownRenderer content={report} />
              ) : (
                <div className="p-8 text-center text-zinc-400 animate-pulse text-sm">
                  Agent is gathering intelligence and drafting the report...
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Save Note Modal */}
      {saveDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Save Research Report</h3>
            <p className="text-sm text-zinc-400 mb-5">
              Saves formatted markdown with frontmatter in <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">steam-ie-vault/notes/</code>
            </p>
            <label className="block text-sm text-zinc-300 mb-2">File name</label>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={saveDialog.filename}
                onChange={e => saveDialog.setFilename(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && saveDialog.save(report || '')}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
              />
              <span className="text-zinc-500 text-sm">.md</span>
            </div>
            {saveDialog.status === 'saved' && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Saved to vault notes!
              </div>
            )}
            {saveDialog.status === 'error' && (
              <div className="mb-4 p-3 rounded-lg bg-rose-900/30 border border-rose-800 text-rose-300 text-sm">Failed to save. Please try again.</div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => saveDialog.setShow(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-sm">Cancel</button>
              <button
                onClick={() => saveDialog.save(report || '')}
                disabled={saveDialog.saving || !saveDialog.filename.trim()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saveDialog.saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
