import { promises as fs } from 'node:fs';
import path from 'node:path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'tutor', 'memory');

export async function readMemory(layer: 'L1' | 'L2' | 'L3', surface: string): Promise<string> {
  try {
    const ext = layer === 'L1' ? '.jsonl' : '.md';
    const filePath = path.join(MEMORY_DIR, layer, `${surface}${ext}`);
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    return ''; // Returns empty if no memory exists
  }
}

export async function writeMemory(layer: 'L1' | 'L2' | 'L3', surface: string, content: string, append = true): Promise<void> {
  const ext = layer === 'L1' ? '.jsonl' : '.md';
  const dirPath = path.join(MEMORY_DIR, layer);
  const filePath = path.join(dirPath, `${surface}${ext}`);
  
  await fs.mkdir(dirPath, { recursive: true });
  
  if (append) {
    await fs.appendFile(filePath, content + '\n', 'utf8');
  } else {
    await fs.writeFile(filePath, content, 'utf8');
  }
}
