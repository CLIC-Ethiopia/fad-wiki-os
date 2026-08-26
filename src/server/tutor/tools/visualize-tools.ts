/**
 * Fad.Tutor — Visualization tools.
 *
 * `create_chart`       — generates Chart.js config JSON for client rendering.
 * `create_diagram`     — generates Mermaid diagram code.
 * `create_interactive` — generates self-contained HTML widget.
 */

import { registerTool } from '../tool-registry';

/* ------------------------------------------------------------------ */
/*  create_chart                                                      */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'create_chart',
  description:
    'Create a chart using Chart.js. Provide a complete Chart.js configuration object. The client will render it.',
  schema: {
    name: 'create_chart',
    description: 'Create a Chart.js chart.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title for the chart.',
        },
        chart_config: {
          type: 'string',
          description:
            'A JSON string containing the full Chart.js configuration object with type, data, and options.',
        },
        explanation: {
          type: 'string',
          description: 'Brief explanation of what the chart shows.',
        },
      },
      required: ['title', 'chart_config'],
    },
  },
  capabilities: ['visualize', 'chat', 'deep_research'],
  async execute(params) {
    try {
      const config = JSON.parse(params.chart_config as string);
      return {
        ok: true,
        content: `Chart created: ${params.title}${params.explanation ? `\n\n${params.explanation}` : ''}`,
        data: {
          type: 'chart',
          title: params.title,
          config,
        },
        renderType: 'chart',
      };
    } catch {
      return {
        ok: false,
        content: 'Failed to parse chart configuration JSON.',
      };
    }
  },
});

/* ------------------------------------------------------------------ */
/*  create_diagram                                                    */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'create_diagram',
  description:
    'Create a diagram using Mermaid syntax. Supports flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, pie charts, mindmaps, and more.',
  schema: {
    name: 'create_diagram',
    description: 'Create a Mermaid diagram.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title for the diagram.',
        },
        mermaid_code: {
          type: 'string',
          description: 'The Mermaid diagram code.',
        },
        explanation: {
          type: 'string',
          description: 'Brief explanation of what the diagram shows.',
        },
      },
      required: ['title', 'mermaid_code'],
    },
  },
  capabilities: ['visualize', 'chat', 'deep_research', 'deep_solve'],
  async execute(params) {
    return {
      ok: true,
      content: `Diagram created: ${params.title}${params.explanation ? `\n\n${params.explanation}` : ''}`,
      data: {
        type: 'diagram',
        title: params.title,
        mermaidCode: params.mermaid_code,
      },
      renderType: 'diagram',
    };
  },
});

/* ------------------------------------------------------------------ */
/*  create_interactive                                                */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'create_interactive',
  description:
    'Create a self-contained interactive HTML widget. The HTML should include inline CSS and JavaScript. It will be rendered in a sandboxed iframe.',
  schema: {
    name: 'create_interactive',
    description: 'Create an interactive HTML widget.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title for the widget.',
        },
        html: {
          type: 'string',
          description:
            'Complete self-contained HTML document with inline CSS and JS. Must be a full HTML page (<html><head>...</head><body>...</body></html>).',
        },
        explanation: {
          type: 'string',
          description: 'Brief explanation of what the widget does.',
        },
      },
      required: ['title', 'html'],
    },
  },
  capabilities: ['visualize', 'chat'],
  async execute(params) {
    return {
      ok: true,
      content: `Interactive widget created: ${params.title}${params.explanation ? `\n\n${params.explanation}` : ''}`,
      data: {
        type: 'interactive',
        title: params.title,
        html: params.html,
      },
      renderType: 'interactive',
    };
  },
});
