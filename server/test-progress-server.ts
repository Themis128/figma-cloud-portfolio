import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import { Server } from "socket.io";

interface TestProgress {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  running: number;
  progress: number;
  currentTest: string;
  timestamp: number;
}

interface TestSuite {
  name: string;
  tests: TestTest[];
  passed: number;
  failed: number;
  skipped: number;
  running: number;
}

interface TestTest {
  name: string;
  status: "pass" | "fail" | "skip" | "running";
  duration?: number;
}

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  suite: string;
  message: string;
  timestamp: Date;
}

class TestProgressServer {
  private app: express.Application;
  private server: import("http").Server;
  private io: Server;
  private progress: TestProgress;
  private testSuites: TestSuite[];
  private logs: LogEntry[] = [];
  private logBuffer: LogEntry[] = [];
  private isTestRunning = false;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.progress = {
      total: 985,
      passed: 0,
      failed: 0,
      skipped: 0,
      running: 985,
      progress: 0,
      currentTest: "Initializing test execution...",
      timestamp: Date.now(),
    };

    this.testSuites = [
      {
        name: "API Endpoints",
        tests: this.generateTestList("API Endpoints", 10),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 10,
      },
      {
        name: "Portfolio Features",
        tests: this.generateTestList("Portfolio Features", 15),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 15,
      },
      {
        name: "PWA Features",
        tests: this.generateTestList("PWA Features", 15),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 15,
      },
      {
        name: "Image Optimization",
        tests: this.generateTestList("Image Optimization", 6),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 6,
      },
      {
        name: "Logo Optimization",
        tests: this.generateTestList("Logo Optimization", 5),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 5,
      },
      {
        name: "Resume Generation",
        tests: this.generateTestList("Resume Generation", 4),
        passed: 0,
        failed: 0,
        skipped: 0,
        running: 4,
      },
    ];

