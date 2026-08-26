/**
 * Fad.Tutor — Tool registry and type definitions.
 *
 * Every tool the agent can call is registered here with a JSON Schema
 * for Gemini function declarations, a typed execute function, and a
 * list of capabilities that may use it.
 */

import type { Capability } from './prompts';

/* ------------------------------------------------------------------ */
/*  Core types                                                        */
/* ------------------------------------------------------------------ */

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: ToolParameter;
  required?: boolean;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolResult {
  /** Whether the tool executed successfully */
  ok: boolean;
  /** Human-readable result text fed back into the agent loop */
  content: string;
  /** Optional structured data (charts, diagrams, etc.) */
  data?: unknown;
  /** Optional type hint for client rendering */
  renderType?: 'chart' | 'diagram' | 'interactive' | 'quiz' | 'report';
}

export interface ToolContext {
  /** The Gemini API key for tools that call external APIs */
  apiKey: string;
  /** The current session ID */
  sessionId: string;
  /** Current capability mode */
  capability: Capability;
}

export interface TutorTool {
  /** Unique tool name (matches Gemini function name) */
  name: string;
  /** Human-readable description */
  description: string;
  /** JSON Schema for Gemini function declarations */
  schema: ToolSchema;
  /** Which capabilities can use this tool */
  capabilities: Capability[] | 'all';
  /** Execute the tool with validated parameters */
  execute: (params: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}

/* ------------------------------------------------------------------ */
/*  Registry                                                          */
/* ------------------------------------------------------------------ */

const tools = new Map<string, TutorTool>();

export function registerTool(tool: TutorTool): void {
  if (tools.has(tool.name)) {
    throw new Error(`Tool "${tool.name}" is already registered`);
  }
  tools.set(tool.name, tool);
}

export function getTool(name: string): TutorTool | undefined {
  return tools.get(name);
}

export function getToolsForCapability(capability: Capability): TutorTool[] {
  const result: TutorTool[] = [];
  for (const tool of tools.values()) {
    if (tool.capabilities === 'all' || tool.capabilities.includes(capability)) {
      result.push(tool);
    }
  }
  return result;
}

export function getToolSchemas(capability: Capability): ToolSchema[] {
  return getToolsForCapability(capability).map((t) => t.schema);
}

export function getAllTools(): TutorTool[] {
  return [...tools.values()];
}

/**
 * Execute a tool by name.
 * Throws if the tool doesn't exist or isn't available for the capability.
 */
export async function executeTool(
  name: string,
  params: Record<string, unknown>,
  context: ToolContext,
): Promise<ToolResult> {
  const tool = tools.get(name);
  if (!tool) {
    return { ok: false, content: `Unknown tool: ${name}` };
  }

  if (tool.capabilities !== 'all' && !tool.capabilities.includes(context.capability)) {
    return {
      ok: false,
      content: `Tool "${name}" is not available in ${context.capability} mode`,
    };
  }

  try {
    return await tool.execute(params, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, content: `Tool "${name}" failed: ${message}` };
  }
}
