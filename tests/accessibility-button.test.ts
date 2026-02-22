import { test, expect } from '@playwright/test'

test('Accessibility button opens settings', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('button[aria-label="Accessibility Settings"]')
  await expect(button).toBeVisible()
  await button.click()
  const panel = page.getByTestId('accessibility-panel')
  await expect(panel).toBeVisible()
  await page.click('button[aria-label="Close"]')
  await expect(panel).toBeHidden()
})
