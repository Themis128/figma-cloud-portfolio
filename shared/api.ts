/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string
}

/**
 * Contact form submission request
 */
export interface ContactFormRequest {
  name: string
  email: string
  subject: string
  message: string
  recaptchaToken: string
}

/**
 * Contact form submission response
 */
export interface ContactFormResponse {
  success: boolean
  message: string
}

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  event: string
  data?: Record<string, unknown>
  timestamp: string
  url: string
  userAgent: string
  // Optional identifiers to support server-side Measurement Protocol forwarding
  clientId?: string
  userId?: string
  eventId?: string
  // Optional array for performance metrics / web-vitals payloads
  metrics?: Array<Record<string, unknown>>
}

/**
 * Analytics response
 */
export interface AnalyticsResponse {
  success: boolean
  message?: string
}

/**
 * Resume data structure for PDF generation
 */
export interface ResumeData {
  name: string
  title: string
  contact: {
    email?: string
    linkedin?: string
    website?: string
  }
  summary: string
  competencies: Record<string, string[]>
  experience: Array<{
    title: string
    company: string
    date: string
    achievements: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    date: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: string
  }>
}

/**
 * Link preview data structures
 */
export interface OpenGraphData {
  title?: string | null
  description?: string | null
  image?: string | null
  url?: string | null
  type?: string | null
  siteName?: string | null
}

export interface TwitterCardData {
  card?: string | null
  title?: string | null
  description?: string | null
  image?: string | null
  site?: string | null
  creator?: string | null
}

export interface LinkPreviewData {
  url: string
  title: string
  description: string
  image: string | null
  favicon: string | null
  siteName: string
  type: string
  openGraph: OpenGraphData | null
  twitter: TwitterCardData | null
  lastFetched: string
  error: string | null
}

/**
 * AI Agent API types
 */
export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeRequest {
  model:
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
    | 'claude-3-5-sonnet-20240620'
  max_tokens: number
  messages: ClaudeMessage[]
  system?: string
  temperature?: number
  top_p?: number
  top_k?: number
  stop_sequences?: string[]
}

export interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string | null
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export interface AgentExecutionRequest {
  templateId: string
  inputs: Record<string, unknown>
  model?:
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
    | 'claude-3-5-sonnet-20240620'
    | 'gpt-4'
    | 'gpt-3.5-turbo'
  provider?: 'anthropic' | 'openai' | 'together'
}

export interface AgentExecutionResponse {
  success: boolean
  output: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  error?: string
}

// Agent types for Amplify integration
export interface Agent {
  id?: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface AgentVersion {
  id?: string
  agentId: string
  version: number
  config: Record<string, unknown>
  createdAt?: string
}

export interface AgentExecution {
  id?: string
  agentId: string
  startedAt?: string
  endedAt?: string
  status: string
  error?: string
  metrics?: Record<string, unknown>
}

// API request/response types
export interface SaveAgentRequest {
  agent: Agent
}
export interface SaveAgentResponse {
  success: boolean
  agent?: Agent
  message?: string
}

export interface ListAgentsResponse {
  success: boolean
  agents: Agent[]
  message?: string
}
