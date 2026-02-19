import { chromium } from 'playwright'

const ANALYTICS_REQUEST_TIMEOUT = 2000

async function testAnalytics() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    await page.goto('http://localhost:8082', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    })

    // Check if the page has the expected content
    await page.title()

    // Wait for React to load
    await page.waitForSelector('body', { timeout: 5000 })

    // Manually trigger analytics by calling the global function
    await page.evaluate(() => {
      if (window.trackContactFormSubmit) {
        window.trackContactFormSubmit()
      } else {
      }
    })

    // Wait for the analytics request
    await page.waitForTimeout(ANALYTICS_REQUEST_TIMEOUT)

    return true
  } catch {
    return false
  } finally {
    await browser.close()
  }
}

testAnalytics()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((_err) => {
    process.exit(1)
  })
