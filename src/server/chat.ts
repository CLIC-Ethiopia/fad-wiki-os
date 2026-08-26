import { GoogleGenAI } from '@google/genai';
import { searchWiki, getWikiPage, slugPartsFromFileName } from '../lib/wiki';

export async function handleChatQuery(apiKey: string, message: string, history: any[]) {
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Retrieve context
    const searchResults = await searchWiki(message);
    const topResults = searchResults.slice(0, 3);
    
    let contextDocs = "";
    for (const result of topResults) {
        try {
            const slugParts = slugPartsFromFileName(result.file);
            const pageData = await getWikiPage(slugParts);
            contextDocs += `\n--- Document: ${pageData.title} ---\n${pageData.contentMarkdown.substring(0, 2500)}\n`;
        } catch (e) {
            // Ignore if page not found
        }
    }

    const systemPrompt = `You are a highly intelligent Wiki Agent. You answer questions based on the user's STEAM-IE vault context provided below.
If the answer is not in the context, you can use Google Search to find it, but always prefer the vault context if available.
When citing vault context, refer to the document title.

Vault Context:
${contextDocs ? contextDocs : "No direct matches found in the vault for this query."}`;

    // Format history for Gemini
    // We only take the last 10 messages
    const formattedHistory = history.slice(-10).map(msg => ({
        role: msg.role === 'agent' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Add current message
    formattedHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedHistory,
            config: {
                systemInstruction: systemPrompt,
                tools: [{ googleSearch: {} }],
                temperature: 0.7,
            }
        });
        
        return response.text;
    } catch (e: any) {
        throw new Error(e.message || "Gemini API failed to generate chat response");
    }
}
