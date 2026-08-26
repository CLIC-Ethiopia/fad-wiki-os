import { useState, useEffect } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { MarkdownRenderer } from "./markdown-renderer";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty?: "Introduction" | "Intermediate" | "Advanced";
}

export function Component() {
  const { settings, flashcards, setFlashcards } = useTutorStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  const cards: Flashcard[] = flashcards;

  const filteredCards = filterDifficulty === "All"
    ? cards
    : cards.filter(c => c.difficulty === filterDifficulty);

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterDifficulty, flashcards]);

  const handleGenerateFlashcards = async (topicOverride?: string) => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/tutor/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicOverride ?? customTopic })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }
      setFlashcards(data.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error('Flashcard error:', err);
      setErrorMessage(err.message || 'Failed to generate flashcards. Please check your Gemini API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleExportCSV = () => {
    const header = "ID,Front,Back,Difficulty\n";
    const rows = cards.map(c => `"${c.id}","${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}","${c.difficulty || 'Intermediate'}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashcards-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Setup / Generator Landing Screen ──
  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto w-full space-y-8 my-auto">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-light">Spaced Repetition Flashcards</h1>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                15 - 25 Cards (Simple to Complex)
              </span>
            </div>
            <p className="text-zinc-400">
              Generate an AI deck spanning foundational principles to advanced industry challenges.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-medium text-zinc-200 border-b border-zinc-800 pb-3">
              Active Learner Preferences from Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Primary Industry / Domain</span>
                <span className="text-zinc-200 font-medium">{settings.industry || <span className="italic text-zinc-500">General STEAM-IE</span>}</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Secondary Industry / Sub-domain</span>
                <span className="text-zinc-200 font-medium">{settings.secondaryIndustry || <span className="italic text-zinc-500">Not specified</span>}</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Difficulty Level</span>
                <span className="text-emerald-400 font-medium">{settings.difficulty || 'Intermediate'}</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Learning Goal</span>
                <span className="text-zinc-300 text-xs line-clamp-2">{settings.goal || <span className="italic text-zinc-500">Master core concepts</span>}</span>
              </div>
            </div>

            {settings.learningNeeds && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 text-sm">
                <span className="text-zinc-500 text-xs block mb-1">Learning Needs & Style</span>
                <span className="text-zinc-300 text-xs">{settings.learningNeeds}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-zinc-300">
                Custom Topic Focus <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="E.g., Key terminology, regulatory frameworks, unit economics..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
              />
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => handleGenerateFlashcards()}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating 15-25 Flashcards...
                  </>
                ) : (
                  'Generate AI Flashcards'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Flashcard Deck Presentation ──
  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-6 sm:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6 h-full flex flex-col">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-display font-light">Flashcards</h1>
              {settings.industry && (
                <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                  {settings.industry}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm">
              {cards.length} cards · Master concepts through spaced repetition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => setFlashcards([])}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              Generate New Deck
            </button>
          </div>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex gap-2">
          {["All", "Introduction", "Intermediate", "Advanced"].map(diff => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterDifficulty === diff
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Flashcard 3D Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-8">
          
          {filteredCards.length > 0 && activeCard ? (
            <div className="w-full aspect-[3/2] perspective-1000 relative">
              <div 
                className={`w-full h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-700/80 shadow-2xl rounded-2xl flex flex-col justify-between p-8 md:p-10 text-center">
                  <div className="flex justify-between items-center w-full">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                      {activeCard.difficulty || 'Concept'}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>

                  <div className="my-auto px-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-zinc-100 leading-relaxed">
                      {activeCard.front}
                    </h2>
                  </div>

                  <div className="text-xs text-zinc-500 font-medium">Click card to flip for answer</div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-900 border border-emerald-500/40 shadow-2xl rounded-2xl flex flex-col justify-between p-8 md:p-10 text-center overflow-y-auto">
                  <div className="flex justify-between items-center w-full">
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30">
                      Answer & Breakdown
                    </span>
                    <span className="text-xs text-emerald-500/60 font-mono">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>

                  <div className="my-auto px-4 text-left">
                    <MarkdownRenderer content={activeCard.back} />
                  </div>

                  <div className="text-xs text-emerald-500/60 font-medium text-center">Click card to flip back</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">
              No flashcards match the selected filter.
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex items-center gap-6 mt-8">
            <button 
              onClick={handlePrev}
              disabled={filteredCards.length <= 1}
              className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors shadow-md"
              title="Previous card"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              {isFlipped ? 'Show Prompt' : 'Reveal Answer'}
            </button>

            <button 
              onClick={handleNext}
              disabled={filteredCards.length <= 1}
              className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors shadow-md"
              title="Next card"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
