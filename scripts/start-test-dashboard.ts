#!/usr/bin/env tsx

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Test Dashboard Launcher
 * Starts the progress server and opens the dashboard in the browser
 */
class TestDashboardLauncher {
  private progressServerUrl = "http://localhost:3001";
  private dashboardUrl = `${this.progressServerUrl}/`;

  async start() {
    console.log("🚀 Starting Playwright Test Progress Dashboard...\n");

    // Start the progress server
    await this.startProgressServer();

    // Open dashboard in browser
    await this.openDashboard();

    // Start test execution automatically
    await this.startTestExecution();

    console.log("\n✅ Test Dashboard is ready!");
    console.log(`📊 Dashboard URL: ${this.dashboardUrl}`);
    console.log(`📡 Progress Server: ${this.progressServerUrl}`);
    console.log("\n💡 Tips:");
    console.log("  - Keep this terminal open to maintain the dashboard");
    console.log("  - The dashboard will show real-time test progress");
    console.log("  - Tests are running automatically in the background");
    console.log("  - Use Ctrl+C to stop the dashboard and tests\n");
  }

  private async startProgressServer(): Promise<void> {
    console.log("📦 Starting Progress Server...");

    try {
      // Check if server file exists
      const serverPath = join(__dirname, "../server/test-progress-server.ts");
      if (!existsSync(serverPath)) {
        throw new Error(`Server file not found: ${serverPath}`);
      }

      // Start the server
      const _serverProcess = spawn("npx", ["tsx", serverPath], {
        stdio: "inherit",
        detached: false,
      });

      // Wait for server to start
      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.isServerRunning = true;
      console.log("✅ Progress Server started successfully");
    } catch (error) {
      console.error("❌ Failed to start Progress Server:", error);
      process.exit(1);
    }
  }

  private async openDashboard(): Promise<void> {
    console.log("🌐 Opening Dashboard in browser...");

    try {
      const { default: open } = await import("open");
      await open(this.dashboardUrl);
      console.log("✅ Dashboard opened in browser");
    } catch (_error) {
      console.warn("⚠️  Could not open browser automatically");
      console.log(`   Please open: ${this.dashboardUrl}`);
    }
  }

  private async startTestExecution(): Promise<void> {
    console.log("🧪 Starting Test Execution...");

    try {
      // Check if Playwright config exists
      const configPath = join(__dirname, "../playwright.config.ts");
      if (!existsSync(configPath)) {
        throw new Error(`Playwright config not found: ${configPath}`);
      }

      // Start Playwright tests
      const testProcess = spawn("npx", ["playwright", "test", "--config", configPath], {
        stdio: "inherit",
        detached: false,
      });

      // Handle test process exit
      testProcess.on("close", (code) => {
        console.log(`\n🏁 Test execution completed with code: ${code}`);
        if (code === 0) {
          console.log("✅ All tests passed!");
        } else {
          console.log("❌ Some tests failed");
        }
      });

      // Handle test process errors
      testProcess.on("error", (error) => {
        console.error("❌ Test execution error:", error);
      });

      console.log("✅ Test execution started");
    } catch (error) {
      console.error("❌ Failed to start test execution:", error);
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Test Dashboard...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down Test Dashboard...");
  process.exit(0);
});

// Start the dashboard
const launcher = new TestDashboardLauncher();
launcher.start().catch((error) => {
  console.error("❌ Failed to start Test Dashboard:", error);
  process.exit(1);
});
