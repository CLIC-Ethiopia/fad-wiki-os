/**
 * Fad.Tutor — Settings manager.
 *
 * Reads/writes tutor configuration from `data/tutor/settings.json`.
 * Falls back to sensible defaults when the file doesn't exist.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Capability } from './prompts';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface TutorSettings {
  /** Gemini API key — overrides .env GEMINI_API_KEY */
  geminiApiKey?: string;
  /** Per-capability model override, e.g. { deep_research: "gemini-2.5-pro" } */
  models?: Partial<Record<Capability, string>>;
  /** Default temperature (0.0 – 2.0) */
  temperature?: number;
  /** Default max output tokens */
  maxOutputTokens?: number;
  /** Whether memory is enabled */
  memoryEnabled?: boolean;
  /** Active persona name (filename without .md) */
  activePersona?: string | null;
  /** Default knowledge base ID to ground against */
  defaultKb?: string | null;
  /** Personal information to help the tutor customize its teaching */
  personalInfo?: {
    interests?: string;
    learningNeeds?: string;
    goal?: string;
    industry?: string;
    secondaryIndustry?: string;
    difficulty?: string;
  };
}

const DEFAULT_SETTINGS: Required<TutorSettings> = {
  geminiApiKey: '',
  models: {},
  temperature: 0.7,
  maxOutputTokens: 8192,
  memoryEnabled: true,
  activePersona: null,
  defaultKb: null,
  personalInfo: {
    interests: '',
    learningNeeds: '',
    goal: '',
    industry: '',
    secondaryIndustry: '',
    difficulty: 'Intermediate',
  },
};

/* ------------------------------------------------------------------ */
/*  File location                                                     */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), 'data', 'tutor');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

/* ------------------------------------------------------------------ */
/*  In-memory cache                                                   */
/* ------------------------------------------------------------------ */

let cachedSettings: TutorSettings | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 5_000; // Re-read from disk every 5 s

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export function getTutorSettings(): TutorSettings {
  if (cachedSettings && Date.now() - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    // Synchronous read for hot path — the file is tiny
    const raw = require('node:fs').readFileSync(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<TutorSettings>;
    cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
    cacheLoadedAt = Date.now();
    return cachedSettings;
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS };
    cacheLoadedAt = Date.now();
    return cachedSettings;
  }
}

export async function saveTutorSettings(
  update: Partial<TutorSettings>,
): Promise<TutorSettings> {
  const current = getTutorSettings();
  const merged: TutorSettings = { ...current, ...update };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');

  cachedSettings = merged;
  cacheLoadedAt = Date.now();
  return merged;
}

export async function ensureTutorDataDirs(): Promise<void> {
  const dirs = [
    DATA_DIR,
    path.join(DATA_DIR, 'memory', 'L1', 'chat'),
    path.join(DATA_DIR, 'memory', 'L1', 'quiz'),
    path.join(DATA_DIR, 'memory', 'L1', 'research'),
    path.join(DATA_DIR, 'memory', 'L2'),
    path.join(DATA_DIR, 'memory', 'L3'),
    path.join(DATA_DIR, 'notebooks'),
    path.join(DATA_DIR, 'personas'),
    path.join(DATA_DIR, 'question-bank'),
    path.join(DATA_DIR, 'attachments'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}
