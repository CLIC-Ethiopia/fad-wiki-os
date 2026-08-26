import { useState, useEffect } from "react";
import { X, Globe, Save, Edit3, FolderPlus, FileText } from "lucide-react";
import { fetchJson } from "@/client/api";

interface WebClipperModalProps {
  onClose: () => void;
  onRefresh: () => void;
  initialUrl?: string;
  initialFolder?: string;
  isStacked?: boolean;
}

export function WebClipperModal({ onClose, onRefresh, initialUrl = "", initialFolder = "/", isStacked = false }: WebClipperModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(initialFolder);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<string[]>("/api/directories")
      .then(setFolders)
      .catch((e) => setError("Failed to load folders."));
  }, []);

  const handleProcess = async () => {
    if (!url.trim()) return setError("Please enter a valid URL.");
    setIsProcessing(true);
    setError(null);
    try {
      const data = await fetchJson<{ title: string; markdown: string }>("/api/clip/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      setPreviewTitle(data.title);
      setPreviewMarkdown(data.markdown);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse URL.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      let finalFolder = selectedFolder;
      if (isCreatingFolder && newFolderName.trim()) {
        finalFolder = selectedFolder === "/" 
          ? newFolderName.trim() 
          : `${selectedFolder}/${newFolderName.trim()}`;
      }

      await fetchJson<{ ok: boolean; file: string }>("/api/clip/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: previewTitle,
          markdown: previewMarkdown,
          folder: finalFolder,
        }),
      });
      onRefresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${isStacked ? "bg-black/20" : "bg-black/60 backdrop-blur-sm"}`}>
      <div className="w-full max-w-3xl rounded-2xl bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col border border-[var(--border)] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Globe className="text-[var(--teal)] h-6 w-6" />
            Add New Source
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border)] transition">
            <X className="h-5 w-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          {!previewMarkdown ? (
            <>
              {/* URL Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--foreground)]">Source URL</label>
                <input 
                  type="url"
                  placeholder="https://example.com or YouTube link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
                  autoFocus
                />
              </div>

              {/* Folder Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--foreground)]">Destination Folder</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
                  >
                    {folders.map(f => <option key={f} value={f}>{f === "/" ? "Root (Vault)" : f}</option>)}
                  </select>
                  <button 
                    onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                    className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-colors ${isCreatingFolder ? "bg-[var(--teal)]/10 border-[var(--teal)] text-[var(--teal)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"}`}
                  >
                    <FolderPlus className="h-4 w-4" /> New
                  </button>
                </div>
                
                {isCreatingFolder && (
                  <input 
                    type="text"
                    placeholder="Subfolder name (e.g. Research)"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 mt-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)]"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Preview State */}
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-end">
                   <label className="text-sm font-bold text-[var(--foreground)]">Title</label>
                   {!isEditing && <span className="text-xs text-[var(--muted-foreground)] bg-[var(--surface)] px-2 py-1 rounded-md">Preview Mode</span>}
                </div>
                {isEditing ? (
                  <input 
                    type="text"
                    value={previewTitle}
                    onChange={(e) => setPreviewTitle(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--teal)] font-bold"
                  />
                ) : (
                  <div className="px-4 py-2 bg-[var(--surface)] rounded-xl font-bold">{previewTitle}</div>
                )}
                
                <label className="text-sm font-bold text-[var(--foreground)] mt-2">Content (Markdown)</label>
                {isEditing ? (
                  <textarea 
                    value={previewMarkdown}
                    onChange={(e) => setPreviewMarkdown(e.target.value)}
                    className="w-full h-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] font-mono text-sm focus:outline-none focus:border-[var(--teal)] resize-none"
                  />
                ) : (
                  <div className="w-full h-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] overflow-y-auto whitespace-pre-wrap font-mono text-xs opacity-80">
                    {previewMarkdown}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition font-medium"
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          {!previewMarkdown ? (
            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Process Source"}
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 rounded-full bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/80 transition font-medium flex items-center gap-2"
                disabled={isProcessing}
              >
                {isEditing ? <FileText className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? "View Preview" : "Edit Content"}
              </button>
              <button 
                onClick={handleSave}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isProcessing ? "Saving..." : "Save to Vault"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
