import { expect, test } from '@playwright/test'

/**
 * React 19 Features Test Suite
 * Tests for React 19 specific features including server components, automatic batching,
 * and improved error handling.
 */

test.describe('React 19 Features', () => {
  test('should render React 19 server components with streaming', async ({ page }) => {
    await page.goto('/')

    // Test server components are properly rendered
    const serverComponents = await page.$$('[data-react-server]')
    expect(serverComponents.length).toBeGreaterThan(0)

    // Test streaming rendering
    const streamingElements = await page.$$('[data-react-streaming]')
    expect(streamingElements.length).toBeGreaterThan(0)
  })

  test('should handle errors gracefully with React 19 error boundaries', async ({ page }) => {
    await page.goto('/')

    // Simulate an error scenario
    await page.click('[data-testid="trigger-error"]')

    // Verify error boundary is displayed
    const errorBoundary = await page.$('[data-testid="error-boundary"]')
    expect(errorBoundary).not.toBeNull()

    // Verify error message is displayed
    const errorMessage = await page.textContent('[data-testid="error-message"]')
    expect(errorMessage).toContain('Something went wrong')
  })

  test('should batch updates automatically for better performance', async ({ page }) => {
    await page.goto('/')

    // Measure update batching behavior
    const updateCount = await page.evaluate(() => {
      const updates = []
      const originalSetState = React.Component.prototype.setState

      React.Component.prototype.setState = function (...args) {
        updates.push(Date.now())
        return originalSetState.apply(this, args)
      }

      // Trigger multiple state updates
      document.dispatchEvent(new Event('trigger-multiple-updates'))

      // Restore original setState
      React.Component.prototype.setState = originalSetState

      return updates
    })

    // Verify updates are batched (should happen within 100ms window)
    const maxDelay = Math.max(...updateCount) - Math.min(...updateCount)
    expect(maxDelay).toBeLessThan(100)
  })

  test('should support suspense for data fetching', async ({ page }) => {
    await page.goto('/')

    // Test that loading states are properly displayed
    const loadingStates = await page.$$('[data-testid="loading"]')
    expect(loadingStates.length).toBeGreaterThan(0)

    // Test that data is eventually loaded
    await page.waitForSelector('[data-testid="loaded-content"]', { timeout: 5000 })
    const loadedContent = await page.$('[data-testid="loaded-content"]')
    expect(loadedContent).not.toBeNull()
  })
})
