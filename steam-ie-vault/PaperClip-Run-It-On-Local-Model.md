---
title: "network-tocoder/PaperClip-Run-It-On-Local-Model"
source: "https://github.com/network-tocoder/PaperClip-Run-It-On-Local-Model"
author:
published:
created: 2026-08-07
description: "Contribute to network-tocoder/PaperClip-Run-It-On-Local-Model development by creating an account on GitHub."
tags:
  - "clippings"
---
## Run a Local AI Company — Paperclip + OpenCode + LM Studio

> **Video Tutorial:** [Watch on YouTube](https://www.youtube.com/watch?v=WzhPd4mVCJE) | **Part of the Local AI Series**

Run a fully private, offline multi-agent AI system on your own machine. No API keys. No cloud. No data leaving your machine.

---

**Stack:**

- **LM Studio** — runs local LLMs with an OpenAI-compatible HTTP server
- **OpenCode** — execution engine that connects your agents to the local model
- **Paperclip** — multi-agent orchestration platform (CEO, sub-agents, tasks, outputs)

---

## Prerequisites

| Tool | Version | Download |
| --- | --- | --- |
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| npm | v9+ | Included with Node.js |
| pnpm | latest | `npm install -g pnpm` |
| Git | latest | [git-scm.com](https://git-scm.com/) |
| LM Studio | latest | [lmstudio.ai](https://lmstudio.ai/) |

### Verify installation

**Windows (PowerShell)**

```
node --version
npm --version
git --version
```

**macOS / Linux**

```
node --version
npm --version
git --version
```

---

## Part 1 — LM Studio + OpenCode Setup

### Step 1 — Download and load the model in LM Studio

1. Open LM Studio
2. Go to **Discover** tab
3. Search `gemma-4-e4b` and download the `Q4_K_M` version (~6.3GB)
4. Go to **Developer** tab → click **Load**
5. Set these values before loading:

| Setting | Value |
| --- | --- |
| Context Length | `32768` |
| GPU Offload | `0` (CPU only) |
| Parallel Sessions | `1` |
| Flash Attention | ON |

> **Why 32768?** OpenCode's system prompt alone consumes ~21,000 tokens. Anything below 32k will fail with a context length error.

6. Click **Load** → once ready click **Start Server**
7. Confirm **Status: Running** at `localhost:1234`

---

### Step 2 — Create project folder and install OpenCode

**Windows**

```
mkdir paperclip-localmodel-demo
cd paperclip-localmodel-demo
npm install -g opencode-ai
opencode --version
```

**macOS / Linux**

```
mkdir paperclip-localmodel-demo
cd paperclip-localmodel-demo
npm install -g opencode-ai
opencode --version
```

Expected output: `1.3.x`

---

### Step 3 — Verify LM Studio server

**Windows**

```
curl http://127.0.0.1:1234/v1/models
```

**macOS / Linux**

```
curl http://127.0.0.1:1234/v1/models
```

Expected response:

```
{
  "data": [
    { "id": "gemma-4-e4b-it", "object": "model" }
  ]
}
```

Copy the exact `id` value — you'll use it in the config below.

---

### Step 4 — Configure OpenCode to use LM Studio

**Windows**

```
notepad "$env:USERPROFILE\.config\opencode\config.json"
```

**macOS**

```
nano ~/.config/opencode/config.json
```

**Linux**

```
nano ~/.config/opencode/config.json
```

Paste this config:

```
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LM Studio (local)",
      "options": {
        "baseURL": "http://127.0.0.1:1234/v1"
      },
      "models": {
        "gemma-4-e4b": {
          "name": "Gemma 4 E4B (local)"
        }
      }
    }
  },
  "model": "lmstudio/gemma-4-e4b"
}
```

Save and verify:

**Windows**

```
cat "$env:USERPROFILE\.config\opencode\config.json"
```

**macOS / Linux**

```
cat ~/.config/opencode/config.json
```

---

### Step 5 — Test the connection

**Windows / macOS / Linux**

```
opencode run "say hello in one sentence"
```

✅ Build line should show: `build · gemma-4-e4b`

Switch to LM Studio → **Developer Logs** — you'll see prompt processing in real time. That confirms the full pipeline: OpenCode → LM Studio → Gemma 4.

---

### Step 6 — Clone and install Paperclip

**Windows**

```
git clone https://github.com/paperclipai/paperclip.git .
mkdir outputs
pnpm install
```

**macOS / Linux**

```
git clone https://github.com/paperclipai/paperclip.git .
mkdir outputs
pnpm install
```

> **Windows only:** Paperclip uses symlinks for skills. Enable Developer Mode or run PowerShell as Administrator to avoid symlink errors.

Run Paperclip:

```
pnpm dev
```

Open browser → `http://127.0.0.1:3100`

---

## Part 2 — Paperclip + Local Model

### Step 7 — Onboarding wizard

Open `http://127.0.0.1:3100` — the onboarding wizard launches automatically.

**Company tab**

| Field | Value |
| --- | --- |
| Company name | `AI Watch` |
| Mission | `Monitor and summarize the latest AI developments across key industry verticals daily` |

**Agent tab**

| Field | Value |
| --- | --- |
| Agent name | `CEO` |
| Adapter type | `OpenCode` (under More Agent Adapter Types) |
| Model | `lmstudio/gemma-4-e4b` |

Click **Test Now** — you may see a timeout warning on the first attempt. This is normal — LM Studio may still be completing a previous request. Click **Test Now** again immediately. It will pass on the second attempt.

**Task tab**

| Field | Value |
| --- | --- |
| Task title | `AI Industry Daily Briefing` |

Task description:

```
You are the CEO of an AI research operation. Do NOT do the research yourself.

Hire a ModelsAnalyst and assign them to find the latest AI model releases 
and benchmark updates from the past 7 days — include model name, company, 
key capability, and what makes it notable.

Hire a ToolsAnalyst and assign them to find the latest AI developer tools, 
frameworks, and open source releases from the past 7 days — include tool name, 
what problem it solves, and GitHub stars if available.

Hire a ReportWriter and assign them to compile both research findings into a 
clean daily briefing in markdown format, post it as a comment on this issue, 
and save it to outputs/ai-daily-briefing.md
```

Click **Create and Open Issue**.

---

### Step 8 — Monitor the run

Go to **CEO → Runs** tab:

- Confirm model shows `OPENCODE LOCAL · lmstudio/gemma-4-e4b`
- Watch transcript build in real time
- Switch to LM Studio → Developer Logs → confirm `PROCESSING PROMPT` entries firing

---

## Switching Models

If a model underperforms (e.g. very low output tokens despite long run time), switching takes under 2 minutes.

### In LM Studio

1. Hit **Eject** on the current model
2. Load `qwen3.5-2b` with the same settings (context `32768`, parallel `1`, Flash Attention ON)
3. Start Server → confirm Running

### Update OpenCode config

**Windows**

```
notepad "$env:USERPROFILE\.config\opencode\config.json"
```

**macOS / Linux**

```
nano ~/.config/opencode/config.json
```

Change the model section:

```
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LM Studio (local)",
      "options": {
        "baseURL": "http://127.0.0.1:1234/v1"
      },
      "models": {
        "qwen3.5-2b": {
          "name": "Qwen 3.5 2B (local)"
        }
      }
    }
  },
  "model": "lmstudio/qwen3.5-2b"
}
```

### Update Paperclip

1. Go to **CEO → Configuration** tab
2. Change model to `lmstudio/qwen3.5-2b`
3. Save

### Restart the task

1. **Issues → AIW-1 → Re-open**
2. **CEO → Run Heartbeat**

---

## Troubleshooting

| Error | Cause | Fix |
| --- | --- | --- |
| `n_keep >= n_ctx` | Context length too small | Set context to `32768` in LM Studio |
| `OpenCode hello probe timed out` | LM Studio busy with previous request | Click Test Now again immediately |
| CEO run succeeds but 0 agents hired | Model output too low (e.g. 17 tokens) | Switch to a larger or better-suited model |
| System crash on model load | RAM/VRAM spike | Use smaller quant (Q3\_K\_M) or set GPU Offload to 0 |
| `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` | Wrong directory | Run `pnpm install` from Paperclip root folder |
| Symlink errors on Windows | Developer Mode disabled | Run PowerShell as Administrator |

---

## Model Comparison

| Model | Size | RAM needed | Agentic tasks | Speed |
| --- | --- | --- | --- | --- |
| Gemma 4 E2B | ~2B | ~4GB | Basic | Fast |
| Gemma 4 E4B | ~4B | ~6GB | Moderate | Moderate |
| Qwen 3.5 2B | ~2B | ~4GB | Good | Moderate |
| Gemma 4 26B MoE | 4B active | ~12GB | Excellent | Slower (CPU) |

> **Recommended for this use case:** Qwen 3.5 2B or Gemma 4 26B MoE (with GPU)

---

## Architecture

```
You (Board of Directors)
        │
        ▼
   CEO Agent
   (reads task, plans, delegates)
        │
        ▼
paperclip-create-agent skill
        │
   ┌────┴────┐
   ▼         ▼
ModelsAnalyst  ToolsAnalyst
   └────┬────┘
        ▼
   ReportWriter
        │
        ▼
outputs/ai-daily-briefing.md

All inference → OpenCode → LM Studio → Local Model
Cost: $0.00
```

---

## Resources

- [Paperclip GitHub](https://github.com/paperclipai/paperclip)
- [OpenCode Documentation](https://opencode.ai/docs)
- [LM Studio](https://lmstudio.ai/)
- [Gemma 4 on LM Studio](https://lmstudio.ai/models/gemma-4)
- [Previous video — Paperclip cloud setup](#)

---

## Related Videos

- Part 1: Paperclip + OpenCode with free cloud model
- Part 2: Local model setup (this video)
- Coming soon: Gemma 4 advanced use cases

---

*Found this useful? Star the repo and share with the AI community.*