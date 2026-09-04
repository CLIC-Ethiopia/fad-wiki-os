import { NavLink } from "react-router-dom";
import { TutorFooter } from "./tutor-footer";

const guideCards = [
  {
    number: 1,
    icon: "⚙️",
    title: "Set Up Your Profile",
    color: "from-amber-500 to-orange-600",
    accent: "amber",
    description:
      "Head to the Settings tab first! Fill in your industry, learning interests, goals, and difficulty level. This personalises every AI response across the entire tutor to your unique context.",
    link: "/tutor/settings",
    linkLabel: "Open Settings →",
  },
  {
    number: 2,
    icon: "💬",
    title: "Chat",
    color: "from-blue-500 to-cyan-600",
    accent: "blue",
    description:
      "Your main conversational interface with the AI tutor. Ask questions, explore ideas, or get explanations on any STEAM-IE topic. The tutor adapts responses based on your profile settings.",
    link: "/tutor/chat",
    linkLabel: "Open Chat →",
  },
  {
    number: 3,
    icon: "📝",
    title: "Quiz & Practice",
    color: "from-green-500 to-emerald-600",
    accent: "green",
    description:
      "Test your knowledge with AI-generated quizzes tailored to your industry and difficulty level. Get instant feedback on your answers and track mastery over time.",
    link: "/tutor/quiz",
    linkLabel: "Open Quiz →",
  },
  {
    number: 4,
    icon: "🔍",
    title: "Research Assistant",
    color: "from-violet-500 to-purple-600",
    accent: "violet",
    description:
      "Conduct in-depth research on any topic. The assistant searches, summarises, and organises findings into structured reports you can save and revisit.",
    link: "/tutor/research",
    linkLabel: "Open Research →",
  },
  {
    number: 5,
    icon: "📊",
    title: "Visualize Concepts",
    color: "from-rose-500 to-pink-600",
    accent: "rose",
    description:
      "Generate visual diagrams, flowcharts, mind-maps, and concept illustrations. Ideal for understanding complex relationships, processes, and systems visually.",
    link: "/tutor/visualize",
    linkLabel: "Open Visualize →",
  },
  {
    number: 6,
    icon: "🧠",
    title: "Knowledge Base",
    color: "from-teal-500 to-cyan-600",
    accent: "teal",
    description:
      "Browse your accumulated knowledge. Every piece of content you interact with across the tutor feeds into this interconnected knowledge graph.",
    link: "/tutor/knowledge",
    linkLabel: "Open Knowledge →",
  },
  {
    number: 7,
    icon: "📓",
    title: "Notebook",
    color: "from-indigo-500 to-blue-600",
    accent: "indigo",
    description:
      "Your personal digital notebook. Write, edit, and organise notes alongside your learning sessions. Notes are saved and appear in the sidebar for quick access.",
    link: "/tutor/notebook",
    linkLabel: "Open Notebook →",
  },
  {
    number: 8,
    icon: "✍️",
    title: "Co-writer",
    color: "from-fuchsia-500 to-pink-600",
    accent: "fuchsia",
    description:
      "Collaborate with the AI to draft essays, reports, and structured documents. Outline, expand, refine, and polish your writing with intelligent assistance.",
    link: "/tutor/cowriter",
    linkLabel: "Open Co-writer →",
  },
  {
    number: 9,
    icon: "📈",
    title: "Progress Tracker",
    color: "from-orange-500 to-red-600",
    accent: "orange",
    description:
      "Monitor your learning journey. See activity trends, quiz scores, topics explored, and milestones. Stay motivated by visualising your growth over time.",
    link: "/tutor/progress",
    linkLabel: "Open Progress →",
  },
  {
    number: 10,
    icon: "🗓️",
    title: "Study Planner",
    color: "from-sky-500 to-blue-600",
    accent: "sky",
    description:
      "Plan and schedule your study sessions. Set goals, create timelines, and let the AI help you build an optimised learning schedule tailored to your pace.",
    link: "/tutor/planner",
    linkLabel: "Open Planner →",
  },
  {
    number: 11,
    icon: "🗂️",
    title: "Flashcards",
    color: "from-lime-500 to-green-600",
    accent: "lime",
    description:
      "Create and review flashcards for active recall practice. The AI generates cards from your learning material and schedules reviews for maximum retention.",
    link: "/tutor/flashcards",
    linkLabel: "Open Flashcards →",
  },
];

export function Component() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-zinc-950 to-rose-900/40" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            STEAM-IE Smart Education Lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
              Fad Tutor
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your AI-powered learning companion built for{" "}
            <span className="text-purple-300 font-medium">Science</span>,{" "}
            <span className="text-blue-300 font-medium">Technology</span>,{" "}
            <span className="text-emerald-300 font-medium">Engineering</span>,{" "}
            <span className="text-rose-300 font-medium">Arts</span> &{" "}
            <span className="text-amber-300 font-medium">Mathematics</span> for {" "}
            <span className="text-cyan-300 font-medium">Innovation</span> &{" "}
            <span className="text-fuchsia-300 font-medium">
              Entrepreneurship.
            </span>
            <br />
            <br />
            Follow the guide below to get started.
          </p>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-12 pt-2">
        {/* Getting Started Callout */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-start gap-3">
          <span className="text-2xl mt-0.5">🚀</span>
          <div>
            <h3 className="text-amber-300 font-semibold text-sm mb-1">
              Quick Start
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Begin by completing{" "}
              <strong className="text-amber-200">Step 1 — Settings</strong>{" "}
              to personalise your experience. Then explore any tab that
              interests you. Each tool works independently and is enhanced by
              your profile.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:gap-5">
          {guideCards.map((card) => (
            <div
              key={card.number}
              className="group relative rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${card.color} opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className="flex items-start gap-4 p-5 sm:p-6 pl-6 sm:pl-7">
                {/* Number badge */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-${card.accent}-500/20`}
                >
                  {card.number}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{card.icon}</span>
                    <h3 className="text-white font-semibold text-base">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                    {card.description}
                  </p>
                  <NavLink
                    to={card.link}
                    className={`inline-flex items-center gap-1 text-xs font-medium bg-gradient-to-r ${card.color} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                  >
                    {card.linkLabel}
                  </NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>

        <TutorFooter />
      </div>
    </div>
  );
}
