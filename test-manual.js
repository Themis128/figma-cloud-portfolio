const { chromium } = require('playwright')

async function testPage() {
  console.log('Launching browser...')
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    console.log('Navigating to http://localhost:8080...')
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 10000,
    })
    console.log('Page loaded successfully')

    const bodyVisible = await page.locator('body').isVisible()
    console.log('Body visible:', bodyVisible)

    const title = await page.title()
    console.log('Page title:', title)

    const h1Count = await page.locator('h1').count()
    console.log('H1 elements found:', h1Count)

    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent()
      console.log('H1 text:', h1Text)
    }

    const bodyText = await page.locator('body').textContent()
    console.log('Body text length:', bodyText ? bodyText.length : 0)
    console.log('Body text preview:', bodyText ? bodyText.substring(0, 200) : 'No text')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await browser.close()
  }
}

testPage().catch(console.error)
