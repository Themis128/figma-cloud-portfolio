#!/usr/bin/env node

/**
 * Context7 MCP Server Runner
 * Runs the Upstash Context7 MCP server for documentation improvement
 */

import { spawn } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Function to run the Context7 MCP server
async function runContext7MCPServer() {
  console.log('🚀 Starting Context7 MCP server...')

  try {
    // Run the Context7 MCP server with HTTP transport on port 3003
    const server = spawn(
      'node',
      [
        path.join(__dirname, '../node_modules/@upstash/context7-mcp/dist/index.js'),
        '--transport',
        'http',
        '--port',
        '3003',
      ],
      {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
      },
    )

    server.on('error', (error) => {
      console.error('❌ Error starting Context7 MCP server:', error)
      process.exit(1)
    })

    server.on('exit', (code) => {
      console.log(`\n🚪 Context7 MCP server exited with code ${code}`)
      process.exit(code)
    })

    // Handle SIGINT (Ctrl+C) to clean up properly
    process.on('SIGINT', () => {
      console.log('\n⏹️  Stopping Context7 MCP server...')
      server.kill()
    })
  } catch (error) {
    console.error('❌ Failed to start Context7 MCP server:', error)
    process.exit(1)
  }
}

// If running directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  runContext7MCPServer()
}

export { runContext7MCPServer }
