import { registerTool } from '../tool-registry';
import { hybridSearch } from '../rag-engine';

registerTool({
  name: 'rag',
  description:
    'Search the STEAM-IE vault for knowledge. Use this to retrieve facts, definitions, and concepts from the connected wiki.',
  schema: {
    name: 'rag',
    description: 'Search the STEAM-IE vault.',
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
    const query = params.query as string;
    const results = await hybridSearch(query, 3);

    if (results.length === 0) {
      return { ok: true, content: `No vault results found for "${query}".` };
    }

    let content = `Vault results for "${query}":\n\n`;
    for (const r of results) {
      // Truncate to reasonable length per page to avoid token limits
      content += `### ${r.title}\nSource: ${r.url}\n\n${r.content.substring(0, 3000)}\n\n`;
    }

    return { ok: true, content };
  },
});
