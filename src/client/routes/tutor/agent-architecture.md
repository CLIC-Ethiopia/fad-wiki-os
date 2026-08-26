# Fad Tutor Agent Architecture

This document outlines the architectural decisions for the Fad Tutor agent, focusing on personalization, knowledge retrieval, and tool execution.

## 1. Knowledge Retrieval: Hybrid RAG (GraphRAG + Vector Embeddings)

To provide speed and deep context-aware performance using the `steam-ie-vault`, the most effective architecture is a **Hybrid Retrieval-Augmented Generation (RAG)** approach. 

### Why not just one?
- **Vector Embeddings (Vector RAG):** Excellent for *speed* and *direct lookup*. If a user asks "What is Design Thinking?", vector search instantly finds the exact paragraph in the vault. However, it struggles to connect disparate concepts (e.g., "How does Design Thinking relate to the Mathematics module?").
- **Knowledge Graph (GraphRAG):** Excellent for *context-awareness* and *relational intelligence*. It understands that Concept A is a prerequisite for Concept B. It is slower due to complex multi-hop traversals but provides deep reasoning.

### The Hybrid Solution
1. **Primary Retrieval (Speed):** Use Vector Embeddings to quickly fetch the most semantically relevant markdown files from `steam-ie-vault/wiki`. 
2. **Contextual Enrichment (Awareness):** Use the existing wiki Knowledge Graph data (nodes and edges) to fetch immediate neighbors (connections) of the retrieved concepts. 
3. **Agent Prompt:** Feed both the raw content (from embeddings) and the relationship metadata (from the graph) to the LLM. 

## 2. Tech Stack for Tool Calling: JavaScript/TypeScript vs Python

**Recommendation: JavaScript (Node.js / TypeScript)**

Since the Fad Wiki OS is built on a modern JS stack (React, Vite, Node.js), integrating the agent using **TypeScript** is highly recommended for consistent performance and maintainability.

### Advantages of JavaScript/TypeScript in this context:
1. **Unified Codebase:** Both the client and the agent tools live in the same ecosystem. You can share types (e.g., `WikiStats`, `GraphData`, `UserSettings`) across the stack without translation layers.
2. **Performance:** Node.js handles asynchronous I/O (like reading from the file system or calling the Gemini API) extremely well. It will prevent blocking the main thread when executing tool calls.
3. **Ecosystem:** Tools like the *Vercel AI SDK* or *LangChain.js* integrate seamlessly with your existing Node server architecture, making streaming responses to the frontend trivial.

*Note on Python:* Python is typically favored when building complex data pipelines, training local models, or using heavy data-science libraries (pandas/numpy). For an AI tutor that is primarily reading markdown files, querying an API, and executing simple web-based tools, Python introduces unnecessary microservice complexity.

## 3. Personalization Engine

The tutor must act differently based on the user's settings (Industry, Interests, Learning Goal, Difficulty).

**Implementation:**
Every time a message is sent to the backend, the client must attach the current `settings` state from the `useTutorStore`. The backend will dynamically inject these settings into the agent's **System Prompt** (see `agent-skill-definition.md`) before running the LLM generation. 
