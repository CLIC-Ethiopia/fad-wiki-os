import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  X, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Trash2,
  ListTodo,
  FileCheck2
} from "lucide-react";
import { TutorFooter } from "./tutor-footer";
import { Link } from "react-router-dom";

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

// Visual presets matching the "Info" tab gradient and color scheme style
const BENTO_PRESETS = [
  { classes: "md:col-span-2", gradient: "from-purple-500 to-indigo-600", border: "hover:border-purple-500/50", glow: "hover:shadow-purple-500/10", accent: "purple", icon: "🧠" }, // Week 1: Wide
  { classes: "md:col-span-1", gradient: "from-blue-500 to-cyan-600", border: "hover:border-blue-500/50", glow: "hover:shadow-blue-500/10", accent: "blue", icon: "💻" },     // Week 2: Normal
  { classes: "md:col-span-1", gradient: "from-emerald-500 to-teal-600", border: "hover:border-emerald-500/50", glow: "hover:shadow-emerald-500/10", accent: "emerald", icon: "🔬" }, // Week 3: Normal
  { classes: "md:col-span-1", gradient: "from-amber-500 to-orange-600", border: "hover:border-amber-500/50", glow: "hover:shadow-amber-500/10", accent: "amber", icon: "🚀" }, // Week 4: Normal
  { classes: "md:col-span-1 lg:col-span-2", gradient: "from-rose-500 to-pink-600", border: "hover:border-rose-500/50", glow: "hover:shadow-rose-500/10", accent: "rose", icon: "🎨" },     // Week 5: Wide on lg
  { classes: "md:col-span-1", gradient: "from-violet-500 to-purple-600", border: "hover:border-violet-500/50", glow: "hover:shadow-violet-500/10", accent: "violet", icon: "🔍" }, // Week 6: Normal
  { classes: "md:col-span-1", gradient: "from-teal-500 to-cyan-600", border: "hover:border-teal-500/50", glow: "hover:shadow-teal-500/10", accent: "teal", icon: "🛠️" },     // Week 7: Normal
  { classes: "md:col-span-1", gradient: "from-indigo-500 to-blue-600", border: "hover:border-indigo-500/50", glow: "hover:shadow-indigo-500/10", accent: "indigo", icon: "📊" }, // Week 8: Normal
  { classes: "md:col-span-2", gradient: "from-fuchsia-500 to-pink-600", border: "hover:border-fuchsia-500/50", glow: "hover:shadow-fuchsia-500/10", accent: "fuchsia", icon: "💡" }, // Week 9: Wide
  { classes: "md:col-span-1", gradient: "from-orange-500 to-red-600", border: "hover:border-orange-500/50", glow: "hover:shadow-orange-500/10", accent: "orange", icon: "📈" }, // Week 10: Normal
  { classes: "md:col-span-1", gradient: "from-sky-500 to-blue-600", border: "hover:border-sky-500/50", glow: "hover:shadow-sky-500/10", accent: "sky", icon: "🗓️" },         // Week 11: Normal
  { classes: "md:col-span-1 lg:col-span-2", gradient: "from-lime-500 to-green-600", border: "hover:border-lime-500/50", glow: "hover:shadow-lime-500/10", accent: "lime", icon: "📚" }      // Week 12: Wide on lg
];

