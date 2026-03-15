# AI Agents Page

The portfolio features a comprehensive AI Agents educational page at /agents/ that teaches visitors about AI agent concepts, architecture patterns, and practical applications.

## Educational Content

### What Is an AI Agent?
The page explains AI agents as autonomous systems with 6 core capabilities: Perceive, Reason, Plan, Execute, Learn, and Communicate.

### The Agentic Loop
Interactive visualization of the core agent cycle: Observe → Think → Act → Evaluate — with explanations of each phase.

### Core Components
1. **LLM (The Brain)** — The language model powering reasoning and decisions
2. **Tools & APIs** — External capabilities the agent can invoke
3. **Memory & Retrieval** — Context storage and RAG (Retrieval-Augmented Generation)
4. **Planning & Reasoning** — Strategy formulation and step-by-step execution

### Architecture Patterns
1. **Single Agent** (Beginner) — One LLM handling all tasks
2. **Router Agent** (Intermediate) — Dispatcher routing to specialized sub-agents
3. **Multi-Agent Collaboration** (Advanced) — Team of agents working together

### Key Terminology
- **RAG** — Retrieval-Augmented Generation: grounding answers in external knowledge
- **ReAct** — Reasoning + Acting: interleaving thought and action steps
- **Tool Use** — Function Calling: letting the LLM invoke external tools
- **MCP** — Model Context Protocol: standardized tool/resource integration
- **Guardrails** — Safety & Validation Layer: input/output filtering
- **Agentic Loop** — Observe → Think → Act → Repeat

## Network Engineering Use Cases
The page showcases 4 practical use cases relevant to Themis's expertise:
1. **Security Monitoring Agent** — SIEM integration, Fortinet, automated incident response
2. **Network Troubleshooting Agent** — Cisco diagnostics, SNMP monitoring, automated triage
3. **Infrastructure Automation Agent** — Ansible, Python, DevNet-powered provisioning
4. **Documentation Agent** — Compliance tracking, CMDB updates, change management

## Agent Templates (5 pre-built)
1. **Basic Chatbot** (Beginner) — Conversational AI template
2. **Content Writer** (Intermediate) — Blog/article generation with customizable tone
3. **Data Analyzer** (Advanced) — Dataset analysis and visualizations
4. **Customer Support Agent** (Intermediate) — Inquiry handling and troubleshooting
5. **Code Reviewer** (Advanced) — Bug detection, security checks, best practices

Each template includes complete workflow configurations with nodes, connections, LLM configs, features, and use cases. Templates can be browsed, searched, filtered by category, and cloned.

## Blockly Agent Builder
An interactive drag-and-drop visual agent builder powered by Google Blockly, designed for kids and beginners. Users can visually compose agent workflows by snapping together blocks representing:
- Agent setup (name, description)
- Tools and API connections
- Logic and decision blocks
- Output formatting

The builder generates Python code from the visual blocks and is designed as an educational tool to make AI agent concepts accessible to younger audiences.
