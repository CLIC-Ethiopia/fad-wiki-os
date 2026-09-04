import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/setup",
    lazy: () => import("./routes/setup-route"),
  },
  {
    path: "/",
    lazy: () => import("./routes/home-route"),
  },
  {
    path: "/stats",
    lazy: () => import("./routes/stats-route"),
  },
  {
    path: "/graph",
    lazy: () => import("./routes/graph-route"),
  },
  {
    path: "/knowledge-center",
    lazy: () => import("./routes/knowledge-center-route"),
  },
  {
    path: "/help",
    lazy: () => import("./routes/help-route"),
  },
  {
    path: "/wiki/*",
    lazy: () => import("./routes/wiki-route"),
  },
  {
    path: "/tutor",
    lazy: () => import("./routes/tutor/tutor-layout"),
    children: [
      {
        index: true,
        lazy: () => import("./routes/tutor/info-view"),
      },
      {
        path: "chat",
        lazy: () => import("./routes/tutor/chat-view"),
      },
      {
        path: "quiz",
        lazy: () => import("./routes/tutor/quiz-view"),
      },
      {
        path: "research",
        lazy: () => import("./routes/tutor/research-view"),
      },
      {
        path: "visualize",
        lazy: () => import("./routes/tutor/visualize-view"),
      },
      {
        path: "knowledge",
        lazy: () => import("./routes/tutor/knowledge-view"),
      },
      {
        path: "notebook",
        lazy: () => import("./routes/tutor/notebook-view"),
      },
      {
        path: "cowriter",
        lazy: () => import("./routes/tutor/cowriter-view"),
      },

      {
        path: "settings",
        lazy: () => import("./routes/tutor/settings-view"),
      },
      {
        path: "progress",
        lazy: () => import("./routes/tutor/progress-view"),
      },
      {
        path: "planner",
        lazy: () => import("./routes/tutor/planner-view"),
      },
      {
        path: "flashcards",
        lazy: () => import("./routes/tutor/flashcards-view"),
      }
    ]
  },
  {
    path: "*",
    lazy: () => import("./routes/not-found-route"),
  },
]);