    this.setupRoutes();
    this.setupSocketEvents();
    this.startProgressSimulation();
    this.startLogGeneration();
  }

  private generateTestList(suiteName: string, count: number): TestTest[] {
    const tests: TestTest[] = [];
    for (let i = 1; i <= count; i++) {
      tests.push({
        name: `${suiteName} Test ${i}`,
        status: "running",
      });
    }
    return tests;
  }

  private setupRoutes() {
    // Serve the visual progress dashboard
    this.app.get("/", (_req, res) => {
      res.sendFile(join(__dirname, "../playwright-tests/visual-progress.html"));
    });

    // API endpoint for test progress
    this.app.get("/api/progress", (_req, res) => {
      res.json({
        ...this.progress,
        testSuites: this.testSuites,
        logs: this.logs.slice(-100), // Return last 100 logs
      });
    });

    // API endpoint for logs
    this.app.get("/api/logs", (req, res) => {
      const level = req.query.level as string;
      const search = req.query.search as string;

      let filteredLogs = [...this.logs];

      if (level && level !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.level === level);
      }

      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message.toLowerCase().includes(lowerSearch) ||
            log.suite.toLowerCase().includes(lowerSearch),
        );
      }

      res.json(filteredLogs.slice(-200)); // Return last 200 logs
    });

    // API endpoint to add logs
    this.app.post("/api/log", express.json(), (req, res) => {
      const { level, suite, message } = req.body;
      this.addLog(level, suite, message);
      res.json({ success: true });
    });

    // API endpoint to update test status
    this.app.post("/api/test-status", express.json(), (req, res) => {
      const { suiteName, testName, status, duration } = req.body;
      this.updateTestStatus(suiteName, testName, status, duration);
      res.json({ success: true });
    });

    // Serve static files
    this.app.use("/playwright-tests", express.static(join(__dirname, "../playwright-tests")));
    this.app.use("/test-results", express.static(join(__dirname, "../test-results")));
    this.app.use("/playwright-report", express.static(join(__dirname, "../playwright-report")));
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Send current progress to new client
      socket.emit("progress-update", this.progress);
      socket.emit("test-suites-update", this.testSuites);
      socket.emit("logs-update", this.logs.slice(-50));

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });

      socket.on("request-refresh", () => {
        socket.emit("progress-update", this.progress);
        socket.emit("test-suites-update", this.testSuites);
        socket.emit("logs-update", this.logs.slice(-50));
      });
    });
  }

  private startProgressSimulation() {
    setInterval(() => {
      if (this.isTestRunning) {
        this.simulateTestProgress();
        this.broadcastProgress();
      }
    }, 2000); // Update every 2 seconds
  }

  private startLogGeneration() {
    setInterval(() => {
      if (this.isTestRunning) {
        this.generateRealisticLogs();
      }
    }, 1000); // Generate logs every second
  }

  private simulateTestProgress() {
    // Simulate test completion
    const completedTests = this.progress.passed + this.progress.failed + this.progress.skipped;

    if (completedTests >= this.progress.total) {
      this.isTestRunning = false;
      return;
    }

    // Randomly complete some tests
    const testsToComplete = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < testsToComplete; i++) {
      if (completedTests + i >= this.progress.total) break;

      // Randomly determine test result
      const rand = Math.random();
      if (rand < 0.7) {
        this.progress.passed++;
      } else if (rand < 0.9) {
        this.progress.failed++;
      } else {
        this.progress.skipped++;
      }
    }

    this.progress.running = Math.max(
      0,
      this.progress.total - this.progress.passed - this.progress.failed - this.progress.skipped,
    );
    this.progress.progress = Math.round((completedTests / this.progress.total) * 100);
    this.progress.timestamp = Date.now();

    // Update current test message
    const testMessages = [
      "Running API endpoint validation...",
      "Testing portfolio features...",
      "Validating PWA capabilities...",
      "Checking image optimization...",
      "Testing logo rendering...",
      "Validating resume generation...",
    ];
    this.progress.currentTest = `🔄 ${testMessages[Math.floor(Math.random() * testMessages.length)]}`;

    // Update test suites
    this.updateTestSuitesProgress();
  }

  private updateTestSuitesProgress() {
    this.testSuites.forEach((suite) => {
      const totalSuiteTests = suite.tests.length;
      const completedSuiteTests = suite.passed + suite.failed + suite.skipped;

      if (completedSuiteTests < totalSuiteTests) {
        // Complete some tests in this suite
        const testsToComplete = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < testsToComplete; i++) {
          if (completedSuiteTests + i >= totalSuiteTests) break;

          const rand = Math.random();
          if (rand < 0.7) {
            suite.passed++;
          } else if (rand < 0.9) {
            suite.failed++;
          } else {
            suite.skipped++;
          }
        }
      }

      suite.running = Math.max(0, totalSuiteTests - suite.passed - suite.failed - suite.skipped);
    });
  }

  public addLog(level: string, suite: string, message: string) {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(),
      level: level as "info" | "warn" | "error" | "debug",
      suite,
      message,
      timestamp: new Date(),
    };

    this.logs.push(logEntry);
    this.logBuffer.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Broadcast to all connected clients
    this.io.emit("new-log", logEntry);
  }

  public updateTestStatus(suiteName: string, testName: string, status: string, duration?: number) {
    const suite = this.testSuites.find((s) => s.name === suiteName);
    if (suite) {
      const test = suite.tests.find((t) => t.name === testName);
      if (test) {
        test.status = status as "pass" | "fail" | "skip" | "running";
        test.duration = duration;

        // Update suite statistics
        if (status === "pass") {
          suite.passed++;
          suite.running = Math.max(0, suite.running - 1);
        } else if (status === "fail") {
          suite.failed++;
          suite.running = Math.max(0, suite.running - 1);
        } else if (status === "skip") {
          suite.skipped++;
          suite.running = Math.max(0, suite.running - 1);
        }

        // Update overall progress
        this.updateOverallProgress();
        this.broadcastProgress();
      }
    }
  }

  private updateOverallProgress() {
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalRunning = 0;

    this.testSuites.forEach((suite) => {
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalSkipped += suite.skipped;
      totalRunning += suite.running;
    });

    this.progress.passed = totalPassed;
    this.progress.failed = totalFailed;
    this.progress.skipped = totalSkipped;
    this.progress.running = totalRunning;
    this.progress.progress = Math.round(
      ((totalPassed + totalFailed + totalSkipped) / this.progress.total) * 100,
    );
    this.progress.timestamp = Date.now();
  }

  private generateRealisticLogs() {
    const logMessages = [
      { level: "info", suite: "API Tests", message: "Starting test execution..." },
      { level: "info", suite: "Portfolio Tests", message: "Loading main page..." },
      { level: "info", suite: "API Tests", message: "Testing /api/ping endpoint" },
      { level: "info", suite: "API Tests", message: "✓ /api/ping responded with status 200" },
      { level: "info", suite: "API Tests", message: "Testing /api/demo endpoint" },
      {
        level: "info",
        suite: "API Tests",
        message: "✓ /api/demo returned expected data structure",
      },
      { level: "info", suite: "Portfolio Tests", message: "Checking navigation links..." },
      { level: "info", suite: "Portfolio Tests", message: "✓ All navigation links are present" },
      { level: "info", suite: "PWA Tests", message: "Testing service worker registration..." },
      {
        level: "warn",
        suite: "PWA Tests",
        message: "Service worker registration delayed - retrying...",
      },
      { level: "info", suite: "PWA Tests", message: "✓ Service worker registered successfully" },
      { level: "info", suite: "Form Tests", message: "Testing contact form validation..." },
      { level: "info", suite: "Form Tests", message: "✓ Form validation working correctly" },
      { level: "info", suite: "Performance Tests", message: "Measuring page load time..." },
      {
        level: "info",
        suite: "Performance Tests",
        message: "Page load time: 2.3s (within acceptable range)",
      },
      { level: "debug", suite: "Accessibility Tests", message: "Checking ARIA labels..." },
      {
        level: "info",
        suite: "Accessibility Tests",
        message: "✓ All ARIA labels are properly set",
      },
      { level: "info", suite: "API Tests", message: "✓ All endpoints responding correctly" },
      {
        level: "warn",
        suite: "Image Tests",
        message: "Large image detected, optimization recommended",
      },
      { level: "info", suite: "Resume Tests", message: "Testing PDF generation..." },
      { level: "info", suite: "Resume Tests", message: "✓ PDF generation completed successfully" },
      { level: "info", suite: "API Tests", message: "Running API endpoint validation..." },
      { level: "info", suite: "Portfolio Tests", message: "Testing responsive breakpoints..." },
      { level: "info", suite: "PWA Tests", message: "Validating offline functionality..." },
      { level: "info", suite: "Form Tests", message: "Checking form submission flow..." },
      { level: "info", suite: "Performance Tests", message: "Collecting Core Web Vitals..." },
      { level: "debug", suite: "Accessibility Tests", message: "Auditing keyboard navigation..." },
      { level: "info", suite: "Image Tests", message: "Verifying lazy loading behavior..." },
      { level: "info", suite: "Resume Tests", message: "Validating PDF content structure..." },
      { level: "info", suite: "API Tests", message: "Testing rate limiting..." },
      { level: "info", suite: "Portfolio Tests", message: "Checking theme switching..." },
      { level: "info", suite: "PWA Tests", message: "Testing push notification setup..." },
      { level: "info", suite: "Form Tests", message: "Validating input sanitization..." },
      { level: "info", suite: "Performance Tests", message: "Measuring Time to Interactive..." },
      {
        level: "debug",
        suite: "Accessibility Tests",
        message: "Checking color contrast ratios...",
      },
      { level: "info", suite: "Image Tests", message: "Testing WebP format support..." },
    ];

    const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
    this.addLog(randomLog.level, randomLog.suite, randomLog.message);
  }

  private broadcastProgress() {
    this.io.emit("progress-update", this.progress);
    this.io.emit("test-suites-update", this.testSuites);
  }

  public start(port: number = 3001) {
    this.server.listen(port, () => {
      console.log(`Test Progress Server running on http://localhost:${port}`);
      console.log(`Visual Progress Dashboard: http://localhost:${port}/`);
      console.log(`API Endpoint: http://localhost:${port}/api/progress`);
    });
  }

  public startTestExecution() {
    this.isTestRunning = true;
    this.addLog("info", "Test Runner", "Test execution started");
  }

  public stopTestExecution() {
    this.isTestRunning = false;
    this.addLog("info", "Test Runner", "Test execution completed");
  }
}

// Start the server
const server = new TestProgressServer();
server.start();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down Test Progress Server...");
  process.exit(0);
});

export default server;
