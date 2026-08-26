# Prime Agent for FadWiki
# The Goal

  i am trying to build a knowledge base for my ai tutor. the knowledge base is based on obsidian vault, with multiple folders per subject and md files per
  concept. the ai tutor uses the knoledge base to personalize trainings and quizes per studen. the knoledge base will grow as new courses are added in
  time. tell me how to use agents and sub agents to achieve this goal.

# The Plan

 We need to respond with how to use agents and sub-agents to build a knowledge base for an AI tutor based on Obsidian vault. Should outline architecture:
 parent agent orchestrates tasks: indexing, parsing, updating knowledge base, generating quizzes, personalizing training. Sub-agents: one for scanning
 vault, one for extracting concepts, one for updating metadata, one for generating quizzes, one for retrieval. Use agent_message to pass tasks. Use
 continual harness refinement to store reusable patterns. Provide steps, example code snippets (Python). Also mention using edit skill to modify files,
 using websearch for new course info, using prime-intellect for GPU if needed. Provide suggestions for file structure, naming conventions, using YAML
 frontmatter, using tags. Also talk about incremental addition of courses: sub-agent monitors folder for new .md files, triggers processing.

 We need to follow guidelines: respond as the assistant, no tool calls needed unless we need to inspect something. We can give high-level plan and maybe
 sample code. Use concise but thorough explanation.


# Using Agents and Sub‑Agents to Build an Obsidian‑Based Knowledge Base for an AI Tutor

Below is a practical, step‑by‑step pattern you can adopt.  
It treats the **Obsidian vault** as a file‑system source that the agents read, transform, and write back to.  
The key idea is to **split the whole pipeline into a small set of well‑named sub‑agents**, each responsible for one logical chunk of work.  
The parent (root) agent then orchestrates them, passes data between them via `agent_message`, and persists reusable pieces in the continual‑harness (memories, prompt notes, skills).

---

## 1. High‑level architecture

```
+-------------------+          +-------------------+          +-------------------+
|   Parent Agent    |  <--->   |   Indexer Sub‑agent|  <--->   |   Extractor Sub‑agent|
| (orchestrates)   |          | (watch vault,      |          | (read & parse .md   |
|  - schedules      |          |  scan new files)  |          |  files, build      |
|  - passes tasks   |          |  - emits "new_file"|          |    metadata)      |
|  - collects replies|          +-------------------+          +-------------------+
+-------------------+                     |                               |
          |                           |                               |
          v                           v                               v
+-------------------+          +-------------------+          +-------------------+
|   Quiz Generator  |  <--->   |   Updater Sub‑agent|  <--->   |   Retrieval Sub‑agent|
| (creates quizzes) |          | (write back to     |          | (serve context to   |
|  - builds prompts |          |  vault, commit)   |          |  tutor)            |
|  - stores in      |          +-------------------+          +-------------------+
|    dedicated folder|
+-------------------+

```

* **Parent Agent** – the “brain” that decides *what* needs to be done (e.g., “index new courses”, “generate a quiz for Student A”). It never does the heavy lifting itself; it just sends messages to the appropriate sub‑agents.
* **Sub‑agents** – each runs in its own isolated RLM session, so they can be restarted, scaled, or even swapped out without affecting the others.
* **Communication** – use `await agent_message.send(message, receiver_role='parent')` from a sub‑agent and `await agent_message.send(..., receiver_role='child', receiver_name=child.name)` from the parent to continue the conversation.

---

## 2. Concrete sub‑agent responsibilities

| Sub‑agent | Core task | Typical inputs | Typical outputs |
|-----------|-----------|----------------|-----------------|
| **Watcher** (Indexer) | Detect new/changed `.md` files in the vault. | Path to vault root (or a watch‑pattern). | `{"file_path": "...", "action": "new"}` or `{"file_path": "...", "action": "modified"}` |
| **Parser** (Extractor) | Read a markdown file, pull out the *concept* (title, tags, front‑matter) and the *content* (text, examples, diagrams). | `file_path` from Watcher. | `{"title": "...", "tags": [...], "content": "...", "metadata": {...}}` |
| **Updater** | Write derived artefacts back to the vault (e.g., a `metadata.yaml` side‑car file, a `quiz.yaml` file, or a generated `index.csv`). | Parsed metadata + any extra data (quiz, tags). | `git commit`‑like message or a simple `write_file(path, content)` confirmation. |
| **Quiz Generator** | Given a concept (or a list of concepts) produce a personalized quiz (multiple‑choice, short‑answer, etc.). | `{"title": "...", "content": "...", "tags": [...], "student_profile": {...}}`. | `{"quiz_id": "...", "questions": [...], "answers": {...}}` |
| **Retriever** | Expose a searchable view of the knowledge base to the tutor (e.g., “find all concepts tagged *calculus*”). | Query string or filter criteria. | List of concept identifiers (file paths) + short snippets. |

