
#!/usr/bin/env node

// Ensure console is defined (for environments where it may be missing)
if (typeof console === 'undefined') {
  global.console = require('console');
}

/**
 * Continuous Testing Script
 * Runs Playwright tests continuously until all pass
 * Optimized for development workflow
 */

import { spawn } from 'node:child_process'

// Constants for continuous testing
const MAX_RUNS = 20 // Maximum number of attempts
const RETRY_DELAY_MS = 3000 // 3 seconds between retries

class ContinuousTester {
  constructor() {
    this.MAX_RUNS = MAX_RUNS; // Maximum number of attempts
    this.RETRY_DELAY_MS = RETRY_DELAY_MS; // 3 seconds between retries
    this.runCount = 0;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runTestCycle() {
    this.runCount++;
    this.log(`Starting test run #${this.runCount}/${this.MAX_RUNS}`);

    return new Promise((resolve) => {
      const testProcess = spawn(
        'npx',
        [
          'playwright',
          'test',
          '--config=playwright.config.ts',
          '--reporter=line,json',
          '--output=test-results/continuous',
        ],
        {
          stdio: 'inherit',
          cwd: process.cwd(),
          shell: true,
        },
      );

      testProcess.on('close', (code) => {
        resolve({ success: code === 0, exitCode: code });
      });

      testProcess.on('error', (error) => {
        this.log(`Test process error: ${error.message}`, 'error');
        resolve({ success: false, exitCode: 1, error: error.message });
      });
    });
  }

  async run() {
    this.log('🚀 Starting Continuous Testing Mode');
    this.log(`Will run tests up to ${this.MAX_RUNS} times until all pass`);
    this.log('Press Ctrl+C to stop at any time');

    while (this.runCount < this.MAX_RUNS) {
      const result = await this.runTestCycle();

      if (result.success) {
        this.log('🎉 All tests passed! Continuous testing complete.', 'success');
        return true;
      } else {
        this.log(
          `❌ Tests failed (exit code: ${result.exitCode}). ${this.MAX_RUNS - this.runCount} attempts remaining.`,
          'error',
        );

        if (this.runCount < this.MAX_RUNS) {
          this.log('⏳ Retrying in 3 seconds...');
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS),
          );
        }
      }
    }

    this.log(
      `💥 Maximum attempts (${this.MAX_RUNS}) reached. Some tests are still failing.`,
      'error',
    );
    this.log('Check the test output above for details on which tests failed.');
    return false;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Continuous testing interrupted by user');
  process.exit(0);
})

// Run the continuous tester
const tester = new ContinuousTester()
tester
  .run()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Continuous testing failed:', error);
    process.exit(1);
  });

export default ContinuousTester;
