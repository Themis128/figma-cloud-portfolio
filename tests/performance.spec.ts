import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('Home page loads under 1s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000)
  })

  test('Agents page loads under 1s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/agents')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000)
  })
})
