
lets redesign the "Study Planner" tab of fad tutor,  give me a plan only, do not code yet
1. we use 12 cards indicating lessons will take 12 weeks in total with 4 hours per week lessons. 
2. each of the 12 cards will show name of the lesson for that week and when clicked they open a modal to show detailed content of the week's lesson and how each of the 4 hours per week are allocated. 
3. use a Modern Bento Grid Layout for arranging the 12 cards. and use the modern style and color scheme used in the "info" tab of fad tutor. 
4. use ai to design a 12 weeks (that is total 48 hours) lesson plan personalized to the user profile from the settings tab. 
5. in the top of this "Study Planner" tab add a hero section that give general info about the 12 weeks lesson plan, also keep "new task" button in hero section that will allow user to add personal tasks by creating new card in addition to the 12 cards. 
6. make sure all user added cards persists even if user switches to other tabs.


lets redesign the "Progress Tracker" tab of fad tutor,  give me a plan only, do not code yet
1. we use 12 cards indicating weekly lessons of 4 hours each with a check box and description text, user can tick boxes to indicate he completed the hourly lesson. 
2. add additional cards, as many as user generated cards in "Personal Learning Tasks" section of the study planer tab 
3.  add additional cards for flashcards to indicate if user generated flashcards and studied them or not
4. add additional cards for quiz indicating  practice questions are completed or not
5. use a Modern Bento Grid Layout for arranging cards. and use the modern style and color scheme used in the "study planner" tab of fad tutor. 
6. in the top of this "Progress Tracker" tab add a hero section that give general info about studen progress, how many hours completed, how many lessons remaining, if tests are ready or completed. stats about flashcards. use checkboxes in each of the card in this tab to record and analyze progress and the display in hero section 
7. make sure all user added info persists even if user switches to other tabs.


the knowledge center design is good. lets edit couple of things. 1. the button in the menu bar should be placed in the center of the page, do not group it with the left or right button groups. 2. in the knowledge center page, the menu bar scrolls with the rest of the page, i need it to stay visible even while scroling the rest of the page. 3. all cards in all 4 tabs of the knowledge center, when clicked, should open a page that has two column, the left column lists all the markdown files from the corresponding folder in "steam-it-vault" in similar ui style used in the home page, the right column will have two tabs  one tab fore displaying the content of clicked file from the right in readable html stye  and second tab for showing knowledge graph based on the files in that particular folder of the steam-ie-vault.

# Implementation Plan: Personalized E-Learning Knowledge Base Redesign

This plan outlines the redesign of the Tutor's **Knowledge base** tab (`/tutor/knowledge`) into a premium, personalized e-learning workspace styled after the **Info** tab, complete with structured syllabi, reading panes, rich media, and customized study pathways.

## Proposed Layout & Aesthetics

We will adapt the design system used in the Tutor **Info** tab:

- **Hero & Backgrounds**: Radial dot grid overlay, deep purple-to-rose gradients, pulsing status badges.
- **Cards & Elements**: Glassmorphic cards with vertical gradient left-rails, custom badges, active hover lifts, and rounded corners.
- **Layout**: A layout featuring a left-side Syllabus Sidebar (collapsible on mobile) and a right-side Content Canvas.

---

## E-Learning Components

### 1. The Study Syllabus (Sidebar Menu)

A chronological course curriculum divided into progressive learning modules:

- **Module 1: Core Fundamentals**: Adapts to the user's target concepts (e.g. Science, Technology).
- **Module 2: Industry Integration**: Dynamically loads files matching the user's selected `settings.industry` or `settings.secondaryIndustry` directly from the `steam-ie-vault` database.
- **Module 3: Special Interests**: Custom reading concepts matching the user's entered `settings.interests`.
- **Difficulty Badges**: Displays difficulty labels (`Beginner`, `Intermediate`, `Expert`) next to modules to denote depth.

### 2. The Learning Canvas (Main Panel)

