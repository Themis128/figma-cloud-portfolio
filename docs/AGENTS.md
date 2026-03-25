# AI Agents Educational Guide

## Overview

The `/agents` page is an **educational guide** that teaches visitors how AI agents work, from LLM fundamentals to multi-agent architectures. It combines static educational content (Server Component) with an interactive agent builder (Client Component) for hands-on learning.

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
| **Act** | Execute chosen action: call tool, generate response, update memory |
| **Evaluate** | Check result; loop back to Observe if goal not met |

### 3. Core Components

Four building blocks of any AI agent:

- **LLM (The Brain)**: Foundation model that processes language and generates responses
- **Tools & APIs**: External services the agent can invoke (search, databases, code execution)
- **Memory & Retrieval**: Short-term conversation history + long-term knowledge via RAG
- **Planning & Reasoning**: Chain-of-thought, ReAct, task decomposition strategies

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

- **Security Monitoring Agent**: SIEM analysis, Fortinet/Splunk integration
- **Network Troubleshooting Agent**: Cisco IOS diagnostics, SNMP monitoring
- **Infrastructure Automation Agent**: Ansible/Terraform, DevNet, compliance checking
- **Documentation Agent**: Auto-generate network diagrams, change logs, runbooks

## Interactive Agent Builder

The `/agents` page includes two interactive builders:

### AgentPlayground (Template Builder)

The `AgentPlayground` Client Component provides hands-on learning:

- **Template browser**: Predefined agent templates (chatbot, code reviewer, data analyzer, etc.)
- **Category filtering**: Filter templates by category (All, Basic, Advanced, Specialized)
- **Template search**: Search templates by name or description
- **Workflow builder**: SVG-based visual workflow with draggable nodes and connections
- **Agent configuration**: Form to edit name, description, category
- **Test & simulate**: Run agent in test mode with simulated responses
- **Save & export**: Save agent configurations, export as JSON

#### Template System

Templates include:
- Basic Chatbot, Code Reviewer, Data Analyzer, Content Writer, Task Automator
- Each template has predefined workflow nodes and connections
- Templates can be cloned and customized

### Blockly Agent Builder (Visual Drag-and-Drop)

The `BlocklyAgentBuilder` Client Component provides a visual drag-and-drop programming interface powered by Google Blockly, designed for kids and beginners to learn AI agent concepts.

#### Components

| Component | Purpose |
| --- | --- |
| `BlocklyAgentBuilder.tsx` | Main component: Blockly workspace, custom blocks, code generation, runtime |
| `BlocklyAgentBuilderWrapper.tsx` | Lazy-loading wrapper with `dynamic()` import |

#### Custom Blocks

10 custom agent blocks in a cyberpunk-themed palette:

| Block | Type | Purpose |
| --- | --- | --- |
| `agent_loop` | Statement | Repeating observation loop with configurable max iterations (1 to 20) |
| `agent_scan` | Statement | Scan a data source (inbox, network, room, logs) |
| `agent_see` | Value | Observe environment. Returns `[code, order]` tuple |
| `agent_listen` | Value | Listen for input. Returns `[code, order]` tuple |
| `agent_decide` | Statement | If-then-otherwise decision based on a condition value |
| `agent_remember` | Statement | Store information in memory |
| `agent_say` | Statement | Speak or output a message |
| `agent_do` | Statement | Perform an action (email, restart, adjust, deploy) |
| `agent_use_tool` | Statement | Use a tool (API, database, search, calculator) |
| `agent_check` | Statement | Verify result with yes/no branches |

#### Prebuilt Agent Templates (6)

Each template is an XML workspace with blocks nested inside loops via `<next>` chains:

1. **My First Agent**: Basic observe → think → act cycle
2. **Email Assistant**: Inbox scanning → message detection → draft/send reply
3. **Security Monitor**: Network scanning → threat detection → blocking → escalation
4. **Smart Home**: Room scanning → temperature/motion detection → adjustments
5. **DevOps Agent**: Log scanning → error detection → restart → rollback
6. **Custom Agent**: Empty workspace for free-form building

#### AgentRuntime

A simulated execution engine that walks the Blockly block tree:

- Processes blocks sequentially following `nextConnection` links
- Handles nested statement blocks (loop body, decide if/otherwise branches, check yes/no)
- Decision triggers use regex pattern matching to detect meaningful observations vs. "no data" responses
- Supports cancellation via `AbortController`
- **Step-by-step mode**: pause after each action, advance with "Next Step" button
- Produces timestamped execution logs displayed in a cyberpunk-styled console

#### Code Generation

- Uses Blockly's Python generator to produce readable Python pseudocode
- Value blocks (`agent_see`, `agent_listen`) return `[code, order]` tuples per Blockly convention
- Statement blocks return code strings
- Generated code displayed with **syntax highlighting** (keywords, strings, agent methods, comments)
- **Copy to clipboard** and **export workspace as XML** buttons in code panel

#### UI Features

- **Block counter**: live count of blocks in workspace
- **Step-by-step execution**: toggle step mode, then advance one action at a time
- **Responsive workspace**: height scales with viewport (`clamp(280px, 50vh, 420px)`)
- **Accessibility**: ARIA labels, roles (`listbox`, `option`, `log`), `aria-live` for output, `aria-pressed` for toggles

## Testing

See [TESTING.md](./TESTING.md) for complete test coverage:

- `playwright-tests/agents.spec.ts`: 18 tests (educational content + builder + accessibility)
- `playwright-tests/agent-builder.spec.ts`: 108 tests (Blockly builder + template loading + code generation + runtime)
- `playwright-tests/ai-agents.spec.ts`: 3 tests (basic page load verification)

## Metadata

```typescript
title: "Understanding AI Agents - Educational Guide"
description: "Learn how AI agents work — from LLM fundamentals to multi-agent architectures."
keywords: ["AI Agents", "LLM", "RAG", "Multi-Agent", "MCP", "Agentic Loop"]
type: "article"
```
