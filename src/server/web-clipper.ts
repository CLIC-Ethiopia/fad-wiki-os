import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getWikiRootPath } from '../lib/wiki';

export async function parseWebClipperUrl(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic YouTube Support
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
       const doc = new JSDOM(html).window.document;
       const title = doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "YouTube Video";
       const description = doc.querySelector('meta[property="og:description"]')?.getAttribute("content") || "";
       let videoId = "";
       try {
           if (url.includes("v=")) {
               videoId = new URL(url).searchParams.get("v") || "";
           } else if (url.includes("youtu.be/")) {
               videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
           }
       } catch (e) {
           // ignore parsing errors
       }
       
       const markdown = `> [!info] Source\n> ${url}\n\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n\n${description}`;
       return { title, markdown };
    }
    
    // Try Jina API first for robust Javascript rendering
    try {
        const jinaResponse = await fetch(`https://r.jina.ai/${url}`);
        if (jinaResponse.ok) {
            const jinaMarkdown = await jinaResponse.text();
            
            const errorMatch = jinaMarkdown.match(/Warning: Target URL returned error ([^\n]+)/);
            if (errorMatch) {
                throw new Error(`The target URL returned an error: ${errorMatch[1]}`);
            }
            
            // Jina API usually returns "Title: <title>\n\nURL Source: <url>\n\nMarkdown Content"
            let title = "Web Clip";
            const titleMatch = jinaMarkdown.match(/^Title:\s*(.+)/m);
            if (titleMatch) {
                title = titleMatch[1].trim();
            }
            
            return { title, markdown: jinaMarkdown };
        }
    } catch (jinaError) {
        console.error("Jina API failed, falling back to basic fetch:", jinaError);
    }
    
    // Fallback to regular article parsing
    const fallbackResponse = await fetch(url);
    if (!fallbackResponse.ok) {
        throw new Error(`The target URL returned an error: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
    }
    const fallbackHtml = await fallbackResponse.text();
    const doc = new JSDOM(fallbackHtml, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    
    if (!article) {
       throw new Error("Could not extract article content from URL");
    }
    
    const turndownService = new TurndownService({ headingStyle: 'atx' });
    const markdownContent = turndownService.turndown(article.content || "");
    
    const markdown = `> [!info] Source\n> ${url}\n\n${markdownContent}`;
    
    return { title: article.title || "Web Clip", markdown };
  } catch (error) {
    throw new Error(`Web clipping failed: ${(error as Error).message}`);
  }
}

export async function saveWebClipperClip(title: string, markdown: string, folderPath: string) {
    const root = await getWikiRootPath();
    if (!root) throw new Error("Wiki root not configured");
    
    const safeTitle = title.replace(/[\\/:"*?<>|]+/g, '-').trim() || "Untitled-Clip";
    
    // Optional subfolder logic
    let finalDir = root;
    if (folderPath && folderPath.trim() !== "/" && folderPath.trim() !== "") {
       finalDir = path.join(root, folderPath.trim());
    }
    
    await fs.mkdir(finalDir, { recursive: true });
    
    const filePath = path.join(finalDir, `${safeTitle}.md`);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const finalMarkdown = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${dateStr}"
tags:
  - "#WebClip"
---

# ${title}

${markdown}`;

    await fs.writeFile(filePath, finalMarkdown, 'utf8');
    
    return filePath;
}

export async function getVaultDirectories() {
    const root = await getWikiRootPath();
    if (!root) return [];
    
    const dirs: string[] = ["/"]; // Root
    
    async function scan(currentDir: string, relativePath: string) {
       const entries = await fs.readdir(currentDir, { withFileTypes: true });
       for (const entry of entries) {
           if (entry.isDirectory() && !entry.name.startsWith('.')) {
               const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
               dirs.push(rel);
               await scan(path.join(currentDir, entry.name), rel);
           }
       }
    }
    await scan(root, "");
    return dirs;
}
