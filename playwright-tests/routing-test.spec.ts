import { test } from "@playwright/test";

test("check routing", async ({ page }) => {
  await page.goto("http://localhost:8081/projects");
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  await page.waitForTimeout(2000);
  console.log("Final URL:", page.url());
  console.log("Final Title:", await page.title());
});
