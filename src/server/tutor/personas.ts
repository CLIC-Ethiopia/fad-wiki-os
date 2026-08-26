import { promises as fs } from 'node:fs';
import path from 'node:path';

const PERSONAS_DIR = path.join(process.cwd(), 'data', 'tutor', 'personas');

export interface Persona {
  id: string;
  name: string;
  instructions: string;
}

export async function listPersonas(): Promise<Persona[]> {
  try {
    await fs.mkdir(PERSONAS_DIR, { recursive: true });
    const files = await fs.readdir(PERSONAS_DIR);
    const personas: Persona[] = [
      { id: 'default', name: 'Tutor', instructions: 'You are a helpful and patient tutor.' },
      { id: 'socratic', name: 'Socratic Coach', instructions: 'You guide the user through questions rather than giving direct answers.' }
    ];
    
    for (const f of files) {
      if (f.endsWith('.md')) {
        const content = await fs.readFile(path.join(PERSONAS_DIR, f), 'utf8');
        personas.push({ id: f.replace('.md', ''), name: f.replace('.md', ''), instructions: content });
      }
    }
    
    return personas;
  } catch (e) {
    return [];
  }
}