Each sub‑agent can be started once and then kept alive for the whole session, or you can spin up a fresh child for a single task and delete it afterwards (`await rlm.delete_subagent(child)`).

---

## 3. Example workflow for **adding a new course**

1. **Watcher** detects a new folder `courses/intro‑python/` and the first `.md` file `01‑variables.md`.
2. **Watcher** sends a message to **Parser**:  

   ```python
   await agent_message.send(
       message={
           "type": "new_file",
           "file_path": "/mnt/c/Users/Frehun/Documents/Fad.Lab/ai/Fad-wiki-os/wiki-os-main/courses/intro-python/01-variables.md"
       },
       receiver_role='parent'
   )
   ```

3. **Parser** reads the file, extracts:
   * title (first heading)
   * front‑matter (if you use YAML)
   * main body (text, code blocks, images)
   * any embedded tags (`#math`, `#variables`, …)

   It replies:

   ```python
   await agent_message.send(
       message={
           "type": "parsed",
           "title": "Variables",
           "tags": ["variables", "python", "intro"],
           "content": "Variables store values …",
           "metadata": {"path": "courses/intro-python/01-variables.md"}
       },
       receiver_role='parent'
   )
   ```

4. **Parent** decides what to do next (e.g., “add to index”, “generate a quick quiz for the next lesson”). It sends a **task** to the **Quiz Generator**:

   ```python
   await agent_message.send(
       message={
           "type": "generate_quiz",
           "concept": parsed_data,
           "student_profile": {"id": "s001", "strengths": ["reading"], "weaknesses": ["coding"]},
           "quiz_length": 5
       },
       receiver_role='child',
       receiver_name=quiz_gen.name   # name of the Quiz Generator sub‑agent
   )
   ```

5. **Quiz Generator** creates a JSON/YAML quiz file, writes it into a dedicated `quizzes/` folder (or embeds it in the same folder with a naming convention), and replies with the quiz ID.

6. **Updater** receives the quiz file (or the parsed concept) and:
   * appends a line to a central `index.csv` that maps concept → quiz_id,
   * optionally commits the new file to the vault (using a git‑like CLI or a simple `write_file` operation).

7. **Retriever** can now be queried by the tutor:

   ```python
   results = await retriever.send(
       query="all concepts with tag 'variables'",
       receiver_role='parent'
   )
   # → list of concept dicts, ready to be fed into a lesson plan.
   ```

---

## 4. Persisting reusable pieces (Continual Harness)

* **Memory** – store a *canonical* representation of a concept (title, tags, a short summary).  
  ```python
  await rlm.harness.create_memory(
      key="concept:variables",
      value=json.dumps(parsed_data)
  )
  ```
* **Prompt note** – keep a reusable prompt template for quiz generation.  
  ```python
  await rlm.harness.create_prompt_note(
      name="quiz_template",
      content="Generate a ${count}‑question multiple‑choice quiz for the concept **${title}**. Use the student profile to bias difficulty."
  )
  ```
* **Skill** – you may want a reusable “extract‑metadata” skill that any sub‑agent can import.  
  ```python
  # in a skill file `extract_meta.py`
  async def run(file_path: str) -> dict: ...
  ```
  Then the parent can do `await extract_meta.run(file_path)`.

* **Refinement** – if you notice that the *Watcher* repeatedly misses files because of a path‑filter bug, you can fix it in the skill and call `await refine.run()`; the change will be persisted for the next turn.

---

## 5. Practical tips for an Obsidian‑based vault

| Tip                                                                                                                                                                                                          | Why it helps                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Front‑matter** (`---` block) at the top of each `.md`                                                                                                                                                      | Gives you a structured place for `title`, `tags`, `course_id`, `difficulty`, etc. The Parser can read this reliably instead of trying to guess from headings. |
| **Consistent folder naming** (`courses/<subject>/<lesson>/`)                                                                                                                                                 | Makes the Watcher’s glob patterns simple (`**/*.md`) and lets the Updater generate predictable output paths (e.g., `index/<subject>/<lesson>.csv`).           |
| **Tag taxonomy** (e.g., `#math/algebra/linear`, `#cs/python/variables`)                                                                                                                                      | Enables the Retriever to filter by subject, difficulty, or learning style without parsing the whole file.                                                     |
| **Separate “generated” folder** (`generated/quizzes/`, `generated/index.csv`)                                                                                                                                | Keeps the original vault untouched; you can version‑control the generated artefacts independently.                                                            |
| **Git hook or Obsidian plugin** to auto‑commit after the Updater writes new files                                                                                                                            | Guarantees that the vault on disk stays in sync with the in‑memory index.                                                                                     |
| **Image handling** – store images next to the markdown or in a dedicated `assets/` folder; the Parser should copy the image path into the extracted dict so the Retriever can embed it when serving context. |                                                                                                                                                               |
|                                                                                                                                                                                                              |                                                                                                                                                               |

---

## 6. Minimal code skeleton (Python, using the pre‑installed skills)

