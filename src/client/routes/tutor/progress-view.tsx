import { useState, useEffect } from "react";
import { useTutorStore } from "../../store/tutor-store";
import { 
  Check, 
  Clock, 
  Calendar, 
  BookOpen, 
  ListTodo, 
  Sparkles, 
  Award, 
  Brain, 
  FileCheck2, 
  HelpCircle,
  HelpCircle as QuizIcon,
  Layers,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { TutorFooter } from "./tutor-footer";

interface HourAllocation {
  hour: number;
  topic: string;
  activity: string;
}

interface WeekPlan {
  weekNumber: number;
  lessonName: string;
  description: string;
  hoursAllocation: HourAllocation[];
}

interface LessonPlan {
  title: string;
  description: string;
  weeks: WeekPlan[];
}

interface UserTask {
  id: number;
  title: string;
  description: string;
  week: string; // "general" or "1" to "12"
  completed: boolean;
}

// Accent styles matching the study planner presets
const SECTION_COLORS = [
  { border: "hover:border-purple-500/50", glow: "hover:shadow-purple-500/10", accent: "purple", gradient: "from-purple-500 to-indigo-600", icon: "🧠" },
  { border: "hover:border-blue-500/50", glow: "hover:shadow-blue-500/10", accent: "blue", gradient: "from-blue-500 to-cyan-600", icon: "💻" },
  { border: "hover:border-emerald-500/50", glow: "hover:shadow-emerald-500/10", accent: "emerald", gradient: "from-emerald-500 to-teal-600", icon: "🔬" },
  { border: "hover:border-amber-500/50", glow: "hover:shadow-amber-500/10", accent: "amber", gradient: "from-amber-500 to-orange-600", icon: "🚀" },
  { border: "hover:border-rose-500/50", glow: "hover:shadow-rose-500/10", accent: "rose", gradient: "from-rose-500 to-pink-600", icon: "🎨" },
  { border: "hover:border-violet-500/50", glow: "hover:shadow-violet-500/10", accent: "violet", gradient: "from-violet-500 to-purple-600", icon: "🔍" },
  { border: "hover:border-teal-500/50", glow: "hover:shadow-teal-500/10", accent: "teal", gradient: "from-teal-500 to-cyan-600", icon: "🛠️" },
  { border: "hover:border-indigo-500/50", glow: "hover:shadow-indigo-500/10", accent: "indigo", gradient: "from-indigo-500 to-blue-600", icon: "📊" },
  { border: "hover:border-fuchsia-500/50", glow: "hover:shadow-fuchsia-500/10", accent: "fuchsia", gradient: "from-fuchsia-500 to-pink-600", icon: "💡" },
  { border: "hover:border-orange-500/50", glow: "hover:shadow-orange-500/10", accent: "orange", gradient: "from-orange-500 to-red-600", icon: "📈" },
  { border: "hover:border-sky-500/50", glow: "hover:shadow-sky-500/10", accent: "sky", gradient: "from-sky-500 to-blue-600", icon: "🗓️" },
  { border: "hover:border-lime-500/50", glow: "hover:shadow-lime-500/10", accent: "lime", gradient: "from-lime-500 to-green-600", icon: "📚" }
];

export function Component() {
  const { flashcards, quizData, quizAnswers, setQuizAnswers, quizSubmitted } = useTutorStore();

  // Local state synced with LocalStorage for live interactive checks
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(() => {
    const saved = localStorage.getItem("study_planner_lesson_plan");
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [completedHours, setCompletedHours] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("study_planner_completed_hours");
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  const [userTasks, setUserTasks] = useState<UserTask[]>(() => {
    const saved = localStorage.getItem("study_planner_user_tasks");
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [flashcardsStudied, setFlashcardsStudied] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem("tutor_flashcards_studied");
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  // Track active tab selection inside progress view
  const [activeSection, setActiveSection] = useState<"syllabus" | "tasks" | "flashcards" | "quizzes">("syllabus");

  // LocalStorage state sync
  useEffect(() => {
    localStorage.setItem("study_planner_completed_hours", JSON.stringify(completedHours));
  }, [completedHours]);

  useEffect(() => {
    localStorage.setItem("study_planner_user_tasks", JSON.stringify(userTasks));
  }, [userTasks]);

  useEffect(() => {
    localStorage.setItem("tutor_flashcards_studied", JSON.stringify(flashcardsStudied));
  }, [flashcardsStudied]);

  // Hourly completion helpers
  const toggleHour = (weekNum: number, hourNum: number) => {
    const key = `${weekNum}_${hourNum}`;
    setCompletedHours(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getWeekCompletedHoursCount = (weekNum: number) => {
    return [1, 2, 3, 4].filter(h => completedHours[`${weekNum}_${h}`]).length;
  };

  const isWeekCompleted = (weekNum: number) => {
    return getWeekCompletedHoursCount(weekNum) === 4;
  };

  // Calculations for Hero Stats
  const totalCompletedHours = Object.values(completedHours).filter(Boolean).length;
  const syllabusPercentage = Math.round((totalCompletedHours / 48) * 100);

  const completedWeeksCount = lessonPlan 
    ? lessonPlan.weeks.filter(w => isWeekCompleted(w.weekNumber)).length 
    : 0;
  const remainingWeeksCount = lessonPlan 
    ? 12 - completedWeeksCount 
    : 12;

  // Personal tasks calculations
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(t => t.completed).length;

  // Quiz calculations
  const totalQuizQuestions = quizData?.questions?.length || 0;
  const completedQuizQuestions = Object.keys(quizAnswers).length;

  // Flashcard calculations
  const totalFlashcards = flashcards.length;
  const studiedFlashcardsCount = flashcards.filter(c => flashcardsStudied[c.id]).length;

  // Overall mastery percentage
  const totalItemsCount = 48 + totalTasks + totalFlashcards + totalQuizQuestions;
  const completedItemsCount = totalCompletedHours + completedTasks + studiedFlashcardsCount + completedQuizQuestions;
  const overallMastery = totalItemsCount > 0 
    ? Math.round((completedItemsCount / totalItemsCount) * 100) 
    : 0;

  // Actions
  const toggleUserTask = (id: number) => {
    setUserTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleFlashcardStudied = (id: number) => {
    setFlashcardsStudied(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleQuizQuestionCompleted = (index: number) => {
    const next = { ...quizAnswers };
    if (next[index] !== undefined) {
      delete next[index];
    } else {
      next[index] = 0; // mark answered with default option
    }
    setQuizAnswers(next);
  };

  return (
    <div className="flex-1 bg-zinc-955 text-zinc-50 overflow-y-auto relative min-h-screen">
      {/* Background Dot Grid Mesh */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">

        {/* 1. Hero Dashboard Section */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900/60 via-zinc-950 to-zinc-900/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-rose-900/15 opacity-60" />
          <div className="relative p-6 sm:p-10 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Performance & Progress Tracker
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                Learning Mastery Analytics
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                Analyze and record your hour-by-hour course progress, custom study planner tasks, flashcard repetitions, and active assessments. Tick items directly to record and view real-time calculations.
              </p>
            </div>

            {/* Progress Metrics Row (Bento Grid Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Mastery */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Overall Mastery</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">{overallMastery}%</div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full" style={{ width: `${overallMastery}%` }} />
                  </div>
                </div>
              </div>

              {/* Lessons Completed */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Syllabus Hours</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">{totalCompletedHours} <span className="text-zinc-500 text-sm">/ 48h</span></div>
                  <div className="text-xs text-zinc-400 mt-1">{remainingWeeksCount} of 12 weeks remaining</div>
                </div>
              </div>

              {/* Personal Tasks */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Planner Tasks</span>
                  <ListTodo className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {completedTasks} <span className="text-zinc-500 text-sm">/ {totalTasks}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{totalTasks - completedTasks} remaining tasks</div>
                </div>
              </div>

              {/* Quiz Status */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Quiz Completed</span>
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {completedQuizQuestions} <span className="text-zinc-500 text-sm">/ {totalQuizQuestions}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {quizSubmitted ? "Assessment Submitted" : "Assessment in progress"}
                  </div>
                </div>
              </div>

              {/* Flashcard Stats */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Cards Studied</span>
                  <Brain className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {studiedFlashcardsCount} <span className="text-zinc-500 text-sm">/ {totalFlashcards}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{totalFlashcards - studiedFlashcardsCount} cards unreviewed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Navigation Tab Menu */}
        <div className="border-b border-zinc-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection("syllabus")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === "syllabus"
                ? "border-purple-500 text-white bg-purple-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            12-Week Syllabus ({totalCompletedHours}/48h)
          </button>
          <button
            onClick={() => setActiveSection("tasks")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === "tasks"
                ? "border-blue-500 text-white bg-blue-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Personal Tasks ({completedTasks}/{totalTasks})
          </button>
          <button
            onClick={() => setActiveSection("flashcards")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === "flashcards"
                ? "border-rose-500 text-white bg-rose-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Brain className="w-4 h-4" />
            Flashcards ({studiedFlashcardsCount}/{totalFlashcards})
          </button>
          <button
            onClick={() => setActiveSection("quizzes")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === "quizzes"
                ? "border-amber-500 text-white bg-amber-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <QuizIcon className="w-4 h-4" />
            Quiz Questions ({completedQuizQuestions}/{totalQuizQuestions})
          </button>
        </div>

        {/* 3. Dynamic Section Content */}
        
        {/* A. Weekly Syllabus Panel */}
        {activeSection === "syllabus" && (
          <div className="space-y-6">
            {!lessonPlan ? (
              <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-10 text-center text-zinc-500 text-sm">
                No active 12-week study plan detected. Please configure and generate a plan in the **Study Planner** tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lessonPlan.weeks.map((week, index) => {
                  const preset = SECTION_COLORS[index % SECTION_COLORS.length];
                  const completedCount = getWeekCompletedHoursCount(week.weekNumber);
                  const isDone = completedCount === 4;

                  return (
                    <div
                      key={week.weekNumber}
                      className={`group relative rounded-2xl bg-zinc-900/40 border border-zinc-800/80 ${preset.border} ${preset.glow} transition-all duration-300 p-6 flex flex-col justify-between min-h-[260px]`}
                    >
                      {/* Left accent color strip */}
                      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${preset.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Week {week.weekNumber} Lesson
                          </span>
                          {isDone ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          ) : completedCount > 0 ? (
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                              {completedCount}/4h
                            </span>
                          ) : null}
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {week.lessonName}
                        </h3>

                        {/* Interactive Hours Checklist */}
                        <div className="space-y-2 pt-1">
                          {week.hoursAllocation.map((item) => {
                            const hourKey = `${week.weekNumber}_${item.hour}`;
                            const isHourChecked = !!completedHours[hourKey];

                            return (
                              <div
                                key={item.hour}
                                onClick={() => toggleHour(week.weekNumber, item.hour)}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                                  isHourChecked
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-400"
                                    : "bg-zinc-950 border-zinc-800/80 text-zinc-200 hover:border-zinc-700"
                                }`}
                              >
                                <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isHourChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-700"
                                }`}>
                                  {isHourChecked && <Check className="w-2.5 h-2.5" />}
                                </span>
                                <span className="font-semibold text-zinc-500 shrink-0">H{item.hour}:</span>
                                <span className={`truncate ${isHourChecked ? "line-through text-zinc-500" : ""}`} title={item.topic}>
                                  {item.topic}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Footer Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/60">
                        <div className="w-full bg-zinc-950 border border-zinc-850 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${preset.gradient}`}
                            style={{ width: `${completedCount * 25}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* B. Personal Tasks Panel */}
        {activeSection === "tasks" && (
          <div className="space-y-6">
            {userTasks.length === 0 ? (
              <div className="border border-zinc-900 border-dashed rounded-2xl p-10 text-center text-zinc-500 text-sm">
                No personal learning tasks created yet. You can add them in the **Study Planner** tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleUserTask(task.id)}
                    className={`group relative rounded-2xl bg-zinc-900/30 border border-zinc-800 border-dashed hover:border-zinc-700/80 transition-all p-5 flex flex-col justify-between min-h-[160px] cursor-pointer`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-zinc-600/50 group-hover:bg-blue-500/80 transition-all" />
                    
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-medium">
                          {task.week === "general" ? "📌 General Task" : `🗓️ Week ${task.week}`}
                        </span>
                        {task.completed && (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-bold text-zinc-200 mb-1 ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center gap-2">
                      <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        task.completed ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-700"
                      }`}>
                        {task.completed && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold select-none">
                        {task.completed ? "Mark Incomplete" : "Mark Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* C. Flashcards Panel */}
        {activeSection === "flashcards" && (
          <div className="space-y-6">
            {flashcards.length === 0 ? (
              <div className="border border-zinc-900 border-dashed rounded-2xl p-10 text-center text-zinc-500 text-sm">
                No active flashcards found. Generate and study decks in the **Flashcards** tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {flashcards.map((card) => {
                  const isStudied = !!flashcardsStudied[card.id];
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleFlashcardStudied(card.id)}
                      className={`group relative rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-rose-500/30 transition-all p-5 flex flex-col justify-between min-h-[160px] cursor-pointer`}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full transition-all ${isStudied ? "bg-rose-500/80" : "bg-zinc-800"}`} />
                      
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900/85 border border-zinc-800 text-zinc-400 font-medium">
                            {card.difficulty || "Intermediate"}
                          </span>
                          {isStudied && (
                            <span className="text-[10px] font-bold text-rose-450 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                              Studied
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xs font-semibold text-zinc-200 leading-relaxed mb-2 line-clamp-3 ${isStudied ? 'text-zinc-500' : ''}`}>
                          {card.front}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center gap-2">
                        <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isStudied ? "bg-rose-500 border-rose-500 text-white" : "border-zinc-700"
                        }`}>
                          {isStudied && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold select-none">
                          {isStudied ? "Studied (Click to reset)" : "Mark Studied"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* D. Quizzes Panel */}
        {activeSection === "quizzes" && (
          <div className="space-y-6">
            {!quizData ? (
              <div className="border border-zinc-900 border-dashed rounded-2xl p-10 text-center text-zinc-500 text-sm">
                No active assessment quiz found. Generate and practice quizzes in the **Quiz & Practice** tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quizData.questions.map((question: any, idx: number) => {
                  const isAnswered = quizAnswers[idx] !== undefined;
                  return (
                    <div
                      key={question.id}
                      onClick={() => toggleQuizQuestionCompleted(idx)}
                      className={`group relative rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-amber-500/30 transition-all p-5 flex flex-col justify-between min-h-[160px] cursor-pointer`}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full transition-all ${isAnswered ? "bg-amber-500/80" : "bg-zinc-800"}`} />
                      
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900/85 border border-zinc-800 text-zinc-400 font-medium">
                            {question.type === "mcq" ? "MCQ Option" : "True / False"}
                          </span>
                          {isAnswered && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xs font-semibold text-zinc-200 leading-relaxed mb-2 line-clamp-3 ${isAnswered ? 'text-zinc-500' : ''}`}>
                          {question.text}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center gap-2">
                        <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isAnswered ? "bg-amber-500 border-amber-500 text-white" : "border-zinc-700"
                        }`}>
                          {isAnswered && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold select-none">
                          {isAnswered ? "Answered (Toggle complete)" : "Mark Answered"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <TutorFooter />
      </div>
    </div>
  );
}
