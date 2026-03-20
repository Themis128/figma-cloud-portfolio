---
description: |
  Automated E2E test fixer: runs all Playwright tests, classifies every failure,
  applies targeted fixes (deletes bogus specs, repairs real app bugs, patches test
  assertions), re-runs the suite to verify, then opens a PR with all changes.
  If failures remain after 3 fix iterations, opens an issue with a repair plan.

on:
  push:
    branches: [production]
  workflow_dispatch:

timeout-minutes: 90

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
      node-version: 22

  - name: Install pnpm
    uses: pnpm/action-setup@v4

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Install Playwright browsers
    run: npx playwright install chromium --with-deps
    shell: bash

  - name: Create mock amplify_outputs.json for CI
    run: |
      cat > amplify_outputs.json << 'EOF'
      {
        "version": "1.3",
        "auth": {
          "user_pool_id": "us-east-1_CImock",
          "aws_region": "us-east-1",
          "user_pool_client_id": "ci-mock-client-id",
          "identity_pool_id": "us-east-1:00000000-0000-0000-0000-000000000000",
          "mfa_methods": [],
          "standard_required_attributes": ["email"],
          "username_attributes": ["email"],
          "user_verification_types": ["email"],
          "mfa_configuration": "NONE",
          "password_policy": {
            "min_length": 8,
            "require_numbers": true,
            "require_lowercase": true,
            "require_uppercase": true,
            "require_symbols": true
          },
          "unauthenticated_identities_enabled": true
        }
      }
      EOF
      echo "Mock amplify_outputs.json created for CI (auth-only, placeholder values)"
    shell: bash

  - name: Start Express backend on port 3002
    run: |
      PORT=3002 npx tsx server/index.ts &
      echo "Waiting for backend on port 3002..."
      timeout 45 bash -c 'until curl -s http://localhost:3002 > /dev/null 2>&1; do sleep 2; done' || true
      echo "Backend ready on port 3002 (port 3001 reserved by gh-aw Safe Outputs MCP)"
    shell: bash
    env:
      NODE_ENV: test
      PORT: "3002"
      RECAPTCHA_SECRET_KEY: ${{ secrets.RECAPTCHA_SECRET_KEY }}
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      CAL_API_KEY: ${{ secrets.CAL_API_KEY }}
      CAL_EVENT_TYPE_ID: ${{ secrets.CAL_EVENT_TYPE_ID }}
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      BEDROCK_REGION: us-east-1

  - name: Start Next.js dev server
    run: |
      # Explicitly unset PORT so next dev binds to 3000 (not 3002 from Express step)
      unset PORT
      pnpm dev &
      echo "Waiting up to 120s for Next.js on port 3000..."
      timeout 120 bash -c 'until curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 3; done'
      echo "Next.js dev server is ready"
    shell: bash

  - name: Run Playwright tests (baseline)
    run: |
      echo "=== BASELINE TEST RUN ===" > /tmp/run1.txt
      PLAYWRIGHT_BASE_URL=http://localhost:3000 \
      npx playwright test --config=playwright.config.fast.ts \
        --reporter=list 2>&1 | tee -a /tmp/run1.txt || true
      echo "Baseline run complete."
    shell: bash
    env:
      PLAYWRIGHT_BASE_URL: http://localhost:3000
      BACKEND_API_URL: http://localhost:3002
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
      API_BASE_URL: http://localhost:3002
      API_URL: http://localhost:3002

  - name: Free port 3001 for gh-aw Safe Outputs MCP server
    run: |
      echo "Killing any processes on port 3001..."
      fuser -k 3001/tcp 2>/dev/null || true
      sleep 2
      echo "Port 3001 is now free"
    shell: bash

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    title-prefix: "${{ github.workflow }}"
    labels: [automation, testing, bug]
    close-older-issues: true
    expires: 14d
    max: 3
  create-pull-request:
    draft: false
    labels: [automation, testing]

