import { useState, useEffect } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { MarkdownRenderer } from "./markdown-renderer";
import { TutorFooter } from "./tutor-footer";

interface QuizQuestion {
  id: number;
  type?: 'mcq' | 'true_false';
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  title: string;
  industry: string;
  questions: QuizQuestion[];
}

export function Component() {
  const {
    settings,
    quizData,
    setQuizData,
    quizAnswers,
    setQuizAnswers,
    quizSubmitted,
    setQuizSubmitted,
    quizCurrentQuestion: currentQuestion,
    setQuizCurrentQuestion: setCurrentQuestion,
  } = useTutorStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeQuiz: QuizData | null = quizData;
  const questions = activeQuiz?.questions || [];
  const question = questions[currentQuestion];
  const isLastQuestion = questions.length > 0 && currentQuestion === questions.length - 1;

  // Sync selectedOption and hasSubmitted whenever the current question changes or on load
  useEffect(() => {
    if (quizAnswers[currentQuestion] !== undefined) {
      setSelectedOption(quizAnswers[currentQuestion]);
      setHasSubmitted(true);
    } else {
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  }, [currentQuestion, quizAnswers]);

  // Derive score from stored answers
  const score = Object.entries(quizAnswers).reduce((acc, [qIdx, answer]) => {
    const q = questions[Number(qIdx)];
    return q && answer === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const handleGenerateQuiz = async (topicOverride?: string) => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/tutor/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicOverride ?? customTopic })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      setQuizData(data);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setHasSubmitted(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setErrorMessage(err.message || 'Failed to generate quiz. Please verify your Gemini API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setQuizAnswers({ ...quizAnswers, [currentQuestion]: selectedOption });
    setHasSubmitted(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizSubmitted(true);
    } else {
      const nextIdx = currentQuestion + 1;
      setCurrentQuestion(nextIdx);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevIdx = currentQuestion - 1;
      setCurrentQuestion(prevIdx);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  // ── Initial / Setup Landing State if no quiz is loaded ──
  if (!activeQuiz || questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto w-full space-y-8 my-auto">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-light">Personalized Quiz Generator</h1>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                15 - 25 Questions
              </span>
            </div>
            <p className="text-zinc-400">
              Generate a tailored multi-concept assessment calibrated to your exact background, learning style, and goals.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-medium text-zinc-200 border-b border-zinc-800 pb-3">
              Active Learner Profile from Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Primary Industry / Domain</span>
                <span className="text-zinc-200 font-medium">{settings.industry || <span className="italic text-zinc-500">Not set (general STEAM-IE)</span>}</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-xs block mb-1">Secondary Industry / Sub-domain</span>
                <span className="text-zinc-200 font-medium">{settings.secondaryIndustry || <span className="italic text-zinc-500">Not set</span>}</span>
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
                placeholder="E.g., Disruptive business models, precision agriculture, telemedicine protocols..."
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
                onClick={() => handleGenerateQuiz()}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating 15-25 Questions...
                  </>
                ) : (
                  'Generate AI Quiz'
                )}
              </button>
            </div>
          </div>
        </div>

        <TutorFooter />
      </div>
    );
  }

  // ── Results Screen when Quiz is Completed ──
  if (quizSubmitted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-8">
        <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-display font-light mb-2">Assessment Completed</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            {activeQuiz.title} · <span className="text-emerald-400">{activeQuiz.industry}</span>
          </p>

          <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 mb-8 space-y-3">
            <div className="text-4xl font-semibold text-emerald-400">{percentage}%</div>
            <p className="text-zinc-300 text-sm">
              You correctly answered <span className="text-white font-semibold">{score}</span> out of {questions.length} questions.
            </p>
            <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setQuizSubmitted(false);
                setCurrentQuestion(0);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              Review Questions
            </button>
            <button
              onClick={resetQuiz}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              Retake This Quiz
            </button>
            <button
              onClick={() => { setQuizData(null); resetQuiz(); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              Generate New Quiz
            </button>
          </div>
        </div>

        <TutorFooter />
      </div>
    );
  }

  // ── One Question at a Time Stepper UI ──
  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto p-6 sm:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-display font-light">Quiz Mode</h1>
              <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                {activeQuiz.industry}
              </span>
              {question.type === 'true_false' && (
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                  True / False
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm">{activeQuiz.title}</p>
          </div>

          <button
            onClick={() => { setQuizData(null); resetQuiz(); }}
            className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg transition-colors shrink-0"
          >
            New Quiz
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Question Stepper Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            {/* Dot Stepper Indicator */}
            <div className="flex flex-wrap gap-1 max-w-full">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQuestion(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentQuestion
                      ? 'bg-emerald-500 w-7'
                      : quizAnswers[i] !== undefined
                      ? 'bg-emerald-500/60 w-3.5'
                      : 'bg-zinc-800 w-3.5 hover:bg-zinc-700'
                  }`}
                  title={`Jump to Question ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-light text-zinc-100 leading-relaxed mb-8">
            {question.text}
          </h2>

          {/* Options List */}
          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === question.correctAnswer;
              
              let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 ";
              
              if (!hasSubmitted) {
                btnClass += isSelected 
                  ? "bg-zinc-800 border-emerald-500/80 text-white shadow-md ring-1 ring-emerald-500/50" 
                  : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700";
              } else {
                if (isCorrect) {
                  btnClass += "bg-emerald-900/30 border-emerald-500/60 text-emerald-200 shadow-sm";
                } else if (isSelected && !isCorrect) {
                  btnClass += "bg-rose-900/30 border-rose-500/60 text-rose-200";
                } else {
                  btnClass += "bg-zinc-950 border-zinc-800 text-zinc-500 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  disabled={hasSubmitted}
                  onClick={() => setSelectedOption(i)}
                  className={btnClass}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-medium
                      ${hasSubmitted && isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 
                        hasSubmitted && isSelected && !isCorrect ? 'border-rose-500 bg-rose-500/20 text-rose-300' : 
                        isSelected ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-zinc-700 text-zinc-400'}
                    `}>
                      {question.type === 'true_false' ? (i === 0 ? 'T' : 'F') : String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm md:text-base leading-relaxed">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation Feedback Block */}
          {hasSubmitted && (
            <div className={`mt-8 p-6 rounded-xl border animate-in fade-in ${
              selectedOption === question.correctAnswer 
                ? 'bg-emerald-900/15 border-emerald-500/40 text-emerald-100' 
                : 'bg-rose-900/15 border-rose-500/40 text-rose-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedOption === question.correctAnswer ? (
                  <>
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="font-medium text-emerald-400">Correct!</h3>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <h3 className="font-medium text-rose-400">Incorrect</h3>
                  </>
                )}
              </div>
              <div className="text-zinc-300 text-sm leading-relaxed mt-2">
                <MarkdownRenderer content={question.explanation} />
              </div>
            </div>
          )}

          {/* Action Buttons (Previous Question, Submit, Next Question) */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              {currentQuestion > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-5 py-3 rounded-xl font-medium transition-colors text-sm border border-zinc-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Question
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!hasSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-medium transition-colors text-sm shadow-md"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium transition-colors text-sm shadow-md flex items-center gap-2"
                >
                  {isLastQuestion ? 'View Results' : 'Next Question'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

        </div>

        <TutorFooter />
      </div>
    </div>
  );
}
