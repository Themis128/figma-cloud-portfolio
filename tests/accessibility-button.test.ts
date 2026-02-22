import { test, expect } from '@playwright/test'

import fetch from 'node-fetch'

const LAMBDA_URL = process.env.PLAYWRIGHT_AUTOFIX_ENDPOINT || process.env.AUTOFIX_LAMBDA_URL

test.beforeAll(async () => {
  if (!LAMBDA_URL) {
    test.skip('Lambda endpoint not configured, skipping tests')
    return
  }
  try {
    const res = await fetch(LAMBDA_URL, { method: 'HEAD' })
    if (!res.ok) {
      test.skip('Lambda endpoint unreachable, skipping tests')
    }
  } catch {
    test.skip('Lambda endpoint unreachable, skipping tests')
  }
})

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
