import type { FastifyPluginAsync } from 'fastify';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { runAgentTurn } from './agent-loop';
import {
  createSession,
  getSession,
  listSessions,
  renameSession,
  deleteSession,
  getMessages,
  addMessage
} from './session-manager';
import type { Capability } from './prompts';

import './tools/rag-tool';
import './tools/web-tools';
import './tools/thinking-tools';
import './tools/research-tools';
import './tools/quiz-tools';
import './tools/visualize-tools';
import './tools/memory-tools';
import './tools/notebook-tools';

import { getTutorSettings, saveTutorSettings } from './tutor-settings';

function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  
  // Strip Markdown codeblocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '').trim();
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    try {
      // Escape raw unescaped newlines and control chars within double quotes
      let insideString = false;
      const chars = cleaned.split('');
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        const prev = i > 0 ? chars[i - 1] : '';
        if (c === '"' && prev !== '\\') {
          insideString = !insideString;
        } else if (insideString) {
          if (c === '\n') {
            chars[i] = '\\n';
          } else if (c === '\r') {
            chars[i] = '\\r';
          } else if (c === '\t') {
            chars[i] = '\\t';
          }
        }
      }
      cleaned = chars.join('');
      return JSON.parse(cleaned);
    } catch (secondErr) {
      // Fallback matching bounds
      const match = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          throw initialErr;
        }
      }
      throw initialErr;
    }
  }
}

