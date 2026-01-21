import fs from 'node:fs/promises'
import path from 'node:path'
import { type BrowserContext, expect, type Locator, type Page } from '@playwright/test'

/**
 * Enhanced test utilities for automatic issue resolution and test stability
 */

/**
 * Wait for application to be fully loaded and stable
 */
export async function waitForAppReady(page: Page, timeout = 30000) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle')

  // Wait for critical app elements
  await page.waitForSelector('body', { timeout })
  await page.waitForSelector('h1, main, [role="main"]', { timeout })

  // Wait for service worker if present
  try {
    await page.waitForFunction(
      () => {
        return navigator.serviceWorker?.ready || true
      },
      { timeout: 5000 },
    )
  } catch (_error) {
    // Service worker not critical for all tests
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        const delay = baseDelay * 2 ** attempt
        console.log(
          `⚠️  Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  if (lastError) {
    throw lastError
  }
}

/**
 * Take screenshot with automatic naming and organization
 */
export async function takeScreenshot(page: Page, name: string, _context?: BrowserContext) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${name}-${timestamp}.png`
  const screenshotPath = path.join('test-results', 'screenshots', filename)

  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })
  await page.screenshot({ path: screenshotPath, fullPage: true })

  console.log(`📸 Screenshot saved: ${screenshotPath}`)
  return screenshotPath
}

/**
 * Enhanced element waiting with multiple strategies
 */
export async function waitForElement(
  page: Page,
  selectors: string | string[],
  options: {
    timeout?: number
    visible?: boolean
    stable?: boolean
  } = {},
) {
  const { timeout = 10000, visible = true, stable = false } = options
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]

  for (const selector of selectorArray) {
    try {
      const element = page.locator(selector).first()

      if (visible) {
        await expect(element).toBeVisible({ timeout })
      } else {
        await expect(element).toBeAttached({ timeout })
      }

      if (stable) {
        // Wait for element to be stable (no layout shifts)
        await page.waitForTimeout(500)
        const initialBox = await element.boundingBox()
        await page.waitForTimeout(500)
        const finalBox = await element.boundingBox()

        if (initialBox && finalBox) {
          const movement = Math.abs(initialBox.x - finalBox.x) + Math.abs(initialBox.y - finalBox.y)
          if (movement > 5) {
            // Allow 5px tolerance
            throw new Error('Element is still moving')
          }
        }
      }

      return element
    } catch (_error) {
      // Continue to next selector
    }
  }

  throw new Error(`None of the selectors found: ${selectorArray.join(', ')}`)
}

/**
 * Handle flaky network requests
 */
export async function handleNetworkFlakiness(page: Page, _context: BrowserContext) {
  // Set up network monitoring
  const failedRequests: string[] = []

  page.on('response', (response) => {
    if (
      !response.ok() &&
      !response.url().includes('favicon') &&
      !response.url().includes('manifest')
    ) {
      failedRequests.push(response.url())
    }
  })

  // Retry failed requests
  if (failedRequests.length > 0) {
    console.log(`⚠️  Retrying ${failedRequests.length} failed requests...`)

    for (const url of failedRequests) {
      try {
        await page.reload()
        await waitForAppReady(page)
        break // If reload succeeds, stop retrying
      } catch (_error) {
        console.warn(`❌ Retry failed for ${url}`)
      }
    }
  }
}

/**
 * Performance monitoring utilities
 */
export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const startTime = Date.now()
  const _startMetrics = await page.evaluate(() => ({
    domContentLoaded:
      performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
  }))

  await action()

  const endTime = Date.now()
  const endMetrics = await page.evaluate(() => ({
    domContentLoaded:
      performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
  }))

  return {
    totalTime: endTime - startTime,
    domContentLoaded: endMetrics.domContentLoaded,
    loadComplete: endMetrics.loadComplete,
  }
}

/**
 * Accessibility audit helper
 */