- **Reading Pane**: A markdown document renderer featuring premium typography, highlighted term boxes, and note cards.
- **Dynamic AI Assistant Card**: An inline block: _"AI Lesson Summary: Custom tailored for your Goal ([Goal]) at [Difficulty] level..."_ which explains how the active document applies to their specific objectives.
- **Rich Media Block**:
    - **Simulated Video Lecture**: A mock video player component with high-fidelity gradients, duration badges, and play triggers to simulate video modules.
    - **Visual Diagrams Card**: Previews concept flowcharts or mindmaps relevant to the active category.
- **Inline Concept Check**: An action button linking the user directly to the **Quiz** tab to practice what they just read.

---

## Proposed Code Changes

### [MODIFY] knowledge-view.tsx

- Connect the component to `useTutorStore` to read active `settings`.
- Implement check for unconfigured settings (shows a welcome setup callout).
- Fetch the list of wiki pages from `/api/graph` (or `/api/home`) and filter them dynamically based on the user's setting parameters.
- Build the local module lists dynamically.
- Build the complete e-learning reading layout (Sidebar menu, main panel, custom video block, AI Insights block).

---

## Verification Plan

### Manual Verification

1. Open settings at `/tutor/settings` and configure:
    - Industry: `Agriculture`
    - Goal: `Launch an Agri-tech startup`
    - Difficulty: `Beginner`
2. Navigate to `/tutor/knowledge`:
    - Check if the curriculum dynamically shifts to focus on agribusiness and smart farming.
    - Confirm the styling mirrors the Info tab (gradients, badges, fonts).
3. Select a document from the Syllabus:
    - Confirm the markdown displays correctly.
    - Ensure the simulated video card and AI Insights block adapt their contents dynamically.

# comment

lets change the number of modules from 3 to 7 one for each of the STEAM-IE (Science, Technology, Engineering, Arts & Mathematics for Innovation & Entrepreneurship) branches. then divide 48 hours of lessons (4 hours per week for 12 weeks total) for each of the 7 modules according to the complexity of each of the 7 modules given user's ai generated study plan from "study planner" tab

# revised plan

# Implementation Plan: Personalized E-Learning Knowledge Base Redesign (v2)

Redesign the Tutor **Knowledge base** tab (`/tutor/knowledge`) into a premium, personalized e-learning workspace with 7 STEAM-IE modules and a 48-hour structured curriculum linked to the AI study planner.

## Core Architecture

### 7 STEAM-IE Learning Modules

Each module maps 1:1 to a STEAM-IE branch and a vault folder:

|#|Module|Icon|Vault Category|Default Hours|
|---|---|---|---|---|
|1|Science|🔬|`Science`|8h|
|2|Technology|💻|`Technology`|8h|
|3|Engineering|⚙️|`Engineering`|6h|
|4|Arts|🎨|`Arts`|4h|
|5|Mathematics|📐|`Mathematics`|6h|
|6|Innovation|💡|`Innovation`|8h|
|7|Entrepreneurship|🚀|`Entrepreneurship`|8h|

> **Total: 48 hours** (4 hours/week × 12 weeks)

### Dynamic Hour Allocation from Study Planner

The hour distribution above is the **default fallback**. When the user has an AI-generated study plan (from the "Study Planner" tab), the Knowledge Base will:

1. Read the `LessonPlan` from `localStorage` key `"study_planner_lesson_plan"`.
2. Parse each `WeekPlan`'s `hoursAllocation` entries — scanning each hour's `topic` field for STEAM-IE keywords (e.g. "science", "technology", "engineering", "arts", "math", "innovation", "entrepreneur").
3. Tally the hours per module to compute a personalized distribution. For example, if the AI planner allocated 12 of 48 hours to science-related topics, Module 1 (Science) gets 12h.
4. Display the allocated hours as progress rings/bars on each module card.
5. Cross-reference with `completedHours` from `localStorage` key `"study_planner_completed_hours"` to show real progress (e.g. "6 of 12 hours completed").

