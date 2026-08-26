import { GoogleGenAI } from '@google/genai';
import { getToolSchemas, executeTool } from './tool-registry';
import { buildSystemPrompt, DEFAULT_MODELS, MAX_ROUNDS, type Capability } from './prompts';
import { getTutorSettings } from './tutor-settings';
import { addMessage } from './session-manager';

export interface AgentToolCallRecord {
  name: string;
  arguments: any;
  result?: any;
}

export type AgentEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_start'; name: string; args: any }
  | { type: 'tool_result'; name: string; ok: boolean; content: string; data?: any; renderType?: string }
  | { type: 'error'; message: string };

export async function* runAgentTurn(
  sessionId: string,
  messages: any[],
  capability: Capability = 'chat'
): AsyncGenerator<AgentEvent, void, unknown> {
  const settings = getTutorSettings();
  const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    yield { type: 'error', message: 'No Gemini API key configured. Please set GEMINI_API_KEY in .env or Settings.' };
    return;
  }

  const genai = new GoogleGenAI({ apiKey });
  const modelName = settings.models?.[capability] || DEFAULT_MODELS[capability] || 'gemini-2.5-flash';
  const maxRounds = MAX_ROUNDS[capability] || 10;

  const info = settings.personalInfo;
  let persona = '';
  if (info?.industry) {
    persona += `You are an expert tutor and mentor specializing in ${info.industry}`;
    if (info.secondaryIndustry) persona += ` (specifically ${info.secondaryIndustry}). `;
    else persona += `. `;
  }

  let memory = '';
  if (info?.industry) memory += `- Primary Industry / Domain: ${info.industry}\n`;
  if (info?.secondaryIndustry) memory += `- Secondary Industry / Sub-domain: ${info.secondaryIndustry}\n`;
  if (info?.interests) memory += `- Interests & Hobbies: ${info.interests}\n`;
  if (info?.learningNeeds) memory += `- Learning Style & Needs: ${info.learningNeeds}\n`;
  if (info?.goal) memory += `- Primary Learning Goal: ${info.goal}\n`;
  if (info?.difficulty) memory += `- Preferred Difficulty: ${info.difficulty}\n`;

  const systemInstruction = buildSystemPrompt(capability, { persona, memory });

  const toolSchemas = getToolSchemas(capability);
  const toolsConfig: any[] = [];
  if (toolSchemas.length > 0) {
    toolsConfig.push({
      functionDeclarations: toolSchemas.map((s) => ({
        name: s.name,
        description: s.description,
        parameters: s.parameters,
      })),
    });
  }

  // Format messages for SDK
  const conversationHistory: any[] = messages.map((m) => {
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    return {
      role,
      parts: [{ text: m.content || '' }],
    };
  });

  let round = 0;
  let fullAssistantText = '';
  const allToolCalls: AgentToolCallRecord[] = [];

  while (round < maxRounds) {
    round++;
    let currentTurnText = '';
    const currentTurnFunctionCalls: Array<{ name: string; args: any }> = [];

    try {
      const responseStream = await genai.models.generateContentStream({
        model: modelName,
        contents: conversationHistory,
        config: {
          systemInstruction,
          ...(toolsConfig.length > 0 ? { tools: toolsConfig } : {}),
          temperature: settings.temperature ?? 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          currentTurnText += chunk.text;
          fullAssistantText += chunk.text;
          yield { type: 'token', text: chunk.text };
        }

        // Check for function calls in chunk
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const fc of chunk.functionCalls) {
            if (fc.name) {
              currentTurnFunctionCalls.push({ name: fc.name, args: fc.args });
            }
          }
        } else if (chunk.candidates?.[0]?.content?.parts) {
          for (const part of chunk.candidates[0].content.parts) {
            if (part.functionCall?.name) {
              currentTurnFunctionCalls.push({
                name: part.functionCall.name,
                args: part.functionCall.args,
              });
            }
          }
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`Gemini agent turn error (round ${round}):`, errMsg);
      yield { type: 'error', message: errMsg };
      return;
    }

    // If no tool calls were requested, the model has finished its response
    if (currentTurnFunctionCalls.length === 0) {
      break;
    }

    // Process tool calls
    for (const fc of currentTurnFunctionCalls) {
      yield { type: 'tool_start', name: fc.name, args: fc.args };

      const toolResult = await executeTool(fc.name, fc.args, {
        apiKey,
        sessionId,
        capability,
      });

      yield {
        type: 'tool_result',
        name: fc.name,
        ok: toolResult.ok,
        content: toolResult.content,
        data: toolResult.data,
        renderType: toolResult.renderType,
      };

      allToolCalls.push({
        name: fc.name,
        arguments: fc.args,
        result: toolResult.content,
      });

      // Append model call and tool response into conversation history for the next iteration
      conversationHistory.push({
        role: 'model',
        parts: [
          ...(currentTurnText ? [{ text: currentTurnText }] : []),
          { functionCall: { name: fc.name, args: fc.args } },
        ],
      });

      conversationHistory.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: fc.name,
              response: {
                output: toolResult.content,
                ...(toolResult.data ? { data: toolResult.data } : {}),
              },
            },
          },
        ],
      });
    }
  }

  // Persist assistant message with any tool calls to database
  if (fullAssistantText.trim() || allToolCalls.length > 0) {
    try {
      addMessage(sessionId, 'assistant', fullAssistantText, allToolCalls.length > 0 ? allToolCalls : null);
    } catch (e) {
      console.error('Failed to save assistant message:', e);
    }
  }
}

