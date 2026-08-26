import { registerTool, type ToolResult, type ToolContext } from '../tool-registry';
import { readMemory, writeMemory } from '../memory-store';

registerTool({
  name: 'read_memory',
  description: 'Retrieve relevant L2/L3 facts about the user.',
  capabilities: 'all',
  schema: {
    name: 'read_memory',
    description: 'Retrieve what is known about the user.',
    parameters: {
      type: 'object',
      properties: {
        surface: { type: 'string', description: 'The surface to read (e.g. chat, quiz, research)' }
      },
      required: ['surface']
    }
  },
  execute: async (params: Record<string, unknown>, _context: ToolContext): Promise<ToolResult> => {
    const surface = (params.surface as string) || 'chat';
    const l2 = await readMemory('L2', surface);
    const l3 = await readMemory('L3', 'profile');
    
    return {
      ok: true,
      content: `L2 (${surface}):\n${l2}\n\nL3 (Profile):\n${l3}`
    };
  }
});

registerTool({
  name: 'write_memory',
  description: 'Record a new fact or preference about the user.',
  capabilities: 'all',
  schema: {
    name: 'write_memory',
    description: 'Save a fact about the user.',
    parameters: {
      type: 'object',
      properties: {
        surface: { type: 'string', description: 'The surface (e.g. chat, quiz, research)' },
        fact: { type: 'string', description: 'The fact to record.' }
      },
      required: ['surface', 'fact']
    }
  },
  execute: async (params: Record<string, unknown>, _context: ToolContext): Promise<ToolResult> => {
    const surface = (params.surface as string) || 'chat';
    const fact = params.fact as string;
    
    try {
      await writeMemory('L2', surface, `- ${fact}`, true);
      return { ok: true, content: 'Memory recorded.' };
    } catch (e: any) {
      return { ok: false, content: `Failed to write memory: ${e.message}` };
    }
  }
});
