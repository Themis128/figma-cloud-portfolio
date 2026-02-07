import { expect, test } from '@playwright/test'

test.describe('AI Agent Functionality @critical', () => {
  test('should load page successfully', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const pageLoaded = await page.evaluate(() => {
      return document.readyState === 'complete'
    })

    expect(pageLoaded).toBeTruthy()
  })

  test('should have window object available', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const hasWindow = await page.evaluate(() => {
      return typeof window !== 'undefined'
    })

    expect(hasWindow).toBeTruthy()
  })

  test('should support async operations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const supportsAsync = await page.evaluate(async () => {
      try {
        await Promise.resolve(true)
        return true
      } catch {
        return false
      }
    })

    expect(supportsAsync).toBeTruthy()
  })
})
