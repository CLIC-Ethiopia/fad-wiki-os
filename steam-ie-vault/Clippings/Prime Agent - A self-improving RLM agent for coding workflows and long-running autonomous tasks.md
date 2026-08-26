---
title: "CLIC-Ethiopia/prime-agent: A self-improving RLM agent for coding workflows and long-running autonomous tasks."
source: "https://github.com/CLIC-Ethiopia/prime-agent/tree/main"
author:
published:
created: 2026-08-23
description: "A self-improving RLM agent for coding workflows and long-running autonomous tasks. - CLIC-Ethiopia/prime-agent"
tags:
  - "clippings"
---
[![Prime Intellect](https://github.com/user-attachments/assets/6414bc9b-126b-41ca-9307-9e982430cde8)](https://primeintellect.ai/)### Prime Agent: A Self-Improving RLM Agent

### Interactive Login Shell (Recommended)

If CMD throws a "command not found" error, it means your Ubuntu `.bashrc` or profile path isn't loading automatically. You can force WSL to load your full Linux profile environment before running the agent by using this syntax:

cmd

```
wsl -d Ubuntu-24.04 -e bash -lic "prime-agent"
```

[Documentation](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/index.md) • [Verifiers](https://github.com/PrimeIntellect-ai/verifiers) • [PRIME-RL](https://github.com/PrimeIntellect-ai/prime-rl)

Prime Agent is an open-source coding and research agent for general and long-running work. It is designed around two core abstractions:

- The **[Recursive Language Model (RLM)](https://www.primeintellect.ai/blog/rlm)** treats context as variables (*prompt-as-a-variable*) and tools like recursive subagents as function calls (*programmatic tool /sub-agent calling*) inside a persistent REPL.
- The **[Continual Harness](https://arxiv.org/abs/2605.09998)** stores supplemental prompts, memories, skill descriptions, and reusable subagent specifications as durable state that Prime Agent can refine through small, evidence-backed updates, local to the session by default.

Prime Agent combines a persistent Python control environment with durable harness state, so useful working context and reusable operating patterns can outlive a single chat window.

- **Everything is programmatic:** persistent IPython is the built-in model tool; file operations, shell commands, tool use, subagents, and context management happen through code.
- **Subagents are built in:** `rlm(...)` spawns real child agents for parallel or background work and returns their results programmatically.
- **The harness can improve:** `/refine` reviews the current trajectory and can apply small, evidence-backed updates to supplemental harness state. It never rewrites the immutable base system prompt, and recorded snapshots support rollback.
- **Skills are executable:** skills are importable Python packages, and the built-in skill creator can turn recurring workflows into project or personal skills.
- **Sessions run in the background:** daemon-backed agents keep running when the terminal disconnects and can be reattached later.
- **Agents communicate directly:** running agents can exchange messages and orchestrate one another without routing everything through the user.
- **Long tasks keep moving:** automatic compaction, persistent goals, heartbeats, schedules, autonomous mode, and retained subagents preserve progress across turns and terminal sessions.

## Getting Started

Install the latest stable release on macOS or Linux:

```
curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh
```

The installer downloads a versioned release, verifies its SHA-256 checksum, installs the `prime-agent` command, and can prepare the IPython runtime used by the agent.

Start Prime Agent from the repository or directory you want it to work in:

```
cd /path/to/project
prime-agent
```

On first launch, run `/login` to choose a subscription or API-key provider. Prime Agent works in the current directory and can run commands and modify files there. Use a disposable clone, clean worktree, or another checkpoint you can inspect and restore.

> [!warning] Warning
> Prime Agent executes model-generated Python and project commands with your user permissions. Its worker and kernel processes improve lifecycle isolation and recovery; they are **not** a security sandbox. Review changes and use trusted repositories, instructions, skills, and extensions only. Run untrusted code or instructions in an external sandbox or restricted environment.

Useful commands:

```
prime-agent agents                   # Browse running, idle, and saved sessions
prime-agent attach <agent>           # Reattach to a running session
prime-agent --resume [path|id]       # Browse sessions or resume one directly
prime-agent status                   # Inspect background service state
prime-agent doctor [--fix]           # Inspect or repair background services
prime-agent update [--force]         # Update Prime Agent
prime-agent shutdown [--force]       # Stop every agent, worker, and background service
```

## Built for Long-Running Work

Prime Agent is built for long-running work, especially for evaluations in research. These features are available in the TUI, and when run autonomously.

- **Continual Harness:** `/refine` can persist focused, reviewable lessons as supplemental prompts, memories, reusable skill descriptions, or subagent specifications, with recorded refinement history. It does not replace packaging and reviewing new executable skills.
- **Direct agent-to-agent communication:** running agents and retained subagents can discover one another, exchange messages, and steer active work.
- **Daemon-backed continuity:** active sessions, IPython state, schedules, and subagents keep running when the terminal detaches and can be reattached later.
- **Heartbeats and schedules:** `/heartbeat`, `rlm_heartbeat`, and `prime-agent schedule` can re-enter a session periodically or at a specific time.
- **Persistent goals:** `/goal` keeps an objective and its progress active across turns until it is completed, paused, or cleared.
- **Bounded autonomous mode:** `/autonomous` continues within configured turn, token, and time budgets and can run user-defined quality gates. A passed gate checks only what that gate verifies; reaching a limit does not imply task success.

## Documentation

- [Quickstart](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/quickstart.md) — install, authenticate, and run a first session
- [Usage and CLI reference](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/usage.md) — commands, sessions, autonomous limits, and output modes
- [Long-running and background agents](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/long-running-agents.md) — detach and reattach, goals, heartbeats, and schedules
- [RLM programming model](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/rlm.md) — persistent IPython, subagents, skills, and the trust model
- [JSON mode](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/json.md) and [RPC mode](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/rpc.md) — headless automation and integrations
- [Skills](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/skills.md) — install and create reusable capabilities
- [Provider setup](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/providers.md) — subscription and API-key providers
- [Architecture overview](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/architecture.md) — daemon, worker, kernel, and persistence boundaries
- [Development](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/packages/coding-agent/docs/development.md) — build and run from source

## Contributing

Start with a GitHub Discussion for [general questions](https://github.com/PrimeIntellect-ai/prime-agent/discussions/categories/general), [bug reports](https://github.com/PrimeIntellect-ai/prime-agent/discussions/categories/bug-reports), and [feature requests](https://github.com/PrimeIntellect-ai/prime-agent/discussions/categories/feature-requests). Maintainers promote accepted work into Issues, and pull requests are reviewed from maintainers and vouched contributors.

Read the [contribution guidelines](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/CONTRIBUTING.md) for the full process. Report security vulnerabilities privately by following the [security policy](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/SECURITY.md).

## Acknowledgements

Our agent and TUI is built on top of [`pi`](https://github.com/earendil-works/pi). We thank the authors of `pi` for their valuable work.

## License

Prime Agent is fully open source and released under the [MIT License](https://github.com/CLIC-Ethiopia/prime-agent/blob/main/LICENSE).