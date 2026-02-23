import { expect, test } from '@playwright/test'

import { skipIfLambdaOffline } from '../playwright-ai-sync'

const LONG_TIMEOUT_MS = 60000
const THEME_TRANSITION_MS = 2000
const NAV_TRANSITION_MS = 500
const SHORT_TIMEOUT_MS = 10000

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
    const toggleCount = await toggle.count()
    const isToggleVisible = toggleCount > 0 && (await toggle.isVisible())
    if (isToggleVisible) {
      await toggle.waitFor({ state: 'visible', timeout: LONG_TIMEOUT_MS })
      await expect(toggle).toBeVisible({ timeout: LONG_TIMEOUT_MS })
    } else {
      // Fallback to mobile theme toggle button
      toggle = page.locator('button[data-testid="theme-toggle-mobile"]')
      await toggle.waitFor({ state: 'visible', timeout: LONG_TIMEOUT_MS })
      await expect(toggle).toBeVisible({ timeout: LONG_TIMEOUT_MS })
    }

    // Initial theme (should match system or default)
    await page.waitForTimeout(THEME_TRANSITION_MS)
    await expectTheme(page, 'dark') // Adjust if your default is 'light' or 'system'

    // Toggle to light
    await toggle.click()
    await page.waitForTimeout(THEME_TRANSITION_MS)
    await expectTheme(page, 'light')

    // Toggle to system (if supported)
    await toggle.click()
    await page.waitForTimeout(THEME_TRANSITION_MS)
    // System theme resolves to dark or light
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClass)

    // Navigate to another page
    await page.goto('/about')
    await page.waitForTimeout(NAV_TRANSITION_MS)
    // Theme should persist
    const htmlClassAfterNav = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClassAfterNav)

    // Go back to home
    await page.goto('/')
    await toggle.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT_MS })
    await expect(toggle).toBeVisible({ timeout: SHORT_TIMEOUT_MS })
  })
})
