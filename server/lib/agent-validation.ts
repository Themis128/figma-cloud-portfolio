// Zod validation schemas for agent API
import { z } from 'zod'

export const AgentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const AgentVersionSchema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  version: z.number(),
  config: z.record(z.string(), z.any()),
  createdAt: z.string().optional(),
})

export const AgentExecutionSchema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  status: z.string(),
  error: z.string().optional(),
  metrics: z.record(z.string(), z.any()).optional(),
})
