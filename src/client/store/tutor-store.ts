import { create } from 'zustand';

export interface TutorSettings {
  industry: string;
  secondaryIndustry: string;
  interests: string;
  learningNeeds: string;
  goal: string;
  difficulty: string; // Beginner, Intermediate, Expert
}

interface TutorState {
  // Settings
  settings: TutorSettings;
  setSettings: (settings: Partial<TutorSettings>) => void;

  // Chat
  chatMessages: any[];
  chatSessionId: string | null;
  setChatMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
  setChatSessionId: (id: string | null) => void;

  // CoWriter (Assistant)
  cowriterDocument: string;
  cowriterMessages: any[];
  cowriterSessionId: string | null;
  setCowriterDocument: (doc: string | ((prev: string) => string)) => void;
  setCowriterMessages: (messages: any[]) => void;
  setCowriterSessionId: (id: string | null) => void;

  // Quiz
  quizData: any | null;
  quizAnswers: Record<number, number>;
  quizSubmitted: boolean;
  quizCurrentQuestion: number;
  setQuizData: (data: any | null) => void;
  setQuizAnswers: (answers: Record<number, number>) => void;
  setQuizSubmitted: (submitted: boolean) => void;
  setQuizCurrentQuestion: (index: number) => void;

  // Research
  researchMessages: any[];
  researchSessionId: string | null;
  researchTopic: string;
  researchReport: string | null;
  setResearchMessages: (messages: any[]) => void;
  setResearchSessionId: (id: string | null) => void;
  setResearchTopic: (topic: string) => void;
  setResearchReport: (report: string | null) => void;

  // Visualize
  visualizeMessages: any[];
  visualizeSessionId: string | null;
  visualizeTopic: string;
  visualizeData: any | null;
  visualizeHistory: Record<string, any>;
  setVisualizeMessages: (messages: any[]) => void;
  setVisualizeSessionId: (id: string | null) => void;
  setVisualizeTopic: (topic: string) => void;
  setVisualizeData: (data: any | null) => void;
  setVisualizeHistory: (type: string, data: any) => void;

  // Flashcards
  flashcards: any[];
  setFlashcards: (cards: any[]) => void;

  // Global actions
  clearSession: () => void;
}

const DEFAULT_SETTINGS: TutorSettings = {
  industry: "",
  secondaryIndustry: "",
  interests: "",
  learningNeeds: "",
  goal: "",
  difficulty: "Intermediate",
};

export const useTutorStore = create<TutorState>((set) => ({
  // Settings
  settings: DEFAULT_SETTINGS,
  setSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),

  // Chat
  chatMessages: [],
  chatSessionId: null,
  setChatMessages: (messagesOrUpdater) =>
    set((state) => ({
      chatMessages:
        typeof messagesOrUpdater === 'function'
          ? messagesOrUpdater(state.chatMessages)
          : messagesOrUpdater,
    })),
  setChatSessionId: (id) => set({ chatSessionId: id }),

  // CoWriter
  cowriterDocument: "",
  cowriterMessages: [],
  cowriterSessionId: null,
  setCowriterDocument: (docOrUpdater) =>
    set((state) => ({
      cowriterDocument:
        typeof docOrUpdater === 'function'
          ? docOrUpdater(state.cowriterDocument)
          : docOrUpdater,
    })),
  setCowriterMessages: (messages) => set({ cowriterMessages: messages }),
  setCowriterSessionId: (id) => set({ cowriterSessionId: id }),

  // Quiz
  quizData: (() => {
    const saved = localStorage.getItem("tutor_quiz_data");
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  })(),
  quizAnswers: (() => {
    const saved = localStorage.getItem("tutor_quiz_answers");
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  })(),
  quizSubmitted: (() => {
    return localStorage.getItem("tutor_quiz_submitted") === "true";
  })(),
  quizCurrentQuestion: (() => {
    const saved = localStorage.getItem("tutor_quiz_current_question");
    const num = Number(saved);
    return isNaN(num) ? 0 : num;
  })(),
  setQuizData: (data) => set(() => {
    if (data) localStorage.setItem("tutor_quiz_data", JSON.stringify(data));
    else localStorage.removeItem("tutor_quiz_data");
    return { quizData: data };
  }),
  setQuizAnswers: (answers) => set(() => {
    localStorage.setItem("tutor_quiz_answers", JSON.stringify(answers));
    return { quizAnswers: answers };
  }),
  setQuizSubmitted: (submitted) => set(() => {
    localStorage.setItem("tutor_quiz_submitted", String(submitted));
    return { quizSubmitted: submitted };
  }),
  setQuizCurrentQuestion: (index) => set(() => {
    localStorage.setItem("tutor_quiz_current_question", String(index));
    return { quizCurrentQuestion: index };
  }),

  // Research
  researchMessages: [],
  researchSessionId: null,
  researchTopic: "",
  researchReport: null,
  setResearchMessages: (messages) => set({ researchMessages: messages }),
  setResearchSessionId: (id) => set({ researchSessionId: id }),
  setResearchTopic: (topic) => set({ researchTopic: topic }),
  setResearchReport: (report) => set({ researchReport: report }),

  // Visualize
  visualizeMessages: [],
  visualizeSessionId: null,
  visualizeTopic: "",
  visualizeData: null,
  visualizeHistory: {},
  setVisualizeMessages: (messages) => set({ visualizeMessages: messages }),
  setVisualizeSessionId: (id) => set({ visualizeSessionId: id }),
  setVisualizeTopic: (topic) => set({ visualizeTopic: topic }),
  setVisualizeData: (data) => set({ visualizeData: data }),
  setVisualizeHistory: (type, data) => set((state) => ({
    visualizeHistory: { ...state.visualizeHistory, [type]: data }
  })),

  // Flashcards
  flashcards: (() => {
    const saved = localStorage.getItem("tutor_flashcards");
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  })(),
  setFlashcards: (cards) => set(() => {
    localStorage.setItem("tutor_flashcards", JSON.stringify(cards));
    return { flashcards: cards };
  }),

  // Global actions
  clearSession: () => {
    localStorage.removeItem("tutor_flashcards");
    localStorage.removeItem("tutor_quiz_data");
    localStorage.removeItem("tutor_quiz_answers");
    localStorage.removeItem("tutor_quiz_submitted");
    localStorage.removeItem("tutor_quiz_current_question");
    set({
      chatMessages: [],
      chatSessionId: null,
      cowriterDocument: "",
      cowriterMessages: [],
      cowriterSessionId: null,
      quizData: null,
      quizAnswers: {},
      quizSubmitted: false,
      quizCurrentQuestion: 0,
      researchMessages: [],
      researchSessionId: null,
      researchTopic: "",
      researchReport: null,
      visualizeMessages: [],
      visualizeSessionId: null,
      visualizeTopic: "",
      visualizeData: null,
      visualizeHistory: {},
      flashcards: [],
    });
  },
}));
