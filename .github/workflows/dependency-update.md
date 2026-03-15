---
description: |
  Monitor and update project dependencies. This workflow checks for outdated
  packages, runs tests with updates, and creates pull requests for safe updates.

on:
  schedule: weekly on Sunday around 3 AM UTC
  workflow_dispatch:

timeout-minutes: 25

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

  - name: Install pnpm
    uses: pnpm/action-setup@v4

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Check for outdated dependencies
    run: |
      echo "Checking for outdated dependencies..."
      pnpm outdated 2>&1 | tee /tmp/outdated-packages.txt || true
      echo "Outdated check completed"
    shell: bash

  - name: Run tests with current dependencies
    run: |
      echo "Running tests with current dependencies..."
      pnpm test 2>&1 | tee /tmp/current-tests.txt || true
      echo "Current tests completed"
    shell: bash

  - name: Update patch versions
    run: |
      echo "Updating patch versions..."
      pnpm update --interactive --latest
      pnpm install
      echo "Patch updates completed"
    shell: bash

  - name: Run tests after patch updates
    run: |
      echo "Running tests after patch updates..."
      pnpm test 2>&1 | tee /tmp/patch-tests.txt || true
      echo "Patch tests completed"
    shell: bash

  - name: Update minor versions (if patch tests pass)
    run: |
      echo "Checking if patch tests passed..."
      if grep -q "passed" /tmp/patch-tests.txt; then
        echo "Patch tests passed, updating minor versions..."
        pnpm update --interactive
        pnpm install
        echo "Minor updates completed"
      else
        echo "Patch tests failed, skipping minor updates"
      fi
    shell: bash

tools:
  github:
    toolsets: [all]
  bash: true
  cache-memory: true

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-discussion:
    title-prefix: "Dependency Update"
    category: "q-a"
    max: 1
  create-issue:
    labels: [dependencies, automated, maintenance]
    max: 3
  noop:

engine: copilot
---

# Dependency Update Management

Your name is ${{ github.workflow }}. Your job is to monitor and manage project dependencies.

## Step 1: Analyze Current Dependencies

Read the outdated packages report and test results:

```bash
cat /tmp/outdated-packages.txt
cat /tmp/current-tests.txt
cat /tmp/patch-tests.txt
```

## Step 2: Check Update Results

Determine:
- **Outdated Packages**: Which packages need updates
- **Patch Update Success**: Did patch updates pass tests
- **Minor Update Status**: Were minor updates attempted
- **Test Results**: Overall test status after updates

## Step 3: Generate Dependency Report

Create a discussion with this structure:

### Title: `Dependency Update Report - [DATE]`

### Body:

```markdown
## Dependency Update Summary

**Date**: [DATE]
**Status**: [SUCCESS / PARTIAL / FAILED]
**Packages Checked**: [number]

## Outdated Packages Found

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| [name] | [version] | [version] | [major/minor/patch] |

## Update Results

### Patch Updates
- **Status**: [PASSED / FAILED]
- **Packages Updated**: [list]
- **Test Results**: [pass/fail count]

### Minor Updates
- **Status**: [ATTEMPTED / SKIPPED]
- **Packages Updated**: [list]
- **Test Results**: [pass/fail count]

## Test Results Summary

**Before Updates**: [test results]
**After Patch Updates**: [test results]
**After Minor Updates**: [test results]

## Recommendations

### ✅ Safe to Update
- [List packages that updated successfully]

### ⚠️ Requires Review
- [List packages that need manual review]

### ❌ Blocked Updates
- [List packages that couldn't be updated]

## Next Steps

1. Review any failed tests
2. Check compatibility for major version updates
3. Consider security implications of outdated packages
4. Plan manual updates for blocked packages

<details>
<summary>Full Update Log</summary>
[Include detailed output from all update operations]
</details>
```

## Step 4: Create Issues for Problems

If dependency updates caused test failures or issues:
- Create issues titled "Dependency Update Issue - [package name]"
- Include specific error messages and suggested solutions
- Add dependencies and automated labels

If updates were successful:
- Use `noop` with message "Dependency update completed successfully"

## Step 5: Update Cache Memory

Save dependency status to cache memory:

```json
{
  "last_update": "[TODAY's DATE]",
  "outdated_count": [number],
  "updated_successfully": [number],
  "test_failures": [number]
}