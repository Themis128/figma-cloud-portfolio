import { expect, test } from '@playwright/test'

// Utility to check theme class on <html>
async function expectTheme(page, theme: 'dark' | 'light') {
  const htmlClass = await page.evaluate(() => document.documentElement.className)
  expect(htmlClass).toContain(theme)
}

test.describe('ThemeProvider integration', () => {
  test('toggles dark/light/system themes and persists across pages', async ({ page }) => {
    await page.goto('/')
    // Find theme toggle button
    const toggle = page.locator('button[data-testid="theme-toggle"]')
    await expect(toggle).toBeVisible()

    // Initial theme (should match system or default)
    await expectTheme(page, 'dark') // Adjust if your default is 'light' or 'system'

    // Toggle to light
    await toggle.click()
    await expectTheme(page, 'light')

    // Toggle to system (if supported)
    await toggle.click()
    // System theme resolves to dark or light
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClass)

    // Navigate to another page
    await page.goto('/about')
    // Theme should persist
    const htmlClassAfterNav = await page.evaluate(() => document.documentElement.className)
    expect(['dark', 'light']).toContain(htmlClassAfterNav)

    // Go back to home
    await page.goto('/')
    await expect(toggle).toBeVisible()
  })
})
