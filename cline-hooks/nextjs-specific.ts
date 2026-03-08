#!/usr/bin/env tsx
/**
 * Next.js Specific Hook
 * Handles Next.js-specific operations and validations
 * Optimizes build process and development workflow
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/nextjs-specific.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface NextJsContext {
  operation: string;
  timestamp: string;
  success: boolean;
  duration?: number;
  details?: string;
}

function validateNextConfig(): boolean {
  try {
    console.log("🔍 Validating Next.js configuration...");
    const configPath = path.join(process.cwd(), "next.config.ts");
    
    if (!fs.existsSync(configPath)) {
      console.warn("⚠️  next.config.ts not found");
      return false;
    }

    const configContent = fs.readFileSync(configPath, "utf-8");
    
    // Check for essential Next.js configurations
    const requiredConfigs = [
      "typescript",
      "tailwindcss",
      "builder.io",
    ];

    const foundConfigs = requiredConfigs.filter(config => 
      configContent.toLowerCase().includes(config)
    );

    if (foundConfigs.length >= 2) {
      console.log("✅ Next.js configuration validated");
      return true;
    } else {
      console.warn("⚠️  Some Next.js configurations may be missing");
      return false;
    }
  } catch (error) {
    console.error("❌ Next.js configuration validation failed");
    return false;
  }
}

function checkPageStructure(): boolean {
  try {
    console.log("🔍 Checking page structure...");
    const pagesDir = path.join(process.cwd(), "src", "pages");
    const appDir = path.join(process.cwd(), "src", "app");

    let hasPages = false;
    let hasAppDir = false;

    if (fs.existsSync(pagesDir)) {
      hasPages = true;
      console.log("✅ Found pages directory");
    }

    if (fs.existsSync(appDir)) {
      hasAppDir = true;
      console.log("✅ Found app directory");
    }

    if (!hasPages && !hasAppDir) {
      console.warn("⚠️  No pages or app directory found");
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Page structure check failed");
    return false;
  }
}

function optimizeBuild(): boolean {
  try {
    console.log("⚡ Optimizing build process...");
    
    // Check if we can use incremental static regeneration
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, "utf-8");
      
      if (!configContent.includes("incremental")) {
        console.log("💡 Consider enabling incremental static regeneration");
      }
    }

    // Run build with optimizations
    execSync("pnpm build", { stdio: "inherit" });
    console.log("✅ Build optimization complete");
    return true;
  } catch (error) {
    console.error("❌ Build optimization failed");
    return false;
  }
}

function validateTailwindConfig(): boolean {
  try {
    console.log("🔍 Validating Tailwind CSS configuration...");
    const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts");
    
    if (!fs.existsSync(tailwindConfigPath)) {
      console.warn("⚠️  tailwind.config.ts not found");
      return false;
    }

    const configContent = fs.readFileSync(tailwindConfigPath, "utf-8");
    
    // Check for essential Tailwind configurations
    const requiredConfigs = [
      "content",
      "theme",
      "plugins",
    ];

    const foundConfigs = requiredConfigs.filter(config => 
      configContent.includes(config)
    );

    if (foundConfigs.length === 3) {
      console.log("✅ Tailwind CSS configuration validated");
      return true;
    } else {
      console.warn("⚠️  Some Tailwind CSS configurations may be missing");
      return false;
    }
  } catch (error) {
    console.error("❌ Tailwind CSS configuration validation failed");
    return false;
  }
}

function checkDependencies(): boolean {
  try {
    console.log("📦 Checking Next.js dependencies...");
    const packageJsonPath = path.join(process.cwd(), "package.json");
    
    if (!fs.existsSync(packageJsonPath)) {
      console.warn("⚠️  package.json not found");
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      "next",
      "react",
      "react-dom",
      "typescript",
    ];

    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);

    if (missingDeps.length === 0) {
      console.log("✅ All required dependencies present");
      return true;
    } else {
      console.warn(`⚠️  Missing dependencies: ${missingDeps.join(", ")}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Dependency check failed");
    return false;
  }
}

function generateNextJsReport(context: NextJsContext): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `nextjs-report-${Date.now()}.md`);
  const statusEmoji = context.success ? "✅" : "❌";

  const report = `# Next.js Operation Report

**Operation**: ${context.operation}
**Status**: ${statusEmoji} ${context.success ? "SUCCESS" : "FAILED"}
**Timestamp**: ${context.timestamp}
${context.duration ? `**Duration**: ${context.duration}ms` : ""}

## Operation Details

${context.details || "No additional details"}

## Next.js Best Practices

- ✅ Use TypeScript for type safety
- ✅ Implement proper error boundaries
- ✅ Optimize images with Next.js Image component
- ✅ Use dynamic imports for code splitting
- ✅ Implement proper SEO with metadata
- ✅ Use environment variables for configuration

## Performance Recommendations

- Use \`getStaticProps\` for static content
- Implement \`getServerSideProps\` for dynamic content
- Enable \`incremental\` static regeneration
- Use \`next/image\` for optimized images
- Implement proper caching strategies
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Next.js report saved to: ${reportFile}`);
}

function logNextJsOperation(context: NextJsContext): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "nextjs-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push(context);

  // Keep only last 100 operations
  if (logs.length > 100) {
    logs = logs.slice(-100);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
  const operation = process.argv[2] || "unknown";
  const timestamp = new Date().toISOString();

  console.log("⚛️  Cline Next.js Specific Hook");
  console.log("=============================");
  console.log(`🔧 Operation: ${operation}`);

  let success = true;
  let details = "";

  // Run Next.js specific checks based on operation
  switch (operation) {
    case "build":
      success = validateNextConfig() && checkDependencies() && optimizeBuild();
      details = "Build process with Next.js optimizations";
      break;
    case "dev":
      success = validateNextConfig() && checkPageStructure() && validateTailwindConfig();
      details = "Development environment setup";
      break;
    case "validate":
      success = validateNextConfig() && checkPageStructure() && validateTailwindConfig() && checkDependencies();
      details = "Complete Next.js validation";
      break;
    default:
      success = validateNextConfig();
      details = "Basic Next.js validation";
  }

  const context: NextJsContext = {
    operation,
    timestamp,
    success,
    details,
  };

  // Log operation
  logNextJsOperation(context);

  // Generate report
  generateNextJsReport(context);

  if (success) {
    console.log("✅ Next.js operation completed successfully");
  } else {
    console.log("❌ Next.js operation failed");
  }
}

main().catch(console.error);