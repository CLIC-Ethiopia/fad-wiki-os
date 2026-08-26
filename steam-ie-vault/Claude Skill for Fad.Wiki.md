
# [STEAM-IE] Knowledge Base — Schema

## Purpose

<!-- CUSTOMIZE: Replace this with a one-paragraph description of your knowledge domain. -->
<!-- Examples: "machine learning research", "19th-century literature", "competitive landscape for SaaS tools" -->
This is an LLM-maintained knowledge base on applied interdisciplinary [STEAM-IE] : Science, Technology, Engineering, Arts and Mathematics for Innovation and Entrepreneurship. The LLM writes and maintains all files under `wiki/`. The human curates raw sources and directs queries. The human never edits wiki files directly.

## Directory Layout


steam-ie-vault/

├── Arts/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Clippings/

├── Engineering/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Entrepreneurship/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Industry/
│   ├── Agriculture/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Construction/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Education/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Energy/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Environment/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Finance/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Governance/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Healthcare/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Infrastructure/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Lifestyle/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Manufacturing/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

│   ├── Mobility/
│   │   └──other-file-name.md
│   │   └── ...
│   │   └── index.md
│   │   └── log.md

├── Innovation/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Interdisciplinary/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Mathematics/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── media/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── notes/

├── raw/

├── Science/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── Technology/
│   └──other-file-name.md
│   └── ...
│   └── index.md
│   └── log.md

├── wiki/
│   ├── concepts/
│   ├── entities/
│   ├── summaries/
│   ├── syntheses/
│   └── index.md
│   └──log.md



- `steam-ie-vault/` — is the root directory of the knowledge base designed as an obsidian vault.
- `raw/` — Immutable source documents (transcripts, articles, ...). Never modify these.
- `Clippings/` —  web source collected by obsidian web clipper browser extension. Never modify the individual files in this folder, but analyze the content of each file and move the file to a folder with similar content.
- `wiki/index.md` — Master catalog. Every wiki page must appear here.
- `wiki/log.md` — Append-only activity log.
- `wiki/summaries/` — One summary page per raw source document.
- `wiki/concepts/` — Concept, strategy, and framework pages.
- `wiki/entities/` — Entity pages (people, tools, organizations, products — whatever "things" exist in your domain).
- `wiki/syntheses/` — Comparison tables, decision frameworks, cross-cutting analyses.
- `media/`  — folder for video and audio files, youtube links, docs, pdfs, slides or other derived material. Keep anything that is not knowledge content OUT of `wiki/` — `wiki/` is the published document set.

## File Naming

In the wiki/ folder and sub folders all files should be named following these conventions:

- All lowercase, hyphens for word separation: `concept-name.md`
- No spaces, no special characters, no uppercase
- Name should match the page title slug

## Page Format

Every wiki page uses this frontmatter and structure:

```yaml
---
title: "Page Title"
type: concept | entity | summary | synthesis
tags: [tag1, tag2, tag3]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: ["raw/filename.txt"]
confidence: high | medium | low
---
```

### Required Sections by Page Type

**Summary pages** (`wiki/summaries/`):
- `## Key Points` — Bulleted list of main claims/ideas
- `## Relevant Concepts` — Links to concept pages this source touches
- `## Source Metadata` — Type of source, author/speaker, date, URL or identifier

**Concept pages** (`wiki/concepts/`):
- `## Definition` — One-paragraph plain-English definition
- `## How It Works` — Mechanics, process, or structure of the concept
- `## Key Parameters` — Important variables, dimensions, or factors
- `## When To Use` — Situations and contexts where this concept applies
- `## Risks & Pitfalls` — Known failure modes, common mistakes, limitations
- `## Related Concepts` — Wiki links to related pages
- `## Sources` — Which raw sources inform this page

**Entity pages** (`wiki/entities/`):
- `## Overview` — What this entity is
- `## Characteristics` — Key properties, attributes, structure
- `## How to Use` — Setup commands, config examples, first steps
- `## Related Entities` — Links to related entity pages

**Synthesis pages** (`wiki/syntheses/`):
- `## Comparison` — Table or structured comparison
- `## Analysis` — Cross-cutting insights
- `## Recommendations` — When to prefer which approach
- `## Pages Compared` — Links to all pages involved

## Linking Conventions

- Use Obsidian-style wiki links: `[[concepts/concept-name]]`
- Always use relative paths from wiki root
- Every page must link to at least one other page (no orphans)
- When mentioning a concept that has a page, always link it

## Tagging Taxonomy

<!-- CUSTOMIZE: Replace these placeholder categories with tags relevant to your domain. -->
<!-- Each category should have 3-8 specific tags. -->
<!-- Example for a cooking KB: -->
<!--   Cuisine: italian, japanese, french, mexican -->
<!--   Technique: braising, fermenting, sous-vide, grilling -->
<!--   Ingredient: protein, vegetable, grain, dairy -->

- **Category-A**: `tag-1`, `tag-2`, `tag-3`
- **Category-B**: `tag-4`, `tag-5`, `tag-6`
- **Category-C**: `tag-7`, `tag-8`, `tag-9`
- **Scope**: `foundational`, `advanced`, `experimental`
- **Status**: `well-established`, `emerging`, `speculative`

## Confidence Levels

- **high** — Well-established idea, multiple corroborating sources, demonstrated with concrete examples
- **medium** — Supported by sources but limited examples or single-source
- **low** — Single mention, anecdotal, or speculative

## Workflows

### Ingest

When the user says "ingest [source]" or adds a file to `raw/`:

1. Read the raw source completely
2. Create `wiki/summaries/<source-slug>.md` with full summary
3. Identify all concepts, entities, and strategies mentioned
4. For each concept/entity: create the page if it doesn't exist, or update it with new information if it does
5. Add cross-links in both directions between all touched pages
6. Update `wiki/index.md` — add new entries, update summaries of changed pages
7. Append to `wiki/log.md` with timestamp, source name, pages created/updated
8. Flag any contradictions with existing wiki content

### Query

When the user asks a question:

1. Read `wiki/index.md` to find relevant pages
2. Read those pages
3. Synthesize an answer citing specific pages with wiki links
4. If the answer reveals new insight worth preserving:
   - Create a synthesis page in `wiki/syntheses/`
   - Update index and log

### Lint

When the user says "lint" or "health check":

1. Read all wiki pages
2. Check for: orphan pages (no inbound links), stale claims, contradictions between pages, missing cross-links, incomplete sections, low-confidence pages that could be strengthened
3. Fix what can be fixed automatically
4. Report issues that need human judgment
5. Suggest new sources or topics to investigate
6. Update log

## Rules

- Never modify files in `raw/` and Clippings/
- Always update `index.md` and `log.md` after any wiki change
- Prefer updating existing pages over creating duplicates
- When in doubt about a claim, set confidence to "low" and note the uncertainty
- Keep pages focused — one concept per page, split if a page gets too long
- Use plain English — define jargon on first use in each page
- All dates in ISO 8601 format: YYYY-MM-DD
- When a source provides specific examples, include them with concrete details