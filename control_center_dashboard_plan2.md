
# Control Center Dashboard Plan for Prime-Agent

This document outlines the architecture and design for a web-based control center dashboard to manage Prime-Agent workflows in the context of an LLM-powered wiki knowledge base.

## 1. Overview
The dashboard will serve as a centralized interface to:
- Monitor agents and sub-agents
- Manage workflows
- Visualize data flow
- Configure prompts and skills
- Inspect the wiki knowledge base

## 2. Core Components

### 2.1 Frontend
Tech stack suggestion:
- React + TypeScript for UI components
- Tailwind CSS for styling
- Socket.IO client for real-time updates

### 2.2 Backend
Tech stack suggestion:
- FastAPI (Python) for REST API
- Redis for pub/sub messaging
- PostgreSQL for metadata storage
- File watcher module for wiki changes

### 2.3 Integration Layer
- Python script wrapping Prime-Agent CLI commands
- WebSocket bridge between backend and frontend

## 3. UI Sections

### 3.1 Dashboard Home
- Live status summary (agents, workflows, wiki stats)
- Recent activity log
- Quick action buttons

### 3.2 Agent Manager
- List of active agents with statuses
- Details view for each agent
- Start/Stop/Pause controls
- Sub-agent hierarchy visualization

### 3.3 Workflow Designer
- Visual workflow builder (drag-and-drop)
- Step configuration panel
- Execution history and logs
- Trigger/scheduling options

### 3.4 Wiki Knowledge Base Explorer
- File tree navigation
- Search and filter capabilities
- Inline markdown viewer/editor
- Metadata inspection

### 3.5 Prompt & Skill Manager
- Prompt library with version control
- Skill repository browser
- Test environment for prompts/skills

### 3.6 Monitoring & Logs
- Real-time log streams
- Data flow visualization
- Performance metrics
- Error alerts

## 4. Data Models

### 4.1 Agent Model
id, name, status, type, created_at, last_heartbeat, config

### 4.2 Workflow Model
id, name, steps, triggers, status, execution_history

### 4.3 WikiEntry Model
file_path, content_hash, metadata, last_indexed

## 5. Workflow
1. User configures agent/workflow via dashboard
2. Backend translates config to Prime-Agent commands
3. Commands executed via CLI wrapper
4. Output streamed back to frontend
5. Changes persisted in PostgreSQL
6. Wiki updates indexed automatically

## 6. Security Considerations
- JWT authentication
- Role-based access control
- Input validation/sanitization
- Secure WebSocket connections
