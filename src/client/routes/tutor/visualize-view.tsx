import { useState, useRef } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { DiagramRenderer } from "./diagram-renderer";
import { MarkdownRenderer } from "./markdown-renderer";
import { TutorFooter } from "./tutor-footer";

interface VisualizeResult {
  title: string;
  type: 'diagram' | 'chart' | 'interactive' | 'mindmap';
  code: string;
  explanation: string;
  frontmatter: string;
}

interface SuggestionItem {
  topic: string;
  type: 'diagram' | 'chart' | 'interactive' | 'mindmap';
  label: string;
}

export function Component() {
  const {
    settings,
    visualizeTopic: topic,
    setVisualizeTopic: setTopic,
    visualizeData: visualResult,
    setVisualizeData: setVisualResult,
    visualizeHistory,
    setVisualizeHistory,
  } = useTutorStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'auto' | 'diagram' | 'chart' | 'interactive' | 'mindmap'>('auto');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Save Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilename, setSaveFilename] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);
  
  // Copy feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedExpl, setCopiedExpl] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const visualRef = useRef<HTMLDivElement>(null);

  const handleVisualize = async (
    topicOverride?: string,
    typeOverride?: 'auto' | 'diagram' | 'chart' | 'interactive' | 'mindmap'
  ) => {
    const activeTopic = topicOverride ?? topic;
    const activeType = typeOverride ?? selectedType;
    if (!activeTopic.trim()) return;

    setIsGenerating(true);
    setVisualResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tutor/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeTopic, type: activeType })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate visualization');
      }
      setVisualResult(data);
      // Persist this result by type in session history
      if (data.type) {
        setVisualizeHistory(data.type, data);
      }
    } catch (err: any) {
      console.error('Visualization error:', err);
      setErrorMessage(err.message || 'Failed to generate visual concepts. Please check your network and settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!visualResult) return;
    navigator.clipboard.writeText(visualResult.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyExplanation = () => {
    if (!visualResult) return;
    navigator.clipboard.writeText(visualResult.explanation);
    setCopiedExpl(true);
    setTimeout(() => setCopiedExpl(false), 2000);
  };

  const openSaveDialog = () => {
    if (!visualResult) return;
    const slug = visualResult.title.trim().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 50).toLowerCase() || 'visual-concept';
    const date = new Date().toISOString().split('T')[0];
    setSaveFilename(`visual-${date}-${slug}`);
    setSaveStatus(null);
    setShowSaveDialog(true);
  };

  const handleSaveNote = async () => {
    if (!saveFilename.trim() || !visualResult) return;
    setIsSaving(true);
    try {
      const hasFrontmatter = visualResult.frontmatter ? visualResult.frontmatter.trim().startsWith('---') : false;
      const frontmatterHeader = visualResult.frontmatter ? visualResult.frontmatter.trim() : '';
      
      let finalContent = "";
      if (hasFrontmatter) {
        let codeSection = '';
        if (visualResult.type === 'diagram') {
          codeSection = '```mermaid\n' + visualResult.code + '\n```';
        } else if (visualResult.type === 'chart') {
          codeSection = 'Config:\n```json\n' + visualResult.code + '\n```';
        } else if (visualResult.type === 'interactive') {
          codeSection = 'HTML Widget:\n```html\n' + visualResult.code + '\n```';
        } else if (visualResult.type === 'mindmap') {
          codeSection = 'Mind Map Data:\n```json\n' + visualResult.code + '\n```';
        }
        finalContent = `${frontmatterHeader}\n\n# ${visualResult.title}\n\n### Visualization:\n${codeSection}\n\n### Explanation:\n${visualResult.explanation}`;
      } else {
        const now = new Date().toISOString().split('T')[0];
        const tags = ['visualization', 'steam-ie'];
        if (settings.industry) tags.push(settings.industry.replace(/\s+/g, ''));
        finalContent = `---\ntitle: ${visualResult.title}\ndate: ${now}\ntags:\n${tags.map(t => `  - ${t}`).join('\n')}\ntype: visualization-note\ndescription: AI visual representation\naliases:\n  - ${saveFilename.trim()}\n---\n\n# ${visualResult.title}\n\n${visualResult.explanation}`;
      }

      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: saveFilename.trim(), content: finalContent })
      });
      if (res.ok) {
        setSaveStatus('saved');
        window.dispatchEvent(new CustomEvent('tutor-notes-updated'));
        setTimeout(() => { setShowSaveDialog(false); setSaveStatus(null); }, 1200);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveImage = async () => {
    if (!visualResult || !visualRef.current) return;
    setExportStatus('saving');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        // Skip iframes that html2canvas cannot handle
        ignoreElements: (el: Element) => el.tagName === 'IFRAME',
      });
      const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      const slug = visualResult.title.trim().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 50).toLowerCase() || 'visual';
      const date = new Date().toISOString().split('T')[0];
      const filename = `visual-${date}-${slug}`;
      const res = await fetch('/api/tutor/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, base64 })
      });
      if (res.ok) {
        setExportStatus('saved');
        setTimeout(() => setExportStatus('idle'), 2500);
      } else {
        setExportStatus('error');
        setTimeout(() => setExportStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Save image failed:', err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  // Profile-specific suggestions: 8 recommendations (2 diagram, 2 chart, 2 interactive, 2 mindmap)
  const getSuggestions = (): SuggestionItem[] => {
    const ind = settings.industry?.toLowerCase() || '';
    
    // Default Fallback
    let diagram = [
      "Workflow layout of renewable smart grid energy supply lifecycle",
      "Process flow architecture of a micro-payment clearing network"
    ];
    let chart = [
      "Comparative metric comparison of 4 clean energy storage options",
      "Statistical breakdown of market share trends for micro-lending platforms"
    ];
    let interactive = [
      "Dynamic solar-grid power load balance simulation dashboard",
      "Interactive inflation compounding calculator with adjustable interest rates"
    ];
    let mindmap = [
      "Hierarchical taxonomy of primary smart grid grid-edge technologies",
      "Concept breakdown map of key microfinance lending risk indicators"
    ];

    // Healthcare / Biotech
    if (ind.includes('health') || ind.includes('bio') || ind.includes('med') || ind.includes('clinical')) {
      diagram = [
        "Patient triage intake workflow loop of an automated telehealth hub",
        "Sequence diagram of CRISPR-Cas9 target cell site correction pipeline"
      ];
      chart = [
        "Efficacy metrics comparing primary gene delivery vectors (AAV, LNP, Lentivirus)",
        "Daily patient concurrent visit load metrics comparison across departments"
      ];
      interactive = [
        "Interactive cell pH homeostatic buffer regulator simulation",
        "Telemedicine server call routing network bandwidth simulator"
      ];
      mindmap = [
        "Hierarchical concept map of FDA Class II medical software approval path",
        "Structural breakdown of genomic sequencing methodologies and techniques"
      ];
    }
    // Software / Tech
    else if (ind.includes('soft') || ind.includes('tech') || ind.includes('comput') || ind.includes('engine') || ind.includes('code')) {
      diagram = [
        "Event-driven CQRS microservice transactional architecture diagram",
        "OAuth 2.0 authorization code grant flow interaction sequence"
      ];
      chart = [
        "Throughput comparison chart of relational vs non-relational database indexes",
        "Latency performance comparison metrics of HTTP/2 vs HTTP/3 under packet loss"
      ];
      interactive = [
        "Interactive Red-Black binary search tree layout balancer widget",
        "Visual network packet collision and backoff simulation dashboard"
      ];
      mindmap = [
        "Hierarchical taxonomy of distributed systems consensus algorithms (Raft, Paxos, Zab)",
        "Core structural concept map of clean architecture design pattern layers"
      ];
    }
    // Finance / Business
    else if (ind.includes('fin') || ind.includes('bank') || ind.includes('pay') || ind.includes('crypto') || ind.includes('block') || ind.includes('business')) {
      diagram = [
        "Decentralized ledger node validation and sync workflow loop",
        "Cross-border payment clearing sequence diagram under ISO 20022"
      ];
      chart = [
        "Comparative radar comparison of liquidity risks across asset classes",
        "Lending algorithm loan default rates by credit score metric comparison"
      ];
      interactive = [
        "Interactive compounding inflation and yield rate projection calculator",
        "Automated market maker liquidity pool constant-product price simulator"
      ];
      mindmap = [
        "Hierarchical taxonomy of decentralized finance yield farming protocols",
        "Core concept map of regulatory risk and compliance layers (KYC, AML, SEC)"
      ];
    }
    // Agriculture / Food
    else if (ind.includes('agri') || ind.includes('farm') || ind.includes('crop') || ind.includes('food')) {
      diagram = [
        "Precision drip irrigation closed-loop telemetry sensor system diagram",
        "Supply chain logistics and temperature-control storage flow diagram"
      ];
      chart = [
        "Crop yield comparison metrics across different soil hydration levels",
        "Pest resistance comparison chart under biological vs chemical treatment"
      ];
      interactive = [
        "Interactive fertilizer NPK compound mixer simulator widget",
        "Greenhouse temperature/humidity evaporation load rate simulator"
      ];
      mindmap = [
        "Hierarchical classification of smart agriculture IoT sensor categories",
        "Concept map of modern sustainable organic farming certifications"
      ];
    }

    return [
      { topic: diagram[0], type: 'diagram', label: 'Diagram: ' + diagram[0] },
      { topic: diagram[1], type: 'diagram', label: 'Diagram: ' + diagram[1] },
      { topic: chart[0], type: 'chart', label: 'Chart: ' + chart[0] },
      { topic: chart[1], type: 'chart', label: 'Chart: ' + chart[1] },
      { topic: interactive[0], type: 'interactive', label: 'Simulation: ' + interactive[0] },
      { topic: interactive[1], type: 'interactive', label: 'Simulation: ' + interactive[1] },
      { topic: mindmap[0], type: 'mindmap', label: 'Mind Map: ' + mindmap[0] },
      { topic: mindmap[1], type: 'mindmap', label: 'Mind Map: ' + mindmap[1] }
    ];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-6 sm:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6 h-full flex flex-col">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-light mb-1">Visualize Concepts</h1>
            <p className="text-zinc-400 text-sm">
              Generate dynamic diagrams, charts, and interactive widgets calibrated to your settings.
            </p>
          </div>
          {visualResult && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setVisualResult(null); }}
                className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 px-3.5 py-2 rounded-lg transition-colors shrink-0 cursor-pointer font-medium"
              >
                Select Visual Type
              </button>
              <button
                onClick={() => { setVisualResult(null); setTopic(""); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Reset Canvas
              </button>
            </div>
          )}
        </div>

        {/* Setup Form */}
        {!visualResult && !isGenerating && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-medium text-zinc-200">Start a Visual Diagram or Simulation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Concept, architecture, or model to visualize</label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="E.g., Design a flow diagram representing serverless functions handling image resizing upload workflows..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px] resize-y text-sm leading-relaxed"
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleVisualize())}
                />
              </div>

              {/* Visual Type selector */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Visual Output Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'auto', label: 'Auto-Select' },
                    { id: 'diagram', label: 'Diagram (Mermaid)' },
                    { id: 'chart', label: 'Chart (Chart.js)' },
                    { id: 'interactive', label: 'Interactive Simulation' },
                    { id: 'mindmap', label: 'Mind Map' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id as any)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        selectedType === t.id
                          ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {settings.industry && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-800/80 animate-in fade-in">
                  <span className="text-emerald-400 font-medium">Calibrated for:</span> {settings.industry} {settings.secondaryIndustry ? `(${settings.secondaryIndustry})` : ''} · {settings.difficulty}
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Suggested Concept Focuses</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getSuggestions().map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setTopic(s.topic); setSelectedType(s.type); handleVisualize(s.topic, s.type); }}
                      className="text-left text-xs bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 text-zinc-300 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="line-clamp-2 pr-4">{s.label}</span>
                      <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">Generate →</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => handleVisualize()}
                  disabled={isGenerating || !topic.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  Generate Visualization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-zinc-400 space-y-4">
            <svg className="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="text-center space-y-1">
              <p className="font-medium text-zinc-200 text-sm">Generating Visual Prototype...</p>
              <p className="text-zinc-500 text-xs">Calibrating architecture layout with Gemini AI grounding</p>
            </div>
          </div>
        )}

        {/* Rendering Results view */}
        {visualResult && !isGenerating && (
          <div className="flex-1 flex flex-col space-y-6 min-h-0">
            
            {/* Visual Container */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-medium text-zinc-200">{visualResult.title}</h2>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono uppercase mt-1 inline-block">
                    {visualResult.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openSaveDialog}
                    className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Save as Note
                  </button>
                  <button
                    onClick={handleSaveImage}
                    disabled={exportStatus === 'saving'}
                    className={`text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      exportStatus === 'saved'
                        ? 'bg-emerald-700 text-white border border-emerald-600'
                        : exportStatus === 'error'
                        ? 'bg-rose-900 text-rose-200 border border-rose-700'
                        : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {exportStatus === 'saving' ? 'Exporting...' : exportStatus === 'saved' ? '✓ Saved to media/' : exportStatus === 'error' ? '✕ Export failed' : 'Export Image'}
                  </button>
                </div>
              </div>

              {/* Main Canvas Container for Visual renderer */}
              <div ref={visualRef} className="bg-zinc-950/80 rounded-xl p-2 sm:p-4 border border-zinc-800">
                <DiagramRenderer
                  type={visualResult.type}
                  code={visualResult.code}
                  title={visualResult.title}
                />
              </div>

              {/* Action tabs for raw output copy */}
              <div className="mt-4 flex flex-wrap gap-2 justify-end border-t border-zinc-800/80 pt-4">
                <button
                  onClick={handleCopyCode}
                  className="text-xs bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? 'Copied Code!' : `Copy Raw ${visualResult.type === 'diagram' ? 'Mermaid' : visualResult.type === 'chart' ? 'JSON' : 'HTML'}`}
                </button>
                <button
                  onClick={handleCopyExplanation}
                  className="text-xs bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedExpl ? 'Copied Explanation!' : 'Copy Explanation'}
                </button>
              </div>

            </div>

            {/* Explanation section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-semibold text-zinc-200 mb-4 pb-2 border-b border-zinc-800/60">Explanation & Insights</h3>
              <MarkdownRenderer content={visualResult.explanation} />
            </div>

          </div>
        )}

        <TutorFooter />
      </div>

      {/* Save Note Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Save Visual Concept</h3>
            <p className="text-sm text-zinc-400 mb-5">
              Saves formatted diagram, code and insights in <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">steam-ie-vault/notes/</code>
            </p>
            <label className="block text-sm text-zinc-300 mb-2">File name</label>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={saveFilename}
                onChange={e => setSaveFilename(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
              />
              <span className="text-zinc-500 text-sm">.md</span>
            </div>
            {saveStatus === 'saved' && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Saved note successfully!
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mb-4 p-3 rounded-lg bg-rose-900/30 border border-rose-800 text-rose-300 text-sm">Failed to save note. Please try again.</div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer">Cancel</button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving || !saveFilename.trim()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Previous Visuals Gallery */}
          {Object.keys(visualizeHistory).length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Previous Visuals (Session)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(visualizeHistory).map(([vType, data]: [string, any]) => (
                  <button
                    key={vType}
                    onClick={() => setVisualResult(data)}
                    className="text-left text-xs bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/40 text-zinc-300 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                      <span className="font-medium text-zinc-200 truncate">{data.title}</span>
                      <span className="text-zinc-500 uppercase text-[10px] font-mono">{vType}</span>
                    </div>
                    <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">View →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