export const tutorRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/settings', async () => {
    return getTutorSettings();
  });

  fastify.post('/settings', async (request: any, reply: any) => {
    const newSettings = await saveTutorSettings(request.body);
    return newSettings;
  });

  fastify.get('/sessions', async () => {
    return listSessions();
  });

  fastify.post('/sessions', async (request: any, reply: any) => {
    const { title, capability } = request.body as { title: string, capability: Capability };
    const session = await createSession(capability, title);
    return session;
  });

  fastify.post('/sessions/:id/chat', async (request: any, reply: any) => {
    const sessionId = request.params.id;
    const { message } = request.body;
    
    await addMessage(sessionId, 'user', message);
    const session = getSession(sessionId);
    const messages = await getMessages(sessionId);
    
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    try {
      const stream = runAgentTurn(sessionId, messages, session?.capability || 'chat');

      for await (const event of stream) {
        if (event.type === 'token') {
          reply.raw.write(`event: token\ndata: ${JSON.stringify(event.text)}\n\n`);
        } else if (event.type === 'tool_start') {
          reply.raw.write(`event: tool_start\ndata: ${JSON.stringify({ name: event.name, args: event.args })}\n\n`);
        } else if (event.type === 'tool_result') {
          reply.raw.write(`event: tool_result\ndata: ${JSON.stringify({ name: event.name, ok: event.ok, content: event.content, data: event.data, renderType: event.renderType })}\n\n`);
        } else if (event.type === 'error') {
          reply.raw.write(`event: error\ndata: ${JSON.stringify(event.message)}\n\n`);
        }
      }
      reply.raw.write(`event: done\ndata: {}\n\n`);
    } catch (error: any) {
      console.error('Agent turn streaming error:', error);
      reply.raw.write(`event: error\ndata: ${JSON.stringify(error.message || 'Unknown error')}\n\n`);
    }
    
    reply.raw.end();
  });

  // ── AI Quiz Generator (15-25 MCQ & True/False Questions Personalized to User Settings) ──
  fastify.post('/generate-quiz', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const { topic } = (request.body || {}) as { topic?: string };
    const info = settings.personalInfo || {};
    const industry = info.industry || 'STEAM-IE Innovation & Entrepreneurship';
    const subDomain = info.secondaryIndustry ? `(${info.secondaryIndustry})` : '';
    const learningNeeds = info.learningNeeds || 'Practical and conceptual';
    const goal = info.goal || 'Master core and advanced principles';
    const difficulty = info.difficulty || 'Intermediate';

    const prompt = `You are an expert tutor creating a comprehensive assessment for a learner with the following profile:
- Primary Industry / Domain: ${industry} ${subDomain}
- Learning Needs & Style: ${learningNeeds}
- Primary Learning Goal: ${goal}
- Difficulty Level: ${difficulty}
${topic ? `- Specific Topic Focus: ${topic}` : '- Topic: Comprehensive coverage from fundamental to advanced applications in their field'}

REQUIREMENTS:
1. Generate between 15 and 25 questions (minimum 15, maximum 25).
2. Question types must ONLY be either 'mcq' (Multiple Choice with 4 options) or 'true_false' (True/False with 2 options: ["True", "False"]).
3. Ensure questions range from foundational concepts up to complex, high-level problem scenarios in ${industry}.
4. Provide a clear, educational explanation for each answer.
5. Return your response STRICTLY as a valid raw JSON object. Do not wrap in markdown code blocks.

JSON format:
{
  "title": "Quiz Title based on user domain",
  "industry": "${industry}",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why Option A is correct..."
    },
    {
      "id": 2,
      "type": "true_false",
      "text": "Statement text here",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "Why this statement is true..."
    }
  ]
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      const quiz = JSON.parse(jsonMatch[0]);
      return quiz;
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      reply.code(500);
      return { error: err.message || 'Failed to generate quiz' };
    }
  });

  // ── AI Deep Research Streaming ──
  fastify.post('/deep-research', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const { hybridSearch } = await import('./rag-engine');
    const { buildSystemPrompt } = await import('./prompts');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const { topic } = request.body as { topic: string };
    if (!topic || !topic.trim()) {
      reply.code(400);
      return { error: 'Topic is required' };
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    try {
      // 1. Tool start: Search STEAM-IE vault
      reply.raw.write(`event: tool_start\ndata: ${JSON.stringify({ name: 'rag', args: { query: topic } })}\n\n`);
      const vaultResults = await hybridSearch(topic, 5);
      let vaultContext = "";
      if (vaultResults.length > 0) {
        vaultContext = vaultResults.map(r => `### ${r.title}\nSource: ${r.url}\n${r.content.substring(0, 2500)}`).join('\n\n');
      }
      reply.raw.write(`event: tool_result\ndata: ${JSON.stringify({ name: 'rag', ok: true, content: `Found ${vaultResults.length} vault documents.` })}\n\n`);

      // 2. Tool start: Web search grounding
      reply.raw.write(`event: tool_start\ndata: ${JSON.stringify({ name: 'web_search', args: { query: topic } })}\n\n`);

      const info = settings.personalInfo || {};
      let persona = '';
      if (info?.industry) {
        persona += `You are an expert research scientist specializing in ${info.industry}`;
        if (info.secondaryIndustry) persona += ` (${info.secondaryIndustry}).`;
      }
      let memory = '';
      if (info?.industry) memory += `- Primary Industry / Domain: ${info.industry}\n`;
      if (info?.secondaryIndustry) memory += `- Secondary Industry: ${info.secondaryIndustry}\n`;
      if (info?.learningNeeds) memory += `- Learning Style & Needs: ${info.learningNeeds}\n`;
      if (info?.goal) memory += `- Learning Goal: ${info.goal}\n`;
      if (info?.difficulty) memory += `- Difficulty: ${info.difficulty}\n`;

      const systemInstruction = buildSystemPrompt('deep_research', { persona, memory, vaultContext });

      const ai = new GoogleGenAI({ apiKey });
      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Topic to thoroughly research and produce complete cited report on:\n${topic}` }]
          }
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          reply.raw.write(`event: token\ndata: ${JSON.stringify(chunk.text)}\n\n`);
        }
      }

      reply.raw.write(`event: done\ndata: {}\n\n`);
    } catch (error: any) {
      console.error('Deep research error:', error);
      reply.raw.write(`event: error\ndata: ${JSON.stringify(error.message || 'Research failed')}\n\n`);
    }

    reply.raw.end();
  });

  // ── AI Co-Writer Endpoint ──
  fastify.post('/cowriter', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const { prompt, document } = request.body as { prompt: string; document: string };
    const info = settings.personalInfo || {};
    const now = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are an expert AI Co-Writer and editor in the STEAM-IE framework.
The user is working on the following document draft:
\`\`\`markdown
${document ? document.substring(0, 8000) : '(Empty draft)'}
\`\`\`

Learner Profile:
- Primary Industry / Domain: ${info.industry || 'STEAM-IE'} ${info.secondaryIndustry ? `(${info.secondaryIndustry})` : ''}
- Learning Needs & Style: ${info.learningNeeds || 'Professional, concise'}
- Primary Learning Goal: ${info.goal || 'Craft high-impact documents'}
- Preferred Difficulty / Depth: ${info.difficulty || 'Intermediate'}

MANDATORY MARKDOWN FRONTMATTER HEADER REQUIREMENT:
Every piece of written content you output MUST begin with a standard markdown YAML frontmatter header block strictly formatted as:
---
title: <Descriptive Document or Section Title>
date: ${now}
tags:
  - ${info.industry ? info.industry.replace(/\s+/g, '') : 'STEAM-IE'}
  - ${info.secondaryIndustry ? info.secondaryIndustry.replace(/\s+/g, '') : 'Innovation'}
  - CoWriter
type: cowriter-document
description: <Short 1-2 sentence description of this document or drafted section>
aliases:
  - <Alternative title or topic alias>
---

# <Document Title>

INSTRUCTION:
The user has requested the following from you:
"${prompt}"

Provide thoughtful, high-quality, actionable writing assistance, expansions, revisions, or complete draft sections. Output in clean markdown with the frontmatter header included at the very top.`;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `User request: ${prompt}\n\nCurrent Document:\n${document}` }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          reply.raw.write(`event: token\ndata: ${JSON.stringify(chunk.text)}\n\n`);
        }
      }
      reply.raw.write(`event: done\ndata: {}\n\n`);
    } catch (err: any) {
      console.error('Co-writer generation error:', err);
      reply.raw.write(`event: error\ndata: ${JSON.stringify(err.message || 'Co-writer error')}\n\n`);
    }

    reply.raw.end();
  });

  // ── AI Flashcard Generator (15-25 Cards from Simple to Complex) ──
  fastify.post('/generate-flashcards', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const { topic } = (request.body || {}) as { topic?: string };
    const info = settings.personalInfo || {};
    const industry = info.industry || 'STEAM-IE Innovation & Entrepreneurship';
    const subDomain = info.secondaryIndustry ? `(${info.secondaryIndustry})` : '';
    const learningNeeds = info.learningNeeds || 'Conceptual and practical';
    const goal = info.goal || 'Master key concepts';
    const difficulty = info.difficulty || 'Intermediate';

    const prompt = `You are an expert educator generating spaced-repetition flashcards for a learner with this profile:
- Primary Industry / Domain: ${industry} ${subDomain}
- Learning Needs & Style: ${learningNeeds}
- Primary Learning Goal: ${goal}
- Preferred Difficulty: ${difficulty}
${topic ? `- Specific Topic Focus: ${topic}` : '- Topic: Comprehensive STEAM-IE concepts and applications for this field'}

REQUIREMENTS:
1. Generate between 15 and 25 flashcards (minimum 15, maximum 25).
2. Spanning from foundational (Introduction), to core applications (Intermediate), up to complex/advanced industry challenges (Advanced).
3. "front": A clear, concise question, term, or problem statement.
4. "back": An informative, comprehensive, and crisp explanation/answer.
5. Return your response STRICTLY as a raw JSON array of objects. Do not wrap in markdown code blocks.

JSON format:
[
  {
    "id": 1,
    "front": "What is ...?",
    "back": "Explanation...",
    "difficulty": "Introduction"
  },
  {
    "id": 2,
    "front": "How does ... apply to ...?",
    "back": "Detailed application...",
    "difficulty": "Intermediate"
  },
  {
    "id": 3,
    "front": "Explain the trade-offs between ... and ... in advanced scenarios.",
    "back": "Advanced explanation...",
    "difficulty": "Advanced"
  }
]`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      const cards = cleanAndParseJSON(text);
      const cardList = Array.isArray(cards) ? cards : (cards.cards || []);
      return { cards: cardList, industry: info.industry || 'STEAM-IE' };
    } catch (err: any) {
      console.error('Failed to generate flashcards:', err);
      reply.code(500);
      return { error: err.message || 'Failed to generate flashcards' };
    }
  });

  // ── AI Visual Concept Generator (Diagrams, Charts, Sandboxed Interactive widgets) ──
  fastify.post('/visualize', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const { hybridSearch } = await import('./rag-engine');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const { topic, type = 'auto' } = request.body as { topic: string; type?: 'auto' | 'diagram' | 'chart' | 'interactive' | 'mindmap' };
    if (!topic || !topic.trim()) {
      reply.code(400);
      return { error: 'Topic is required' };
    }

    const info = settings.personalInfo || {};
    const industry = info.industry || 'STEAM-IE Innovation';
    const subDomain = info.secondaryIndustry ? `(${info.secondaryIndustry})` : '';
    const learningNeeds = info.learningNeeds || 'Conceptual and practical';
    const goal = info.goal || 'Master key concepts';
    const difficulty = info.difficulty || 'Intermediate';

    // 1. Gather local vault RAG context
    let vaultContext = "";
    try {
      const vaultResults = await hybridSearch(topic, 3);
      if (vaultResults.length > 0) {
        vaultContext = vaultResults.map(r => `Document: ${r.title}\n${r.content.substring(0, 1500)}`).join('\n\n');
      }
    } catch (ragErr) {
      console.warn('RAG search skipped or failed during visualization:', ragErr);
    }

    const now = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a world-class AI Data Visualizer, Diagram designer, and UI prototype architect operating in the STEAM-IE framework.
Your task is to generate a visual representation for: "${topic}"

Learner Profile Context:
- Primary Industry / Domain: ${industry} ${subDomain}
- Learning Needs & Style: ${learningNeeds}
- Primary Learning Goal: ${goal}
- Preferred Difficulty: ${difficulty}

Vault Context:
${vaultContext || '(No local context found)'}

You can generate four types of visuals. Choose the one that best explains the topic, or respect the user's specific type selection if it is not 'auto':
1. 'diagram': Mermaid.js code representing flowcharts, sequence, Gantt, mindmaps, state machine, or ER diagram.
2. 'chart': Chart.js configuration JSON representing a metric chart, radar comparison, bar graph, line graph, etc.
3. 'interactive': A fully self-contained HTML page using inline CSS, JS, or Canvas to create interactive simulators, sliders, dashboards, or animations.
4. 'mindmap': A hierarchical JSON tree of concepts, each with "name", "definition", "description", and an optional "children" array. Example:
{"name":"Root Concept","definition":"Brief def","description":"Extended description","children":[{"name":"Sub-concept","definition":"...","description":"...","children":[]}]}

MANDATORY MARKDOWN FRONTMATTER HEADER REQUIREMENT:
The 'frontmatter' field in your JSON output must contain a standard YAML block matching notes/Template.md:
---
title: <Clear title for this visual>
date: ${now}
tags:
  - ${info.industry ? info.industry.replace(/\s+/g, '') : 'STEAM-IE'}
  - ${info.secondaryIndustry ? info.secondaryIndustry.replace(/\s+/g, '') : 'Visualization'}
  - Visualization
type: visualization-note
description: <Short description of what this diagram/visualization models>
aliases:
  - <Alternative title 1>
  - <Alternative title 2>
---

RETURN STRICTLY A JSON OBJECT matching this exact structure:
{
  "title": "Title of the visual",
  "type": "diagram" | "chart" | "interactive" | "mindmap",
  "code": "The raw Mermaid code OR Chart.js JSON configuration string OR complete self-contained HTML widget OR hierarchical mind map JSON tree",
  "explanation": "Markdown explanation with key insights, legends, or takeaways from this visual",
  "frontmatter": "The raw YAML frontmatter header block string (enclosed between ---)"
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const promptText = `Topic: ${topic}
Selected preference type: ${type}
Remember to return ONLY the JSON object, do not wrap it in markdown code blocks.`;

      // Fallback model runner helper
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
      } catch (err: any) {
        console.warn('Primary model gemini-2.5-flash failed for visualization, falling back to gemini-2.0-flash. Error:', err.message);
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            },
          });
        } catch (err2: any) {
          console.warn('Fallback model gemini-2.0-flash failed, falling back to gemini-1.5-flash. Error:', err2.message);
          response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            },
          });
        }
      }

      const text = response.text || '';
      const parsed = cleanAndParseJSON(text);
      return parsed;
    } catch (err: any) {
      console.error('Failed to generate visual representation:', err);
      reply.code(500);
      return { error: err.message || 'Failed to generate visual concept' };
    }
  });

  // ── Saved chat notes in steam-ie-vault/notes ──
  const NOTES_DIR = path.join(process.cwd(), 'steam-ie-vault', 'notes');

  fastify.get('/notes', async () => {
    try {
      await fs.mkdir(NOTES_DIR, { recursive: true });
      const files = await fs.readdir(NOTES_DIR);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      const result = [];
      for (const file of mdFiles) {
        const stat = await fs.stat(path.join(NOTES_DIR, file));
        result.push({
          filename: file,
          title: file.replace(/\.md$/, '').replace(/-/g, ' '),
          updatedAt: stat.mtime.toISOString()
        });
      }
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return result;
    } catch {
      return [];
    }
  });

  fastify.get('/notes/:filename', async (request: any, reply: any) => {
    const { filename } = request.params;
    const filePath = path.join(NOTES_DIR, filename);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return { filename, content };
    } catch {
      reply.code(404);
      return { error: 'Note not found' };
    }
  });

  fastify.post('/notes', async (request: any, reply: any) => {
    const { filename, content } = request.body as { filename: string; content: string };
    await fs.mkdir(NOTES_DIR, { recursive: true });
    const safeName = filename.endsWith('.md') ? filename : `${filename}.md`;
    const filePath = path.join(NOTES_DIR, safeName);
    await fs.writeFile(filePath, content, 'utf8');
    return { filename: safeName, success: true };
  });

  // ── Save images to steam-ie-vault/media ──
  const MEDIA_DIR = path.join(process.cwd(), 'steam-ie-vault', 'media');

  fastify.post('/media', async (request: any, reply: any) => {
    const { filename, base64 } = request.body as { filename: string; base64: string };
    await fs.mkdir(MEDIA_DIR, { recursive: true });
    const safeName = filename.endsWith('.png') ? filename : `${filename}.png`;
    const filePath = path.join(MEDIA_DIR, safeName);
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFile(filePath, buffer);
    return { filename: safeName, success: true };
  });

  // ── AI Study Planner (12 weeks, 4 hours per week lesson plan) ──
  fastify.post('/generate-lesson-plan', async (request: any, reply: any) => {
    const { GoogleGenAI } = await import('@google/genai');
    const settings = getTutorSettings();
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reply.code(400);
      return { error: 'Gemini API key not configured. Please add GEMINI_API_KEY in .env or Settings.' };
    }

    const info = settings.personalInfo || {};
    const industry = info.industry || 'STEAM-IE Innovation & Entrepreneurship';
    const subDomain = info.secondaryIndustry ? `(${info.secondaryIndustry})` : '';
    const learningNeeds = info.learningNeeds || 'Practical and conceptual';
    const goal = info.goal || 'Master core and advanced principles';
    const difficulty = info.difficulty || 'Intermediate';
    const interests = info.interests || 'General interest in STEAM fields';

    const prompt = `You are an expert tutor creating a highly personalized 12-week study plan for a student.
Student Profile:
- Industry/Domain: ${industry} ${subDomain}
- Difficulty Level: ${difficulty}
- Interests & Hobbies: ${interests}
- Learning Style & Needs: ${learningNeeds}
- Primary Learning Goal: ${goal}

Requirements:
1. Structure a 12-week plan with exactly 4 hours of lesson content per week (total 48 hours in total).
2. Customize the language, examples, and progression specifically for their goal, difficulty, and interests.
3. Each week should have a theme, description, and an hourly breakdown.
4. Output MUST be a single raw JSON object matching the schema below. Do not wrap in markdown code blocks.

JSON schema format:
{
  "title": "Study Plan Title tailored to the student",
  "description": "General summary and introduction of how this plan is personalized to the student's profile",
  "weeks": [
    {
      "weekNumber": 1,
      "lessonName": "Topic Name for Week 1",
      "description": "Overview of this week's learnings (2-3 sentences)",
      "hoursAllocation": [
        { "hour": 1, "topic": "Topic for hour 1", "activity": "Specific learning activity, e.g., concept review or exercises" },
        { "hour": 2, "topic": "Topic for hour 2", "activity": "..." },
        { "hour": 3, "topic": "Topic for hour 3", "activity": "..." },
        { "hour": 4, "topic": "Topic for hour 4", "activity": "..." }
      ]
    },
    ... (weeks 2 to 12)
  ]
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      const parsed = cleanAndParseJSON(text);
      return parsed;
    } catch (err: any) {
      console.error('Failed to generate lesson plan:', err);
      reply.code(500);
      return { error: err.message || 'Failed to generate lesson plan' };
    }
  });
};
