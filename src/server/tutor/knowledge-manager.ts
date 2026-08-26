import { promises as fs } from 'node:fs';
import path from 'node:path';

const KB_DIR = path.join(process.cwd(), 'data', 'tutor', 'kb');

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'vault' | 'custom';
}

export async function initializeKnowledgeBases() {
  await fs.mkdir(KB_DIR, { recursive: true });
}

export async function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  return [
    { id: 'default', name: 'STEAM-IE Vault', type: 'vault' }
  ];
}