export function Component() {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  
  // Synchronous state initialization from localStorage to prevent flash and keep persistence clean
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(() => {
    const saved = localStorage.getItem("study_planner_lesson_plan");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [userTasks, setUserTasks] = useState<UserTask[]>(() => {
    const saved = localStorage.getItem("study_planner_user_tasks");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [completedHours, setCompletedHours] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("study_planner_completed_hours");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Control States
  const [selectedWeek, setSelectedWeek] = useState<WeekPlan | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  // Custom task form fields
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskWeek, setNewTaskWeek] = useState("general");

  // Load latest settings on mount
  useEffect(() => {
    fetch('/api/tutor/settings')
      .then(res => res.json())
      .then(data => {
        if (data.personalInfo) {
          setPersonalInfo(data.personalInfo);
        }
        setLoadingSettings(false);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
        setLoadingSettings(false);
      });
  }, []);

  // Save states to localStorage whenever they change
  useEffect(() => {
    if (lessonPlan) {
      localStorage.setItem("study_planner_lesson_plan", JSON.stringify(lessonPlan));
    } else {
      localStorage.removeItem("study_planner_lesson_plan");
    }
  }, [lessonPlan]);

  useEffect(() => {
    localStorage.setItem("study_planner_user_tasks", JSON.stringify(userTasks));
  }, [userTasks]);

  useEffect(() => {
    localStorage.setItem("study_planner_completed_hours", JSON.stringify(completedHours));
  }, [completedHours]);

  // AI Plan Generation Trigger
  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    setConfirmRegen(false);
    try {
      const res = await fetch("/api/tutor/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || data.message || "Failed to generate plan");
      }
      setLessonPlan(data);
      setCompletedHours({}); // Reset lesson progress for the new plan
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate plan. Please verify your Gemini API key.");
    } finally {
      setGenerating(false);
    }
  };

  // Hour checklist completion calculation helpers
  const toggleHour = (weekNum: number, hourNum: number) => {
    const key = `${weekNum}_${hourNum}`;
    setCompletedHours(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getWeekCompletedHoursCount = (weekNum: number) => {
    return [1, 2, 3, 4].filter(h => completedHours[`${weekNum}_${h}`]).length;
  };

  const isWeekCompleted = (weekNum: number) => {
    return getWeekCompletedHoursCount(weekNum) === 4;
  };

  const getTotalCompletedHours = () => {
    return Object.values(completedHours).filter(Boolean).length;
  };

  // Custom User Tasks Actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: UserTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      week: newTaskWeek,
      completed: false
    };

    setUserTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskWeek("general");
    setIsAddingTask(false);
  };

  const toggleUserTask = (id: number) => {
    setUserTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteUserTask = (id: number) => {
    setUserTasks(prev => prev.filter(t => t.id !== id));
  };

  // If loading settings and no cached plan exists
  if (loadingSettings && !lessonPlan) {
    return (
      <div className="flex-1 p-8 bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <div className="text-zinc-500 text-sm font-medium">Checking planner status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-550 overflow-y-auto relative min-h-screen">
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

        {/* 1. Hero Section Banner (Matching the premium Info banner) */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900/60 via-zinc-950 to-zinc-900/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-rose-900/15 opacity-60" />
          <div className="relative p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                12-Week AI Smart Planner
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {lessonPlan ? lessonPlan.title : "Your Personalized Study Roadmap"}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                {lessonPlan 
                  ? lessonPlan.description 
                  : "Design a customized 12-week study plan consisting of 4 hours of lessons per week (48 hours in total). The AI will tailor the concepts, difficulty, and pace directly to your learning goals and professional domain."
                }
              </p>

              {/* Progress Summary if plan exists */}
              {lessonPlan && (
                <div className="pt-2 flex flex-wrap gap-4 items-center text-xs sm:text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Duration: 12 Weeks</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Progress: {getTotalCompletedHours()} / 48 Hours ({Math.round((getTotalCompletedHours() / 48) * 100)}%)</span>
                  </div>
                  {personalInfo && (
                    <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Targeting: {personalInfo.industry || "General STEAM"} ({personalInfo.difficulty})</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              {lessonPlan ? (
                <>
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-600/10 hover:shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New Task
                  </button>
                  <button 
                    onClick={() => setConfirmRegen(true)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-3 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              ) : (
                <button 
                  onClick={generatePlan}
                  disabled={generating}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Lesson Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Personalized Plan
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Generation Failed</h4>
              <p className="text-zinc-400 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* 2. Empty State View */}
        {!lessonPlan && !generating && (
          <div className="border border-zinc-900 bg-zinc-900/20 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
              🗓️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Plan Not Configured</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We'll assemble 12 detailed bento cards mapped to weekly goals, incorporating your settings, interests, and selected difficulty.
              </p>
            </div>

            {/* Profile configuration summary card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3">
              <h3 className="font-semibold text-zinc-300 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <Settings className="w-4 h-4 text-purple-400" />
                Active Profile Configuration
              </h3>
              {personalInfo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-400 pt-1">
                  <div><span className="text-zinc-500 font-medium">Domain:</span> {personalInfo.industry || "(Not set)"}</div>
                  <div><span className="text-zinc-500 font-medium">Sub-domain:</span> {personalInfo.secondaryIndustry || "(Not set)"}</div>
                  <div><span className="text-zinc-500 font-medium">Level:</span> {personalInfo.difficulty || "Intermediate"}</div>
                  <div className="sm:col-span-2"><span className="text-zinc-500 font-medium">Goal:</span> {personalInfo.goal || "(Not set)"}</div>
                </div>
              ) : (
                <div className="text-zinc-500 italic">No settings loaded.</div>
              )}
              <div className="pt-2 text-center border-t border-zinc-800/60 mt-1">
                <Link to="/tutor/settings" className="text-purple-400 hover:text-purple-300 font-medium text-xs">
                  Update settings in Profile →
                </Link>
              </div>
            </div>

            <button 
              onClick={generatePlan}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 text-sm font-semibold shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Using Profile Settings
            </button>
          </div>
        )}

        {/* 3. Generating Loading State */}
        {generating && (
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-8">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Consulting AI Tutor...</h2>
              <p className="text-zinc-400 text-sm leading-relaxed animate-pulse">
                Structuring a 12-week (48-hour) syllabus tailored to your goal...
              </p>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-rose-500 h-full w-[65%] rounded-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        )}

        {/* 4. Lesson Plan Grid & Layout */}
        {lessonPlan && !generating && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Lesson Roadmap
              </h2>
              <span className="text-xs text-zinc-500 font-medium">Click cards to open details and track progress</span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {lessonPlan.weeks.map((week, index) => {
                const preset = BENTO_PRESETS[index % BENTO_PRESETS.length];
                const completedCount = getWeekCompletedHoursCount(week.weekNumber);
                const completed = completedCount === 4;

                // Find week tasks
                const weekUserTasks = userTasks.filter(t => t.week === String(week.weekNumber));
                const weekUserTasksDone = weekUserTasks.filter(t => t.completed).length;

                return (
                  <div
                    key={week.weekNumber}
                    onClick={() => setSelectedWeek(week)}
                    className={`group relative rounded-2xl bg-zinc-900/40 border border-zinc-800/80 ${preset.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${preset.glow} overflow-hidden flex flex-col justify-between p-6 cursor-pointer ${preset.classes} h-full min-h-[240px]`}
                  >
                    {/* Side gradient accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${preset.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 shadow-md`}>
                            {preset.icon}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Week {week.weekNumber}
                          </span>
                        </div>
                        {completed ? (
                          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : completedCount > 0 ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            {completedCount}/4h
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
                        {week.lessonName}
                      </h3>
                      <p className="text-zinc-450 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {week.description}
                      </p>
                    </div>

                    {/* Footer Progress & Metadata */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-medium">
                      <div className="flex gap-2">
                        {/* Weekly Lesson allocation progress */}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {completedCount * 1}h done
                        </span>
                        
                        {/* Task association indicator */}
                        {weekUserTasks.length > 0 && (
                          <span className="flex items-center gap-1 text-purple-400/80">
                            <ListTodo className="w-3.5 h-3.5" />
                            {weekUserTasksDone}/{weekUserTasks.length} tasks
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom User-Added Tasks Section */}
            <div className="space-y-4 pt-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-purple-400" />
                  Personal Learning Tasks
                </h2>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Card
                </button>
              </div>

              {userTasks.length === 0 ? (
                <div className="border border-zinc-900 border-dashed rounded-2xl p-8 text-center text-zinc-500 text-sm">
                  No personal learning tasks added yet. Click "+ Add Card" or the button in the hero header to create custom tasks.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {userTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="group relative rounded-2xl bg-zinc-900/30 border border-zinc-800 border-dashed hover:border-zinc-700/80 transition-all duration-300 hover:shadow-lg p-5 flex flex-col justify-between min-h-[160px]"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-zinc-600/50 group-hover:bg-purple-500/80 transition-all" />
                      
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-medium">
                            {task.week === "general" ? "📌 General Task" : `🗓️ Week ${task.week}`}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUserTask(task.id);
                            }}
                            className="text-zinc-600 hover:text-red-400 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className={`text-sm font-semibold text-zinc-200 mb-1 ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex justify-between items-center">
                        <button
                          onClick={() => toggleUserTask(task.id)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {task.completed ? (
                            <>
                              <Check className="w-3 h-3" />
                              Done
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Mark Done
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <TutorFooter />
      </div>

      {/* 5. Week Detail Interactive Modal */}
      {selectedWeek && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                  Week {selectedWeek.weekNumber} Lesson Details
                </span>
                <h2 className="text-xl font-bold text-white">
                  {selectedWeek.lessonName}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedWeek(null)}
                className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-xl border border-zinc-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Introduction */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Summary</h3>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                  {selectedWeek.description}
                </p>
              </div>

              {/* Lesson allocation timeline (4 hours breakdown) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Weekly Hour Allocations</h3>
                  <span className="text-xs text-zinc-400 font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    {getWeekCompletedHoursCount(selectedWeek.weekNumber)} / 4 Hours Completed
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {selectedWeek.hoursAllocation.map((item) => {
                    const isHourDone = !!completedHours[`${selectedWeek.weekNumber}_${item.hour}`];
                    return (
                      <div 
                        key={item.hour}
                        onClick={() => toggleHour(selectedWeek.weekNumber, item.hour)}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                          isHourDone 
                            ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30' 
                            : 'bg-zinc-955 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <button
                          className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            isHourDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-zinc-700 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isHourDone ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              HOUR {item.hour}
                            </span>
                            <span className={`text-sm font-semibold ${isHourDone ? 'text-zinc-400 line-through' : 'text-white'}`}>
                              {item.topic}
                            </span>
                          </div>
                          <p className={`text-xs ${isHourDone ? 'text-zinc-500 line-through' : 'text-zinc-400'} leading-relaxed`}>
                            <span className="font-semibold text-zinc-500">Activity: </span>{item.activity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personal tasks for this week if any */}
              {userTasks.filter(t => t.week === String(selectedWeek.weekNumber)).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Week {selectedWeek.weekNumber} Personal Tasks</h3>
                  <div className="space-y-2">
                    {userTasks
                      .filter(t => t.week === String(selectedWeek.weekNumber))
                      .map((task) => (
                        <div 
                          key={task.id}
                          onClick={() => toggleUserTask(task.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-zinc-950/40 border-zinc-800/80 text-zinc-500'
                              : 'bg-zinc-955 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              task.completed ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-700'
                            }`}>
                              {task.completed && <Check className="w-3 h-3" />}
                            </span>
                            <div className="min-w-0">
                              <span className={`text-sm font-semibold truncate block ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <span className={`text-xs block line-clamp-1 ${task.completed ? 'text-zinc-600' : 'text-zinc-405'}`}>
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUserTask(task.id);
                            }}
                            className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Progress */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center text-sm font-medium">
              <span className="text-zinc-400">
                Syllabus progress: {getWeekCompletedHoursCount(selectedWeek.weekNumber) * 25}%
              </span>
              <button 
                onClick={() => setSelectedWeek(null)}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-205 px-5 py-2 rounded-xl transition-all font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Personal Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-purple-400" />
                Add Personal Task
              </h2>
              <button 
                onClick={() => setIsAddingTask(false)}
                className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-xl border border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g., Complete Chapter 3 exercises"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Notes, links, or specific targets..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all min-h-[80px] resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Timeline / Week Association</label>
                <select
                  value={newTaskWeek}
                  onChange={(e) => setNewTaskWeek(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                >
                  <option value="general">📌 General (Unassigned)</option>
                  {lessonPlan?.weeks.map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      🗓️ Week {w.weekNumber}: {w.lessonName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-purple-600/10"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Confirm Regeneration Warning Modal */}
      {confirmRegen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Regenerate Lesson Plan?
              </h2>
              <button 
                onClick={() => setConfirmRegen(false)}
                className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-xl border border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-zinc-450 text-sm leading-relaxed">
                Are you sure you want to regenerate your 12-week study plan? This will replace the current syllabus with a new plan tailored to your latest settings.
              </p>
              
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs text-amber-400/90 leading-relaxed">
                <strong>Please Note:</strong> Your hour-by-hour completion progress for the weekly lessons will be reset. However, your custom personal tasks will be kept.
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setConfirmRegen(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={generatePlan}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-amber-600/10"
                >
                  Yes, Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