tools:
  github:
    toolsets: [all]
  bash: true
  cache-memory: true

engine: copilot
---

# E2E Test CI Fixer

You are an autonomous test repair agent for `${{ github.repository }}`.

**Goal**: Get the Playwright E2E suite to 100% pass rate. You do this by:
1. Reading the baseline test results
2. Classifying every failure
3. Applying fixes (via GitHub API file operations)
4. Re-running tests to verify
5. Opening a PR with the changes — or an issue with a repair plan if still failing

## App Context

This is a Next.js 16 portfolio. Know what **exists** and what **does not**:

| Exists | Does NOT exist |
|--------|---------------|
| Contact form (SES + Slack) | Socket.IO / WebSockets |
| Chatbot (AWS Bedrock) | Real-time collaboration |
| Admin dashboard (Cognito) | GraphQL client calls |
| Cal.com booking proxy | Redis / caching layer |
| Performance page (`/performance`) | i18n / multi-language |
| Work experience, projects pages | Blockchain / VR / AR |
| Mobile-responsive layout | WebAssembly compute features |

**Test config**: Always `playwright.config.fast.ts` (chromium only, webServer pre-configured).

---

## Step 1: Read Baseline Results

```bash
cat /tmp/run1.txt
```

Extract:
- Total passed / failed / skipped counts and duration
- Every failing test: file path + test name + error snippet

---

## Step 2: Inspect Failing Test Files

For each failing spec file, read it:

```bash
cat playwright-tests/<failing-file>.spec.ts
```

Also read relevant app source if the test is testing real app functionality:

```bash
# Find the relevant component/route
grep -r "<keyword-from-test>" src/ server/ --include="*.ts" --include="*.tsx" -l
```

---

## Step 3: Classify Every Failure

Assign each failing spec to exactly one bucket:

### Bucket A — Delete (tests non-existent features)
Only delete if the feature is **confirmed absent** from `src/` and `server/`:
- `socketio-realtime.spec.ts` — Socket.IO server not in this app
- `test-optimization.spec.ts` — calls `measurePerformance()` / `retryOperation()` from test-utils that do not exist
- Any spec whose entire premise is a feature not in the app (confirm via grep)

To confirm absence before deleting:
```bash
grep -r "socket\.io\|socketio\|io\.on\|io\.emit" src/ server/ --include="*.ts" --include="*.tsx"
```

### Bucket B — Fix the app code (real app bug)
Tests checking features that exist and should work but don't. Fix the app code.

### Bucket C — Fix the test assertion (test too strict)
Tests checking correct features but asserting on stale text, outdated selectors, or implementation details that changed. Update assertions to match current app.

### Bucket D — Skip (requires live secrets/backend)
Tests that require Bedrock, SES, or Cal.com API keys that are unavailable in CI — add `test.skip(!!process.env.CI, 'requires live secrets')` at the test level.

### Bucket E — Investigate further
Tests that fail for unclear reasons — look deeper at the error and the app code.

---

## Step 4: Apply Fixes via GitHub API

**Use your GitHub file creation/update tools** to modify files directly in the repo. Do NOT attempt `git push` via bash (the runner has read-only credentials).

For each fix:

1. **Read the current file content** (via bash `cat` or GitHub API)
2. **Prepare the new content** (surgical edits — never rewrite entire files)
3. **Write the updated file** back via GitHub API to a new branch named `fix/e2e-repair-$(date +%Y%m%d)`
4. **Record what you changed** and why

**For Bucket A** (delete): Use the GitHub API to delete the file from the branch.

**For Bucket B** (app bug): Edit the app source file with the minimal fix.

**For Bucket C** (test assertion): Update only the failing assertion(s), not the whole test.

**For Bucket D** (skip): Add `test.skip(!!process.env.CI, 'requires live secrets not available in CI')` as the first line of the failing `test()` block.