---

## Proposed Layout

### Left Sidebar: Module Navigator

- A vertical list of the 7 modules styled as cards with:
    - Module icon + name
    - Hours allocation badge (e.g. `8h allocated`)
    - Progress bar showing completed vs. allocated hours
    - Difficulty badge from `settings.difficulty` (Beginner/Intermediate/Expert)
    - Active module highlighted with gradient left-rail (matching Info tab style)
- Below the modules: a link to "Open Study Planner →" and "Open Knowledge Center →"

### Right Main Panel: Learning Canvas

When a module is selected, the panel displays:

#### A. Module Header

- Module title, icon, description
- Personalized AI insight card: _"Based on your goal ([Goal]) in [Industry], focus on [specific concept]…"_
- Hours allocation ring + week range indicator

#### B. Concept Reading Section

- Lists the vault pages matching this module's category (fetched from `/api/graph`)
- Clicking a concept opens a full reading pane with `ReactMarkdown` rendering
- Each concept card shows: title, summary, estimated read time, connections count

#### C. Rich Media Section

- **Video Lecture Block**: A premium mock video player card per concept — gradient thumbnail, play icon overlay, duration badge ("12 min"), chapter indicators
- **Visual Diagram Block**: Links to the Visualize tab with a pre-filled topic for the active concept

#### D. Inline Assessment

- "Test Your Knowledge" callout card linking to the Quiz tab
- "Create Flashcards" callout linking to the Flashcards tab
- Shows quiz completion stats from `useTutorStore` if available

---

## Personalization Engine

Data sources read by the component:

|Source|Key / API|Data Used|
|---|---|---|
|User Profile|`useTutorStore().settings`|`industry`, `secondaryIndustry`, `interests`, `goal`, `difficulty`|
|Study Plan|`localStorage["study_planner_lesson_plan"]`|`weeks[].hoursAllocation[].topic` — parsed to compute per-module hour budgets|
|Completion|`localStorage["study_planner_completed_hours"]`|`{weekNum_hourNum: boolean}` — tracks completed study hours|
|Vault Pages|`GET /api/graph`|`nodes[].categories`, `nodes[].title`, `nodes[].summary`, `nodes[].slug`|
|Page Content|`GET /api/wiki/:slug`|`contentMarkdown`, `title`, `headings`|

**Unconfigured state**: If settings are empty, show a gorgeous setup prompt (matching the Info tab "Quick Start" callout) directing the user to Settings → Study Planner → Knowledge Base.

---

## Code Changes

### [MODIFY] knowledge-view.tsx

Complete rewrite (~600 lines):

- Import `useTutorStore`, `ReactMarkdown`, `remarkGfm`, `rehypeHighlight`, lucide icons
- Define the 7 `STEAM_IE_MODULES` constant array with name, icon, color, vault category, default hours
- `parseStudyPlanHours(lessonPlan)` — utility function that scans the AI study plan and tallies hours per STEAM-IE branch
- `useEffect` to fetch `/api/graph` for vault page data
- `useEffect` to read study plan + completed hours from localStorage
- State management: `activeModule`, `selectedPageSlug`, `pageContent`, `loadingContent`
- Render: Info-tab-styled hero banner → sidebar module list → main reading canvas with tabs

---

## Verification Plan

### Manual Verification

1. Open `/tutor/settings`, configure Industry + Goal + Difficulty
2. Open `/tutor/planner`, generate an AI study plan
3. Navigate to `/tutor/knowledge`:
    - Verify 7 modules appear in the sidebar
    - Confirm hour allocations match the study planner's topic distribution
    - Confirm progress bars reflect completed hours from the planner
    - Click a module → verify vault pages load for that category
    - Click a page → verify markdown content renders correctly
    - Verify the AI insight card references the user's goal and industry
4. Without a study plan: verify fallback default hours (8/8/6/4/6/8/8) are shown
5. Without settings: verify the setup prompt appears