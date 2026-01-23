import { type ChildProcess, spawn } from 'node:child_process'

// Global server process references for cleanup
export let serverProcess: ChildProcess | null = null
export let frontendProcess: ChildProcess | null = null

/**
 * Start the backend server
 */
export async function startBackendServer(): Promise<void> {
  console.log('🔧 Starting backend server...')
  serverProcess = spawn('npx', ['tsx', 'server/dev-server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd(),
    detached: false,
  })

  // Wait for backend to start
  await new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => {
      reject(new Error('Backend server failed to start within 30 seconds'))
    }, 30000)

    const checkOutput = (data: Buffer) => {
      output += data.toString()
      if (
        output.includes('Baltzakis Themistoklis API server running on port') ||
        output.includes('listening on port')
      ) {
        clearTimeout(timeout)
        resolve(true)
      }
    }

    if (serverProcess) {
      serverProcess.stdout?.on('data', checkOutput)
      serverProcess.stderr?.on('data', checkOutput)

      serverProcess.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    } else {
      reject(new Error('Failed to start server process'))
    }
  })

  console.log('✅ Backend server started')
}

/**
 * Start the frontend server
 */
export async function startFrontendServer(): Promise<void> {
  console.log('🌐 Starting frontend server...')
  frontendProcess = spawn('pnpm', ['dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd(),
    detached: false,
  })

  // Wait for frontend to start
  await new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => {
      reject(new Error('Frontend server failed to start within 30 seconds'))
    }, 30000)

    const checkOutput = (data: Buffer) => {
      output += data.toString()
      if (
        output.includes('ready in') ||
        output.includes('Local:') ||
        output.includes('http://localhost:8081')
      ) {
        clearTimeout(timeout)
        resolve(true)
      }
    }

    if (frontendProcess) {
      frontendProcess.stdout?.on('data', checkOutput)
      frontendProcess.stderr?.on('data', checkOutput)

      frontendProcess.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    } else {
      reject(new Error('Failed to start frontend process'))
    }
  })

  console.log('✅ Frontend server started')
}

/**
 * Stop all servers
 */
export async function stopServers(): Promise<void> {
  console.log('🛑 Stopping servers...')

  if (serverProcess) {
    serverProcess.kill('SIGTERM')
    console.log('✅ Backend server stopped')
  }

  if (frontendProcess) {
    frontendProcess.kill('SIGTERM')
    console.log('✅ Frontend server stopped')
  }

  // Wait a bit for processes to terminate
  await new Promise((resolve) => setTimeout(resolve, 2000))

  serverProcess = null
  frontendProcess = null
}
