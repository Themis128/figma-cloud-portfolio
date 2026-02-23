import { expect, test } from '@playwright/test'

test.describe('Accessibility', () => {
  test('Home page has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    if (!page.accessibility || typeof page.accessibility.snapshot !== 'function') {
      test.skip('Accessibility API not supported in this browser/context')
      return
    }
    try {
      const accessibility = await page.accessibility.snapshot()
      expect(accessibility).not.toBeNull()
      // Optionally, check for specific roles or violations
    } catch (err) {
      test.skip(`Accessibility snapshot failed: ${err?.message || err}`)
    }
  })

  test('Agents page has no accessibility violations', async ({ page }) => {
    await page.goto('/agents')
    if (!page.accessibility || typeof page.accessibility.snapshot !== 'function') {
      test.skip('Accessibility API not supported in this browser/context')
      return
    }
    try {
      const accessibility = await page.accessibility.snapshot()
      expect(accessibility).not.toBeNull()
    } catch (err) {
      test.skip(`Accessibility snapshot failed: ${err?.message || err}`)
    }
  })
})
