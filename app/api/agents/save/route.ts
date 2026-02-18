import { NextResponse } from 'next/server'

// In-memory storage for agents (in production, use a database)
const agents: Array<{
  id: string
  name: string
  template: string
  createdAt: string
  updatedAt: string
}> = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: body.name || 'Untitled Agent',
      template: body.template || 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    agents.push(newAgent)
    
    return NextResponse.json({ 
      success: true, 
      agent: newAgent 
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving agent:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save agent' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    agents 
  })
}
