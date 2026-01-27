const { chromium } = require("playwright");

async function testPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:8080", {
      waitUntil: "networkidle",
      timeout: 10000,
    });

    const _bodyVisible = await page.locator("body").isVisible();

    const _title = await page.title();

    const h1Count = await page.locator("h1").count();

    if (h1Count > 0) {
      const _h1Text = await page.locator("h1").first().textContent();
    }

    const _bodyText = await page.locator("body").textContent();
  } catch (_error) {
  } finally {
    await browser.close();
  }
}

testPage().catch(() => {});
