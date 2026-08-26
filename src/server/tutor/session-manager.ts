/**
 * Fad.Tutor — Session manager.
 *
 * SQLite-backed persistence for tutor sessions and messages.
 * Uses a separate database from the wiki index to keep concerns isolated.
 */

import Database from 'better-sqlite3';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Capability } from './prompts';
import type { AgentToolCallRecord } from './agent-loop';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface TutorSession {
  id: string;
  title: string;
  capability: Capability;
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls: AgentToolCallRecord[] | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Database setup                                                    */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), 'data', 'tutor');
const DB_PATH = path.join(DATA_DIR, 'tutor.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  // Synchronous mkdir for first-access simplicity
  require('node:fs').mkdirSync(DATA_DIR, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      capability TEXT NOT NULL DEFAULT 'chat',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      tool_calls TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session
      ON messages(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_updated
      ON sessions(updated_at DESC);
  `);

  return db;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export function createSession(capability: Capability, title?: string): TutorSession {
  const session: TutorSession = {
    id: generateId(),
    title: title || 'New conversation',
    capability,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  getDb()
    .prepare(
      'INSERT INTO sessions (id, title, capability, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(session.id, session.title, session.capability, session.createdAt, session.updatedAt);

  return session;
}

export function getSession(id: string): TutorSession | null {
  const row = getDb()
    .prepare('SELECT id, title, capability, created_at, updated_at FROM sessions WHERE id = ?')
    .get(id) as
    | { id: string; title: string; capability: string; created_at: string; updated_at: string }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    capability: row.capability as Capability,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSessions(limit = 50): TutorSession[] {
  const rows = getDb()
    .prepare(
      'SELECT id, title, capability, created_at, updated_at FROM sessions ORDER BY updated_at DESC LIMIT ?',
    )
    .all(limit) as Array<{
    id: string;
    title: string;
    capability: string;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    capability: row.capability as Capability,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function renameSession(id: string, title: string): boolean {
  const result = getDb()
    .prepare('UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?')
    .run(title, nowIso(), id);
  return result.changes > 0;
}

export function deleteSession(id: string): boolean {
  const result = getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
  return result.changes > 0;
}

export function addMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  toolCalls?: AgentToolCallRecord[] | null,
): TutorMessage {
  const msg: TutorMessage = {
    id: generateId(),
    sessionId,
    role,
    content,
    toolCalls: toolCalls || null,
    createdAt: nowIso(),
  };

  getDb()
    .prepare(
      'INSERT INTO messages (id, session_id, role, content, tool_calls, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      msg.id,
      msg.sessionId,
      msg.role,
      msg.content,
      msg.toolCalls ? JSON.stringify(msg.toolCalls) : null,
      msg.createdAt,
    );

  // Touch session updated_at
  getDb()
    .prepare('UPDATE sessions SET updated_at = ? WHERE id = ?')
    .run(nowIso(), sessionId);

  return msg;
}

export function getMessages(sessionId: string): TutorMessage[] {
  const rows = getDb()
    .prepare(
      'SELECT id, session_id, role, content, tool_calls, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
    )
    .all(sessionId) as Array<{
    id: string;
    session_id: string;
    role: string;
    content: string;
    tool_calls: string | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : null,
    createdAt: row.created_at,
  }));
}

/**
 * Auto-generate a session title from the first user message.
 * Uses Gemini for a one-shot summarization.
 */
export function updateSessionTitle(sessionId: string, title: string): void {
  getDb()
    .prepare('UPDATE sessions SET title = ? WHERE id = ?')
    .run(title, sessionId);
}
