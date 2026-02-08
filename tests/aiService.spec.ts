import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AIService, aiService } from '@/lib/aiService'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('AIService', () => {
  let service: AIService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables for each test
    delete (import.meta as any).env
    ;(import.meta as any).env = {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with Ollama provider by default', () => {
      ;(import.meta as any).env.VITE_AI_PROVIDER = 'ollama'
      service = new AIService()

      expect(service.getCurrentProvider()).toBe('ollama')
      expect(service.getAvailableModels()).toEqual([
        'llama2',
        'codellama',
        'mistral',
        'llama2:13b',
        'codellama:13b',
      ])
    })

    it('should initialize with OpenAI provider when configured', () => {
      ;(import.meta as any).env.VITE_AI_PROVIDER = 'openai'
      ;(import.meta as any).env.VITE_OPENAI_API_KEY = 'test_key'
      service = new AIService()

      expect(service.getCurrentProvider()).toBe('openai')
      expect(service.getAvailableModels()).toEqual(['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4'])
    })

    it('should return "none" provider when API key is missing for OpenAI', () => {
      ;(import.meta as any).env.VITE_AI_PROVIDER = 'openai'
      service = new AIService()

      expect(service.getCurrentProvider()).toBe('none')
    })
  })

  describe('generateResponse', () => {
    beforeEach(() => {
      ;(import.meta as any).env.VITE_AI_PROVIDER = 'ollama'
      service = new AIService()
    })

    it('should return fallback response when provider is not configured', async () => {
      // Create service without proper provider
      const fallbackService = new AIService()
      ;(fallbackService as any).provider = null

      const response = await fallbackService.generateResponse('Hello')

      expect(response.content).toContain('happy to help')
      expect(response.model).toBe('fallback')
    })

    it('should handle Ollama API responses', async () => {
      const mockResponse = {
        response: 'Test response from Ollama',
        model: 'llama2',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await service.generateResponse('Test message')

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test message'),
      })

      expect(response.content).toBe('Test response from Ollama')
      expect(response.model).toBe('llama2')
    })

    it('should handle OpenAI API responses', async () => {
      // Create a service instance with OpenAI provider
      const openaiService = new AIService()
      // Mock the provider to be OpenAI for this test
      ;(openaiService as any).provider = {
        name: 'openai',
        apiKey: 'test_key',
        baseURL: 'https://api.openai.com/v1',
        models: ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4'],
      }

      const mockResponse = {
        choices: [{ message: { content: 'Test response from OpenAI' } }],
        model: 'gpt-4',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await openaiService.generateResponse('Test message')

      expect(fetchMock).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_key',
        },
        body: expect.stringContaining('Test message'),
      })

      expect(response.content).toBe('Test response from OpenAI')
      expect(response.model).toBe('gpt-4')
      expect(response.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      })
    })

    it('should handle API errors gracefully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const response = await service.generateResponse('Test message')

      expect(response.content).toContain("I'd be happy to help")
      expect(response.model).toBe('fallback')
    })

    it('should handle network errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const response = await service.generateResponse('Test message')

      expect(response.content).toContain("I'd be happy to help")
      expect(response.model).toBe('fallback')
    })
  })

  describe('getFallbackResponse', () => {
    beforeEach(() => {
      service = new AIService()
    })

    it('should provide relevant responses for React queries', async () => {
      const response = await service.generateResponse('Tell me about React')
      expect(response.content).toContain('React development')
    })

    it('should provide relevant responses for Azure queries', async () => {
      const response = await service.generateResponse('What about Azure?')
      expect(response.content).toContain('Azure')
    })

    it('should provide relevant responses for security queries', async () => {
      const response = await service.generateResponse('Cybersecurity experience?')
      expect(response.content).toContain('cybersecurity')
    })

    it('should provide general response for unknown queries', async () => {
      const response = await service.generateResponse('Random question')
      expect(response.content).toContain('happy to help')
    })
  })

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(aiService).toBeInstanceOf(AIService)
      expect(aiService.getCurrentProvider()).toBeDefined()
    })
  })
})
