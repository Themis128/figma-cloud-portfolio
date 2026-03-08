#!/usr/bin/env tsx
/**
 * Code Quality Hook
 * Executes code quality checks and analysis
 * Runs linting, type checking, and code analysis
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/lint/code-quality.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface QualityCheckResult {
  tool: string;
  success: boolean;
  issues: number;
  duration: number;
  output?: string;
}

function runESLint(): QualityCheckResult {
  const startTime = Date.now();

  try {
    console.log("🔍 Running ESLint...");
    const output = execSync("pnpm lint", { encoding: "utf-8" });
    const duration = Date.now() - startTime;

    // Parse ESLint output for issues
    const issues = (output.match(/(\d+)\s+error/)?.[1] || "0") + (output.match(/(\d+)\s+warn/)?.[1] || "0");

    console.log("✅ ESLint completed");
    return { tool: "ESLint", success: true, issues: parseInt(issues, 10), duration, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ ESLint failed");
    return { tool: "ESLint", success: false, issues: 0, duration, output: error.toString() };
  }
}

function runTypeCheck(): QualityCheckResult {
  const startTime = Date.now();

  try {
    console.log("🔍 Running TypeScript type check...");
    const output = execSync("pnpm typecheck", { encoding: "utf-8" });
    const duration = Date.now() - startTime;

    // Parse TypeScript output for errors
    const errors = output.match(/Found (\d+) errors?/)?.[1] || "0";

    console.log("✅ TypeScript check completed");
    return { tool: "TypeScript", success: true, issues: parseInt(errors, 10), duration, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ TypeScript check failed");
    return { tool: "TypeScript", success: false, issues: 0, duration, output: error.toString() };
  }
}

function runSecurityAudit(): QualityCheckResult {
  const startTime = Date.now();

  try {
    console.log("🔍 Running security audit...");
    const output = execSync("pnpm audit", { encoding: "utf-8" });
    const duration = Date.now() - startTime;

    // Parse audit output for vulnerabilities
    const vulnerabilities = output.match(/(\d+)\s+high/)?.[1] || "0";

    console.log("✅ Security audit completed");
    return { tool: "Security Audit", success: true, issues: parseInt(vulnerabilities, 10), duration, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Security audit failed");
    return { tool: "Security Audit", success: false, issues: 0, duration, output: error.toString() };
  }
}

function runCodeComplexityAnalysis(): QualityCheckResult {
  const startTime = Date.now();

  try {
    console.log("🔍 Running code complexity analysis...");
    const output = execSync("npx complexity-report --format json client/", { encoding: "utf-8" });
    const duration = Date.now() - startTime;

    // Parse complexity output
    const complexFunctions = output.match(/(\d+)\s+complex/)?.[1] || "0";

    console.log("✅ Complexity analysis completed");
    return { tool: "Complexity Analysis", success: true, issues: parseInt(complexFunctions, 10), duration, output };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Complexity analysis failed");
    return { tool: "Complexity Analysis", success: false, issues: 0, duration, output: error.toString() };
  }
}

function generateQualityReport(results: QualityCheckResult[]): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `code-quality-report-${Date.now()}.md`);
  const totalIssues = results.reduce((sum, r) => sum + r.issues, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const passedChecks = results.filter((r) => r.success).length;

  const checkResults = results
    .map((result) => {
      const emoji = result.success ? "✅" : "❌";
      return `- ${emoji} ${result.tool}: ${result.issues} issues, ${result.duration}ms`;
    })
    .join("\n");

  const report = `# Code Quality Report

**Timestamp**: ${new Date().toISOString()}
**Total Checks**: ${results.length}
**Passed**: ${passedChecks}
**Failed**: ${results.length - passedChecks}
**Total Issues**: ${totalIssues}
**Total Duration**: ${totalDuration}ms

## Check Results

${checkResults}

## Summary

${passedChecks === results.length ? "✅ All quality checks passed" : "❌ Some quality checks failed"}

${totalIssues > 0 ? `⚠️  Found ${totalIssues} total issues` : "✅ No issues found"}

## Recommendations

${totalIssues > 0 ? "- Address code quality issues" : "- Code quality is good"}
- Run \`pnpm lint --fix\` to auto-fix linting issues
- Review TypeScript errors and fix type issues
- Address security vulnerabilities
- Simplify complex functions

## Next Steps

1. Review detailed output for each check
2. Fix identified issues
3. Re-run quality checks to verify fixes
4. Consider adding pre-commit hooks for quality checks
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Code quality report saved to: ${reportFile}`);
}

async function main() {
  console.log("🔍 Cline Code Quality Hook");
  console.log("==========================");
  console.log("Running comprehensive code quality analysis...");

  const results: QualityCheckResult[] = [];

  // Run quality checks
  results.push(runESLint());
  results.push(runTypeCheck());
  results.push(runSecurityAudit());
  results.push(runCodeComplexityAnalysis());

  // Generate report
  generateQualityReport(results);

  const allPassed = results.every((r) => r.success);
  const totalIssues = results.reduce((sum, r) => sum + r.issues, 0);

  if (allPassed && totalIssues === 0) {
    console.log("\n✅ Code quality checks passed - no issues found!");
  } else {
    console.log("\n⚠️  Code quality issues found");
    console.log("💡 Check the report for details and take appropriate action");
  }
}

main().catch(console.error);