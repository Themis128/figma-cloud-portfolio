/**
 * Playwright Configuration Validation and Health Check
 *
 * This module provides comprehensive validation for Playwright configurations
 * and health checks to ensure optimal test execution.
 */

import * as os from 'node:os'
import type { PlaywrightTestConfig } from '@playwright/test'
import { PRESET_CONFIGS } from './playwright.config.shared.ts'

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

  // Worker calculation constants
  WORKER_MULTIPLIER: 1.5,
  MIN_WORKER_BASE: 8,

  // Timeout thresholds (in milliseconds)
  MIN_TEST_TIMEOUT_MS: 10000,
  MIN_ACTION_TIMEOUT_MS: 1000,

  // Browser project thresholds
  MIN_BROWSER_PROJECTS: 3,

  // Retry thresholds
  MAX_RETRY_COUNT: 5,

  // Score deductions (adjusted for better balance)
  SCORE_DEDUCTION_CRITICAL_WORKERS: 1.5, // Reduced from 2
  SCORE_DEDUCTION_TIMEOUT: 1.5, // Reduced from 2
  SCORE_DEDUCTION_ACTION_TIMEOUT: 1, // Reduced from 1.5
  SCORE_DEDUCTION_SETUP: 0.5, // Reduced from 1
  SCORE_DEDUCTION_HIGH_WORKERS: 0.3, // Reduced from 0.5
  SCORE_DEDUCTION_NO_PROJECTS: 1.5, // Reduced from 2
  SCORE_DEDUCTION_RETRY_STRATEGY: 0.3, // Reduced from 0.5
  SCORE_DEDUCTION_HIGH_RETRIES: 0.3, // Reduced from 0.5
  SCORE_DEDUCTION_NO_REPORTERS: 0.3, // Reduced from 0.5
  SCORE_DEDUCTION_NO_OUTPUT_DIR: 0.1, // Reduced from 0.2
  SCORE_DEDUCTION_NO_METADATA: 0.2, // Reduced from 0.3
  SCORE_DEDUCTION_NO_BASE_URL: 0.3, // Reduced from 0.5

  // Bonus scores
  SCORE_BONUS_COMPREHENSIVE_METADATA: 0.2,
  MIN_METADATA_KEYS_FOR_BONUS: 5,

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

  // Browser launch argument validation
  SCORE_DEDUCTION_BROWSER_ARGS: 0.3,
  SCORE_DEDUCTION_PERFORMANCE_ARGS: 0.2,
  SCORE_DEDUCTION_REDUNDANT_ARGS: 0.1,

  // Performance validation thresholds
  MAX_BROWSER_ARGS_COUNT: 50, // Maximum reasonable number of launch args
  MIN_PERFORMANCE_ARGS: 5, // Minimum performance optimizations
  MIN_PERFORMANCE_ARGS_NON_CHROMIUM: 4, // Lower threshold for Firefox/WebKit
  MAX_DUPLICATE_ARGS: 2, // Maximum allowed duplicate args

  // Report formatting
  REPORT_WIDTH: 80,
} as const

// =============================================================================
// CONFIGURATION HEALTH CHECK
// =============================================================================

export interface ConfigHealthReport {
  score: number // 0-10 score
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  issues: Array<{
    severity: 'critical' | 'warning' | 'info'
    category: 'performance' | 'reliability' | 'maintainability' | 'security'
    message: string
    recommendation?: string
  }>
  strengths: string[]
  summary: string
}

/**
 * Perform comprehensive health check on Playwright configuration
 */
