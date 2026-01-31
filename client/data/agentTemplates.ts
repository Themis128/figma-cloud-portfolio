export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: "basic" | "advanced" | "specialized";
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  tags: string[];
  estimatedTime: string;
  workflow: {
    nodes: AgentNode[];
    connections: AgentConnection[];
  };
  features: string[];
  useCases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentNode {
  id: string;
  type: "llm" | "decision" | "data-processor" | "output" | "input" | "tool";
  position: { x: number; y: number };
  config: Record<string, unknown> & {
    provider?: "anthropic" | "openai" | "together";
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
  label: string;
}

export interface AgentConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Random ID generation constants
const RANDOM_ID_RADIX = 36;
const RANDOM_ID_SKIP_PREFIX = 2;
const RANDOM_ID_LENGTH = 9;

export const agentTemplates: AgentTemplate[] = [
  {
    id: "basic-chatbot",
    name: "Basic Chatbot",
    description:
      "A simple conversational AI that can answer questions and engage in basic dialogue.",
    category: "basic",
    difficulty: "beginner",
    icon: "💬",
    tags: ["conversation", "qa", "basic"],
    estimatedTime: "5 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: { prompt: "Hello! How can I help you today?" },
          label: "User Input",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 300, y: 100 },
          config: {
            model: "claude-3-haiku-20240307",
            temperature: 0.7,
            maxTokens: 500,
            systemPrompt: "You are a helpful assistant.",
            provider: "anthropic",
          },
          label: "AI Response",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 500, y: 100 },
          config: {},
          label: "Response",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "llm-1" },
        { id: "conn-2", source: "llm-1", target: "output-1" },
      ],
    },
    features: ["Natural language processing", "Context awareness", "Customizable personality"],
    useCases: ["Customer support", "General assistance", "Information queries"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    description:
      "An AI agent specialized in creating high-quality written content for blogs, articles, and marketing materials.",
    category: "specialized",
    difficulty: "intermediate",
    icon: "✍️",
    tags: ["writing", "content", "marketing"],
    estimatedTime: "10 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: {
            prompt: "What type of content would you like me to create?",
          },
          label: "Content Request",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 300, y: 100 },
          config: {
            model: "gpt-4",
            temperature: 0.8,
            maxTokens: 2000,
            systemPrompt:
              "You are a professional content writer with expertise in SEO and engaging storytelling.",
          },
          label: "Content Generation",
        },
        {
          id: "decision-1",
          type: "decision",
          position: { x: 500, y: 50 },
          config: {
            conditions: [
              { field: "tone", operator: "equals", value: "formal" },
              { field: "tone", operator: "equals", value: "casual" },
            ],
          },
          label: "Style Check",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 700, y: 100 },
          config: {},
          label: "Final Content",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "llm-1" },
        { id: "conn-2", source: "llm-1", target: "decision-1" },
        { id: "conn-3", source: "decision-1", target: "output-1" },
      ],
    },
    features: [
      "SEO optimization",
      "Multiple writing styles",
      "Research integration",
      "Content proofreading",
    ],
    useCases: ["Blog posts", "Marketing copy", "Technical documentation", "Social media content"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "data-analyzer",
    name: "Data Analyzer",
    description:
      "An intelligent agent that can analyze datasets, generate insights, and create visualizations.",
    category: "advanced",
    difficulty: "advanced",
    icon: "📊",
    tags: ["data", "analysis", "visualization"],
    estimatedTime: "15 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: {
            prompt: "Upload your dataset or describe the data you want to analyze.",
          },
          label: "Data Input",
        },
        {
          id: "data-processor-1",
          type: "data-processor",
          position: { x: 300, y: 100 },
          config: {
            operations: ["clean", "normalize", "analyze"],
            outputFormat: "json",
          },
          label: "Data Processing",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 500, y: 100 },
          config: {
            model: "gpt-4",
            temperature: 0.3,
            maxTokens: 1000,
            systemPrompt:
              "You are a data analysis expert. Provide clear, actionable insights from the processed data.",
          },
          label: "Insight Generation",
        },
        {
          id: "tool-1",
          type: "tool",
          position: { x: 700, y: 100 },
          config: {
            tool: "chart-generator",
            chartType: "auto",
          },
          label: "Visualization",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 900, y: 100 },
          config: {},
          label: "Analysis Report",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "data-processor-1" },
        { id: "conn-2", source: "data-processor-1", target: "llm-1" },
        { id: "conn-3", source: "llm-1", target: "tool-1" },
        { id: "conn-4", source: "tool-1", target: "output-1" },
      ],
    },
    features: [
      "Automated data cleaning",
      "Statistical analysis",
      "Insight generation",
      "Interactive visualizations",
    ],
    useCases: [
      "Business intelligence",
      "Market research",
      "Performance analytics",
      "Scientific data analysis",
    ],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description:
      "A specialized AI agent for handling customer inquiries, troubleshooting, and providing support.",
    category: "specialized",
    difficulty: "intermediate",
    icon: "🎧",
    tags: ["support", "customer-service", "helpdesk"],
    estimatedTime: "12 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: { prompt: "How can I help you today?" },
          label: "Customer Query",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 300, y: 100 },
          config: {
            model: "gpt-4",
            temperature: 0.6,
            maxTokens: 800,
            systemPrompt:
              "You are a professional customer support agent. Be helpful, empathetic, and provide clear solutions.",
          },
          label: "Initial Response",
        },
        {
          id: "decision-1",
          type: "decision",
          position: { x: 500, y: 50 },
          config: {
            conditions: [
              { field: "complexity", operator: "equals", value: "simple" },
              { field: "complexity", operator: "equals", value: "complex" },
            ],
          },
          label: "Issue Assessment",
        },
        {
          id: "tool-1",
          type: "tool",
          position: { x: 500, y: 150 },
          config: {
            tool: "knowledge-base",
            searchQuery: "auto",
          },
          label: "Knowledge Search",
        },
        {
          id: "llm-2",
          type: "llm",
          position: { x: 700, y: 100 },
          config: {
            model: "gpt-4",
            temperature: 0.4,
            maxTokens: 600,
            systemPrompt: "Provide detailed troubleshooting steps and escalate if needed.",
          },
          label: "Detailed Solution",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 900, y: 100 },
          config: {},
          label: "Support Response",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "llm-1" },
        { id: "conn-2", source: "llm-1", target: "decision-1" },
        {
          id: "conn-3",
          source: "decision-1",
          target: "tool-1",
          sourceHandle: "complex",
        },
        {
          id: "conn-4",
          source: "decision-1",
          target: "output-1",
          sourceHandle: "simple",
        },
        { id: "conn-5", source: "tool-1", target: "llm-2" },
        { id: "conn-6", source: "llm-2", target: "output-1" },
      ],
    },
    features: [
      "Multi-language support",
      "Knowledge base integration",
      "Escalation workflows",
      "Satisfaction tracking",
    ],
    useCases: ["Technical support", "Product inquiries", "Troubleshooting", "Order assistance"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "An AI agent that reviews code for bugs, security issues, and best practices.",
    category: "specialized",
    difficulty: "advanced",
    icon: "🔍",
    tags: ["code", "review", "security", "quality"],
    estimatedTime: "20 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: { prompt: "Paste your code for review or upload a file." },
          label: "Code Input",
        },
        {
          id: "data-processor-1",
          type: "data-processor",
          position: { x: 300, y: 100 },
          config: {
            operations: ["parse", "analyze-syntax", "extract-functions"],
            language: "auto-detect",
          },
          label: "Code Analysis",
        },
        {
          id: "tool-1",
          type: "tool",
          position: { x: 500, y: 50 },
          config: {
            tool: "security-scanner",
            rules: ["owasp-top-10", "sast-rules"],
          },
          label: "Security Scan",
        },
        {
          id: "tool-2",
          type: "tool",
          position: { x: 500, y: 150 },
          config: {
            tool: "quality-checker",
            standards: ["pep8", "eslint", "sonar"],
          },
          label: "Quality Check",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 700, y: 100 },
          config: {
            model: "gpt-4",
            temperature: 0.2,
            maxTokens: 1500,
            systemPrompt:
              "You are an expert code reviewer. Provide constructive feedback, identify issues, and suggest improvements.",
          },
          label: "Review Generation",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 900, y: 100 },
          config: {},
          label: "Review Report",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "data-processor-1" },
        { id: "conn-2", source: "data-processor-1", target: "tool-1" },
        { id: "conn-3", source: "data-processor-1", target: "tool-2" },
        { id: "conn-4", source: "tool-1", target: "llm-1" },
        { id: "conn-5", source: "tool-2", target: "llm-1" },
        { id: "conn-6", source: "llm-1", target: "output-1" },
      ],
    },
    features: [
      "Multi-language support",
      "Security vulnerability detection",
      "Code quality analysis",
      "Performance recommendations",
    ],
    useCases: [
      "Pull request reviews",
      "Security audits",
      "Code quality checks",
      "Technical debt assessment",
    ],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
];

