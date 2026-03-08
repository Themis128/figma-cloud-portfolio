#!/usr/bin/env tsx
/**
 * PR Merge Preparation Hook
 * Prepares a pull request for merging
 * Runs final checks and cleanup
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/tasks/pr-merge-preparation.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface MergePreparationResult {
  branch: string;
  status: "ready" | "needs-work" | "blocked";
  checks: CheckResult[];
  timestamp: string;
}

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

function runLinting(): CheckResult {
  try {
    console.log("🔍 Running final linting...");
    execSync("pnpm lint", { stdio: "inherit" });
    console.log("✅ Linting passed");
    return { name: "Linting", passed: true, details: "All linting rules passed" };
  } catch (error) {
    console.error("❌ Linting failed");
    return { name: "Linting", passed: false, details: error.toString() };
  }
}

function runTypeCheck(): CheckResult {
  try {
    console.log("🔍 Running final type check...");
    execSync("pnpm typecheck", { stdio: "inherit" });
    console.log("✅ Type check passed");
    return { name: "Type Check", passed: true, details: "No TypeScript errors" };
  } catch (error) {
    console.error("❌ Type check failed");
    return { name: "Type Check", passed: false, details: error.toString() };
  }
}

function runTests(): CheckResult {
  try {
    console.log("🧪 Running final tests...");
    execSync("pnpm test", { stdio: "inherit" });
    console.log("✅ Tests passed");
    return { name: "Tests", passed: true, details: "All tests passing" };
  } catch (error) {
    console.error("❌ Tests failed");
    return { name: "Tests", passed: false, details: error.toString() };
  }
}

function checkCommitMessages(): CheckResult {
  try {
    console.log("📝 Checking commit messages...");
    const commits = execSync("git log --oneline HEAD~5..HEAD", { encoding: "utf-8" });
    
    const conventionalCommits = commits.split("\n").filter(Boolean).every(commit => {
      return /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/.test(commit);
    });

    if (conventionalCommits) {
      console.log("✅ Commit messages follow conventional format");
      return { name: "Commit Messages", passed: true, details: "All commits follow conventional format" };
    } else {
      console.log("⚠️  Some commit messages don't follow conventional format");
      return { name: "Commit Messages", passed: false, details: "Some commits don't follow conventional format" };
    }
  } catch (error) {
    console.error("❌ Failed to check commit messages");
    return { name: "Commit Messages", passed: false, details: error.toString() };
  }
}

function checkMergeConflicts(): CheckResult {
  try {
    console.log("🔍 Checking for merge conflicts...");
    const status = execSync("git status --porcelain", { encoding: "utf-8" });
    
    if (status.includes("CONFLICT")) {
      console.log("❌ Merge conflicts detected");
      return { name: "Merge Conflicts", passed: false, details: "Merge conflicts need to be resolved" };
    } else {
      console.log("✅ No merge conflicts");
      return { name: "Merge Conflicts", passed: true, details: "No conflicts detected" };
    }
  } catch (error) {
    console.error("❌ Failed to check merge conflicts");
    return { name: "Merge Conflicts", passed: false, details: error.toString() };
  }
}

function generateMergeReport(result: MergePreparationResult): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `merge-preparation-report-${Date.now()}.md`);
  const passedChecks = result.checks.filter(c => c.passed).length;
  const totalChecks = result.checks.length;

  const checkResults = result.checks
    .map((check) => {
      const emoji = check.passed ? "✅" : "❌";
      return `- ${emoji} ${check.name}: ${check.details}`;
    })
    .join("\n");

  const statusEmoji = result.status === "ready" ? "✅" : result.status === "needs-work" ? "⚠️" : "❌";

  const report = `# PR Merge Preparation Report

**Branch**: ${result.branch}
**Status**: ${statusEmoji} ${result.status.toUpperCase()}
**Timestamp**: ${result.timestamp}
**Checks Passed**: ${passedChecks}/${totalChecks}

## Check Results

${checkResults}

## Summary

${result.status === "ready" ? "✅ Ready for merge" : result.status === "needs-work" ? "⚠️  Needs work before merge" : "❌ Blocked from merge"}

## Next Steps

${result.status === "ready" ? 
  "1. Create pull request\n2. Request code review\n3. Merge after approval" : 
  result.status === "needs-work" ? 
  "1. Address failing checks\n2. Re-run preparation\n3. Verify fixes" : 
  "1. Resolve blocking issues\n2. Re-run preparation\n3. Verify fixes"}

## Merge Checklist

- [${result.checks.every(c => c.passed) ? "x" : " "}] All checks passed
- [${result.checks.some(c => c.passed) ? "x" : " "}] Code review completed
- [ ] Documentation updated (if needed)
- [ ] Tests passing
- [ ] No merge conflicts
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Merge preparation report saved to: ${reportFile}`);
}

async function main() {
  const branch = process.argv[2] || execSync("git branch --show-current", { encoding: "utf-8" }).trim();

  console.log("🔀 Cline PR Merge Preparation Hook");
  console.log("==================================");
  console.log(`🌿 Branch: ${branch}`);

  const checks = [
    runLinting(),
    runTypeCheck(),
    runTests(),
    checkCommitMessages(),
    checkMergeConflicts(),
  ];

  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;

  let status: "ready" | "needs-work" | "blocked";

  if (passedChecks === totalChecks) {
    status = "ready";
  } else if (passedChecks >= totalChecks * 0.6) {
    status = "needs-work";
  } else {
    status = "blocked";
  }

  const result: MergePreparationResult = {
    branch,
    status,
    checks,
    timestamp: new Date().toISOString(),
  };

  // Generate report
  generateMergeReport(result);

  if (status === "ready") {
    console.log("\n✅ Ready for merge!");
    console.log("💡 Create PR and request review");
  } else if (status === "needs-work") {
    console.log("\n⚠️  Needs work before merge");
    console.log("💡 Address failing checks and re-run preparation");
  } else {
    console.log("\n❌ Blocked from merge");
    console.log("💡 Resolve critical issues before proceeding");
  }
}

main().catch(console.error);