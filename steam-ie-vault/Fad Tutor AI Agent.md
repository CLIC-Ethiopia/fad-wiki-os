# Fad Tutor AI Agent — Full Customization Plan

Connect all five broken/dummy tabs (Chat, Quiz, Deep Research, Co-Writer, Flashcards) to the real Gemini AI backend, and personalize Quiz + Flashcards using the user's Settings preferences.

## Current State Summary

|Tab|Current Problem|Root Cause|
|---|---|---|
|**Chat**|Doesn't respond to user messages|`agent-loop.ts` calls Gemini but doesn't execute tool calls or save assistant reply. The agent loop is incomplete — it streams tokens but never processes `functionCall` results or runs the agentic tool-use loop.|
|**Quiz**|Shows hardcoded `DEMO_QUIZ` (10 generic STEAM-IE questions)|No AI call — `quiz-view.tsx` renders a static `DEMO_QUIZ` constant, never calls the backend|
|**Deep Research**|Fake progress bar → dummy hardcoded markdown|`research-view.tsx` uses `setInterval` to fake progress and returns a hardcoded report string (L70-81)|
|**Co-Writer**|"Ask Tutor" returns hardcoded AgriTech drone text|`cowriter-view.tsx` `handleAskTutor()` uses `setTimeout` + hardcoded string (L23-27)|
|**Flashcards**|Shows 15 generic hardcoded cards|`flashcards-view.tsx` renders `DEFAULT_CARDS`, never calls AI|

---

## User Review Required

IMPORTANT

**Gemini API Key**: A `GEMINI_API_KEY` exists in `.env`. All 5 tabs will share this key. The current agent-loop uses `gemini-1.5-pro` but `prompts.ts` defines `gemini-2.5-flash` as default per capability. I'll standardize on the `DEFAULT_MODELS` mapping from `prompts.ts` (`gemini-2.5-flash`).

WARNING

