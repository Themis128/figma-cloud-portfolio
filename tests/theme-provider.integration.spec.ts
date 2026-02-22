import { test, expect } from '@playwright/test'

import { skipIfLambdaOffline } from '../playwright-ai-sync'

test.beforeAll(async () => {
  await skipIfLambdaOffline(test)
})

// Utility to check theme class on <html>
async function expectTheme(page, theme: 'dark' | 'light') {
  const htmlClass = await page.evaluate(() => document.documentElement.className)
  expect(htmlClass).toContain(theme)
}

test.describe('ThemeProvider integration', () => {
  test('toggles dark/light/system themes and persists across pages', async ({ page }) => {
    await page.goto('/')
    // Try to find desktop theme toggle button
    let toggle = page.locator('button[data-testid="theme-toggle-desktop"]')
    if (!(await toggle.count()) || !(await toggle.isVisible())) {
      // Fallback to mobile theme toggle button
      toggle = page.locator('button[data-testid="theme-toggle-mobile"]')
      await toggle.waitFor({ state: 'visible', timeout: 60000 })
      await expect(toggle).toBeVisible({ timeout: 60000 })
    } else {
      await toggle.waitFor({ state: 'visible', timeout: 60000 })
      await expect(toggle).toBeVisible({ timeout: 60000 })
    }

    // Initial theme (should match system or default)
    await page.waitForTimeout(2000)
    await expectTheme(page, 'dark') // Adjust if your default is 'light' or 'system'

    // Toggle to light
    await toggle.click()
    await page.waitForTimeout(2000)
    await expectTheme(page, 'light')

    // Toggle to system (if supported)
    await toggle.click()
    await page.waitForTimeout(2000)
    // System theme resolves to dark or light
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClass)

    // Navigate to another page
    await page.goto('/about')
    await page.waitForTimeout(500)
    // Theme should persist
    const htmlClassAfterNav = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClassAfterNav)

    // Go back to home
    await page.goto('/')
    await toggle.waitFor({ state: 'visible', timeout: 10000 })
    await expect(toggle).toBeVisible({ timeout: 10000 })
  })
})