**TypeScript rule**: After any change to `src/` or `server/` files, run:
```bash
pnpm typecheck 2>&1 | tail -30
```
If there are new TS errors from your change, fix them before continuing.

---

## Step 5: Re-run Tests After Fixes

```bash
echo "=== POST-FIX TEST RUN ===" > /tmp/run2.txt
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
npx playwright test --config=playwright.config.fast.ts \
  --reporter=list 2>&1 | tee -a /tmp/run2.txt || true
cat /tmp/run2.txt | tail -5
```

Compare to baseline. If new failures appeared (regressions from a fix), revert that specific fix:
```bash
# Identify which fix caused the regression by reviewing changes made
# Then revert only the problematic file via GitHub API (restore original content)
```

---

## Step 6: Third Iteration (if needed)

If failures remain after iteration 2, repeat Steps 3-5 for remaining failures only:

```bash
echo "=== FINAL TEST RUN ===" > /tmp/run3.txt
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
npx playwright test --config=playwright.config.fast.ts \
  --reporter=list 2>&1 | tee -a /tmp/run3.txt || true
```

---

## Step 7: Save to Cache Memory

Save results for comparison in future runs:

```json
{
  "last_run": "<today ISO date>",
  "baseline_passed": "<N>",
  "baseline_failed": "<N>",
  "final_passed": "<N>",
  "final_failed": "<N>",
  "fixes_applied": ["<list of files changed/deleted>"],
  "known_remaining_failures": [
    { "file": "<spec>", "test": "<name>", "bucket": "D", "reason": "<why skipped>" }
  ]
}
```

---

## Step 8: Open PR or Issue

### If tests improved (any fixes were applied):

Create a pull request from the fix branch to `production`:

**Title**: `fix(tests): E2E repair — <final_passed> passing (<delta> improvement)`

**Body**:
```markdown
## Summary

Automated fix by `${{ github.workflow }}` — [Run #${{ github.run_number }}](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})

| Metric | Baseline | After Fix |
|--------|----------|-----------|
| Passed | N | N |
| Failed | N | N |
| Skipped | N | N |

## Changes

### Deleted specs (testing non-existent features)
- `file.spec.ts` — reason

### App code fixes
- `src/...` — what was fixed and why

### Test assertion fixes
- `playwright-tests/...` — what assertion was updated

### Skipped (live secrets required)
- `test name` in `file.spec.ts` — requires [secret name]

## Remaining failures
[If any remain — categorized with root cause and recommended fix]

## Verify locally
```bash
npx playwright test --config=playwright.config.fast.ts
```
```

### If all tests pass after fixes:

Create the PR (above) and `noop` with message: "E2E suite fully repaired — PR opened."

### If failures remain unchanged after 3 iterations:

Create a GitHub issue:

**Title**: `E2E Test Suite: <N> failures need manual repair`

**Body**:
```markdown
## Summary

The automated test fixer ran 3 iterations but <N> failures remain. Manual intervention required.

### Run progression
| Run | Passed | Failed |
|-----|--------|--------|
| Baseline | N | N |
| After fixes | N | N |

### Remaining failures — repair plan

For each failure:
- **Test**: `test name` in `playwright-tests/file.spec.ts`
- **Error**: `<error message>`
- **Root cause**: <analysis>
- **Fix**: <exact code change needed>
- **Reproduce**: `npx playwright test playwright-tests/file.spec.ts --headed`
```

---

## Hard Rules

1. **Never delete tests for features that exist in the app** — grep first, delete second
2. **Never modify `playwright.config.fast.ts`** — already correctly configured
3. **Never use `any` TypeScript type** — run `pnpm typecheck` after every app code change
4. **Never touch `amplify/`, `amplify.yml`, `.github/workflows/deploy.yml`**
5. **Surgical edits only** — change the minimum necessary, never rewrite whole files
6. **If a fix causes regressions, revert it** — do not trade old failures for new ones
