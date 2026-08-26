import { registerTool, type ToolResult, type ToolContext } from '../tool-registry';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const NOTEBOOK_DIR = path.join(process.cwd(), 'data', 'tutor', 'notebooks');

registerTool({
  name: 'write_notebook',
  description: 'Write or append to a shared notebook document.',
  capabilities: ['chat', 'deep_research'],
  schema: {
    name: 'write_notebook',
    description: 'Save content to a notebook document.',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Name of the notebook file.' },
        content: { type: 'string', description: 'Content to write.' },
        append: { type: 'boolean', description: 'Whether to append or overwrite.' }
      },
      required: ['filename', 'content']
    }
  },
  execute: async (params: Record<string, unknown>, _context: ToolContext): Promise<ToolResult> => {
    const filename = params.filename as string;
    const content = params.content as string;
    const append = (params.append as boolean) || false;
    
    try {
      await fs.mkdir(NOTEBOOK_DIR, { recursive: true });
      const filepath = path.join(NOTEBOOK_DIR, filename);
      
      if (append) {
        await fs.appendFile(filepath, '\n' + content, 'utf8');
      } else {
        await fs.writeFile(filepath, content, 'utf8');
      }
      
      return { ok: true, content: `Successfully wrote to ${filename}` };
    } catch (e: any) {
      return { ok: false, content: `Failed to write notebook: ${e.message}` };
    }
  }
});
