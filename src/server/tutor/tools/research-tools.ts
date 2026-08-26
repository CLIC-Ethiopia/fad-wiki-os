import { registerTool } from '../tool-registry';
import { promises as fs } from 'node:fs';
import path from 'node:path';

registerTool({
  name: 'save_report',
  description: 'Save a generated research report to the notebook.',
  schema: {
    name: 'save_report',
    description: 'Save research report.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Report title' },
        content: { type: 'string', description: 'Markdown content of the report' }
      },
      required: ['title', 'content'],
    },
  },
  capabilities: ['deep_research'],
  async execute(params) {
    const title = params.title as string;
    const content = params.content as string;
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filepath = path.join(process.cwd(), 'data', 'tutor', 'notebooks', `${safeTitle}.md`);
    
    try {
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, content, 'utf-8');
      return { ok: true, content: `Report saved to ${filepath}` };
    } catch (e) {
      return { ok: false, content: `Failed to save report: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
});