```python
import json
from pathlib import Path

# ------------------------------------------------------------------
# 1.  Define the sub‑agents (run once, keep handles)
# ------------------------------------------------------------------
watcher = await rlm('watch_vault', name='watcher')
parser  = await rlm('parse_md',    name='parser')
updater = await rlm('write_file',  name='updater')
quiz_gen= await rlm('quiz_generator', name='quiz_gen')
retriever = await rlm('search_kb', name='retriever')

# ------------------------------------------------------------------
# 2.  Helper to send a message and wait for a reply (simple pattern)
# ------------------------------------------------------------------
async def send_and_wait(msg, target_role='parent'):
    await agent_message.send(msg, receiver_role=target_role)
    # In a real implementation you would have a listener that returns the reply.
    # Here we just block until the next turn (the framework will deliver replies).
    return await _wait_for_reply()   # placeholder – actual code depends on your agent framework

# ------------------------------------------------------------------
# 3.  Main orchestration (run in the parent agent)
# ------------------------------------------------------------------
async def main():
    # a) watch for new files
    while True:
        ev = await send_and_wait(
            {"type": "watch", "root": "/mnt/c/Users/Frehun/Documents/Fad.Lab/ai/Fad-wiki-os/wiki-os-main"},
            target_role='parent'
        )
        # ev may be a dict like {"file_path": "...", "action": "new"}
        if ev.get("action") == "new":
            # b) parse the file
            parsed = await send_and_wait(
                {"type": "parse", "path": ev["file_path"]},
                target_role='parent'
            )
            # c) generate a quiz for the *next* student (example)
            quiz_msg = {
                "type": "generate_quiz",
                "concept": parsed,
                "student_profile": {"id": "s001", "strengths": ["reading"], "weaknesses": ["coding"]},
                "quiz_length": 5
            }
            quiz_reply = await send_and_wait(quiz_msg, target_role='child', receiver_name=quiz_gen.name)

            # d) write quiz (or index) back
            await send_and_wait(
                {"type": "write_quiz", "quiz_path": f"generated/quizzes/{parsed['metadata']['path'].split('/')[-1].replace('.md', '.quiz.yaml')}", "content": quiz_reply},
                target_role='parent'
            )
            # e) optionally persist concept in memory
            await rlm.harness.create_memory(
                key=f"concept:{parsed['metadata']['path']}",
                value=json.dumps(parsed)
            )

        # ... handle other actions (modified, delete, etc.) similarly ...

# ------------------------------------------------------------------
# 4.  Run the parent
# ------------------------------------------------------------------
import asyncio
asyncio.run(main())
```

*The code above is illustrative; you will replace the placeholder `send_and_wait` with the actual message‑passing API your environment provides (e.g., `await agent_message.send(...)` and a listener that returns the reply).*

---

## 7. Checklist for a production‑ready implementation

1. **Vault monitoring** – use a file‑system watcher (`watchdog` or a simple `while True` with `os.listdir`) inside the *Watcher* sub‑agent.
2. **Robust parsing** – handle front‑matter, markdown headings, code fences, and images. Consider using `markdown` + `mistune` or `beautifulsoup4` for HTML‑like extraction.
3. **Idempotent writes** – when the Updater writes a quiz or index file, check if the target already exists and either overwrite or append with a version stamp.
4. **Atomic commits** – if the vault lives in a git repository, let the Updater run `git add … && git commit -m "add quiz for <concept>"` via a small CLI skill.
5. **Security / sandboxing** – keep each sub‑agent in its own RLM session; avoid giving them unrestricted shell access unless you explicitly need it.
6. **Testing** – write a few unit‑style integration tests that feed a known `.md` file into the Parser and assert the extracted dict shape. Run them in a temporary directory to avoid contaminating the real vault.
7. **Scalability** – if the vault grows large, consider paging the Watcher (only scan directories that changed since the last run) and caching parsed results in the continual harness memory.

---

## 8. TL;DR – What you should do next

1. **Create the sub‑agents** (`watcher`, `parser`, `updater`, `quiz_gen`, `retriever`).  
2. **Implement the core logic** for each (file watching, markdown extraction, quiz generation).  
3. **Wire them together** in the parent agent using `agent_message.send`.  
4. **Persist reusable artefacts** (memories, prompt notes, skills) with `rlm.harness` so the same logic can be reused when new courses are added.  
5. **Iterate** – run the system, watch the logs, and call `await refine.run()` whenever you notice a repeated failure (e.g., a parsing bug, a naming clash, or a missing tag).  

With this modular agent‑sub‑agent setup, your AI tutor can:

* **Automatically ingest new courses** as they appear in the Obsidian vault.  
* **Personalize training** by pulling the right concepts (via the Retriever) and generating quizzes that match each student’s profile.  
* **Scale** – adding a new subject is just a new folder; the Watcher will pick it up without any code change.

Happy building! �� 🚀
