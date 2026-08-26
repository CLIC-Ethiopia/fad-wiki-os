/**
 * Fad.Tutor — Thinking tools.
 *
 * `reason`     — structured chain-of-thought scratchpad.
 * `brainstorm` — generate multiple approaches before picking one.
 * `ask_user`   — pause the agent loop to ask the user a question.
 */

import { registerTool } from '../tool-registry';

/* ------------------------------------------------------------------ */
/*  reason — chain-of-thought scratchpad                              */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'reason',
  description:
    'Use this tool to think step-by-step before answering. Write out your reasoning process, break down the problem, and organize your thoughts. The output will NOT be shown to the user — it is your private scratchpad.',
  schema: {
    name: 'reason',
    description: 'Private step-by-step reasoning scratchpad.',
    parameters: {
      type: 'object',
      properties: {
        thinking: {
          type: 'string',
          description:
            'Your step-by-step reasoning, analysis, and working-out process.',
        },
      },
      required: ['thinking'],
    },
  },
  capabilities: 'all',
  async execute(params) {
    // The thinking content is captured by the agent loop for inspection
    // but is not shown to the user in the final response.
    return {
      ok: true,
      content: `Reasoning complete. Proceed with your response incorporating these insights.`,
    };
  },
});

/* ------------------------------------------------------------------ */
/*  brainstorm — multi-approach ideation                              */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'brainstorm',
  description:
    'Generate multiple distinct approaches, ideas, or perspectives on a problem before selecting the best one. Use when there is not a single obvious answer.',
  schema: {
    name: 'brainstorm',
    description: 'Generate multiple approaches or ideas.',
    parameters: {
      type: 'object',
      properties: {
        approaches: {
          type: 'string',
          description:
            'A numbered list of distinct approaches or ideas, with brief pros/cons for each.',
        },
        selected: {
          type: 'string',
          description:
            'Which approach you selected and why.',
        },
      },
      required: ['approaches', 'selected'],
    },
  },
  capabilities: 'all',
  async execute(params) {
    return {
      ok: true,
      content: `Brainstorming complete. Selected approach: ${params.selected}`,
    };
  },
});

/* ------------------------------------------------------------------ */
/*  ask_user — pause and ask the human                                */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'ask_user',
  description:
    'Pause the conversation to ask the user a clarifying question. Use when you need more information before proceeding. The user will see the question and can respond.',
  schema: {
    name: 'ask_user',
    description: 'Ask the user a clarifying question.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question to ask the user.',
        },
        options: {
          type: 'array',
          description:
            'Optional list of suggested answers for the user to choose from.',
          items: { type: 'string', description: 'A suggested answer option.' },
        },
      },
      required: ['question'],
    },
  },
  capabilities: 'all',
  async execute(params) {
    // The agent loop intercepts ask_user calls and sends them to the
    // client as a special event. This execute is a no-op fallback.
    return {
      ok: true,
      content: `Asked user: ${params.question}`,
      data: {
        type: 'ask_user',
        question: params.question,
        options: params.options || [],
      },
      renderType: undefined,
    };
  },
});
