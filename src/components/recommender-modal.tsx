import { useState, useEffect } from "react";
import { X, Sparkles, Key, BrainCircuit, ExternalLink, Link as LinkIcon, RefreshCw as RefreshSpinnerIcon } from "lucide-react";
import { fetchJson } from "@/client/api";

interface RecommenderModalProps {
  onClose: () => void;
  onClipSource: (url: string, folder: string) => void;
}

interface VaultNode {
  path: string;
  type: "folder" | "file";
}

interface Recommendation {
  topic: string;
  reasoning: string;
  sourceTitle: string;
  sourceUrl: string;
}

export function RecommenderModal({ onClose, onClipSource }: RecommenderModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [nodes, setNodes] = useState<VaultNode[]>([]);
  const [selectedPath, setSelectedPath] = useState("/");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("wiki_gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
    fetchJson<VaultNode[]>("/api/recommender/nodes")
      .then(setNodes)
      .catch((e) => setError("Failed to load vault nodes."));
  }, []);

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("wiki_gemini_api_key", apiKey.trim());
      setIsKeySaved(true);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const data = await fetchJson<{ ok: boolean; recommendations: Recommendation[] }>("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, targetPath: selectedPath, customPrompt }),
      });
      setRecommendations(data.recommendations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate recommendations.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isKeySaved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col border border-[var(--border)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)]">
            <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <Key className="text-[var(--teal)] h-5 w-5" />
              API Key Required
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border)] transition">
              <X className="h-5 w-5 text-[var(--muted-foreground)]" />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              The Recommender Engine uses Google Gemini to read your notes and search the web. Please provide a free Gemini API key to continue. It is stored securely in your browser's local storage.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
            />
            <button
              onClick={saveKey}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Save Key & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col border border-[var(--border)] max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Sparkles className="text-[var(--teal)] h-6 w-6" />
            Recommender Engine
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border)] transition">
            <X className="h-5 w-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          {!recommendations ? (
            <div className="flex flex-col gap-6 items-center justify-center py-12">

              <div className="text-center max-w-md">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Analyze Your Vault</h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Select a specific folder or note below. The AI will read the contents, identify missing knowledge, and search the web for the best sources to fill the gaps.
                </p>
              </div>

              <div className="w-full max-w-md flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--foreground)]">Target Content</label>
                <select
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
                >
                  {nodes.map(n => (
                    <option key={n.path} value={n.path}>
                      {n.type === "folder" ? "📁 " : "📄 "}{n.path === "/" ? "Entire Vault (Root)" : n.path}
                    </option>
                  ))}
                </select>
                <label className="text-sm font-bold text-[var(--foreground)] mt-2">Refine Search (Optional)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Focus on recent advancements..."
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)] resize-none h-20"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {isProcessing ? <RefreshSpinner /> : <Sparkles className="h-5 w-5" />}
                  {isProcessing ? "AI is analyzing and searching..." : "Generate Recommendations"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Top Recommendations</h3>
                  <button
                    onClick={() => setRecommendations(null)}
                    className="text-sm text-[var(--teal)] hover:underline font-medium"
                  >
                    Analyze another folder
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Refine further (e.g. Focus on papers)"
                    className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm active:scale-95"
                  >
                    {isProcessing ? <RefreshSpinner /> : <RefreshSpinnerIcon />}
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {recommendations.map((rec, i) => {
                  let folderDest = selectedPath;
                  if (folderDest.endsWith(".md")) {
                    const parts = folderDest.split("/");
                    parts.pop();
                    folderDest = parts.join("/") || "/";
                  }

                  return (
                    <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-lg font-bold text-[var(--foreground)] text-[var(--teal)]">{rec.topic}</h4>
                      </div>
                      <p className="text-sm text-[var(--foreground)] opacity-90">{rec.reasoning}</p>

                      <div className="mt-2 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                          <ExternalLink className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
                          <a href={rec.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--teal)] truncate" title={rec.sourceTitle}>
                            {rec.sourceTitle}
                          </a>
                        </div>
                        <button
                          onClick={() => {
                            onClipSource(rec.sourceUrl, folderDest);
                          }}
                          className="flex-shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white shadow-sm hover:shadow-md transition-all text-sm font-bold flex items-center gap-2 active:scale-95"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Clip this source
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RefreshSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
