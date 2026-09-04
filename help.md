# Fad.Wiki & STEAM-IE Knowledge OS — User Guide & Navigation Manual

Welcome to **Fad.Wiki & STEAM-IE Knowledge OS**, an intelligent, compounding personal knowledge environment and AI learning laboratory built upon the principles of disciplined knowledge management and adaptive AI education.

This guide provides an exhaustive walkthrough of every section, interactive tool, and functional card across the entire application. Use the direct navigation links below to jump directly to any part of the system.

---

## Table of Contents

1. [System Architecture & Core Philosophy](#1-system-architecture--core-philosophy)
2. [Global Navigation Bar (Menu Bar)](#2-global-navigation-bar-menu-bar)
3. [Home Page (`/`)](#3-home-page-)
4. [Knowledge Center (`/knowledge-center`)](#4-knowledge-center-knowledge-center)
   - [STEAM Domains Tab](#steam-domains-tab)
   - [Innovation Hub Tab](#innovation-hub-tab)
   - [Entrepreneurship & Venture Tab](#entrepreneurship--venture-tab)
   - [Industry Sectors Tab](#industry-sectors-tab)
   - [Document Content & Graph Dual-Viewer](#document-content--graph-dual-viewer)
5. [Fad Tutor Suite (`/tutor`)](#5-fad-tutor-suite-tutor)
   - [Tutor Overview (`/tutor`)](#tutor-overview-tutor)
   - [Study Planner & Syllabus (`/tutor/planner`)](#study-planner--syllabus-tutorplanner)
   - [Flashcards & Active Recall (`/tutor/flashcards`)](#flashcards--active-recall-tutorflashcards)
   - [Interactive Quiz Lab (`/tutor/quiz`)](#interactive-quiz-lab-tutorquiz)
   - [AI Research Assistant (`/tutor/research`)](#ai-research-assistant-tutorresearch)
   - [Co-Writer & Essay Lab (`/tutor/cowriter`)](#co-writer--essay-lab-tutorcowriter)
   - [Diagram & Concept Visualizer (`/tutor/visualize`)](#diagram--concept-visualizer-tutorvisualize)
   - [Smart Notebook (`/tutor/notebook`)](#smart-notebook-tutornotebook)
   - [Mastery Analytics & Progress (`/tutor/progress`)](#mastery-analytics--progress-tutorprogress)
   - [AI Socratic Chat Companion (`/tutor/chat`)](#ai-socratic-chat-companion-tutorchat)
   - [Learner Settings & Profile (`/tutor/settings`)](#learner-settings--profile-tutorsettings)
6. [Global Knowledge Graph (`/graph`)](#6-global-knowledge-graph-graph)
7. [Analytics & Bento Stats (`/stats`)](#7-analytics--bento-stats-stats)
8. [Wiki Document Hub (`/wiki/:slug`)](#8-wiki-document-hub-wikislug)
9. [Web Clipper & Knowledge Ingestion Workflow](#9-web-clipper--knowledge-ingestion-workflow)
10. [Frequently Asked Questions & Tips](#10-frequently-asked-questions--tips)

---

## 1. System Architecture & Core Philosophy

Fad.Wiki operates on the **Compounding LLM Wiki** paradigm. Unlike static note-taking applications, every article, concept, and relationship in the vault grows richer over time:

- **Immutable Sources (`raw/`)**: Curated papers, whitepapers, and raw data are preserved untouched as ground truth.
- **Inbox & Web Clippings (`Clippings/`)**: Incoming articles from Obsidian Web Clipper are organized directly into the corresponding STEAM-IE topic folders.
- **The STEAM-IE Topic Hierarchy**:
  - `Science/`: Natural laws, physics, cognitive neuroscience, biological systems.
  - `Technology/`: Software systems, artificial intelligence, cloud architectures, cybersecurity.
  - `Engineering/`: Robotics, electronics, systems design, physical engineering.
  - `Arts/`: Digital design, human-centered aesthetics, creative media, communications.
  - `Mathematics/`: Linear algebra, statistics, discrete math, algorithms.
  - `Innovation/`: Emerging paradigms, research breakthroughs, disruptive technologies.
  - `Entrepreneurship/`: Business models, startup validation, venture finance, scaling.
  - `Industry/`: Vertical applications across healthcare, fintech, energy, and supply chain.
  - `Interdisciplinary/`: Syntheses bridging multiple domains.

---

## 2. Global Navigation Bar (Menu Bar)

The top navigation bar is permanently docked across all views and provides immediate one-click access to core utilities:

- **[Fad.Wiki Logo Button](/)**: Located at the top left. Displays the site title and a glowing brain icon. Clicking it returns you directly to the **Home Page**.
- **`Add new source` Button**: Launches the interactive **Web Clipper Modal**. Paste any URL (web page, documentation, research paper) and specify a target folder to scrape, clean, and convert the page into a clean Markdown note stored in the vault.
- **`Recommender Engine` Button**: Opens the **AI Recommender Modal**. Analyzes your current vault corpus to suggest unexplored topics, missing cross-disciplinary links, and high-impact study paths.
- **[Knowledge Center Button](/knowledge-center)**: Positioned prominently in the center with a vivid multi-color gradient (`#4f46e5` to `#10b981`). Takes you directly to the **Knowledge Center**, where all vault concepts are categorized into STEAM, Innovation, Entrepreneurship, and Industry matrices.
- **[Fad.Tutor Button](/tutor)**: Accesses the complete **Fad Tutor Suite**—including the AI Study Planner, Flashcards, Quizzes, Co-Writer, and Research Lab.
- **`Articles Count & Refresh` Button**: Displays live vault statistics (total markdown articles indexed). Clicking it triggers a manual re-index of the SQLite knowledge graph and cache.
- **[Graph Button](/graph)**: Opens the full-screen **Interactive Knowledge Graph**, visualizing all interconnected concepts in 2D/3D.
- **[Stats Button](/stats)**: Direct link to the **Analytics & Stats Dashboard**, featuring a Bento Grid layout with category distributions and learner KPIs.
- **[Help Button](/help)**: Positioned at the far right. Opens this interactive **User Guide & System Documentation**.

---

## 3. Home Page (`/`)

Direct link: [Go to Home Page](/)

The Home Page serves as your executive command center and quick-search hub:

### Main Components & Cards:
1. **Interactive Hero Search Box**:
   - Type any keyword, concept name, or alias to query the entire vault in real time.
   - Features keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter` to open, `Escape` to close).
   - Shows matching document titles, brief excerpts, and direct links.
2. **Vault Highlights & Metrics**:
   - Quick counters displaying total synthesized articles, overall word count, and last indexed date.
3. **Daily Insight & Quote Card**:
   - Curated intellectual reflections linking science, technology, and entrepreneurship to inspire daily exploration.
4. **Recent & Featured Notes Cards**:
   - Dynamic cards showing recently modified documents and randomly surfaced foundational concepts to encourage serendipitous learning.
5. **Quick Domain Jump Buttons**:
   - Color-coded badges allowing you to jump straight into specific STEAM-IE domain categories.

---

## 4. Knowledge Center (`/knowledge-center`)

Direct link: [Go to Knowledge Center](/knowledge-center)

The **Knowledge Center** is the central catalog of the application. It organizes all human knowledge in your vault into four high-level tabs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE CENTER FOUR HIGH-LEVEL TABS                │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  1. STEAM        │  2. INNOVATION   │ 3. ENTREPRENEUR  │  4. INDUSTRY  │
│  Foundations     │  Emerging Tech   │ Venture & Growth │  Applications │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### STEAM Domains Tab
Covers foundational intellectual disciplines:
- **Science Card (🔬)**: Physics, Chemistry, Biology, Cognitive Science, and empirical research.
- **Technology Card (💻)**: Computer Science, AI, Distributed Systems, Software Engineering.
- **Engineering Card (⚙️)**: Hardware design, robotics, systems engineering, materials.
- **Arts Card (🎨)**: Visual design, UX/UI, human expression, cognitive psychology in media.
- **Mathematics Card (📐)**: Calculus, Probability, Linear Algebra, Cryptography.
- **Interdisciplinary Card (🌐)**: Boundary-crossing studies connecting multiple sciences.

### Innovation Hub Tab
Highlights modern disruptive technological frontiers:
- **Disruptive Tech Card (⚡)**: Quantum computing, synthetic biology, nanotechnology.
- **AI & Automation Card (🤖)**: Large language models, autonomous agents, neural architectures.
- **CleanTech & Energy Card (🌱)**: Fusion, battery storage, renewables, circular economy.
- **Biotech & Health Card (🧬)**: Gene editing (CRISPR), mRNA technology, longevity science.
- **Space Exploration Card (🚀)**: Orbital manufacturing, propulsion systems, astronomy.
- **Creative Computing Card (💡)**: Generative art, procedural generation, spatial computing.

### Entrepreneurship & Venture Tab
Frameworks for building, funding, and scaling enterprises:
- **Startup Playbooks Card (🚀)**: Zero-to-one validation, MVP creation, customer discovery.
- **Venture Capital & Funding Card (💰)**: Cap tables, angel investing, term sheets, seed to Series A.
- **Business Models & Monetization Card (📈)**: SaaS unit economics, network effects, pricing strategies.
- **Product Strategy & PM Card (🎯)**: Product-Market Fit, agile roadmaps, user retention loops.
- **Growth & Marketing Card (📣)**: Viral coefficients, content funnels, B2B enterprise sales.
- **Legal & IP Card (⚖️)**: Patents, trademarks, founder vesting agreements, regulatory compliance.

### Industry Sectors Tab
Real-world industrial verticals and economic applications:
- **Manufacturing & Industry 4.0 Card (🏭)**: Digital twins, smart factories, additive manufacturing.
- **Healthcare & MedTech Card (🏥)**: Clinical diagnostics, medical devices, regulatory trials.
- **FinTech & Digital Economy Card (💳)**: Decentralized ledgers, algorithmic trading, payment gateways.
- **Agriculture & FoodTech Card (🌾)**: Vertical farming, cellular agriculture, supply forecasting.
- **Education & EdTech Card (🎓)**: Adaptive tutoring, micro-credentials, cognitive learning platforms.
- **Logistics & Supply Chain Card (🚢)**: Fleet optimization, multi-modal freight, inventory resilience.

### Document Content & Graph Dual-Viewer
When you click any card in the Knowledge Center, you enter the dedicated **Category Workspace**:
- **Sidebar Document List**: Search and filter all markdown documents belonging to that domain. Shows backlink counts and brief summaries.
- **`Document Content` Tab**: Displays the selected document in a high-contrast reading environment. Includes reading time, word count, formatted code blocks, and an instant **☀️ Light / 🌙 Dark** theme switcher.
- **`Knowledge Graph` Tab**: Renders an interactive local graph showing only the nodes and connections associated with the current domain.

---

## 5. Fad Tutor Suite (`/tutor`)

Direct link: [Go to Fad Tutor](/tutor)

The **Fad Tutor** suite is an adaptive smart learning lab designed to guide you through mastering complex technical and business concepts through active learning.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FAD TUTOR LAB MODULES                           │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 📋 Planner         │ 🗂️ Flashcards      │ 📝 Quiz Lab                  │
│ 12-Week Syllabus   │ Active Recall      │ Adaptive Evaluation          │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 🔬 Research        │ ✍️ Co-Writer       │ 📊 Visualize                 │
│ Deep Synthesis     │ Essay & Drafting   │ Mermaid & Diagrams           │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 📓 Notebook        │ 📈 Progress        │ 💬 AI Chat                   │
│ Scratchpad Editor  │ Mastery Analytics  │ Socratic Dialog              │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### Tutor Overview (`/tutor`)
Direct link: [Open Tutor Overview](/tutor)
- Summarizes your active learner persona, current difficulty tier, selected industry focus, and active learning goals.
- Provides quick links into each specialized tutor utility.

### Study Planner & Syllabus (`/tutor/planner`)
Direct link: [Open Study Planner](/tutor/planner)
- **12-Week Smart Curriculum**: Structured into weekly thematic milestones customized to your industry profile.
- **Module Checklist**: Check off completed learning blocks to automatically advance your completed study hours.
- **Completed Hours Gauge**: Tracks progress toward the 48-hour curriculum benchmark.

### Flashcards & Active Recall (`/tutor/flashcards`)
Direct link: [Open Flashcards](/tutor/flashcards)
- **Concept Cards**: Generate or review flashcards extracted from vault concepts.
- **Interactive Flip Mechanism**: Click to reveal definitions, formulas, or key arguments.
- **Mastery Tiers**: Rate your recall ("Hard", "Good", "Easy") to automatically schedule spaced repetition.

### Interactive Quiz Lab (`/tutor/quiz`)
Direct link: [Open Quiz Lab](/tutor/quiz)
- **Adaptive Question Generator**: Generates multiple-choice and conceptual assessment questions.
- **Instant Scoring & Explanation**: Provides detailed technical justifications for why each answer is correct or incorrect.
- **Score Archiving**: Records performance in local storage to update your Mastery Analytics.

### AI Research Assistant (`/tutor/research`)
Direct link: [Open Research Lab](/tutor/research)
- **Autonomous Literature Synthesis**: Formulates deep-dive research reports on complex queries.
- **Multi-Source Structuring**: Organizes output into executive summaries, technical breakdowns, trade-off matrices, and future outlooks.
- **Vault Export**: Save generated research directly into your vault as markdown notes.

### Co-Writer & Essay Lab (`/tutor/cowriter`)
Direct link: [Open Co-Writer](/tutor/cowriter)
- **Collaborative Drafting Surface**: Draft technical articles, investment memos, or study guides.
- **AI Assist Modes**: Expand bullet points, clarify dense prose, adjust tone (Academic, Executive, Technical), or generate counter-arguments.
- **Live Markdown Preview**: Split-pane editor with instant formatting.

### Diagram & Concept Visualizer (`/tutor/visualize`)
Direct link: [Open Concept Visualizer](/tutor/visualize)
- **Mermaid Diagram Generator**: Generates flowcharts, sequence diagrams, mind maps, Gantt charts, and architecture diagrams.
- **Interactive Preview & Code Editor**: Edit Mermaid syntax live and export high-resolution diagrams.

### Smart Notebook (`/tutor/notebook`)
Direct link: [Open Smart Notebook](/tutor/notebook)
- **Distraction-Free Scratchpad**: Take quick notes during study sessions.
- **Vault Sync**: Automatically saves notes to the `steam-ie-vault/notes/` directory for long-term retention and graph indexing.

### Mastery Analytics & Progress (`/tutor/progress`)
Direct link: [Open Progress Analytics](/tutor/progress)
- **Learner KPI Radar**: Visualizes competency across Science, Technology, Engineering, Arts, and Mathematics.
- **Study Streak Counter**: Tracks consecutive days of active engagement.
- **Quiz Performance History**: Graphs accuracy trends over time.

### AI Socratic Chat Companion (`/tutor/chat`)
Direct link: [Open Socratic Chat](/tutor/chat)
- **Context-Aware Dialogue**: Have a real-time conversation with an AI tutor aware of your vault notes, difficulty level, and study goals.
- **Socratic Prompting**: Encourages deep problem-solving rather than just delivering passive answers.

### Learner Settings & Profile (`/tutor/settings`)
Direct link: [Open Learner Settings](/tutor/settings)
- **Target Industry**: Select your primary domain (e.g., Artificial Intelligence, CleanTech, BioTech, FinTech).
- **Secondary Sub-Domain**: Refine your specialization.
- **Difficulty Tier**: Switch between Beginner, Intermediate, or Advanced/Expert.
- **Learning Goals & Interests**: Provide customized guidance prompts for all AI-generated syllabi and quizzes.

---

## 6. Global Knowledge Graph (`/graph`)

Direct link: [Open Knowledge Graph](/graph)

The **Knowledge Graph** renders the complete network topology of your second brain:

- **Force-Directed Physics Simulation**: Interlinked pages naturally cluster together based on conceptual affinity.
- **Category-Based Node Coloring**: Nodes are color-coded according to their primary STEAM-IE category (e.g., Cyan for Science, Violet for Tech, Orange for Engineering).
- **Search & Focus**: Filter the graph to highlight specific concepts, isolating direct connections and second-degree neighbors.
- **Inspection Drawer**: Click any node to open a preview card showing its summary, word count, and inbound backlinks, with a button to open the full page.

---

## 7. Analytics & Bento Stats (`/stats`)

Direct link: [Open Stats Dashboard](/stats)

The **Stats Tab** organizes all qualitative and quantitative system metrics into a modern two-column Bento Grid:

### Left Column: Vault Knowledge Intelligence
- **Pages Stat Card**: Total number of markdown documents indexed in the vault.
- **Words Stat Card**: Total synthesized words across all documents.
- **Avg. Words Stat Card**: Average content density per article.
- **Top Links Stat Card**: Maximum number of inbound backlinks to a single concept.
- **STEAM-IE Category Distribution**: Progress bars showing page counts across Science, Technology, Engineering, Arts, Mathematics, Industry, Innovation, and Interdisciplinary.
- **Most Backlinked Concepts Card**: Ordered ranking of the central hub concepts in your vault with visual frequency bars.

### Right Column: Tutor & Learner Intelligence
- **Learner Profile Card**: Displays your active industry, secondary specialization, difficulty tier, and custom learning goal.
- **Study Roadmap & Syllabus Card**: Circular gauge displaying completed syllabus hours against the 48-hour curriculum goal.
- **Practice & Active Recall Card**: Number of flashcards reviewed and quiz questions answered.
- **Vault Notes & Workspace Card**: Total saved study notes stored in `notes/` with quick launcher links to Research, Co-Writer, and Visualize.

---

## 8. Wiki Document Hub (`/wiki/:slug`)

Every concept in the vault has a dedicated reader view accessible via `/wiki/<page-name>`:

- **Breadcrumb Navigation**: Shows the folder hierarchy of the active article.
- **Reading Metadata**: Estimated reading time in minutes and total word count.
- **Table of Contents**: Auto-generated outline jumping directly to `h2` and `h3` section headers.
- **Related Concepts**: Badges displaying pages that link to or are cited by the current article.
- **Person Recognition**: If the document describes a person, the system displays their portrait avatar and historical overview.

---

## 9. Web Clipper & Knowledge Ingestion Workflow

Fad.Wiki is designed to ingest and organize external literature seamlessly:

1. Click **`Add new source`** in the top navigation bar.
2. Enter the **Source URL** (e.g., a research article, Medium essay, or technical documentation).
3. Select the target **STEAM-IE Folder** (e.g., `Science`, `Technology`, `Entrepreneurship`).
4. Click **`Clip and Save`**. The server fetches the content, cleans out advertisements and boilerplate, converts it to clean Markdown, and writes it directly to your vault.
5. Click **`Articles Count`** or trigger a reindex to immediately see the new concept reflected in the Knowledge Graph and Knowledge Center.

---

## 10. Frequently Asked Questions & Tips

> [!TIP]
> **Keyboard Shortcut**: Press `Escape` in any modal (Web Clipper, Recommender) to close it instantly.

> [!NOTE]
> **Reading Mode in Document Content**: In the Knowledge Center's "Document Content" tab, use the **Light/Dark Toggle** in the upper-right corner of the tab bar to switch between a clean white paper sheet and dark mode.

> [!IMPORTANT]
> **Vault Storage**: All notes and data are stored locally in plain Markdown (`.md`) files inside the vault directory. You own your knowledge, and it remains readable by Obsidian, VS Code, or any text editor.

---

*Fad Tutor · STEAM-IE Smart Education Lab*
