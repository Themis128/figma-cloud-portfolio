import {
  createPlaywrightConfig,
  healthCheckConfig,
} from "./playwright.config.shared";

// Configuration validation script
const config = createPlaywrightConfig("development");

// Run health check
const health = healthCheckConfig(config);

// Output results
console.log("\n🎭 Playwright Configuration Health Check");
console.log("═".repeat(60));
console.log(`Score: ${health.score}/10 (${health.grade})`);
console.log("═".repeat(60));

if (health.issues.length > 0) {
  console.log("\n⚠️  Issues Found:");
  health.issues.forEach((issue, index) => {
    console.log(
      `\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`,
    );
    console.log(`   Recommendation: ${issue.recommendation}`);
  });
}

if (health.recommendations.length > 0) {
  console.log("\nℹ️  Recommendations:");
  health.recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. ${rec}`);
  });
}

console.log("\n✅ Configuration validation completed");
console.log("═".repeat(60));
