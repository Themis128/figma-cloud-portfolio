---
description: |
  Runs the full Playwright E2E test suite against the production build and creates
  a detailed report discussion with pass/fail summary, failure analysis, regression
  detection, and actionable recommendations. Files issues for new test failures.

on:
  schedule: weekly on Monday around 8 AM UTC
  workflow_dispatch:

timeout-minutes: 30

permissions: read-all

network: defaults

steps:
  - name: Checkout repository
    uses: actions/checkout@v6
    with:
      fetch-depth: 0
      persist-credentials: false

  - name: Setup Node.js
    uses: actions/setup-node@v6
    with:
      node-version: 20

  - name: Enable corepack
    run: corepack enable

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Install Playwright browsers
    run: npx playwright install chromium --with-deps
    shell: bash

  - name: Start Express backend on port 3002
    run: |
      PORT=3002 npx tsx server/index.ts &
      echo "Waiting for backend on port 3002..."
      timeout 30 bash -c 'until curl -sf http://localhost:3002/api/ping > /dev/null 2>&1; do sleep 2; done'
      echo "Backend is running on http://localhost:3002"
    shell: bash
    env:
      NODE_ENV: test
      PORT: "3002"
      RECAPTCHA_SECRET_KEY: ${{ secrets.RECAPTCHA_SECRET_KEY }}
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      HF_TOKEN: ${{ secrets.HF_TOKEN }}
      CAL_API_KEY: ${{ secrets.CAL_API_KEY }}
      CAL_EVENT_TYPE_ID: ${{ secrets.CAL_EVENT_TYPE_ID }}

  - name: Start Next.js dev server
    run: |
      unset PORT
      pnpm dev &
      echo "Waiting for frontend on port 3000..."
      timeout 120 bash -c 'until curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 3; done'
      echo "Frontend is running on http://localhost:3000"
    shell: bash
    env:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002

  - name: Run Playwright tests
    run: |
      echo "Running Playwright E2E tests (chromium, CI config)..."
      npx playwright test --config=playwright.config.ci.ts \
        --reporter=list \
        2>&1 | tee /tmp/playwright-results.txt || true
      echo "Tests complete. Results saved to /tmp/playwright-results.txt"
    shell: bash
    env:
      PLAYWRIGHT_BASE_URL: http://localhost:3000
      BACKEND_API_URL: http://localhost:3002
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
      PW_TEST_REUSE_CONTEXT: "1"

tools:
  github:
    toolsets: [all]
  bash: true
  cache-memory: true

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    title-prefix: "${{ github.workflow }}"
    labels: [automation, testing]
    close-older-issues: true
    expires: 7d
    max: 5
  noop:

engine: copilot
---

# Playwright E2E Test Runner

Your name is ${{ github.workflow }}. Your job is to analyze Playwright E2E test results for the repository `${{ github.repository }}` and create a clear, actionable report.

## Step 1: Read Test Results

The Playwright tests have already been executed in the previous steps. Read the results:

```bash
cat /tmp/playwright-results.txt
```

## Step 2: Parse and Analyze Results

From the test output, extract:

- **Total tests** run
- **Passed** count (lines with ✓ or "passed")
- **Failed** count (lines with ✗ or "failed")
- **Skipped** count
- **Total duration**
- For each **failure**: test name, spec file, error message

Also categorize tests by spec file into these groups:
- **smoke**: tests tagged `@smoke`
- **push-notifications**: `push-notifications*.spec.ts`
- **navigation**: `navigation.spec.ts`, `mobile.spec.ts`
- **chatbot**: `chatbot-widget.spec.ts`
- **global-components**: `global-components.spec.ts`
- **interactive-components**: `interactive-components*.spec.ts`
- **performance-components**: `performance-components.spec.ts`, `performance-*.spec.ts`
- **admin**: `admin.spec.ts`
- **other**: everything else

## Step 3: Check for Regressions

Load cache memory to compare with previous run results. The cache should have this structure:

```json
{
  "last_run": "2026-03-22",
  "total": 400,
  "passed": 396,
  "failed": 0,
  "skipped": 4,
  "categories": {
    "smoke": { "total": 30, "passed": 30 },
    "push-notifications": { "total": 67, "passed": 67 },
    "navigation": { "total": 20, "passed": 20 },
    "chatbot": { "total": 11, "passed": 11 },
    "global-components": { "total": 14, "passed": 14 },
    "interactive-components": { "total": 8, "passed": 8 },
    "performance-components": { "total": 14, "passed": 14 },
    "admin": { "total": 135, "passed": 135 },
    "other": { "total": 101, "passed": 97 }
  },
  "known_failures": [
    {
      "test": "test name",
      "file": "spec-file.spec.ts",
      "since": "2026-03-22"
    }
  ]
}
```

Compare current results with previous:
- **New failures** = tests that failed now but passed before (or weren't in known_failures)
- **Fixed tests** = tests that passed now but were in known_failures
- **Persistent failures** = tests that remain in known_failures

## Step 4: Create Report Issue

Search for any previous open "${{ github.workflow }}" issues. Close older ones.

Create a new issue with this structure:

### Title: `${{ github.workflow }} — [DATE] — [X/Y passed]`

### Body:

```markdown
## Summary

| Metric | Value |
|--------|-------|
| Total Tests | X |
| Passed | X |
| Failed | X |
| Skipped | X |
| Flaky | X |
| Duration | Xs |
| Pass Rate | X% |

## Status: [ALL GREEN / X FAILURES]

### New Failures (regressions)
[List any new failures not seen in previous runs]

### Persistent Failures
[List failures that have been failing for multiple runs]

### Fixed Since Last Run
[List tests that were failing but now pass]

### Failure Details
[For each failed test, include:
- Test name and file
- Error message
- Brief analysis of likely cause]

<details>
<summary>Full Test Output</summary>
[Include the list reporter output]
</details>
```

## Step 5: Create Issues for New Failures

If there are **new failures** (regressions — tests that weren't failing before):
- Create a GitHub issue for each distinct spec file with failures
- Title: `E2E Test Failure: [spec-file-name]`
- Body: include the failing test names, error messages, and steps to reproduce locally (`npx playwright test [file] --headed`)
- Do NOT create issues for persistent/known failures (they already have issues)

If **all tests pass**: use `noop` with message "All E2E tests passed — no action needed."

## Step 6: Update Cache Memory

Save the current results to cache memory:

```json
{
  "last_run": "[TODAY's DATE]",
  "total": [total],
  "passed": [passed],
  "failed": [failed],
  "skipped": [skipped],
  "known_failures": [
    {
      "test": "[test name]",
      "file": "[spec file]",
      "since": "[date first seen or today]"
    }
  ]
}
```

## Important Guidelines

- Be concise — focus on actionable information, not raw logs
- Group failures by spec file for clarity
- Include the command to reproduce failures locally: `npx playwright test [file] --headed`
- If the build step failed (no test results), report the build error instead
- Do not create duplicate issues — check existing open issues first
