#!/usr/bin/env node

/**
 * Playwright Test Runner with Automatic Dashboard Opening
 *
 * This script runs Playwright tests and automatically opens the visual progress dashboard
 * when tests start, providing real-time monitoring of test execution.
 */

import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const DASHBOARD_URL =
  'file:///D:/Nuxt%20Projects/new-portfolio/playwright-tests/visual-progress.html'
const PROJECT_ROOT = path.resolve(__dirname, '..')
const DASHBOARD_PATH = path.join(PROJECT_ROOT, 'playwright-tests', 'visual-progress.html')

/**
 * Cross-platform browser opening function
 */
function openBrowser(url) {
  let command

  if (process.platform === 'win32') {
    command = `start "" "${url}"`
  } else if (process.platform === 'darwin') {
    command = `open "${url}"`
  } else {
    command = `xdg-open "${url}"`
  }

  try {
    execSync(command, { stdio: 'ignore' })
    console.log('✅ Visual Progress Dashboard opened successfully')
    return true
  } catch (error) {
    console.log('⚠️  Could not open dashboard automatically:', error.message)
    console.log('📋 Dashboard URL:', url)
    return false
  }
}

/**
 * Check if dashboard file exists
 */
function checkDashboardExists() {
  if (!fs.existsSync(DASHBOARD_PATH)) {
    console.log('⚠️  Visual Progress Dashboard not found at:', DASHBOARD_PATH)
    console.log(`📋 Manual dashboard URL: ${DASHBOARD_URL}`)
    return false
  }
  return true
}

/**
 * Run Playwright tests with dashboard monitoring
 */
function runPlaywrightTests() {
  console.log('🚀 Starting Playwright tests with Visual Progress Dashboard...\n')

  // Check if dashboard exists
  const dashboardExists = checkDashboardExists()

  if (dashboardExists) {
    console.log('📊 Opening Visual Progress Dashboard...')
    const dashboardOpened = openBrowser(DASHBOARD_URL)

    if (!dashboardOpened) {
      console.log('⚠️  Dashboard opening failed, but tests will continue')
    }
  } else {
    console.log('⚠️  Dashboard not found, but tests will continue')
  }

  console.log('\n🧪 Starting Playwright test execution...\n')

  // Change to project directory
  process.chdir(PROJECT_ROOT)

  // Run Playwright tests
  const testProcess = spawn('npx', ['playwright', 'test'], {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT,
  })

  // Handle test process exit
  testProcess.on('close', (code) => {
    console.log('\n🏁 Playwright tests completed')
    console.log(`📊 Test results available at: ${PROJECT_ROOT}/playwright-report/index.html`)

    if (code === 0) {
      console.log('✅ All tests passed!')
    } else {
      console.log('❌ Some tests failed. Check the report for details.')
    }

    process.exit(code)
  })

  // Handle test process errors
  testProcess.on('error', (error) => {
    console.error('❌ Error running Playwright tests:', error)
    process.exit(1)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating tests...')
    testProcess.kill('SIGINT')
  })
}

/**
 * Run Playwright tests in watch mode with dashboard
 */
function runPlaywrightWatch() {
  console.log('🚀 Starting Playwright tests in watch mode with Visual Progress Dashboard...\n')

  // Check if dashboard exists
  const dashboardExists = checkDashboardExists()

  if (dashboardExists) {
    console.log('📊 Opening Visual Progress Dashboard...')
    const dashboardOpened = openBrowser(DASHBOARD_URL)

    if (!dashboardOpened) {
      console.log('⚠️  Dashboard opening failed, but tests will continue')
    }
  } else {
    console.log('⚠️  Dashboard not found, but tests will continue')
  }

  console.log('\n🧪 Starting Playwright test execution in watch mode...\n')

  // Change to project directory
  process.chdir(PROJECT_ROOT)

  // Run Playwright tests in watch mode
  const testProcess = spawn('npx', ['playwright', 'test', '--watch'], {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT,
  })

  // Handle test process exit
  testProcess.on('close', (code) => {
    console.log('\n🏁 Playwright watch mode terminated')
    process.exit(code)
  })

  // Handle test process errors
  testProcess.on('error', (error) => {
    console.error('❌ Error running Playwright tests:', error)
    process.exit(1)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating tests...')
    testProcess.kill('SIGINT')
  })
}

/**
 * Run specific test file with dashboard
 */
function runSpecificTest(testFile) {
  console.log(`🚀 Running specific test file: ${testFile} with Visual Progress Dashboard...\n`)

  // Check if dashboard exists
  const dashboardExists = checkDashboardExists()

  if (dashboardExists) {
    console.log('📊 Opening Visual Progress Dashboard...')
    const dashboardOpened = openBrowser(DASHBOARD_URL)

    if (!dashboardOpened) {
      console.log('⚠️  Dashboard opening failed, but tests will continue')
    }
  } else {
    console.log('⚠️  Dashboard not found, but tests will continue')
  }

  console.log('\n🧪 Starting Playwright test execution...\n')

  // Change to project directory
  process.chdir(PROJECT_ROOT)

  // Run specific test file
  const testProcess = spawn('npx', ['playwright', 'test', testFile], {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT,
  })

  // Handle test process exit
  testProcess.on('close', (code) => {
    console.log('\n🏁 Playwright tests completed')
    console.log(`📊 Test results available at: ${PROJECT_ROOT}/playwright-report/index.html`)

    if (code === 0) {
      console.log('✅ Test passed!')
    } else {
      console.log('❌ Test failed. Check the report for details.')
    }

    process.exit(code)
  })

  // Handle test process errors
  testProcess.on('error', (error) => {
    console.error('❌ Error running Playwright tests:', error)
    process.exit(1)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating tests...')
    testProcess.kill('SIGINT')
  })
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🎯 Playwright Test Runner with Visual Progress Dashboard

Usage: node run-playwright-with-dashboard.js [command] [options]

Commands:
  run              Run all Playwright tests (default)
  watch            Run Playwright tests in watch mode
  test <file>      Run specific test file
  help             Show this help message

Examples:
  node run-playwright-with-dashboard.js
  node run-playwright-with-dashboard.js watch
  node run-playwright-with-dashboard.js test playwright-tests/api.spec.ts
  node run-playwright-with-dashboard.js help

Features:
  📊 Automatically opens Visual Progress Dashboard
  🚀 Real-time test execution monitoring
  📈 Live progress updates and statistics
  🎯 Comprehensive test reporting

Dashboard URL: ${DASHBOARD_URL}
  `)
}

// Main execution
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'watch':
      runPlaywrightWatch()
      break

    case 'test': {
      const testFile = args[1]
      if (!testFile) {
        console.error('❌ Please specify a test file')
        console.log('Usage: node run-playwright-with-dashboard.js test <file>')
        process.exit(1)
      }
      runSpecificTest(testFile)
      break
    }

    case 'help':
      showHelp()
      break

    case undefined:
    case 'run':
      runPlaywrightTests()
      break

    default:
      console.error('❌ Unknown command:', command)
      showHelp()
      process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  runPlaywrightTests,
  runPlaywrightWatch,
  runSpecificTest,
  openBrowser,
  checkDashboardExists,
}
