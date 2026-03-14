import {
  Bot,
  Brain,
  CircuitBoard,
  Cpu,
  GitBranch,
  Layers,
  MessageSquare,
  Network,
  Search,
  Shield,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverCard } from "@/components/HoverAnimations";
import Navigation from "@/components/Navigation";
import AgentPlayground from "@/components/agents/AgentPlayground";

export const metadata: Metadata = {
  title: "Understanding AI Agents",
  description:
    "Learn how AI agents work — from LLM fundamentals to multi-agent architectures. Interactive guide with visual workflow builder.",
};

const coreComponents = [
  {
    icon: Brain,
    title: "LLM (The Brain)",
    description:
      "Large Language Models like GPT-4, Claude, or Llama form the reasoning core. They process natural language, understand context, and generate responses based on learned patterns from vast training data.",
    detail: "Handles reasoning, planning, and language understanding",
  },
  {
    icon: Wrench,
    title: "Tools & APIs",
    description:
      "Agents extend their capabilities by calling external tools — web search, code execution, database queries, or any API. This bridges the gap between language understanding and real-world action.",
    detail: "Web search, code execution, API calls, file I/O",
  },
  {
    icon: Search,
    title: "Memory & Retrieval",
    description:
      "Short-term memory (conversation context) and long-term memory (vector databases, RAG) let agents recall past interactions and access domain-specific knowledge beyond their training data.",
    detail: "Context window, vector DBs, RAG pipelines",
  },
  {
    icon: Target,
    title: "Planning & Reasoning",
    description:
      "Advanced agents break complex tasks into subtasks, evaluate multiple approaches, and self-correct. Techniques like chain-of-thought, ReAct, and tree-of-thought enable structured problem solving.",
    detail: "Chain-of-thought, ReAct, task decomposition",
  },
];

const architecturePatterns = [
  {
    title: "Single Agent",
    difficulty: "Beginner",
    description:
      "One LLM with tools handles the entire task. Simple to build, good for focused use cases like customer support or content generation.",
    flow: ["Input", "LLM + Tools", "Output"],
    pros: ["Simple to implement", "Low latency", "Easy to debug"],
    cons: ["Limited specialization", "Context window constraints"],
  },
  {
    title: "Router Agent",
    difficulty: "Intermediate",
    description:
      "A supervisor agent classifies incoming requests and routes them to specialized sub-agents. Each sub-agent is optimized for its domain.",
    flow: ["Input", "Router", "Agent A / Agent B / Agent C", "Output"],
    pros: ["Domain specialization", "Modular design", "Scalable"],
    cons: ["Routing errors compound", "Higher complexity"],
  },
  {
    title: "Multi-Agent Collaboration",
    difficulty: "Advanced",
    description:
      "Multiple agents with distinct roles collaborate on complex tasks — debating, reviewing, and refining each other's work. Used in research, code review, and content pipelines.",
    flow: ["Input", "Planner", "Executor + Reviewer", "Consensus", "Output"],
    pros: ["Higher quality output", "Self-correction", "Handles complexity"],
    cons: ["Token-expensive", "Harder to orchestrate"],
  },
];

const networkUseCases = [
  {
    icon: Shield,
    title: "Security Monitoring Agent",
    description:
      "Monitors SIEM alerts, correlates events across firewalls and IDS/IPS, and generates incident reports. Can triage alerts by severity and suggest remediation steps.",
    tags: ["Fortinet", "SIEM", "Incident Response"],
  },
  {
    icon: Network,
    title: "Network Troubleshooting Agent",
    description:
      "Analyzes network topology, runs diagnostic commands (ping, traceroute, show interfaces), and identifies root causes of connectivity issues across Cisco infrastructure.",
    tags: ["Cisco", "Diagnostics", "SNMP"],
  },
  {
    icon: Cpu,
    title: "Infrastructure Automation Agent",
    description:
      "Automates routine tasks — VLAN provisioning, ACL updates, firmware upgrades, and configuration backups. Validates changes against policies before applying.",
    tags: ["Ansible", "Python", "DevNet"],
  },
  {
    icon: Layers,
    title: "Documentation Agent",
    description:
      "Crawls network configs, generates topology diagrams, and maintains up-to-date documentation. Detects config drift and alerts on undocumented changes.",
    tags: ["Compliance", "CMDB", "Change Management"],
  },
];

