import { chromium, FullConfig } from '@playwright/test'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Global setup for Playwright tests
 * Prepares the test environment and ensures all dependencies are ready
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...')

  try {
    // Verify development servers are running
    console.log('📡 Checking development servers...')

    // Check if frontend server is accessible
    const frontendResponse = await fetch('http://localhost:8081')
    if (!frontendResponse.ok) {
      throw new Error('Frontend server not accessible')
    }
    console.log('✅ Frontend server ready')

    // Check if backend API is accessible
    const backendResponse = await fetch('http://localhost:3000/api/ping')
    if (!backendResponse.ok) {
      throw new Error('Backend API server not accessible')
    }
    console.log('✅ Backend API server ready')

    // Pre-warm the application by loading the main page
    console.log('🔥 Pre-warming application...')
    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle' })
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
    } catch (error) {
      // Ignore cleanup errors
    }

    console.log('🎯 Global setup completed successfully')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup