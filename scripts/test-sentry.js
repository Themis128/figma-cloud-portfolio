/**
 * Sentry Test Script
 * Tests Sentry integration by sending test events
 */

import * as Sentry from "@sentry/node";

// Initialize Sentry with current configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
  debug: true, // Enable debug mode for testing
});

console.log("🧪 Sentry Test Suite");
console.log("====================\n");

console.log("Configuration:");
console.log(`- DSN: ${process.env.SENTRY_DSN ? "✅ Set" : "❌ Not set"}`);
console.log(
  `- Environment: ${process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development"}`,
);
console.log(`- Traces Sample Rate: ${process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"}\n`);

// Test 1: Send a test message
console.log("Test 1: Sending test message...");
Sentry.captureMessage("Sentry test message from portfolio app", "info");
console.log("✅ Test message sent\n");

// Test 2: Send a test error
console.log("Test 2: Sending test error...");
try {
  throw new Error("Sentry test error - this is intentional");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Test error captured\n");
}

// Test 3: Test breadcrumb
console.log("Test 3: Adding breadcrumb...");
Sentry.addBreadcrumb({
  category: "test",
  message: "Test breadcrumb",
  level: "info",
});
console.log("✅ Breadcrumb added\n");

// Test 4: Test with custom context
console.log("Test 4: Sending error with custom context...");
Sentry.withScope((scope) => {
  scope.setTag("test_type", "integration_test");
  scope.setContext("test_data", {
    timestamp: new Date().toISOString(),
    node_version: process.version,
  });
  Sentry.captureMessage("Test with custom context", "warning");
});
console.log("✅ Message with context sent\n");

// Flush events and exit
const SENTRY_CLOSE_TIMEOUT_MS = 2000;
console.log("Flushing Sentry events...");
Sentry.close(SENTRY_CLOSE_TIMEOUT_MS).then(() => {
  console.log("\n✅ All tests complete!");
  console.log("\nCheck your Sentry dashboard at:");
  console.log("https://sentry.io/organizations/your-org/issues/\n");
  console.log("You should see 2 messages and 1 error within 30 seconds.");
  process.exit(0);
});
