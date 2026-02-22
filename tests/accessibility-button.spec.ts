import { test, expect } from '@playwright/test'

test('Accessibility button opens settings', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('button[aria-label="Accessibility Settings"]')
  await expect(button).toBeVisible({ timeout: 10000 })
  await button.waitFor({ state: 'visible', timeout: 10000 })
  await button.click()
  const panel = page.getByTestId('accessibility-panel')
  await panel.waitFor({ state: 'visible', timeout: 10000 })
  await expect(panel).toBeVisible({ timeout: 10000 })
  const closeButton = page.locator('button[aria-label="Close"]')
  await closeButton.waitFor({ state: 'visible', timeout: 10000 })
  await closeButton.click()
  await panel.waitFor({ state: 'hidden', timeout: 10000 })
  await expect(panel).toBeHidden({ timeout: 10000 })
})
