import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getWikiRootPath } from '../lib/wiki';
import { GoogleGenAI } from '@google/genai';

export async function getVaultNodes() {
    const root = await getWikiRootPath();
    if (!root) return [];
    
    const nodes: { path: string; type: 'folder' | 'file' }[] = [{ path: "/", type: "folder" }];
    
    async function scan(currentDir: string, relativePath: string) {
       const entries = await fs.readdir(currentDir, { withFileTypes: true });
       for (const entry of entries) {
           if (entry.name.startsWith('.')) continue;
           
           const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
           if (entry.isDirectory()) {
               nodes.push({ path: rel, type: "folder" });
               await scan(path.join(currentDir, entry.name), rel);
           } else if (entry.isFile() && entry.name.endsWith('.md')) {
               nodes.push({ path: rel, type: "file" });
           }
       }
    }
    await scan(root, "");
    return nodes;
}

export async function generateRecommendations(apiKey: string, targetPath: string, customPrompt?: string) {
    const root = await getWikiRootPath();
    if (!root) throw new Error("Wiki root not configured");

    const ai = new GoogleGenAI({ apiKey });
    
    let contentToAnalyze = "";
    
    if (targetPath === "/") {
        contentToAnalyze = await aggregateFolderContent(root, 10);
    } else {
        const fullPath = path.join(root, targetPath);
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
            contentToAnalyze = await fs.readFile(fullPath, "utf8");
        } else if (stat.isDirectory()) {
            contentToAnalyze = await aggregateFolderContent(fullPath, 10);
        }
    }

    const systemPrompt = `You are a highly intelligent knowledge base Recommender Engine.
The user has provided content from their STEAM-IE (Science, Technology, Engineering, Arts, Mathematics, Innovation, Entrepreneurship) vault.
Analyze this content. Identify what missing but highly important related information should be added next to make the vault smarter.
Search the web to find the top 5 most relevant and high-quality sources (articles or YouTube videos).
Return your response EXACTLY as a JSON array of objects. Do not use markdown blocks like \`\`\`json. Return raw JSON.
Format:
[
  {
    "topic": "Name of the topic/concept to add",
    "reasoning": "Why this is a crucial addition to the current notes",
    "sourceTitle": "Title of the recommended web article or YouTube video",
    "sourceUrl": "https://..."
  }
]
${customPrompt ? `\n\nUSER'S CUSTOM INSTRUCTION TO REFINE RECOMMENDATIONS:\n${customPrompt}` : ''}`;

    let response;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `Vault Content:\n\n${contentToAnalyze}` }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                tools: [{ googleSearch: {} }],
                temperature: 0.7,
            }
        });
    } catch (e: any) {
        throw new Error(e.message || "Gemini API failed to generate recommendations");
    }

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Failed to parse AI response as JSON: " + text);
    }
}

async function aggregateFolderContent(dir: string, maxFiles: number): Promise<string> {
    let content = "";
    let count = 0;
    
    async function scan(currentDir: string) {
       if (count >= maxFiles) return;
       const entries = await fs.readdir(currentDir, { withFileTypes: true });
       for (const entry of entries) {
           if (count >= maxFiles) break;
           if (entry.name.startsWith('.')) continue;
           
           const fullPath = path.join(currentDir, entry.name);
           if (entry.isDirectory()) {
               await scan(fullPath);
           } else if (entry.isFile() && entry.name.endsWith('.md')) {
               const text = await fs.readFile(fullPath, "utf8");
               content += `\n--- FILE: ${entry.name} ---\n${text.substring(0, 2000)}\n`;
               count++;
           }
       }
    }
    
    await scan(dir);
    return content;
}
