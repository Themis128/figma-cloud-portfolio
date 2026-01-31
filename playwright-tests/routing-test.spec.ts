import { test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test("check routing", async ({ page }) => {
  await page.goto("/projects");
  await waitForAppReady(page);
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  await page.waitForTimeout(2000);
  console.log("Final URL:", page.url());
  console.log("Final Title:", await page.title());
});
