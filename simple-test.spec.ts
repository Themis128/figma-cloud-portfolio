import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:8081')
  await expect(page.locator('h1')).toBeVisible()
})