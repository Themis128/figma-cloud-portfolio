import { chromium } from '@playwright/test'

async function runTest() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Navigate to the page
  await page.goto('http://localhost:8082')

  // Check for basic content
  const _title = await page.title()

  const _h1Text = await page.locator('h1').first().textContent()

  // Check for logo
  const logo = await page.locator('img[alt*="Logo"]').first()
  const _logoVisible = await logo.isVisible()

  await browser.close()
}

runTest().catch(console.error)