// Claude-powered agent templates
export const claudeAgentTemplates: AgentTemplate[] = [
  {
    id: "claude-chatbot",
    name: "Claude Chatbot",
    description:
      "A conversational AI powered by Anthropic's Claude, offering more natural and nuanced responses.",
    category: "basic",
    difficulty: "beginner",
    icon: "🤖",
    tags: ["conversation", "claude", "anthropic", "ai"],
    estimatedTime: "5 minutes",
    workflow: {
      nodes: [
        {
          id: "input-1",
          type: "input",
          position: { x: 100, y: 100 },
          config: { prompt: "Hello! How can I help you today?" },
          label: "User Input",
        },
        {
          id: "llm-1",
          type: "llm",
          position: { x: 300, y: 100 },
          config: {
            provider: "anthropic",
            model: "claude-3-haiku-20240307",
            temperature: 0.7,
            maxTokens: 500,
            systemPrompt: "You are Claude, a helpful and harmless AI assistant built by Anthropic.",
          },
          label: "Claude Response",
        },
        {
          id: "output-1",
          type: "output",
          position: { x: 500, y: 100 },
          config: {},
          label: "Response",
        },
      ],
      connections: [
        { id: "conn-1", source: "input-1", target: "llm-1" },
        { id: "conn-2", source: "llm-1", target: "output-1" },
      ],
    },
    features: [
      "Natural language processing",
      "Context awareness",
      "Constitutional AI",
      "Helpful responses",
    ],
    useCases: ["Customer support", "General assistance", "Information queries", "Creative writing"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
];

export const getTemplatesByCategory = (category: AgentTemplate["category"]) => {
  return agentTemplates.filter((template) => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: AgentTemplate["difficulty"]) => {
  return agentTemplates.filter((template) => template.difficulty === difficulty);
};

export const getTemplateById = (id: string) => {
  return agentTemplates.find((template) => template.id === id);
};

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return agentTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
};

export const cloneTemplate = (template: AgentTemplate, newName?: string): AgentTemplate => {
  const clonedTemplate: AgentTemplate = {
    ...template,
    id: `${template.id}-clone-${Date.now()}`,
    name: newName ?? `${template.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workflow: {
      nodes: template.workflow.nodes.map((node) => ({
        ...node,
        id: `${node.id}-clone-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substr(RANDOM_ID_SKIP_PREFIX, RANDOM_ID_LENGTH)}`,
      })),
      connections: template.workflow.connections.map((connection) => ({
        ...connection,
        id: `${connection.id}-clone-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substr(RANDOM_ID_SKIP_PREFIX, RANDOM_ID_LENGTH)}`,
        source: template.workflow.nodes.find((node) => node.id === connection.source)
          ? `${connection.source}-clone-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substr(RANDOM_ID_SKIP_PREFIX, RANDOM_ID_LENGTH)}`
          : connection.source,
        target: template.workflow.nodes.find((node) => node.id === connection.target)
          ? `${connection.target}-clone-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substr(RANDOM_ID_SKIP_PREFIX, RANDOM_ID_LENGTH)}`
          : connection.target,
      })),
    },
  };

  return clonedTemplate;
};
