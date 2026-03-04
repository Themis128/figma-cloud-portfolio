import { NextResponse } from 'next/server'

// Stable UUID identifying this workspace to Chrome DevTools
const WORKSPACE_UUID = 'b8e4a2f1-3c7d-4e9a-8b5f-2d6a1e0c9f4e'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({})
  }

  return NextResponse.json({
    workspace: {
      root: process.cwd(),
      uuid: WORKSPACE_UUID,
    },
  })
}
