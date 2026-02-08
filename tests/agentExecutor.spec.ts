import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AgentConnection, AgentNode, AgentTemplate } from '@/data/agentTemplates'
import { AgentExecutor, executeAgent } from '@/lib/agentExecutor'

// Mock the aiService
vi.mock('@/lib/aiService', () => ({
  aiService: {
    generateResponse: vi.fn().mockResolvedValue({
      content: 'Mock AI response',
      model: 'mock-model',
    }),
  },
}))

// Mock fetch for tool calls
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('AgentExecutor', () => {
  let mockWorkflow: {
    nodes: AgentNode[]
    connections: AgentConnection[]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ data: 'mock fetch result' }),
    })
  })

  describe('constructor', () => {
    it('should initialize with workflow nodes and connections', () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Test input' },
            label: 'Input',
          },
        ],
        connections: [],
      }

      const executor = new AgentExecutor(mockWorkflow)

      expect(executor).toBeInstanceOf(AgentExecutor)
    })
  })

  describe('execute', () => {
    it('should execute a simple input-output workflow', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Hello World' },
            label: 'Input',
          },
          {
            id: 'output1',
            type: 'output',
            position: { x: 100, y: 0 },
            config: {},
            label: 'Output',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'output1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('Hello World')
      expect(result['output1']).toBe('Hello World')
    })

    it('should execute LLM node', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Test prompt' },
            label: 'Input',
          },
          {
            id: 'llm1',
            type: 'llm',
            position: { x: 100, y: 0 },
            config: { model: 'gpt-4' },
            label: 'LLM',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'llm1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('Test prompt')
      expect(result['llm1']).toBe('Mock AI response')
    })

    it('should execute decision node', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Hello World' },
            label: 'Input',
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 100, y: 0 },
            config: { condition: 'world' },
            label: 'Decision',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'decision1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('Hello World')
      expect(result['decision1']).toBe(true) // 'Hello World' contains 'world'
    })

    it('should execute data-processor node', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: '  hello world  ' },
            label: 'Input',
          },
          {
            id: 'processor1',
            type: 'data-processor',
            position: { x: 100, y: 0 },
            config: { operation: 'trim' },
            label: 'Processor',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'processor1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('  hello world  ')
      expect(result['processor1']).toBe('hello world')
    })

    it('should execute tool node', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'test input' },
            label: 'Input',
          },
          {
            id: 'tool1',
            type: 'tool',
            position: { x: 100, y: 0 },
            config: { tool: 'fetch', url: 'https://api.example.com' },
            label: 'Tool',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'tool1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('test input')
      expect(result['tool1']).toEqual({ data: 'mock fetch result' })
      expect(fetchMock).toHaveBeenCalledWith('https://api.example.com')
    })

    it('should handle complex workflow with multiple nodes', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'HELLO' },
            label: 'Input',
          },
          {
            id: 'processor1',
            type: 'data-processor',
            position: { x: 100, y: 0 },
            config: { operation: 'lowercase' },
            label: 'Processor',
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 200, y: 0 },
            config: { condition: 'hello' },
            label: 'Decision',
          },
          {
            id: 'output1',
            type: 'output',
            position: { x: 300, y: 0 },
            config: {},
            label: 'Output',
          },
        ],
        connections: [
          { id: 'conn1', source: 'input1', target: 'processor1' },
          { id: 'conn2', source: 'processor1', target: 'decision1' },
          { id: 'conn3', source: 'decision1', target: 'output1' },
        ],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['input1']).toBe('HELLO')
      expect(result['processor1']).toBe('hello')
      expect(result['decision1']).toBe(true)
      expect(result['output1']).toBe(true)
    })

    it('should handle input data passed to execute', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'default' },
            label: 'Input',
          },
          {
            id: 'output1',
            type: 'output',
            position: { x: 100, y: 0 },
            config: {},
            label: 'Output',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'output1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute({ customInput: 'custom value' })

      expect(result['customInput']).toBe('custom value')
      expect(result['input1']).toBe('default')
      expect(result['output1']).toBe('default')
    })
  })

  describe('data processing operations', () => {
    it('should handle uppercase operation', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'hello' },
            label: 'Input',
          },
          {
            id: 'processor1',
            type: 'data-processor',
            position: { x: 100, y: 0 },
            config: { operation: 'uppercase' },
            label: 'Processor',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'processor1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['processor1']).toBe('HELLO')
    })

    it('should handle lowercase operation', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'HELLO' },
            label: 'Input',
          },
          {
            id: 'processor1',
            type: 'data-processor',
            position: { x: 100, y: 0 },
            config: { operation: 'lowercase' },
            label: 'Processor',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'processor1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['processor1']).toBe('hello')
    })

    it('should return input unchanged for unknown operations', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'test' },
            label: 'Input',
          },
          {
            id: 'processor1',
            type: 'data-processor',
            position: { x: 100, y: 0 },
            config: { operation: 'unknown' },
            label: 'Processor',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'processor1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['processor1']).toBe('test')
    })
  })

  describe('decision evaluation', () => {
    it('should return true when condition is met', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Hello World' },
            label: 'Input',
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 100, y: 0 },
            config: { condition: 'world' },
            label: 'Decision',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'decision1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['decision1']).toBe(true)
    })

    it('should return false when condition is not met', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'Hello World' },
            label: 'Input',
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 100, y: 0 },
            config: { condition: 'goodbye' },
            label: 'Decision',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'decision1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['decision1']).toBe(false)
    })

    it('should return false when no condition is provided', async () => {
      mockWorkflow = {
        nodes: [
          {
            id: 'input1',
            type: 'input',
            position: { x: 0, y: 0 },
            config: { prompt: 'test' },
            label: 'Input',
          },
          {
            id: 'decision1',
            type: 'decision',
            position: { x: 100, y: 0 },
            config: {},
            label: 'Decision',
          },
        ],
        connections: [{ id: 'conn1', source: 'input1', target: 'decision1' }],
      }

      const executor = new AgentExecutor(mockWorkflow)
      const result = await executor.execute()

      expect(result['decision1']).toBe(false)
    })
  })

  describe('executeAgent function', () => {
    it('should execute an agent template', async () => {
      const template: AgentTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'basic',
        difficulty: 'beginner',
        icon: 'icon',
        tags: [],
        estimatedTime: '5 min',
        workflow: {
          nodes: [
            {
              id: 'input1',
              type: 'input',
              position: { x: 0, y: 0 },
              config: { prompt: 'Test' },
              label: 'Input',
            },
            {
              id: 'output1',
              type: 'output',
              position: { x: 100, y: 0 },
              config: {},
              label: 'Output',
            },
          ],
          connections: [{ id: 'conn1', source: 'input1', target: 'output1' }],
        },
        features: [],
        useCases: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      const result = await executeAgent(template, { extra: 'data' })

      expect(result['input1']).toBe('Test')
      expect(result['output1']).toBe('Test')
      expect(result['extra']).toBe('data')
    })
  })
})