const keyTerms = [
  {
    term: "RAG",
    full: "Retrieval-Augmented Generation",
    definition:
      "Enhances LLM responses by retrieving relevant documents from a knowledge base before generating answers. Reduces hallucination and keeps answers grounded in real data.",
  },
  {
    term: "ReAct",
    full: "Reasoning + Acting",
    definition:
      "A prompting pattern where the agent alternates between thinking (reasoning about what to do) and acting (calling tools). Each observation informs the next reasoning step.",
  },
  {
    term: "Tool Use",
    full: "Function Calling",
    definition:
      "The ability for an LLM to generate structured function calls that execute code, query APIs, or interact with external systems. The results are fed back to the LLM for further reasoning.",
  },
  {
    term: "MCP",
    full: "Model Context Protocol",
    definition:
      "An open standard by Anthropic for connecting AI agents to external data sources and tools. Provides a universal interface for tool discovery and execution.",
  },
  {
    term: "Guardrails",
    full: "Safety & Validation Layer",
    definition:
      "Input/output filters that prevent harmful, off-topic, or incorrect agent behavior. Includes content moderation, output validation, and scope constraints.",
  },
  {
    term: "Agentic Loop",
    full: "Observe → Think → Act → Repeat",
    definition:
      "The core execution cycle of an agent: observe the current state, reason about what to do next, take an action, and repeat until the goal is achieved or a stop condition is met.",
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 mb-16 md:mb-24">
            <AnimatedSection delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                Understanding AI Agents
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-cyan-400 text-lg sm:text-xl font-semibold tracking-wide">
                From Language Models to Autonomous Systems
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                AI agents go beyond simple chatbots — they observe, reason, act,
                and learn. This guide explains how they work, the architectures
                behind them, and how they apply to network engineering and IT
                operations.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          <div className="max-w-6xl mx-auto space-y-20">
            {/* What is an AI Agent? */}
            <AnimatedSection delay={0.1}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Bot className="w-8 h-8 text-cyan-400" />
                  What Is an AI Agent?
                </h2>
                <div className="text-foreground/80 space-y-4 leading-relaxed">
                  <p>
                    An <strong className="text-cyan-400">AI agent</strong> is a
                    software system that uses a Large Language Model (LLM) as its
                    reasoning engine to autonomously pursue goals. Unlike a
                    simple chatbot that responds to one prompt at a time, an
                    agent can:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                    {[
                      "Break complex tasks into steps",
                      "Call external tools and APIs",
                      "Remember context across interactions",
                      "Self-correct when errors occur",
                      "Make decisions based on observations",
                      "Operate with minimal human intervention",
                    ].map((capability) => (
                      <div
                        key={capability}
                        className="flex items-center gap-3 p-3 rounded-lg bg-foreground/5"
                      >
                        <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>
                  <p>
                    Think of it as the difference between a calculator (chatbot)
                    and a mathematician (agent). The calculator answers what you
                    ask; the mathematician understands the problem, plans an
                    approach, uses the right tools, and verifies the answer.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* The Agentic Loop */}
            <AnimatedSection delay={0.15}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <CircuitBoard className="w-8 h-8 text-cyan-400" />
                  The Agentic Loop
                </h2>
                <p className="text-foreground/80 mb-8 leading-relaxed">
                  Every AI agent follows a fundamental cycle. Understanding this
                  loop is key to understanding how agents operate:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      step: "1",
                      title: "Observe",
                      desc: "Receive input or observe the current state of the environment. This could be a user message, an API response, or sensor data.",
                      color: "from-green-500 to-emerald-600",
                    },
                    {
                      step: "2",
                      title: "Think",
                      desc: "The LLM reasons about what to do next. It considers the goal, available tools, past actions, and current observations.",
                      color: "from-blue-500 to-cyan-600",
                    },
                    {
                      step: "3",
                      title: "Act",
                      desc: "Execute the chosen action — call a tool, generate a response, update memory, or delegate to another agent.",
                      color: "from-purple-500 to-violet-600",
                    },
                    {
                      step: "4",
                      title: "Evaluate",
                      desc: "Check the result. If the goal is met, return the output. If not, loop back to Observe with the new state.",
                      color: "from-amber-500 to-orange-600",
                    },
                  ].map((phase) => (
                    <div
                      key={phase.step}
                      className="relative bg-foreground/5 rounded-xl p-5 border border-border hover:border-cyan-400/30 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-linear-to-br ${phase.color} flex items-center justify-center text-white font-bold text-lg mb-3`}
                      >
                        {phase.step}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {phase.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {phase.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                  <p className="text-sm text-foreground/70">
                    <Sparkles className="w-4 h-4 text-cyan-400 inline mr-2" />
                    <strong className="text-cyan-400">Key insight:</strong> The
                    power of agents comes from this loop being{" "}
                    <em>autonomous</em>. The agent decides when to stop, what
                    tools to use, and how to handle errors — without human
                    intervention at each step.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Core Components */}
            <AnimatedSection delay={0.2}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-cyan-400" />
                Core Components
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreComponents.map((component) => (
                  <HoverCard key={component.title}>
                    <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-cyan-400/30 transition-all duration-300 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                          <component.icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {component.title}
                          </h3>
                          <span className="text-cyan-400/60 text-xs font-mono">
                            {component.detail}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {component.description}
                      </p>
                    </div>
                  </HoverCard>
                ))}
              </div>
            </AnimatedSection>

            {/* Architecture Patterns */}
            <AnimatedSection delay={0.25}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-cyan-400" />
                Architecture Patterns
              </h2>
              <div className="space-y-6">
                {architecturePatterns.map((pattern) => (
                  <div
                    key={pattern.title}
                    className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border hover:border-cyan-400/20 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-foreground">
                            {pattern.title}
                          </h3>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              pattern.difficulty === "Beginner"
                                ? "text-green-400 border-green-400/30 bg-green-400/10"
                                : pattern.difficulty === "Intermediate"
                                  ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                                  : "text-red-400 border-red-400/30 bg-red-400/10"
                            }`}
                          >
                            {pattern.difficulty}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {pattern.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-mono text-green-400/70 uppercase tracking-wider mb-2">
                              Advantages
                            </h4>
                            <ul className="space-y-1">
                              {pattern.pros.map((pro) => (
                                <li
                                  key={pro}
                                  className="text-xs text-foreground/60 flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-mono text-red-400/70 uppercase tracking-wider mb-2">
                              Trade-offs
                            </h4>
                            <ul className="space-y-1">
                              {pattern.cons.map((con) => (
                                <li
                                  key={con}
                                  className="text-xs text-foreground/60 flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* Flow Diagram */}
                      <div className="md:w-64 shrink-0">
                        <h4 className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider mb-3">
                          Data Flow
                        </h4>
                        <div className="flex flex-col items-center gap-2">
                          {pattern.flow.map((step, i) => (
                            <div key={step} className="w-full">
                              <div className="bg-foreground/10 border border-border rounded-lg px-4 py-2 text-center text-sm font-mono text-foreground/80">
                                {step}
                              </div>
                              {i < pattern.flow.length - 1 && (
                                <div className="flex justify-center py-1">
                                  <div className="w-px h-4 bg-cyan-400/30" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Key Terminology */}
            <AnimatedSection delay={0.3}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
                Key Terminology
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyTerms.map((item) => (
                  <div
                    key={item.term}
                    className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-border hover:border-cyan-400/20 transition-colors"
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-cyan-400 font-bold font-mono text-lg">
                        {item.term}
                      </span>
                    </div>
                    <p className="text-foreground/50 text-[11px] font-mono mb-3">
                      {item.full}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Use Cases in Network Engineering */}
            <AnimatedSection delay={0.35}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Network className="w-8 h-8 text-cyan-400" />
                Use Cases in Network Engineering
              </h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-3xl">
                AI agents are transforming network operations. Here are
                practical applications relevant to enterprise infrastructure and
                security:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {networkUseCases.map((useCase) => (
                  <HoverCard key={useCase.title}>
                    <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-cyan-400/30 transition-all duration-300 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                          <useCase.icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                          {useCase.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {useCase.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {useCase.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 rounded text-[10px] text-cyan-400/80 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </HoverCard>
                ))}
              </div>
            </AnimatedSection>

            {/* Interactive Builder */}
            <AnimatedSection delay={0.4}>
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                    Interactive Agent Builder
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                    Put theory into practice. Browse pre-built agent templates,
                    explore their workflow graphs, or create your own from
                    scratch. Each template demonstrates a different architecture
                    pattern.
                  </p>
                </div>
                <AgentPlayground />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}
