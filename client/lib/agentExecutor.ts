import type { AgentConnection, AgentNode, AgentTemplate } from '@/data/agentTemplates'

// Simple agent execution engine
export class AgentExecutor {
  private nodes: AgentNode[]
  private connections: AgentConnection[]
  private context: Record<string, unknown> = {}

  constructor(workflow: {
    nodes: AgentNode[]
    connections: AgentConnection[]
  }) {
    this.nodes = workflow.nodes
    this.connections = workflow.connections
  }

  async execute(input?: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Initialize context with input
    this.context = { ...input }

    // Find input nodes
    const inputNodes = this.nodes.filter((node) => node.type === 'input')

    // Execute input nodes
    for (const node of inputNodes) {
      await this.executeNode(node)
    }

    // Continue execution based on connections
    await this.executeWorkflow()

    // Return final context
    return this.context
  }

  private async executeNode(node: AgentNode): Promise<void> {
    switch (node.type) {
      case 'input':
        // Input nodes set initial data
        this.context[node.id] = node.config.prompt || ''
        break

      case 'llm': {
        // Simulate LLM call (in real implementation, call actual AI API)
        const prompt = this.getConnectedInput(node.id)
        this.context[node.id] = await this.callLLM(prompt, node.config)
        break
      }

      case 'decision': {
        // Evaluate conditions
        const inputValue = this.getConnectedInput(node.id)
        this.context[node.id] = this.evaluateDecision(inputValue, node.config)
        break
      }

      case 'data-processor': {
        // Process data
        const dataInput = this.getConnectedInput(node.id)
        this.context[node.id] = this.processData(dataInput, node.config)
        break
      }

      case 'tool': {
        // Call tool
        const toolInput = this.getConnectedInput(node.id)
        this.context[node.id] = await this.callTool(toolInput, node.config)
        break
      }

      case 'output': {
        // Output nodes collect results
        const outputValue = this.getConnectedInput(node.id)
        this.context[node.id] = outputValue
        break
      }

      default:
        // Unknown node type - do nothing
        break
    }
  }

  private async executeWorkflow(): Promise<void> {
    // Simple execution: process nodes in topological order
    const processed = new Set<string>()
    const queue = this.nodes.filter((node) => node.type === 'input')

    while (queue.length > 0) {
      const node = queue.shift()
      if (!node || processed.has(node.id)) continue

      await this.executeNode(node)
      processed.add(node.id)

      // Add connected nodes to queue
      const connectedNodes = this.getConnectedNodes(node.id)
      for (const connectedNode of connectedNodes) {
        if (!processed.has(connectedNode.id)) {
          queue.push(connectedNode)
        }
      }
    }
  }

  private getConnectedInput(nodeId: string): unknown {
    // Find incoming connections
    const incomingConnections = this.connections.filter((conn) => conn.target === nodeId)

    // Get value from source nodes
    for (const conn of incomingConnections) {
      if (this.context[conn.source] !== undefined) {
        return this.context[conn.source]
      }
    }

    return null
  }

  private getConnectedNodes(nodeId: string): AgentNode[] {
    const outgoingConnections = this.connections.filter((conn) => conn.source === nodeId)
    return outgoingConnections
      .map((conn) => this.nodes.find((node) => node.id === conn.target))
      .filter((node): node is AgentNode => node !== undefined)
  }

  private async callLLM(prompt: unknown, config: Record<string, unknown>): Promise<string> {
    const { aiService } = await import('./aiService')
    const model = (config.model as string) || undefined
    const response = await aiService.generateResponse(String(prompt), model)
    return response.content
  }

  private evaluateDecision(input: unknown, config: Record<string, unknown>): boolean {
    const condition = config.condition as string
    if (!condition) return false

    // Simple condition evaluation
    const inputStr = String(input).toLowerCase()
    return inputStr.includes(condition.toLowerCase())
  }

  private processData(input: unknown, config: Record<string, unknown>): unknown {
    const operation = config.operation as string

    if (operation === 'uppercase' && typeof input === 'string') {
      return input.toUpperCase()
    }
    if (operation === 'lowercase' && typeof input === 'string') {
      return input.toLowerCase()
    }
    if (operation === 'trim' && typeof input === 'string') {
      return input.trim()
    }

    return input
  }

  private async callTool(input: unknown, config: Record<string, unknown>): Promise<unknown> {
    const toolName = config.tool as string

    // Call actual tools based on configuration
    if (toolName === 'fetch') {
      const url = config.url as string
      const response = await fetch(url)
      return response.json()
    }

    return `Tool ${toolName} executed with: ${input}`
  }
}

// Execute an agent template
export function executeAgent(
  template: AgentTemplate,
  input?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const executor = new AgentExecutor(template.workflow)
  return executor.execute(input)
}
