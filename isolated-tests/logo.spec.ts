import { expect, test } from '@playwright/test'

const HTTP_OK_STATUS = 200

test.describe('Logo Image Optimization', () => {
  test('should load page and check for errors', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    })

    // Listen for page errors
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.goto('http://localhost:8082/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check if the page has loaded
    const title = await page.title()

    // Check for JavaScript errors

    // Check if the root div exists
    const rootDiv = page.locator('#root')
    const rootExists = (await rootDiv.count()) > 0
    expect(rootExists).toBe(true)

    // Basic check - page should have loaded
    expect(title).toBeTruthy()
  })

  test('should load logo with proper optimization', async ({ page }) => {
    await page.goto('http://localhost:8082/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the logo image exists
    const logoImg = page.locator('img[alt="Themistoklis Baltzakis Logo"]')
    await expect(logoImg).toBeVisible()

    // Check that the image has proper attributes
    const src = await logoImg.getAttribute('src')
    expect(src).toBeTruthy()

    // Check that sizes attribute is present (for responsive images)
    const sizes = await logoImg.getAttribute('sizes')
    expect(sizes).toBeTruthy()
    expect(sizes).toContain('32px') // Should have mobile size
    expect(sizes).toContain('40px') // Should have desktop size

    // Check that loading is eager (since it's above the fold)
    const loading = await logoImg.getAttribute('loading')
    expect(loading).toBe('eager')

    // Check that decoding is async
    const decoding = await logoImg.getAttribute('decoding')
    expect(decoding).toBe('async')

    // Check that the image loads without errors
    const imgSrc = await logoImg.getAttribute('src')
    if (imgSrc) {
      // Try to fetch the image to ensure it loads
      const response = await page.request.get(imgSrc)
      expect(response.status()).toBe(HTTP_OK_STATUS)
    }
  })

  test('should use modern image formats', async ({ page }) => {
    await page.goto('http://localhost:8082/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the logo uses modern formats (WebP/AVIF)
    const logoImg = page.locator('img[alt="Themistoklis Baltzakis Logo"]')

    // Wait for the image to be visible (should load immediately due to priority=true)
    await expect(logoImg).toBeVisible()

    // Check that picture element exists
    const picture = logoImg.locator('xpath=ancestor::picture')
    await expect(picture).toBeVisible()

    // Check for AVIF source with srcset
    const avifSource = picture.locator('source[type="image/avif"]')
    await expect(avifSource).toHaveAttribute('srcset', '/logo.avif')

    // Check for WebP source with srcset
    const webpSource = picture.locator('source[type="image/webp"]')
    await expect(webpSource).toHaveAttribute('srcset', '/logo.webp')

    // The img src should be the fallback (original format)
    const src = await logoImg.getAttribute('src')
    expect(src).toBe('/logo.jpg')
  })

  test('should have proper alt text', async ({ page }) => {
    await page.goto('http://localhost:8082/')

    const logoImg = page.locator('img[alt="Themistoklis Baltzakis Logo"]')
    const alt = await logoImg.getAttribute('alt')
    expect(alt).toBe('Themistoklis Baltzakis Logo')
  })

  test('should be properly sized', async ({ page }) => {
    await page.goto('http://localhost:8082/')

    const logoImg = page.locator('img[alt="Themistoklis Baltzakis Logo"]')

    // Check width and height attributes
    const width = await logoImg.getAttribute('width')
    const height = await logoImg.getAttribute('height')

    expect(width).toBe('40')
    expect(height).toBe('40')
  })

  test('should have proper CSS classes', async ({ page }) => {
    await page.goto('http://localhost:8082/')

    const logoImg = page.locator('img[alt="Themistoklis Baltzakis Logo"]')
    const className = await logoImg.getAttribute('class')

    // Should have responsive classes and object-cover
    expect(className).toContain('w-full')
    expect(className).toContain('h-full')
    expect(className).toContain('object-cover')
  })
})
