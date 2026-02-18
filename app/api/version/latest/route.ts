import { NextResponse } from 'next/server'

// Current app version - in production this would come from package.json
const APP_VERSION = '1.0.0'

export async function GET() {
  try {
    return NextResponse.json({
      version: APP_VERSION,
      latest: APP_VERSION,
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error checking version:', error)
    return NextResponse.json({ 
      error: 'Failed to check version' 
    }, { status: 500 })
  }
}
