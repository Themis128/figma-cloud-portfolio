import Anthropic from '@anthropic-ai/sdk'
import type {
  AgentExecutionRequest,
  AgentExecutionResponse,
  ClaudeRequest,
  ClaudeResponse,
} from '@shared/api'
import type { RequestHandler } from 'express'

// Constants
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
})

/**
 * Execute Claude API call
 */
export const executeClaude: RequestHandler<
  Record<string, never>,
  ClaudeResponse,
  ClaudeRequest
> = async (req, res) => {
  try {
    const { model, max_tokens, messages, system, temperature, top_p, top_k, stop_sequences } =
      req.body

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages,
      system: system || '',
      temperature,
      top_p,
      top_k,
      stop_sequences: stop_sequences || [],
    })

    // Transform the response to match our ClaudeResponse type
    const transformedResponse: ClaudeResponse = {
      id: response.id,
      type: response.type,
      role: response.role,
      content: response.content.map((block) => ({
        type: block.type,
        text: block.type === 'text' ? block.text : '',
      })),
      model: response.model,
      stop_reason: response.stop_reason,
      stop_sequence: response.stop_sequence,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    }

    res.json(transformedResponse)
  } catch (error) {
    console.error('Claude API error:', error)
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      id: 'error',
      type: 'error',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'An error occurred while processing your request.',
        },
      ],
      model: req.body['model'],
      stop_reason: 'error',
      stop_sequence: null,
      usage: { input_tokens: 0, output_tokens: 0 },
    })
  }
}

/**
 * Execute AI Agent workflow
 */
export const executeAgent: RequestHandler<
  Record<string, never>,
  AgentExecutionResponse,
  AgentExecutionRequest
> = async (req, res) => {
  try {
    const {
      templateId,
      inputs,
      model = 'claude-3-haiku-20240307',
      provider = 'anthropic',
    } = req.body

    // For now, we'll implement a simple agent execution
    // In a full implementation, you'd load the template workflow and execute it step by step

    let response: string
    let usage: AgentExecutionResponse['usage']

    if (provider === 'anthropic') {
      const claudeResponse = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Execute agent template ${templateId} with inputs: ${JSON.stringify(inputs)}`,
          },
        ],
        system:
          'You are an AI agent executing a workflow. Provide a helpful response based on the template and inputs.',
        stop_sequences: [],
      })

      response =
        claudeResponse.content[0]?.type === 'text'
          ? claudeResponse.content[0].text
          : 'No response generated'
      usage = {
        inputTokens: claudeResponse.usage.input_tokens,
        outputTokens: claudeResponse.usage.output_tokens,
        totalTokens: claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens,
      }
    } else {
      // Fallback for other providers
      response = `Agent ${templateId} executed with inputs: ${JSON.stringify(inputs)}`
      usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    }

    res.json({
      success: true,
      output: response,
      usage,
    })
  } catch (error) {
    console.error('Agent execution error:', error)
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      output: '',
      error: 'Failed to execute agent',
    })
  }
}
