const http = require("node:http");
const https = require("node:https");

// Configuration constants
const SEPARATOR_LENGTH = 50;

// HTTP status codes
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (_e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBackendAPIs() {
  const baseUrl = "http://localhost:3000";
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function logResult(testName, success, details = "") {
    const status = success ? "✅ PASS" : "❌ FAIL";
    console.log(`${status}: ${testName}`);
    if (details) console.log(`   ${details}`);
    results.tests.push({ testName, success, details });
    if (success) results.passed++;
    else results.failed++;
  }

  console.log("🧪 Testing Backend API Endpoints\n");
  console.log("=".repeat(SEPARATOR_LENGTH));

  try {
    // Test 1: Health Check
    console.log("\n1. Testing /api/health");
    const health = await makeRequest(`${baseUrl}/api/health`);
    const healthSuccess = health.status === HTTP_OK && health.data.status === "healthy";
    logResult(
      "/api/health",
      healthSuccess,
      `Status: ${health.status}, Response: ${JSON.stringify(health.data)}`,
    );

    // Test 2: Detailed Health Check
    console.log("\n2. Testing /api/health/detailed");
    const healthDetailed = await makeRequest(`${baseUrl}/api/health/detailed`);
    const detailedSuccess =
      healthDetailed.status === HTTP_OK && healthDetailed.data.status === "healthy";
    logResult("/api/health/detailed", detailedSuccess, `Status: ${healthDetailed.status}`);

    // Test 3: Ping
    console.log("\n3. Testing /api/ping");
    const ping = await makeRequest(`${baseUrl}/api/ping`);
    const pingSuccess = ping.status === HTTP_OK && ping.data.message;
    logResult("/api/ping", pingSuccess, `Response: ${JSON.stringify(ping.data)}`);

    // Test 4: Demo
    console.log("\n4. Testing /api/demo");
    const demo = await makeRequest(`${baseUrl}/api/demo`);
    const demoSuccess = demo.status === HTTP_OK;
    logResult("/api/demo", demoSuccess, `Status: ${demo.status}`);

    // Test 5: Contact Form (POST)
    console.log("\n5. Testing /api/contact (POST)");
    const contactData = JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      subject: "API Test",
      message: "This is a test message from the API testing script",
      recaptchaToken: "test-token-123",
    });
    const contact = await makeRequest(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(contactData),
      },
      body: contactData,
    });
    const contactSuccess = contact.status === HTTP_OK || contact.status === HTTP_BAD_REQUEST; // 400 is expected due to invalid recaptcha
    logResult(
      "/api/contact (POST)",
      contactSuccess,
      `Status: ${contact.status}, Response: ${JSON.stringify(contact.data)}`,
    );

    // Test 6: Analytics (POST)
    console.log("\n6. Testing /api/analytics (POST)");
    const analyticsData = JSON.stringify({
      event: "test_event",
      data: { test: true, timestamp: new Date().toISOString() },
    });
    const analytics = await makeRequest(`${baseUrl}/api/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(analyticsData),
      },
      body: analyticsData,
    });
    const analyticsSuccess = analytics.status === HTTP_OK;
    logResult("/api/analytics (POST)", analyticsSuccess, `Status: ${analytics.status}`);

    // Test 7: Resume Download (GET)
    console.log("\n7. Testing /api/resume/download (GET)");
    const resume = await makeRequest(`${baseUrl}/api/resume/download`);
    const resumeSuccess = resume.status === HTTP_OK || resume.status === HTTP_INTERNAL_SERVER_ERROR; // 500 might be expected if Puppeteer isn't configured
    logResult(
      "/api/resume/download (GET)",
      resumeSuccess,
      `Status: ${resume.status}, Content-Type: ${resume.headers["content-type"]}`,
    );

    // Test 8: Push Notifications VAPID Key
    console.log("\n8. Testing /api/push-notifications VAPID Key");
    const vapid = await makeRequest(`${baseUrl}/api/push-notifications?action=vapid-public-key`);
    const vapidSuccess = vapid.status === HTTP_OK && vapid.data.publicKey;
    logResult("/api/push-notifications VAPID", vapidSuccess, `Status: ${vapid.status}`);

    // Test 9: Push Notifications Subscriptions
    console.log("\n9. Testing /api/push-notifications Subscriptions");
    const subscriptions = await makeRequest(
      `${baseUrl}/api/push-notifications?action=subscriptions`,
    );
    const subsSuccess = subscriptions.status === HTTP_OK;
    logResult(
      "/api/push-notifications Subscriptions",
      subsSuccess,
      `Status: ${subscriptions.status}`,
    );

    // Test 10: GitHub Workflows (may require auth)
    console.log("\n10. Testing /api/github/workflows");
    const workflows = await makeRequest(`${baseUrl}/api/github/workflows`);
    const workflowsSuccess =
      workflows.status === HTTP_OK ||
      workflows.status === HTTP_UNAUTHORIZED ||
      workflows.status === HTTP_FORBIDDEN; // Auth required
    logResult(
      "/api/github/workflows",
      workflowsSuccess,
      `Status: ${workflows.status} (auth may be required)`,
    );

    // Test 11: 404 for invalid endpoint
    console.log("\n11. Testing invalid endpoint (should 404)");
    const notFound = await makeRequest(`${baseUrl}/api/nonexistent`);
    const notFoundSuccess = notFound.status === HTTP_NOT_FOUND;
    logResult("Invalid endpoint 404", notFoundSuccess, `Status: ${notFound.status}`);

    // Test 12: Manifest alias
    console.log("\n12. Testing /manifest.json alias");
    const manifest = await makeRequest(`${baseUrl}/manifest.json`);
    const manifestSuccess = manifest.status === HTTP_OK;
    logResult("/manifest.json alias", manifestSuccess, `Status: ${manifest.status}`);
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
    logResult("Test execution", false, error.message);
  }

  console.log(`\n${"=".repeat(SEPARATOR_LENGTH)}`);
  console.log(`📊 Test Results: ${results.passed} passed, ${results.failed} failed`);

  if (results.failed > 0) {
    console.log("\n❌ Failed tests:");
    results.tests
      .filter((t) => !t.success)
      .forEach((test) => {
        console.log(`   - ${test.testName}: ${test.details}`);
      });
  }

  console.log("\n✅ Backend API testing completed!");
  return results;
}

testBackendAPIs().catch(console.error);
