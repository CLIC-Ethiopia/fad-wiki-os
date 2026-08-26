import { searchWiki, getWikiPage } from '../../lib/wiki';

import { slugPartsFromFileName } from '../../lib/wiki-shared';

export interface RagResult {
  title: string;
  url: string;
  content: string;
  snippet?: string;
  score: number;
}

export async function hybridSearch(query: string, topN: number = 3): Promise<RagResult[]> {
  try {
    const wikiResults = await searchWiki(query);
    const results: RagResult[] = [];
    
    // Just use the topN from FTS5 for now
    const topResults = wikiResults.slice(0, topN);
    
    for (const match of topResults) {
      try {
        const slugParts = slugPartsFromFileName(match.file).map(decodeURIComponent);
        const page = await getWikiPage(slugParts);
        if (page) {
          results.push({
            title: page.title,
            url: match.file,
            content: page.contentMarkdown || '',
            snippet: match.matches[0]?.snippet,
            score: match.score || 1
          });
        }
      } catch (e) {
        // ignore individual page fetch errors
      }
    }
    
    return results;
  } catch (error) {
    console.error("Hybrid search failed:", error);
    return [];
  }
}
