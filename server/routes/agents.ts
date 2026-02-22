import type { RequestHandler } from 'express'
import { logger } from '../logger'
import { saveAgentToDB, listAgentsFromDB } from '../lib/amplify'
import { AgentSchema } from '../lib/agent-validation'

export const saveAgent: RequestHandler = async (req, res) => {
  try {
    const agent = req.body
    const parseResult = AgentSchema.safeParse(agent)
    if (!parseResult.success) {
      logger.warn('[Agent] Validation failed:', JSON.stringify(parseResult.error))
      res
        .status(400)
        .json({ success: false, message: 'Invalid agent data', errors: parseResult.error.errors })
      return;
    }
    const saved = await saveAgentToDB(parseResult.data)
    logger.info('[Agent]', `[Saved: ${parseResult.data.name} (${saved.id})]`)
    res.json({ success: true, agent: saved })
    return;
  } catch (error) {
    logger.error('[Agent] Save error:', String(error))
    res.status(500).json({ success: false, message: 'Internal error' })
    return;
  }
}

export const getAgents: RequestHandler = async (_req, res) => {
  try {
    const agents = await listAgentsFromDB()
    logger.info('[Agent]', `[Listing ${agents.length} agents]`)
    res.json({ success: true, agents })
  } catch (error) {
    logger.error('[Agent] List error:', String(error))
    res.status(500).json({ success: false, message: 'Internal error' })
  }
}
