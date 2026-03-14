# AI Agents Educational Guide

## Overview

The `/agents` page is an **educational guide** that teaches visitors how AI agents work — from LLM fundamentals to multi-agent architectures. It combines static educational content (Server Component) with an interactive agent builder (Client Component) for hands-on learning.

## Page Architecture

| Section | Type | Purpose |
| --- | --- | --- |
| Educational content | **Server Component** | Static sections covering concepts, terminology, patterns |
| `AgentPlayground` | **Client Component** | Interactive builder with templates, workflow visualization |

### File Structure

```
src/
  app/agents/page.tsx              # Server Component — educational content + metadata
  components/agents/
    AgentPlayground.tsx             # Client Component — interactive template builder
```

## Educational Sections

### 1. What Is an AI Agent?

Explains the difference between a chatbot (stateless Q&A) and an AI agent (autonomous, tool-using system). Lists core agent capabilities:
- Break complex tasks into steps
- Call external tools and APIs
- Maintain memory and context
- Self-correct and iterate

### 2. The Agentic Loop

Four-phase cycle that all AI agents follow:

| Phase | Description |
| --- | --- |
| **Observe** | Receive input or observe environment state |
| **Think** | LLM reasons about next action using goal, tools, and context |
| **Act** | Execute chosen action — call tool, generate response, update memory |
| **Evaluate** | Check result; loop back to Observe if goal not met |

### 3. Core Components

Four building blocks of any AI agent:

- **LLM (The Brain)** — Foundation model that processes language and generates responses
- **Tools & APIs** — External services the agent can invoke (search, databases, code execution)
- **Memory & Retrieval** — Short-term conversation history + long-term knowledge via RAG
- **Planning & Reasoning** — Chain-of-thought, ReAct, task decomposition strategies

### 4. Architecture Patterns

Three progressively complex patterns with difficulty levels, pros/cons, and data flow diagrams:

| Pattern | Difficulty | Description |
| --- | --- | --- |
| **Single Agent** | Beginner | One LLM + tools in an agentic loop |
| **Router Agent** | Intermediate | Orchestrator routes tasks to specialized sub-agents |
| **Multi-Agent Collaboration** | Advanced | Peer agents with shared memory and negotiation |

### 5. Key Terminology

Six key terms with abbreviations and full names:

| Term | Full Name | Description |
| --- | --- | --- |
| **RAG** | Retrieval-Augmented Generation | Ground LLM in external knowledge |
| **ReAct** | Reasoning + Acting | Interleave reasoning steps with tool actions |
| **Tool Use** | Function Calling | LLM outputs structured calls to external tools |
| **MCP** | Model Context Protocol | Standard protocol for connecting LLMs to tools |
| **Guardrails** | Safety & Validation | Input/output filtering, rate limiting, content policies |
| **Agentic Loop** | Observe → Think → Act → Repeat | Core execution cycle of autonomous agents |

### 6. Use Cases in Network Engineering

Four practical applications relevant to the portfolio owner's domain:

- **Security Monitoring Agent** — SIEM analysis, Fortinet/Splunk integration
- **Network Troubleshooting Agent** — Cisco IOS diagnostics, SNMP monitoring
- **Infrastructure Automation Agent** — Ansible/Terraform, DevNet, compliance checking
- **Documentation Agent** — Auto-generate network diagrams, change logs, runbooks

## Interactive Agent Builder

The `AgentPlayground` Client Component provides hands-on learning:

### Features

- **Template browser** — Predefined agent templates (chatbot, code reviewer, data analyzer, etc.)
- **Category filtering** — Filter templates by category (All, Basic, Advanced, Specialized)
- **Template search** — Search templates by name or description
- **Workflow builder** — SVG-based visual workflow with draggable nodes and connections
- **Agent configuration** — Form to edit name, description, category
- **Test & simulate** — Run agent in test mode with simulated responses
- **Save & export** — Save agent configurations, export as JSON

### Template System

Templates include:
- Basic Chatbot, Code Reviewer, Data Analyzer, Content Writer, Task Automator
- Each template has predefined workflow nodes and connections
- Templates can be cloned and customized

## Testing

See [TESTING.md](./TESTING.md) for complete test coverage:

- `playwright-tests/agents.spec.ts` — 18 tests (educational content + builder + accessibility)
- `playwright-tests/agent-builder.spec.ts` — 13 tests (interactive builder functionality)
- `playwright-tests/ai-agents.spec.ts` — 3 tests (basic page load verification)

## Metadata

```typescript
title: "Understanding AI Agents - Educational Guide"
description: "Learn how AI agents work — from LLM fundamentals to multi-agent architectures."
keywords: ["AI Agents", "LLM", "RAG", "Multi-Agent", "MCP", "Agentic Loop"]
type: "article"
```
