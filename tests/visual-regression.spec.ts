import { expect, test } from '@playwright/test'

const SCREENSHOT_DELAY_MS = 1000

test.describe('Visual Regression', () => {
  test('Home page matches baseline screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(SCREENSHOT_DELAY_MS)
    expect(await page.screenshot()).toMatchSnapshot('home-page.png')
  })

  test('Agents page matches baseline screenshot', async ({ page }) => {
    await page.goto('/agents')
    await page.waitForTimeout(SCREENSHOT_DELAY_MS)
    expect(await page.screenshot()).toMatchSnapshot('agents-page.png')
  })
})