**Tool-calling agent loop**: The current `agent-loop.ts` only does a single `generateContentStream` call. It does NOT process tool call responses (i.e., it doesn't run `executeTool`, feed results back, and re-prompt). This means tools like `rag`, `web_search`, `generate_questions` etc. are declared but never executed. Fixing this is the foundational prerequisite for **all 5 tabs**.

IMPORTANT

**Settings personalization**: The Quiz and Flashcards tabs must generate content based on the user's `industry`, `secondaryIndustry`, `learningNeeds`, and `goal` from the Settings tab. I'll inject these into the system prompt AND include them in the API request body so the backend can use them for context.

## Open Questions

1. **Quiz UI overhaul**: The current Quiz UI is built for a fixed 10-question MCQ format. The AI will generate variable-length quizzes with multiple question types (MCQ, true/false, short answer, fill-in-blank). Should I keep the existing "one question at a time" stepper UI (adapted for AI-generated questions), or switch to a "show all questions" layout?
    
2. **Deep Research streaming**: Should the research report stream in token-by-token (like Chat), or should it accumulate behind the progress bar and reveal the full report at completion? The streamed approach gives better UX feedback.
    
3. **Flashcard count**: The system prompt says "at least 15 flashcards". Is 15 a good default, or would you prefer fewer (e.g., 10) for faster generation?
    

---

## Proposed Changes

### Component 1: Agent Loop — The Foundation

The single most critical fix. Without this, no tab works.

#### [MODIFY] agent-loop.ts

**Problem**: Current implementation does a single `generateContentStream` call. When Gemini returns `functionCall` parts (tool invocations), the loop ignores them — it never executes the tool, feeds the result back, or re-prompts. This breaks the entire agentic pattern.

**Changes**:

1. Accept `capability` as a parameter (currently hardcoded to `'chat'`)
2. Convert to a proper **agentic tool-use loop**:
    - Call `generateContentStream` with the tool declarations from `getToolSchemas(capability)`
    - Stream text tokens back to the caller via `yield`
    - When a `functionCall` chunk arrives:
        - Yield a `tool_start` event
        - Execute the tool via `executeTool(name, args, context)`
        - Yield a `tool_result` event
        - Append the tool result as a `functionResponse` part to the conversation
        - Re-call `generateContentStream` with the updated conversation (this closes the loop)
    - Repeat until the model responds with only text (no more tool calls), or `MAX_ROUNDS` is reached
3. Use `DEFAULT_MODELS[capability]` instead of hardcoded `'gemini-1.5-pro'`
4. Save the final assistant message to the session via `addMessage()`
5. Pass `tools` declarations (from `getToolSchemas`) to the Gemini `config`

This transforms the agent from a single-shot LLM call into a proper ReAct-style agent loop.

---

### Component 2: Tutor Routes — New API Endpoints

#### [MODIFY] tutor-routes.ts

**Changes**:

1. **Fix the chat endpoint** (`POST /sessions/:id/chat`):
    
    - Pass the session's `capability` (fetched from `getSession()`) into `runAgentTurn` instead of hardcoding `'chat'`
    - Stream `tool_start` and `tool_result` events in addition to `token` events
    - Save the final assembled assistant content to the session via `addMessage()`
2. **Add new endpoint**: `POST /api/tutor/generate-quiz`
    
    - Accepts `{ topic?: string }` in body (optional — if omitted, uses settings to auto-pick a topic)
    - Reads user settings from `getTutorSettings()`
    - Creates a one-shot Gemini call using the `deep_question` system prompt, with user's `industry`, `secondaryIndustry`, `learningNeeds`, and `goal` injected
    - Instructs the model to return structured JSON (an array of question objects)
    - Returns the parsed quiz JSON to the client
3. **Add new endpoint**: `POST /api/tutor/deep-research`
    
    - Accepts `{ topic: string }` in body
    - Creates a session with `capability: 'deep_research'`
    - Runs the agent loop (which will use `web_search`, `web_fetch`, `rag`, `reason` tools)
    - Streams SSE events (`token`, `tool_start`, `tool_result`, `done`) back to the client
4. **Add new endpoint**: `POST /api/tutor/cowriter`
    
    - Accepts `{ prompt: string, document: string }` in body
    - Runs a Gemini call with `capability: 'chat'` (or a new `'cowriter'` capability) with the current document as context
    - Streams the AI's response back
5. **Add new endpoint**: `POST /api/tutor/generate-flashcards`
    
    - Accepts `{ topic?: string, count?: number }` in body
    - Reads user settings for personalization
    - Runs a one-shot Gemini call using the `flashcards` system prompt
    - Instructs the model to return structured JSON (array of `{ front, back }` objects)
    - Returns parsed flashcard JSON

---

### Component 3: Chat Tab — Fix Response Handling

#### [MODIFY] chat-view.tsx

**Problem**: The SSE parsing logic (L59-95) is mostly correct but fragile. It doesn't handle multi-line SSE data or `tool_result` events.

**Changes**:

1. Improve SSE parsing robustness — handle chunked `data:` lines that split across `reader.read()` boundaries
2. Add handling for `tool_result` events to display tool execution results inline
3. Add basic **markdown rendering** for assistant messages (currently renders raw text via `{m.content}` — needs a markdown renderer like `react-markdown`)
4. Ensure the settings are passed to the backend in the chat request body so the system prompt is personalized

---

### Component 4: Quiz Tab — AI-Generated Questions from Settings

#### [MODIFY] quiz-view.tsx

**Problem**: Renders hardcoded `DEMO_QUIZ`. No AI involvement.

**Changes**:

1. **Remove** the `DEMO_QUIZ` constant entirely
2. **Add a "Generate Quiz" screen** as the initial state:
    - Shows the user's current settings (industry, sub-domain, learning goal) pulled from `useTutorStore().settings`
    - Optional topic input for further refinement
    - A "Generate Quiz" button
3. **On button click**: Call `POST /api/tutor/generate-quiz` with the user's settings
4. **Loading state**: Show a skeleton/spinner while the AI generates questions
5. **Render AI-generated questions** using the existing stepper UI (adapted to handle variable question counts and types)
6. **Settings-empty guard**: If no settings are configured, show a prompt directing the user to the Settings tab first
7. Keep the existing score display, progress bar, and answer-feedback UX — just wire them to AI data instead of the hardcoded constant

---

### Component 5: Deep Research Tab — Real AI Research

#### [MODIFY] research-view.tsx

**Problem**: `handleResearch()` (L64-81) uses `setInterval` to fake progress and outputs a hardcoded report.

**Changes**:

1. **Replace `handleResearch`** with a real API call to `POST /api/tutor/deep-research`
2. **Stream SSE events** from the backend:
    - `tool_start` events → update the progress label ("Searching the web...", "Reading source: [title]", "Querying vault...")
    - `token` events → incrementally build the report text
    - `done` event → finalize
3. **Replace the fake progress bar** with a real tool-activity log showing which tools the agent is currently using (similar to how chat shows `ToolActivity`)
4. **Render the final report** with markdown formatting (use `react-markdown` or similar)
5. Keep the existing Save-as-Note and Export CSV functionality

---

### Component 6: Co-Writer Tab — Real AI Writing Assistance

#### [MODIFY] cowriter-view.tsx

**Problem**: `handleAskTutor()` (L19-28) uses `setTimeout` + a hardcoded response.

**Changes**:

1. **Replace `handleAskTutor`** with a call to `POST /api/tutor/cowriter`
2. **Send the current document + user prompt** to the backend
3. **Stream the AI response** back and append it to the document (or display it in the sidebar for review before insertion)
4. **Add "Insert" / "Replace" actions** so the user can choose how to apply the AI's suggestion to their document
5. Make the suggestion list items ("Expand this section", "Make it more professional", etc.) functional — clicking them should trigger the AI with the appropriate prompt
6. Remove the hardcoded dummy document from the Zustand store default

---

### Component 7: Flashcards Tab — AI-Generated from Settings

#### [MODIFY] flashcards-view.tsx

**Problem**: Renders 15 hardcoded `DEFAULT_CARDS`. No AI involvement.

**Changes**:

1. **Add a "Generate Flashcards" landing screen** (similar to Quiz):
    - Show the user's current settings (industry, sub-domain, learning needs, goal) from `useTutorStore().settings`
    - Optional topic input for further refinement
    - A "Generate Flashcards" button
2. **On button click**: Call `POST /api/tutor/generate-flashcards` with the user's settings
3. **Loading state**: Show a skeleton while the AI generates cards
4. **Render AI-generated cards** using the existing flip-card UI
5. **Keep `DEFAULT_CARDS` as fallback** only if the user has no settings configured and hasn't generated cards yet
6. **Settings-empty guard**: If no settings, prompt the user to configure Settings first
7. The difficulty buttons (Advanced/Intermediate/Introduction) at the bottom should be reworked to trigger AI regeneration at that difficulty level, or filter existing cards

---

### Component 8: Zustand Store Updates

#### [MODIFY] tutor-store.ts

**Changes**:

1. Add `quizLoading: boolean` and `setQuizLoading` for quiz generation state
2. Add `flashcardsLoading: boolean` and `setFlashcardsLoading` for flashcard generation state
3. Add `researchLoading: boolean` and research progress state
4. Remove the hardcoded cowriter document default (L86) — set it to an empty string
5. Ensure `quizData` is properly typed to hold AI-generated question arrays

---

### Component 9: Prompts — Add Co-Writer Capability

#### [MODIFY] prompts.ts

**Changes**:

1. Add a `'cowriter'` capability to the `Capability` type union
2. Add a `cowriter` system prompt that instructs the model to act as a collaborative writing assistant
3. Add model/rounds defaults for the new capability

---

### Component 10: Optional — Markdown Rendering

#### [NEW] Install `react-markdown` + `remark-gfm`

Currently, all assistant messages render as raw text. For proper formatting:

- Install `react-markdown` and `remark-gfm`
- Create a shared `<MarkdownRenderer>` component
- Use it in Chat, Research report, and Co-Writer views

---

## File Change Summary

|File|Action|Purpose|
|---|---|---|
|agent-loop.ts|MODIFY|Fix the agentic tool-use loop (foundational)|
|tutor-routes.ts|MODIFY|Add quiz, research, cowriter, flashcard endpoints|
|prompts.ts|MODIFY|Add `cowriter` capability|
|chat-view.tsx|MODIFY|Fix SSE parsing, add markdown rendering|
|quiz-view.tsx|MODIFY|Replace hardcoded quiz with AI-generated|
|research-view.tsx|MODIFY|Replace fake progress with real AI research|
|cowriter-view.tsx|MODIFY|Replace dummy response with real AI|
|flashcards-view.tsx|MODIFY|Replace hardcoded cards with AI-generated|
|tutor-store.ts|MODIFY|Add loading states, fix defaults|
|New: `react-markdown`|NPM INSTALL|Markdown rendering for AI responses|

---

## Verification Plan

### Automated Tests

- `npm run build` — verify TypeScript compiles without errors after all changes

### Manual Verification

1. **Settings**: Set industry="Healthcare", sub-domain="Telemedicine", goal="Transition to health informatics", difficulty="Intermediate"
2. **Chat**: Send "What are the latest trends in telemedicine?" → verify streaming response, tool calls visible, personalized content
3. **Quiz**: Click Generate Quiz → verify questions are about Healthcare/Telemedicine, not generic STEAM
4. **Deep Research**: Enter "AI in telemedicine diagnostics" → verify real web search + vault queries + cited report
5. **Co-Writer**: Type a prompt → verify AI-generated suggestion (not the hardcoded AgriTech text)
6. **Flashcards**: Click Generate → verify cards are about Healthcare/Telemedicine concepts
7. **Empty settings**: Clear all settings → verify Quiz and Flashcards show "configure settings first" message

---

## Execution Order

The agent loop fix is the critical path — everything else depends on it.