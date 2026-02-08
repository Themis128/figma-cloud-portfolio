/**
 * Playwright Autofix Demo Tests
 *
 * This spec file demonstrates the autofix capabilities:
 * - Locator healing on stale elements
 * - Smart waiting for dynamic content
 * - Selector optimization
 * - Performance monitoring
 */

import { expect, test } from '@playwright/test'
import { createHealingLocator, SmartWaiter, SelectorOptimizer, PerformanceMonitor } from './autofix-helpers'

// Declare globals for TypeScript
declare global {
  interface Window {
    setTimeout?: typeof setTimeout
    document?: Document
  }
}

test.describe('Autofix Feature Demonstration', () => {
  test('should demonstrate locator healing on stale elements', async ({ page }) => {
    await page.goto('data:text/html,<html><body><button id="test-btn">Click me</button></body></html>')

    // Create a healing locator
    const healingBtn = createHealingLocator(page, '#test-btn')

    // First interaction should work
    await healingBtn.click()

    // Simulate element becoming stale by replacing it (this will cause a stale element error)
    await page.evaluate(() => {
      const btn = document.getElementById('test-btn')
      if (btn) {
        const newBtn = document.createElement('button')
        newBtn.id = 'test-btn'
        newBtn.textContent = 'New Button'
        btn.parentNode?.replaceChild(newBtn, btn)
      }
    })

    // Wait a bit to ensure the DOM change is processed
    await page.waitForTimeout(100)

    // This should automatically heal and work - the healing locator will retry
    await healingBtn.click()

    // Verify the locator healed (should have attempted healing)
    expect(healingBtn.getHealAttempts()).toBeGreaterThan(0)
  })

  test('should demonstrate smart waiting for dynamic content', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="container"></div></body></html>')

    const waiter = new SmartWaiter(page)

    // Start waiting for an element that doesn't exist yet
    const waitPromise = waiter.waitForText('#container', 'Hello World', 5000)

    // Add the content after a delay
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _timeout = setTimeout(() => {
        const container = document.getElementById('container')
        if (container) {
          container.textContent = 'Hello World'
        }
      }, 1000)
    })

    // Should wait intelligently and succeed
    await waitPromise
  })

  test('should demonstrate selector optimization suggestions', async ({ page }) => {
    await page.goto('data:text/html,<html><body><button class="btn-primary">Test</button></body></html>')

    // Get optimization suggestions
    const suggestions = SelectorOptimizer.suggest('.btn-primary')

    // Should suggest better selectors
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some((s) => s.includes('data-testid'))).toBe(true)
  })

  test('should demonstrate performance monitoring', async ({ page }) => {
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>')

    const monitor = new PerformanceMonitor(page)

    // Mark performance points
    await monitor.mark('start')
    await page.waitForTimeout(100)
    const duration = await monitor.measure('test-operation', 'start')

    // Should have measured duration
    expect(duration).toBeGreaterThan(0)

    // Get metrics
    const metrics = await monitor.getMetrics()
    expect(metrics.fcp).toBeGreaterThan(0)
  })

  test('should handle locator failures gracefully', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div>Content</div></body></html>')

    const healingLocator = createHealingLocator(page, '#non-existent-element', {
      maxRetries: 2,
      retryDelay: 100,
    })

    // This should fail gracefully after retries
    await expect(healingLocator.click()).rejects.toThrow()
    expect(healingLocator.getHealAttempts()).toBe(2)
  })

  test('should optimize selector priority', async ({ page }) => {
    await page.goto(
      'data:text/html,<html><body><button data-testid="submit" class="btn" role="button">Submit</button></body></html>',
    )

    const selectors = ['.btn', '[data-testid="submit"]', '[role="button"]', 'button']

    const bestSelector = SelectorOptimizer.findBest(selectors)

    // Should prefer data-testid
    expect(bestSelector).toBe('[data-testid="submit"]')
  })
})
