import { exec, execSync } from "node:child_process";
import { promisify } from "node:util";
import { chromium, type FullConfig } from "@playwright/test";
import { startBackendServer, startFrontendServer } from "./test-environment";

const execAsync = promisify(exec);

/**
 * Global setup for Playwright tests
 * Prepares the test environment and ensures all dependencies are ready
 */
async function globalSetup(_config: FullConfig) {
  console.log("🚀 Starting Playwright global setup...");

  try {
    // Start development servers
    console.log("📡 Starting development servers...");
    await startBackendServer();
    await startFrontendServer();

    // Health check function with retries
    async function checkServer(url: string, name: string, maxRetries = 5): Promise<boolean> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔍 Checking ${name} (attempt ${attempt}/${maxRetries})...`);
          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
            headers: { "Cache-Control": "no-cache" },
          });

          if (response.ok) {
            console.log(`✅ ${name} ready`);
            return true;
          } else {
            console.log(`⚠️  ${name} returned status ${response.status}`);
          }
        } catch (error: unknown) {
          console.log(
            `❌ ${name} check failed (attempt ${attempt}):`,
            error instanceof Error ? error.message : String(error),
          );
          if (attempt < maxRetries) {
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
      return false;
    }

    // Check frontend server with retries
    const frontendUrl = "http://localhost:8082";
    const frontendReady = await checkServer(frontendUrl, "Frontend server");
    if (!frontendReady) {
      throw new Error("Frontend server failed health check");
    }

    // Check backend API with retries
    const apiUrl = "http://localhost:3000/api/ping";
    const backendReady = await checkServer(apiUrl, "Backend API server");
    if (!backendReady) {
      console.log("⚠️  Backend API server not accessible - some tests may fail");
    }

    // Pre-warm the application by loading the main page
    console.log("🔥 Pre-warming application...");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(frontendUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000); // Allow time for service worker registration

      // Verify critical elements are present
      const title = await page.title();
      if (!title) {
        throw new Error("Application failed to load properly");
      }

      console.log("✅ Application pre-warmed successfully");
    } finally {
      await browser.close();
    }

    // Open the visual progress dashboard automatically
    console.log("📊 Opening Visual Progress Dashboard...");
    try {
      const dashboardUrl =
        "file:///D:/Nuxt Projects/new-portfolio/playwright-tests/visual-progress.html";

      // Cross-platform browser opening
      let command: string = "";
      if (process.platform === "win32") {
        command = `start "" "${dashboardUrl}"`;
      } else if (process.platform === "darwin") {
        command = `open "${dashboardUrl}"`;
      } else {
        command = `xdg-open "${dashboardUrl}"`;
      }

      try {
        execSync(command, { stdio: "ignore" });
        console.log("✅ Visual Progress Dashboard opened successfully");
      } catch (openError: unknown) {
        const errorMessage = openError instanceof Error ? openError.message : String(openError);
        console.log("⚠️  Could not open dashboard automatically:", errorMessage);
        console.log("📋 Dashboard URL:", dashboardUrl);
      }
    } catch (dashboardError) {
      const errorMessage =
        dashboardError instanceof Error ? dashboardError.message : String(dashboardError);
      console.log("⚠️  Dashboard opening failed:", errorMessage);
      console.log(
        "📋 Manual dashboard URL: file:///D:/Nuxt%20Projects/new-portfolio/playwright-tests/visual-progress.html",
      );
    }

    // Clean up any existing test artifacts
    console.log("🧹 Cleaning up previous test artifacts...");
    try {
      await execAsync("rm -rf test-results/playwright-report");
      await execAsync("mkdir -p test-results");
    } catch (_error) {
      // Ignore cleanup errors
    }

    console.log("🎯 Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
}

export default globalSetup;
