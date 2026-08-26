/**
 * Fad.Tutor — Web tools.
 *
 * `web_search` — uses Gemini's built-in googleSearch grounding (handled
 *   natively by the Gemini API, so this tool is declared but the agent
 *   loop uses it as a signal to enable Google Search grounding).
 *
 * `web_fetch` — fetches a URL and extracts readable content using the
 *   existing @mozilla/readability + jsdom + turndown stack.
 */

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { registerTool } from '../tool-registry';

/* ------------------------------------------------------------------ */
/*  web_search — signal tool for Gemini grounding                     */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'web_search',
  description:
    'Search the web using Google Search for up-to-date information. Use this when vault content is insufficient or when the user asks about current events.',
  schema: {
    name: 'web_search',
    description: 'Search the web using Google Search.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.',
        },
      },
      required: ['query'],
    },
  },
  capabilities: 'all',
  async execute(params) {
    // This is a "signal" tool — the actual search is performed by
    // Gemini's googleSearch grounding. The agent loop intercepts this
    // tool call and enables grounding instead of executing here.
    // This fallback exists for cases where grounding isn't available.
    return {
      ok: true,
      content: `Web search for "${params.query}" — results provided via Gemini grounding.`,
    };
  },
});

/* ------------------------------------------------------------------ */
/*  web_fetch — URL → readable markdown                               */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'web_fetch',
  description:
    'Fetch a URL and extract its main content as readable markdown. Use this to read full articles, documentation pages, or blog posts.',
  schema: {
    name: 'web_fetch',
    description: 'Fetch a URL and extract readable content.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to fetch and parse.',
        },
      },
      required: ['url'],
    },
  },
  capabilities: ['chat', 'deep_research', 'deep_solve', 'mastery_path'],
  async execute(params) {
    const url = params.url as string;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; FadTutor/1.0; +https://fad.wiki)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        return {
          ok: false,
          content: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        };
      }

      const html = await response.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article) {
        return {
          ok: false,
          content: `Could not extract readable content from: ${url}`,
        };
      }

      const turndown = new TurndownService({ headingStyle: 'atx' });
      const markdown = turndown.turndown(article.content || '');

      // Truncate to a reasonable length
      const truncated = markdown.substring(0, 8000);
      const wasTruncated = markdown.length > 8000;

      return {
        ok: true,
        content:
          `# ${article.title}\n` +
          `**Source:** ${url}\n\n` +
          truncated +
          (wasTruncated ? '\n\n*(content truncated for length)*' : ''),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        content: `Failed to fetch URL "${url}": ${message}`,
      };
    }
  },
});
