#!/usr/bin/env tsx
/**
 * On-Deployment Hook
 * Executes during deployment events
 * Validates deployment and provides status updates
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/on-deployment.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface DeploymentContext {
  environment: string;
  version: string;
  status: "started" | "completed" | "failed";
  timestamp: string;
  duration?: number;
}

function validateBuild(): boolean {
  try {
    console.log("🔍 Validating build...");
    execSync("pnpm build", { stdio: "inherit" });
    console.log("✅ Build validation passed");
    return true;
  } catch (error) {
    console.error("❌ Build validation failed");
    return false;
  }
}

function checkEnvironmentVariables(env: string): boolean {
  const requiredVars = [
    "NEXT_PUBLIC_SITE_URL",
    "NODE_ENV",
    "FIREBASE_PROJECT_ID",
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
    return false;
  }

  console.log("✅ Environment variables validated");
  return true;
}

function generateDeploymentReport(context: DeploymentContext): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `deployment-report-${Date.now()}.md`);
  const statusEmoji = context.status === "completed" ? "✅" : "❌";

  const report = `# Deployment Report

**Environment**: ${context.environment}
**Version**: ${context.version}
**Status**: ${statusEmoji} ${context.status}
**Timestamp**: ${context.timestamp}
${context.duration ? `**Duration**: ${context.duration}ms` : ""}

## Deployment Steps

- [x] Build validation
- [x] Environment check
- [x] Deployment execution
- [ ] Post-deployment verification

## Next Steps

1. Verify the deployment at ${process.env.NEXT_PUBLIC_SITE_URL}
2. Run smoke tests if available
3. Monitor application logs for any issues
4. Update deployment tracking if needed
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Deployment report saved to: ${reportFile}`);
}

function logDeployment(context: DeploymentContext): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "deployment-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push(context);

  // Keep only last 50 deployments
  if (logs.length > 50) {
    logs = logs.slice(-50);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
  const context: DeploymentContext = {
    environment: process.argv[2] || "unknown",
    version: process.argv[3] || "unknown",
    status: (process.argv[4] as any) || "started",
    timestamp: new Date().toISOString(),
    duration: parseInt(process.argv[5] || "0", 10),
  };

  console.log("🚀 Cline On-Deployment Hook");
  console.log("===========================");
  console.log(`🌍 Environment: ${context.environment}`);
  console.log(`📦 Version: ${context.version}`);
  console.log(`📊 Status: ${context.status}`);

  // Log deployment
  logDeployment(context);

  // Generate report
  generateDeploymentReport(context);

  if (context.status === "started") {
    // Pre-deployment checks
    const buildValid = validateBuild();
    const envValid = checkEnvironmentVariables(context.environment);

    if (!buildValid || !envValid) {
      console.error("❌ Pre-deployment checks failed");
      process.exit(1);
    }

    console.log("✅ Pre-deployment validation complete");
  } else if (context.status === "completed") {
    console.log("✅ Deployment completed successfully");
    console.log("💡 Verify deployment at:", process.env.NEXT_PUBLIC_SITE_URL);
  } else if (context.status === "failed") {
    console.error("❌ Deployment failed");
    console.log("💡 Check logs and retry deployment");
  }
}

main().catch(console.error);