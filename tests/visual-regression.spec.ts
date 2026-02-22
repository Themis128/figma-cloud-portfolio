import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('Home page matches baseline screenshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot('home-page.png')
  })

  test('Agents page matches baseline screenshot', async ({ page }) => {
    await page.goto('/agents')
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot('agents-page.png')
  })
})
