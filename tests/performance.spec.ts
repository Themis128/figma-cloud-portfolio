import { expect, test } from '@playwright/test'

const MAX_LOAD_TIME_MS = 1000

test.describe('Performance', () => {
  test('Home page loads under 1s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(MAX_LOAD_TIME_MS)
  })

  test('Agents page loads under 1s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/agents')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(MAX_LOAD_TIME_MS)
  })
})