export async function runAccessibilityAudit(page: Page) {
  const violations = await page.evaluate(() => {
    // Basic accessibility checks
    const issues: Array<{ type: string; count?: number; message?: string }> = []

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push({ type: 'missing-alt', count: images.length })
    }

    // Check for missing labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    if (inputs.length > 0) {
      issues.push({ type: 'missing-label', count: inputs.length })
    }

    // Check for proper heading hierarchy
    const _headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const h1Count = document.querySelectorAll('h1').length
    if (h1Count !== 1) {
      issues.push({
        type: 'heading-hierarchy',
        message: `Found ${h1Count} h1 elements, expected 1`,
      })
    }

    return issues
  })

  return violations
}

/**
 * Auto-heal flaky selectors
 */
export async function findElementWithFallbacks(
  page: Page,
  primarySelector: string,
  fallbacks: string[] = [],
) {
  // Try primary selector first
  try {
    const element = page.locator(primarySelector).first()
    await expect(element).toBeVisible({ timeout: 2000 })
    return element
  } catch (_error) {
    // Try fallbacks
    for (const fallback of fallbacks) {
      try {
        const element = page.locator(fallback).first()
        await expect(element).toBeVisible({ timeout: 2000 })
        console.log(`🔄 Used fallback selector: ${fallback} instead of ${primarySelector}`)
        return element
      } catch (_error) {
        // Continue to next fallback
      }
    }

    // Try text-based or attribute-based fallbacks
    const textFallbacks = [
      `[text*="${primarySelector.replace(/[^a-zA-Z0-9]/g, ' ').trim()}"]`,
      `[placeholder*="${primarySelector.replace(/[^a-zA-Z0-9]/g, ' ').trim()}"]`,
    ]

    for (const fallback of textFallbacks) {
      try {
        const element = page.locator(fallback).first()
        await expect(element).toBeVisible({ timeout: 2000 })
        console.log(`🔄 Used text-based fallback: ${fallback}`)
        return element
      } catch (_error) {
        // Continue to next fallback
      }
    }

    throw new Error(`Element not found with any selector: ${primarySelector}`)
  }
}

/**
 * Smart wait for dynamic content
 */
export async function waitForDynamicContent(
  page: Page,
  contentCheck: () => Promise<boolean>,
  timeout = 10000,
) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await contentCheck()) {
      return true
    }

    // Wait a bit before checking again
    await page.waitForTimeout(500)

    // Reload if content is taking too long (possible caching issue)
    if (Date.now() - startTime > timeout / 2) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)
    }
  }

  return false
}

/**
 * Generate test report with recommendations
 */
export function generateTestRecommendations(results: {
  failed: number
  duration: number
  flakyTests?: string[]
}) {
  const recommendations: string[] = []

  if (results.failed > 0) {
    recommendations.push('🔴 Some tests failed - check screenshots and traces for details')
  }

  if (results.duration > 300000) {
    // 5 minutes
    recommendations.push('⏱️  Tests are running slowly - consider optimizing or parallelizing')
  }

  if ((results.flakyTests?.length ?? 0) > 0) {
    recommendations.push(
      `🎲 ${results.flakyTests?.length ?? 0} tests appear flaky - consider adding retries or stability improvements`,
    )
  }

  return recommendations
}

/**
 * Custom matchers for better test assertions
 */
export const customMatchers = {
  /**
   * Check if element is accessible
   */
  toBeAccessible: async (locator: Locator) => {
    const isVisible = await locator.isVisible()
    const isEnabled = await locator.isEnabled()

    return {
      pass: isVisible && isEnabled,
      message: (): string => `Expected element to be accessible (visible and enabled)`,
    }
  },

  /**
   * Check if page loaded within performance budget
   */
  toLoadWithinBudget: async (page: Page, budgetMs: number) => {
    const metrics = await page.evaluate(() => ({
      domContentLoaded:
        performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
    }))

    const maxTime = Math.max(metrics.domContentLoaded, metrics.loadComplete)

    return {
      pass: maxTime <= budgetMs,
      message: (): string => `Expected page to load within ${budgetMs}ms, but took ${maxTime}ms`,
    }
  },
}
