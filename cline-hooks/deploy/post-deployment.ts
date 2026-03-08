#!/usr/bin/env tsx
/**
 * Post-Deployment Hook
 * Executes after deployment completes
 * Runs smoke tests and health checks
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/deploy/post-deployment.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface DeploymentResult {
  environment: string;
  version: string;
  success: boolean;
  timestamp: string;
  healthChecks: HealthCheckResult[];
}

interface HealthCheckResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

async function runHealthCheck(name: string, url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    console.log(`🔍 Running health check: ${name}`);
    const response = await fetch(url, { timeout: 10000 });

    const duration = Date.now() - startTime;
    const success = response.ok;

    if (success) {
      console.log(`✅ ${name}: OK (${duration}ms)`);
    } else {
      console.log(`❌ ${name}: Failed (${response.status})`);
    }

    return { name, success, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${name}: Error - ${error}`);
    return { name, success: false, duration, error: error.toString() };
  }
}

function runSmokeTests(): boolean {
  try {
    console.log("🧪 Running smoke tests...");
    execSync("pnpm test:smoke", { stdio: "inherit" });
    console.log("✅ Smoke tests passed");
    return true;
  } catch (error) {
    console.error("❌ Smoke tests failed");
    return false;
  }
}

function generateDeploymentReport(result: DeploymentResult): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `post-deployment-report-${Date.now()}.md`);
  const statusEmoji = result.success ? "✅" : "❌";

  const healthCheckResults = result.healthChecks
    .map((check) => {
      const emoji = check.success ? "✅" : "❌";
      return `- ${emoji} ${check.name}: ${check.duration}ms${check.error ? ` - ${check.error}` : ""}`;
    })
    .join("\n");

  const report = `# Post-Deployment Report

**Environment**: ${result.environment}
**Version**: ${result.version}
**Status**: ${statusEmoji} ${result.success ? "SUCCESS" : "FAILED"}
**Timestamp**: ${result.timestamp}

## Health Checks

${healthCheckResults}

## Smoke Tests

- [${result.success ? "x" : " "}] Smoke tests completed

## Summary

${result.success ? "✅ Deployment successful" : "❌ Deployment failed"}

${result.healthChecks.some((c) => !c.success) ? "⚠️  Some health checks failed" : "✅ All health checks passed"}

## Next Steps

1. Monitor application logs for any issues
2. Verify user-facing functionality
3. Update monitoring dashboards if needed
4. Notify stakeholders of deployment status
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Post-deployment report saved to: ${reportFile}`);
}

async function main() {
  const environment = process.argv[2] || "production";
  const version = process.argv[3] || "unknown";

  console.log("✅ Cline Post-Deployment Hook");
  console.log("=============================");
  console.log(`🌍 Environment: ${environment}`);
  console.log(`📦 Version: ${version}`);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${environment}.example.com`;

  // Run health checks
  const healthChecks = await Promise.all([
    runHealthCheck("Homepage", `${baseUrl}/`),
    runHealthCheck("API Health", `${baseUrl}/api/health`),
    runHealthCheck("Contact API", `${baseUrl}/api/contact`),
    runHealthCheck("Projects API", `${baseUrl}/api/projects`),
  ]);

  // Run smoke tests
  const smokeTestsPassed = runSmokeTests();

  // Determine overall success
  const healthChecksPassed = healthChecks.every((check) => check.success);
  const success = healthChecksPassed && smokeTestsPassed;

  const result: DeploymentResult = {
    environment,
    version,
    success,
    timestamp: new Date().toISOString(),
    healthChecks,
  };

  // Generate report
  generateDeploymentReport(result);

  if (success) {
    console.log("\n✅ Post-deployment validation complete - all checks passed!");
  } else {
    console.log("\n❌ Post-deployment validation failed");
    console.log("💡 Check the report for details and take appropriate action");
  }
}

main().catch(console.error);