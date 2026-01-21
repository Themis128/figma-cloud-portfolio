import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { chromium, type FullConfig } from '@playwright/test'

const execAsync = promisify(exec)

// Global server process reference for cleanup
let serverProcess: ReturnType<typeof spawn> | null = null

/**
 * Global setup for Playwright tests
 * Prepares the test environment and ensures all dependencies are ready
 */
async function globalSetup(_config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...')

  try {
    // Verify development servers are running
    console.log('📡 Checking development servers...')

    // Health check function with retries
    async function checkServer(url: string, name: string, maxRetries = 5): Promise<boolean> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔍 Checking ${name} (attempt ${attempt}/${maxRetries})...`)
          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
            headers: { 'Cache-Control': 'no-cache' }
          })

          if (response.ok) {
            console.log(`✅ ${name} ready`)
            return true
          } else {
            console.log(`⚠️  ${name} returned status ${response.status}`)
          }
        } catch (error) {
          console.log(`❌ ${name} check failed (attempt ${attempt}):`, error.message)
          if (attempt < maxRetries) {
            console.log(`⏳ Waiting 2 seconds before retry...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
      return false
    }

    // Check production frontend server with retries
    const frontendReady = await checkServer('http://127.0.0.1:8083', 'Production Frontend server')
    if (!frontendReady) {
      console.log('⚠️  Production server not ready, trying development server...')
      const devFrontendReady = await checkServer('http://localhost:8081', 'Development Frontend server')
      if (!devFrontendReady) {
        throw new Error('Both production and development frontend servers failed health check')
      }
    }

    // Check backend API with retries (optional)
    const backendReady = await checkServer('http://localhost:3000/api/ping', 'Backend API server')
    if (!backendReady) {
      console.log('⚠️  Backend API server not accessible - tests may have limited functionality')
    }

    // Pre-warm the application by loading the main page
    console.log('🔥 Pre-warming application...')
    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      await page.goto('http://127.0.0.1:8083', { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000) // Allow time for service worker registration

      // Verify critical elements are present
      const title = await page.title()
      if (!title) {
        throw new Error('Application failed to load properly')
      }

      console.log('✅ Application pre-warmed successfully')
    } finally {
      await browser.close()
    }

    // Clean up any existing test artifacts
    console.log('🧹 Cleaning up previous test artifacts...')
    try {
      await execAsync('rm -rf test-results/playwright-report')
      await execAsync('mkdir -p test-results')
    } catch (_error) {
      // Ignore cleanup errors
    }

    console.log('🎯 Global setup completed successfully')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup