import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import type { FullConfig } from '@playwright/test'
import { stopServers } from './test-environment'

const execAsync = promisify(exec)

/**
 * Global teardown for Playwright tests
 * Cleans up test environment and generates reports
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Starting Playwright global teardown...')

  try {
    // Stop all servers using the shared environment
    await stopServers()

    // Generate test summary report
    console.log('📊 Generating test summary...')
    await generateTestSummary()

    // Archive test artifacts if there were failures
    console.log('📦 Archiving test artifacts...')
    await archiveFailedTestArtifacts()

    // Clean up temporary files
    console.log('🗑️  Cleaning up temporary files...')
    await cleanupTempFiles()

    // Optional: Send notifications for test results
    await sendTestNotifications()

    console.log('✅ Global teardown completed successfully')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Generate a comprehensive test summary
 */
async function generateTestSummary() {
  try {
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json')

    if (await fileExists(resultsPath)) {
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'))

      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.expected || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        passRate: results.stats?.expected
          ? ((results.stats.passed / results.stats.expected) * 100).toFixed(2)
          : '0.00',
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      }

      const summaryPath = path.join(process.cwd(), 'test-results', 'test-summary.json')
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))

      console.log(
        `📈 Test Summary: ${summary.passed}/${summary.totalTests} passed (${summary.passRate}%)`,
      )
    }
  } catch (_error) {
    console.warn('⚠️  Failed to generate test summary:', _error.message)
  }
}

/**
 * Archive screenshots, videos, and traces for failed tests
 */
async function archiveFailedTestArtifacts() {
  try {
    const testResultsDir = path.join(process.cwd(), 'test-results')
    const archiveDir = path.join(testResultsDir, 'failed-tests-archive')

    // Check if there are any failed test artifacts
    const hasFailures = await checkForFailedTests(testResultsDir)

    if (hasFailures) {
      await fs.mkdir(archiveDir, { recursive: true })

      // Archive screenshots
      const screenshots = await findFiles(testResultsDir, '-screenshot.png')
      for (const screenshot of screenshots) {
        await moveFile(screenshot, path.join(archiveDir, path.basename(screenshot)))
      }

      // Archive videos
      const videos = await findFiles(testResultsDir, '-video.webm')
      for (const video of videos) {
        await moveFile(video, path.join(archiveDir, path.basename(video)))
      }

      // Archive traces
      const traces = await findFiles(testResultsDir, '-trace.zip')
      for (const trace of traces) {
        await moveFile(trace, path.join(archiveDir, path.basename(trace)))
      }

      console.log(
        `📁 Archived ${screenshots.length + videos.length + traces.length} failed test artifacts`,
      )
    }
  } catch (error) {
    console.warn('⚠️  Failed to archive test artifacts:', error.message)
  }
}

/**
 * Clean up temporary test files
 */
async function cleanupTempFiles() {
  try {
    // Clean up old test reports (keep last 5)
    const reportsDir = path.join(process.cwd(), 'playwright-report')
    if (await fileExists(reportsDir)) {
      const entries = await fs.readdir(reportsDir, { withFileTypes: true })
      const reportDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
          name: entry.name,
          path: path.join(reportsDir, entry.name),
          mtime: 0,
        }))

      // Get modification times
      for (const report of reportDirs) {
        try {
          const stats = await fs.stat(report.path)
          report.mtime = stats.mtime.getTime()
        } catch (_error) {
          // Ignore stat errors
        }
      }

      // Sort by modification time (newest first) and keep only last 5
      reportDirs.sort((a, b) => b.mtime - a.mtime)
      const toDelete = reportDirs.slice(5)

      for (const report of toDelete) {
        try {
          await execAsync(`rm -rf "${report.path}"`)
        } catch (_error) {
          // Ignore deletion errors
        }
      }

      if (toDelete.length > 0) {
        console.log(`🗑️  Cleaned up ${toDelete.length} old test reports`)
      }
    }
  } catch (error) {
    console.warn('⚠️  Failed to cleanup temporary files:', error.message)
  }
}

/**
 * Send notifications about test results (placeholder for CI/CD integration)
 */
async function sendTestNotifications() {
  // This could be extended to send Slack notifications, email alerts, etc.
  // For now, just log completion
  console.log('📤 Test execution completed')
}

/**
 * Helper functions
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function checkForFailedTests(testResultsDir: string): Promise<boolean> {
  try {
    const resultsPath = path.join(testResultsDir, 'results.json')
    if (await fileExists(resultsPath)) {
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'))
      return (results.stats?.failed || 0) > 0
    }
  } catch (_error) {
    // Ignore errors
  }
  return false
}

async function findFiles(dir: string, pattern: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir, { recursive: true })
    return files
      .filter((file) => typeof file === 'string' && file.includes(pattern))
      .map((file) => path.join(dir, file as string))
  } catch (_error) {
    return []
  }
}

async function moveFile(src: string, dest: string): Promise<void> {
  try {
    await fs.copyFile(src, dest)
    await fs.unlink(src)
  } catch (_error) {
    // Ignore move errors
  }
}

export default globalTeardown
