import { test } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

test("debug elements", async ({ page }) => {
  await page.goto("http://localhost:3001/");
  await waitForAppReady(page);

  // Check for semantic elements
  const mainCount = await page.locator("main").count();
  const navCount = await page.locator("nav").count();
  const headerCount = await page.locator("header").count();
  const footerCount = await page.locator("footer").count();

  console.log("Semantic elements:");
  console.log(`main: ${mainCount}`);
  console.log(`nav: ${navCount}`);
  console.log(`header: ${headerCount}`);
  console.log(`footer: ${footerCount}`);

  // Check for ARIA landmarks
  const mainRoleCount = await page.locator('[role="main"]').count();
  const navRoleCount = await page.locator('[role="navigation"]').count();
  const bannerRoleCount = await page.locator('[role="banner"]').count();
  const contentinfoRoleCount = await page.locator('[role="contentinfo"]').count();

  console.log("ARIA landmarks:");
  console.log(`[role="main"]: ${mainRoleCount}`);
  console.log(`[role="navigation"]: ${navRoleCount}`);
  console.log(`[role="banner"]: ${bannerRoleCount}`);
  console.log(`[role="contentinfo"]: ${contentinfoRoleCount}`);

  // Check page content
  const bodyText = await page.locator("body").textContent();
  console.log("Page has content:", (bodyText?.length || 0) > 0);

  // Total count
  const total =
    mainCount +
    navCount +
    headerCount +
    footerCount +
    mainRoleCount +
    navRoleCount +
    bannerRoleCount +
    contentinfoRoleCount;
  console.log("Total semantic/landmark elements:", total);
});