export function healthCheckConfig(config: PlaywrightTestConfig): ConfigHealthReport {
  const issues: ConfigHealthReport['issues'] = []
  const strengths: string[] = []
  let score = 10 // Start with perfect score and deduct for issues

  // === CRITICAL CHECKS (Major score impact) ===

  // Check for hardcoded worker limits
  if (
    typeof config.workers === 'number' &&
    config.workers <= VALIDATION_CONSTANTS.MIN_WORKER_COUNT &&
    !process.env.CI &&
    !config.metadata?.environment?.includes('isolated') // Allow single worker for isolated mode
  ) {
    issues.push({
      severity: 'critical',
      category: 'performance',
      message: 'Hardcoded low worker count may limit performance',
      recommendation: 'Use dynamic worker allocation based on CPU cores',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_CRITICAL_WORKERS
  } else if (typeof config.workers === 'number' || config.workers === undefined) {
    strengths.push('Dynamic worker allocation implemented')
  }

  // Check for proper timeout strategy
  if (!config.timeout || config.timeout < VALIDATION_CONSTANTS.MIN_TEST_TIMEOUT_MS) {
    issues.push({
      severity: 'critical',
      category: 'reliability',
      message: 'Test timeout too low, may cause false failures',
      recommendation: 'Set reasonable test timeout (60s+ for CI, 30s+ for local)',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_TIMEOUT
  }

  if (
    !config.use?.actionTimeout ||
    config.use.actionTimeout < VALIDATION_CONSTANTS.MIN_ACTION_TIMEOUT_MS
  ) {
    issues.push({
      severity: 'critical',
      category: 'reliability',
      message: 'Action timeout too low, may cause flaky tests',
      recommendation: 'Set action timeout to at least 5s',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_ACTION_TIMEOUT
  }

  // Check for global setup/teardown
  if (config.globalSetup || config.globalTeardown) {
    strengths.push('Global setup/teardown configured for proper test isolation')
  } else {
    // Allow fast mode to skip global setup for speed
    if (!config.metadata?.environment?.includes('fast')) {
      issues.push({
        severity: 'info', // Changed from warning to info
        category: 'reliability',
        message: 'Missing global setup/teardown may affect test isolation',
        recommendation: 'Implement global setup and teardown for better test isolation',
      })
      score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_SETUP
    }
  }

  // === PERFORMANCE CHECKS ===

  // Check worker configuration
  const maxRecommendedWorkers = Math.max(
    VALIDATION_CONSTANTS.MIN_WORKER_BASE,
    Math.floor(os.cpus().length * VALIDATION_CONSTANTS.WORKER_MULTIPLIER),
  )
  if (
    config.workers &&
    typeof config.workers === 'number' &&
    config.workers > maxRecommendedWorkers
  ) {
    issues.push({
      severity: 'warning',
      category: 'performance',
      message: `Worker count (${config.workers}) may cause resource contention on ${os.cpus().length} CPU cores`,
      recommendation: `Consider limiting workers to ${maxRecommendedWorkers} for better resource management`,
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_HIGH_WORKERS
  }

  // Check browser projects
  if (!config.projects || config.projects.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'reliability',
      message: 'No browser projects configured',
      recommendation: 'Configure at least one browser project',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_PROJECTS
  } else if (config.projects.length >= VALIDATION_CONSTANTS.MIN_BROWSER_PROJECTS) {
    strengths.push('Comprehensive browser coverage configured')
  }

  // Check retry strategy
  if (config.retries === undefined || config.retries < 0) {
    issues.push({
      severity: 'warning',
      category: 'reliability',
      message: 'Retry strategy not configured',
      recommendation: 'Configure appropriate retry strategy (1-3 retries)',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_RETRY_STRATEGY
  } else if (config.retries > VALIDATION_CONSTANTS.MAX_RETRY_COUNT) {
    issues.push({
      severity: 'warning',
      category: 'performance',
      message: 'Very high retry count may mask real issues',
      recommendation: 'Consider reducing retries and fixing underlying issues',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_HIGH_RETRIES
  }

  // === MAINTAINABILITY CHECKS ===

  // Check for reporter configuration
  if (!config.reporter || (Array.isArray(config.reporter) && config.reporter.length === 0)) {
    issues.push({
      severity: 'warning',
      category: 'maintainability',
      message: 'No reporters configured',
      recommendation: 'Configure appropriate reporters for your environment',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_REPORTERS
  } else {
    strengths.push('Reporting configuration present')
  }

  // Check for output directory
  if (!config.outputDir) {
    issues.push({
      severity: 'info',
      category: 'maintainability',
      message: 'Output directory not specified',
      recommendation: 'Specify output directory for better artifact organization',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_OUTPUT_DIR
  }

  // Check for metadata
  if (!config.metadata || Object.keys(config.metadata).length === 0) {
    issues.push({
      severity: 'info',
      category: 'maintainability',
      message: 'No metadata configured',
      recommendation: 'Add metadata for better test tracking and debugging',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_METADATA
  } else {
    // Bonus points for comprehensive metadata
    const metadataKeys = Object.keys(config.metadata)
    if (metadataKeys.length >= VALIDATION_CONSTANTS.MIN_METADATA_KEYS_FOR_BONUS) {
      score += VALIDATION_CONSTANTS.SCORE_BONUS_COMPREHENSIVE_METADATA // Small bonus for comprehensive metadata
    }
    strengths.push('Test metadata configured for better tracking')
  }

  // === SECURITY CHECKS ===

  // Check for proper base URL configuration
  if (!config.use?.baseURL) {
    issues.push({
      severity: 'warning',
      category: 'reliability',
      message: 'Base URL not configured',
      recommendation: 'Configure base URL for consistent test execution',
    })
    score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_NO_BASE_URL
  }

  // === BROWSER LAUNCH ARGUMENT VALIDATION ===

  // Check browser projects for launch arguments
  if (config.projects && Array.isArray(config.projects)) {
    for (const project of config.projects) {
      if (project.use?.launchOptions?.args) {
        const args = project.use.launchOptions.args as string[]

        // Check for excessive arguments
        if (args.length > VALIDATION_CONSTANTS.MAX_BROWSER_ARGS_COUNT) {
          issues.push({
            severity: 'warning',
            category: 'performance',
            message: `Browser project '${project.name}' has ${args.length} launch arguments (max recommended: ${VALIDATION_CONSTANTS.MAX_BROWSER_ARGS_COUNT})`,
            recommendation: 'Review and optimize browser launch arguments for better performance',
          })
          score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_BROWSER_ARGS
        }

        // Check for duplicate arguments
        const uniqueArgs = new Set(args)
        const duplicates = args.length - uniqueArgs.size
        if (duplicates > VALIDATION_CONSTANTS.MAX_DUPLICATE_ARGS) {
          issues.push({
            severity: 'info',
            category: 'maintainability',
            message: `Browser project '${project.name}' has ${duplicates} duplicate launch arguments`,
            recommendation: 'Remove duplicate browser launch arguments',
          })
          score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_REDUNDANT_ARGS
        }

        // Check for conflicting arguments (more precise detection)
        const conflictingPairs = [
          // Only truly conflicting combinations
          ['--disable-gpu', '--use-gl=desktop'], // GPU disable vs specific GL usage
          ['--no-sandbox', '--disable-setuid-sandbox'], // Redundant sandbox options
          ['--disable-web-security', '--disable-features=VizDisplayCompositor'], // Security vs compositor
        ]

        for (const [arg1, arg2] of conflictingPairs) {
          // More precise matching - check for exact arg matches
          const hasArg1 = args.some((arg) => arg === arg1 || arg.startsWith(`${arg1}=`))
          const hasArg2 = args.some((arg) => arg === arg2 || arg.startsWith(`${arg2}=`))

          if (hasArg1 && hasArg2) {
            issues.push({
              severity: 'warning',
              category: 'reliability',
              message: `Browser project '${project.name}' has potentially conflicting launch arguments: ${arg1} and ${arg2}`,
              recommendation: 'Review conflicting browser launch arguments',
            })
            score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_BROWSER_ARGS
          }
        }

        // Check for performance optimizations (browser-aware)
        const isChromium =
          project.name.toLowerCase().includes('chrome') ||
          project.name.toLowerCase().includes('chromium')
        const isFirefox = project.name.toLowerCase().includes('firefox')
        const isWebKit =
          project.name.toLowerCase().includes('webkit') ||
          project.name.toLowerCase().includes('safari')

        let performanceArgs: string[] = []
        if (isChromium) {
          performanceArgs = [
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--memory-pressure-off',
            '--max_old_space_size',
          ]
        } else if (isFirefox || isWebKit) {
          // Firefox and WebKit support fewer performance args
          performanceArgs = [
            '--disable-dev-shm-usage',
            '--memory-pressure-off',
            '--max_old_space_size',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
          ]
        }

        const performanceCount = performanceArgs.filter((arg) =>
          args.some((launchArg) => launchArg.includes(arg)),
        ).length

        const minPerformanceArgs = isChromium
          ? VALIDATION_CONSTANTS.MIN_PERFORMANCE_ARGS
          : VALIDATION_CONSTANTS.MIN_PERFORMANCE_ARGS_NON_CHROMIUM

        if (performanceCount < minPerformanceArgs) {
          issues.push({
            severity: 'info',
            category: 'performance',
            message: `Browser project '${project.name}' has limited performance optimizations (${performanceCount}/${minPerformanceArgs})`,
            recommendation: 'Consider adding more performance-focused browser launch arguments',
          })
          score -= VALIDATION_CONSTANTS.SCORE_DEDUCTION_PERFORMANCE_ARGS
        } else {
          strengths.push(`Browser project '${project.name}' has good performance optimizations`)
        }
      }
    }
  }

  // === ADDITIONAL STRENGTH CHECKS ===

  if (config.use?.trace) {
    strengths.push('Tracing configured for debugging support')
  }

  if (config.expect?.timeout) {
    strengths.push('Expect timeout configured for reliable assertions')
  }

  if (config.webServer) {
    strengths.push('Web server configuration present for local development')
  }

  if (config.fullyParallel) {
    strengths.push('Parallel execution enabled for better performance')
  }

  // === SCORE CALCULATION AND GRADING ===

  // Ensure score doesn't go below 0 and cap at 10.0
  score = Math.max(0, Math.min(10, score))

  // Determine grade
  let grade: ConfigHealthReport['grade']
  if (score >= VALIDATION_CONSTANTS.GRADE_A_PLUS_THRESHOLD) grade = 'A+'
  else if (score >= VALIDATION_CONSTANTS.GRADE_A_THRESHOLD) grade = 'A'
  else if (score >= VALIDATION_CONSTANTS.GRADE_B_THRESHOLD) grade = 'B'
  else if (score >= VALIDATION_CONSTANTS.GRADE_C_THRESHOLD) grade = 'C'
  else if (score >= VALIDATION_CONSTANTS.GRADE_D_THRESHOLD) grade = 'D'
  else grade = 'F'

  // Generate summary
  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length

  let summary = `Configuration scored ${score.toFixed(1)}/10.0 (Grade: ${grade}). `

  if (criticalCount > 0) {
    summary += `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} need immediate attention. `
  }

  if (warningCount > 0) {
    summary += `${warningCount} warning${warningCount > 1 ? 's' : ''} could be improved. `
  }

  if (score >= VALIDATION_CONSTANTS.SUMMARY_EXCELLENT_THRESHOLD) {
    summary += 'Excellent configuration with best practices implemented.'
  } else if (score >= VALIDATION_CONSTANTS.SUMMARY_GOOD_THRESHOLD) {
    summary += 'Good configuration with minor improvements needed.'
  } else if (score >= VALIDATION_CONSTANTS.SUMMARY_DECENT_THRESHOLD) {
    summary += 'Decent configuration but several areas need attention.'
  } else {
    summary += 'Configuration needs significant improvements.'
  }

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    grade,
    issues,
    strengths,
    summary,
  }
}

/**
 * Validate all preset configurations
 */
export function validateAllConfigs(): Record<string, ConfigHealthReport> {
  const results: Record<string, ConfigHealthReport> = {}

  for (const [name, configFactory] of Object.entries(PRESET_CONFIGS)) {
    try {
      const config = configFactory()
      results[name] = healthCheckConfig(config)
    } catch (error) {
      results[name] = {
        score: 0,
        grade: 'F',
        issues: [
          {
            severity: 'critical',
            category: 'reliability',
            message: `Configuration creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        strengths: [],
        summary: 'Configuration creation failed',
      }
    }
  }

  return results
}

/**
 * Generate configuration report as string
 */
export function generateConfigReport(): string {
  let output = '\n🎭 Playwright Configuration Health Report'
  output += `\n${'═'.repeat(VALIDATION_CONSTANTS.REPORT_WIDTH)}`

  const results = validateAllConfigs()

  for (const [configName, report] of Object.entries(results)) {
    output += `\n\n📊 ${configName.toUpperCase()} Configuration:`
    output += `\n   Score: ${report.score}/10.0 (${report.grade})`
    output += `\n   ${report.summary}\n`

    if (report.strengths.length > 0) {
      output += '\n   ✅ Strengths:'
      report.strengths.forEach((strength) => {
        output += `\n      • ${strength}`
      })
      output += '\n'
    }

    if (report.issues.length > 0) {
      output += '\n   🔍 Issues:'
      report.issues.forEach((issue) => {
        const icon = issue.severity === 'critical' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
        output += `\n      ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`
        if (issue.recommendation) {
          output += `\n         💡 ${issue.recommendation}`
        }
      })
      output += '\n'
    }
  }

  // Overall summary
  const avgScore =
    Object.values(results).reduce((sum, r) => sum + r.score, 0) / Object.values(results).length
  output += `\n🎯 Overall Average Score: ${avgScore.toFixed(1)}/10.0`
  output += `\n${'═'.repeat(VALIDATION_CONSTANTS.REPORT_WIDTH)}`

  return output
}

// Run report if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  // biome-ignore lint/suspicious/noConsole: Direct script execution for debugging is appropriate
  console.log(generateConfigReport())
}

/**
 * Analyze browser launch arguments and provide optimization recommendations
 */
export function analyzeBrowserArgs(args: string[]): {
  recommendations: string[]
  score: number
  issues: string[]
} {
  const recommendations: string[] = []
  const issues: string[] = []
  let score = 10

  // Constants for scoring
  const PROBLEMATIC_COMBO_PENALTY = 0.5
  const MISSING_ARGS_PENALTY = 0.2
  const MAX_RECOMMENDED_ARGS_SHOWN = 3

  // Check for known problematic combinations
  const problematicCombos = [
    {
      args: ['--disable-gpu', '--use-gl=desktop'],
      issue: 'Conflicting GPU settings',
      fix: 'Remove --disable-gpu or --use-gl=desktop',
    },
    {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      issue: 'Redundant sandbox disabling',
      fix: 'Use only --no-sandbox for most cases',
    },
    {
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
      issue: 'Web security and compositor conflict',
      fix: 'Choose one security approach',
    },
  ]

  for (const combo of problematicCombos) {
    const hasAllArgs = combo.args.every((arg) =>
      args.some((launchArg) => launchArg.includes(arg.split('=')[0])),
    )
    if (hasAllArgs) {
      issues.push(combo.issue)
      recommendations.push(combo.fix)
      score -= PROBLEMATIC_COMBO_PENALTY
    }
  }

  // Check for missing modern optimizations
  const recommendedArgs = [
    '--disable-dev-shm-usage',
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
  ]

  const missingArgs = recommendedArgs.filter(
    (arg) => !args.some((launchArg) => launchArg.includes(arg.split('=')[0])),
  )

  if (missingArgs.length > 0) {
    recommendations.push(
      `Consider adding: ${missingArgs.slice(0, MAX_RECOMMENDED_ARGS_SHOWN).join(', ')}`,
    )
    score -= MISSING_ARGS_PENALTY
  }

  // General recommendation for browser-specific args
  recommendations.push('Ensure browser-specific arguments are properly configured')

  return { recommendations, score: Math.max(0, score), issues }
}
