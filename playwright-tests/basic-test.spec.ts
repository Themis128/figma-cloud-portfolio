import { expect, test } from '@playwright/test'

test('basic test in playwright-tests directory', async ({ page }) => {
  await page.goto('http://localhost:8082')
  await expect(page.locator('h1')).toBeVisible()
})
