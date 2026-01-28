/**
 * Playwright Configuration Validation and Health Check
 *
 * This module provides comprehensive validation for Playwright configurations
 * and health checks to ensure optimal test execution.
 */

import type { PlaywrightTestConfig } from "@playwright/test";
import { PRESET_CONFIGS } from "./playwright.config.shared";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Validation thresholds and scoring constants
 */
const VALIDATION_CONSTANTS = {
  // Worker limits
  MIN_WORKER_COUNT: 2,
  MAX_WORKER_COUNT: 8,

  // Timeout thresholds (in milliseconds)
  MIN_TEST_TIMEOUT_MS: 10000,
  MIN_ACTION_TIMEOUT_MS: 1000,

  // Browser project thresholds
  MIN_BROWSER_PROJECTS: 3,

  // Retry thresholds
  MAX_RETRY_COUNT: 5,

  // Score deductions
  SCORE_DEDUCTION_CRITICAL_WORKERS: 2,
  SCORE_DEDUCTION_TIMEOUT: 2,
  SCORE_DEDUCTION_ACTION_TIMEOUT: 1.5,
  SCORE_DEDUCTION_SETUP: 1,
  SCORE_DEDUCTION_HIGH_WORKERS: 0.5,
  SCORE_DEDUCTION_NO_PROJECTS: 2,
  SCORE_DEDUCTION_RETRY_STRATEGY: 0.5,
  SCORE_DEDUCTION_HIGH_RETRIES: 0.5,
  SCORE_DEDUCTION_NO_REPORTERS: 0.5,
  SCORE_DEDUCTION_NO_OUTPUT_DIR: 0.2,
  SCORE_DEDUCTION_NO_METADATA: 0.3,
  SCORE_DEDUCTION_NO_BASE_URL: 0.5,

  // Grade thresholds
  GRADE_A_PLUS_THRESHOLD: 9.5,
  GRADE_A_THRESHOLD: 8.5,
  GRADE_B_THRESHOLD: 7.0,
  GRADE_C_THRESHOLD: 5.0,
  GRADE_D_THRESHOLD: 3.0,

  // Summary thresholds
  SUMMARY_EXCELLENT_THRESHOLD: 9,
  SUMMARY_GOOD_THRESHOLD: 7,
  SUMMARY_DECENT_THRESHOLD: 5,

  // Display constants
  REPORT_WIDTH: 80,
} as const;

// =============================================================================
// CONFIGURATION HEALTH CHECK
// =============================================================================

export interface ConfigHealthReport {
  score: number; // 0-10 score
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  issues: Array<{
    severity: "critical" | "warning" | "info";
    category: "performance" | "reliability" | "maintainability" | "security";
    message: string;
    recommendation?: string;
  }>;
  strengths: string[];
  summary: string;
}

/**
 * Perform comprehensive health check on Playwright configuration
 */
