// AWS Amplify DataStore/DynamoDB integration for agent CRUD
// This is a stub for backend route refactoring

import { Amplify, DataStore } from 'aws-amplify'
import { Agent, AgentVersion, AgentExecution } from '@/amplify/models'

// Example: Save agent
export async function saveAgentToDB(agent: Partial<Agent>) {
  // Use DataStore.save or DynamoDB SDK
  return await DataStore.save(new Agent({ ...agent }))
}

// Example: List agents
export async function listAgentsFromDB() {
  return await DataStore.query(Agent)
}

// Example: Update agent
export async function updateAgentInDB(agentId: string, updates: Partial<Agent>) {
  const original = await DataStore.query(Agent, agentId)
  if (!original) throw new Error('Agent not found')
  return await DataStore.save(
    Agent.copyOf(original, (updated) => {
      Object.assign(updated, updates)
    })
  )
}

// Example: Delete agent
export async function deleteAgentFromDB(agentId: string) {
  const original = await DataStore.query(Agent, agentId)
  if (!original) throw new Error('Agent not found')
  return await DataStore.delete(original)
}