export function healthCheckConfig(config: PlaywrightTestConfig): ConfigHealthReport {
  const issues: ConfigHealthReport["issues"] = [];
  const strengths: string[] = [];
  let score = 10; // Start with perfect score and deduct for issues

  // === CRITICAL CHECKS (Major score impact) ===

  // Check for hardcoded worker limits
  if (
    typeof config.workers === "number" &&
    config.workers <= VALIDATION_CONSTANTS.MIN_WORKER_COUNT &&
    !process.env.CI
  ) {
    issues.push({
      severity: "critical",
      category: "performance",
      message: "Hardcoded low worker count may limit performance",
      recommendation: "Use dynamic worker allocation based on CPU cores",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_CRITICAL_WORKERS;
  } else if (typeof config.workers === "number" || config.workers === undefined) {
    strengths.push("Dynamic worker allocation implemented");
  }

  // Check for proper timeout strategy
  if (!config.timeout || config.timeout < VALIDATION_CONSTANTS.MIN_TEST_TIMEOUT_MS) {
    issues.push({
      severity: "critical",
      category: "reliability",
      message: "Test timeout too low, may cause false failures",
      recommendation: "Set reasonable test timeout (60s+ for CI, 30s+ for local)",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_TIMEOUT;
  }

  if (
    !config.use?.actionTimeout ||
    config.use.actionTimeout < VALIDATION_CONSTANTS.MIN_ACTION_TIMEOUT_MS
  ) {
    issues.push({
      severity: "critical",
      category: "reliability",
      message: "Action timeout too low, may cause flaky tests",
      recommendation: "Set action timeout to at least 5s",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_ACTION_TIMEOUT;
  }

  // Check for global setup/teardown
  if (!config.globalSetup && !config.globalTeardown) {
    issues.push({
      severity: "warning",
      category: "reliability",
      message: "Missing global setup/teardown may affect test isolation",
      recommendation: "Implement global setup and teardown for better test isolation",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_SETUP;
  } else {
    strengths.push("Global setup/teardown configured for proper test isolation");
  }

  // === PERFORMANCE CHECKS ===

  // Check worker configuration
  if (
    config.workers &&
    typeof config.workers === "number" &&
    config.workers > VALIDATION_CONSTANTS.MAX_WORKER_COUNT
  ) {
    issues.push({
      severity: "warning",
      category: "performance",
      message: "Very high worker count may cause resource contention",
      recommendation: "Consider limiting workers based on CPU cores and memory",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_HIGH_WORKERS;
  }

  // Check browser projects
  if (!config.projects || config.projects.length === 0) {
    issues.push({
      severity: "critical",
      category: "reliability",
      message: "No browser projects configured",
      recommendation: "Configure at least one browser project",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_PROJECTS;
  } else if (config.projects.length >= VALIDATION_CONSTANTS.MIN_BROWSER_PROJECTS) {
    strengths.push("Comprehensive browser coverage configured");
  }

  // Check retry strategy
  if (config.retries === undefined || config.retries < 0) {
    issues.push({
      severity: "warning",
      category: "reliability",
      message: "Retry strategy not configured",
      recommendation: "Configure appropriate retry strategy (1-3 retries)",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_RETRY_STRATEGY;
  } else if (config.retries > VALIDATION_CONSTANTS.MAX_RETRY_COUNT) {
    issues.push({
      severity: "warning",
      category: "performance",
      message: "Very high retry count may mask real issues",
      recommendation: "Consider reducing retries and fixing underlying issues",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_HIGH_RETRIES;
  }

  // === MAINTAINABILITY CHECKS ===

  // Check for reporter configuration
  if (!config.reporter || (Array.isArray(config.reporter) && config.reporter.length === 0)) {
    issues.push({
      severity: "warning",
      category: "maintainability",
      message: "No reporters configured",
      recommendation: "Configure appropriate reporters for your environment",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_REPORTERS;
  } else {
    strengths.push("Reporting configuration present");
  }

  // Check for output directory
  if (!config.outputDir) {
    issues.push({
      severity: "info",
      category: "maintainability",
      message: "Output directory not specified",
      recommendation: "Specify output directory for better artifact organization",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_OUTPUT_DIR;
  }

  // Check for metadata
  if (!config.metadata || Object.keys(config.metadata).length === 0) {
    issues.push({
      severity: "info",
      category: "maintainability",
      message: "No metadata configured",
      recommendation: "Add metadata for better test tracking and debugging",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_METADATA;
  } else {
    strengths.push("Test metadata configured for better tracking");
  }

  // === SECURITY CHECKS ===

  // Check for proper base URL configuration
  if (!config.use?.baseURL) {
    issues.push({
      severity: "warning",
      category: "reliability",
      message: "Base URL not configured",
      recommendation: "Configure base URL for consistent test execution",
    });
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_BASE_URL;
  }

  // === ADDITIONAL STRENGTH CHECKS ===

  if (config.use?.trace) {
    strengths.push("Tracing configured for debugging support");
  }

  if (config.expect?.timeout) {
    strengths.push("Expect timeout configured for reliable assertions");
  }

  if (config.webServer) {
    strengths.push("Web server configuration present for local development");
  }

  if (config.fullyParallel) {
    strengths.push("Parallel execution enabled for better performance");
  }

  // === SCORE CALCULATION AND GRADING ===

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine grade
  let grade: ConfigHealthReport["grade"];
  if (score >= VALIDATION_CONSTANTS.GRADE_A_PLUS_THRESHOLD) grade = "A+";
  else if (score >= VALIDATION_CONSTANTS.GRADE_A_THRESHOLD) grade = "A";
  else if (score >= VALIDATION_CONSTANTS.GRADE_B_THRESHOLD) grade = "B";
  else if (score >= VALIDATION_CONSTANTS.GRADE_C_THRESHOLD) grade = "C";
  else if (score >= VALIDATION_CONSTANTS.GRADE_D_THRESHOLD) grade = "D";
  else grade = "F";

  // Generate summary
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let summary = `Configuration scored ${score.toFixed(1)}/10.0 (Grade: ${grade}). `;

  if (criticalCount > 0) {
    summary += `${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} need immediate attention. `;
  }

  if (warningCount > 0) {
    summary += `${warningCount} warning${warningCount > 1 ? "s" : ""} could be improved. `;
  }

  if (score >= VALIDATION_CONSTANTS.SUMMARY_EXCELLENT_THRESHOLD) {
    summary += "Excellent configuration with best practices implemented.";
  } else if (score >= VALIDATION_CONSTANTS.SUMMARY_GOOD_THRESHOLD) {
    summary += "Good configuration with minor improvements needed.";
  } else if (score >= VALIDATION_CONSTANTS.SUMMARY_DECENT_THRESHOLD) {
    summary += "Decent configuration but several areas need attention.";
  } else {
    summary += "Configuration needs significant improvements.";
  }

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    grade,
    issues,
    strengths,
    summary,
  };
}

/**
 * Validate all preset configurations
 */
export function validateAllConfigs(): Record<string, ConfigHealthReport> {
  const results: Record<string, ConfigHealthReport> = {};

  for (const [name, configFactory] of Object.entries(PRESET_CONFIGS)) {
    try {
      const config = configFactory();
      results[name] = healthCheckConfig(config);
    } catch (error) {
      results[name] = {
        score: 0,
        grade: "F",
        issues: [
          {
            severity: "critical",
            category: "reliability",
            message: `Configuration creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        strengths: [],
        summary: "Configuration creation failed",
      };
    }
  }

  return results;
}

/**
 * Generate configuration report as string
 */
export function generateConfigReport(): string {
  let output = "\n🎭 Playwright Configuration Health Report";
  output += `\n${"═".repeat(VALIDATION_CONSTANTS.REPORT_WIDTH)}`;

  const results = validateAllConfigs();

  for (const [configName, report] of Object.entries(results)) {
    output += `\n\n📊 ${configName.toUpperCase()} Configuration:`;
    output += `\n   Score: ${report.score}/10.0 (${report.grade})`;
    output += `\n   ${report.summary}\n`;

    if (report.strengths.length > 0) {
      output += "\n   ✅ Strengths:";
      report.strengths.forEach((strength) => {
        output += `\n      • ${strength}`;
      });
      output += "\n";
    }

    if (report.issues.length > 0) {
      output += "\n   🔍 Issues:";
      report.issues.forEach((issue) => {
        const icon =
          issue.severity === "critical" ? "❌" : issue.severity === "warning" ? "⚠️" : "ℹ️";
        output += `\n      ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`;
        if (issue.recommendation) {
          output += `\n         💡 ${issue.recommendation}`;
        }
      });
      output += "\n";
    }
  }

  // Overall summary
  const avgScore =
    Object.values(results).reduce((sum, r) => sum + r.score, 0) / Object.values(results).length;
  output += `\n🎯 Overall Average Score: ${avgScore.toFixed(1)}/10.0`;
  output += `\n${"═".repeat(VALIDATION_CONSTANTS.REPORT_WIDTH)}`;

  return output;
}

// Run report if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  // biome-ignore lint/suspicious/noConsole: Direct script execution for debugging is appropriate
  console.log(generateConfigReport());
}
