---
description: |
  Analyzes Playwright E2E test coverage against the codebase. Identifies untested
  components, pages, and API routes. Creates a coverage report issue with gaps
  and recommendations. Tracks coverage improvement over time.

on:
  schedule: weekly on Wednesday around 9 AM UTC
  workflow_dispatch:

timeout-minutes: 15

permissions: read-all

network: defaults

steps:
  - name: Checkout repository
    uses: actions/checkout@v6
    with:
      fetch-depth: 1
      persist-credentials: false

  - name: Setup Node.js
    uses: actions/setup-node@v6
    with:
      node-version: 20

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
    labels: [automation, testing, coverage]
    close-older-issues: true
    expires: 7d
    max: 3
  noop:

engine: copilot
---

# Test Coverage Analyzer

Your name is ${{ github.workflow }}. Your job is to analyze Playwright E2E test coverage for `${{ github.repository }}` and identify gaps.

## Step 1: Inventory Components

List all interactive components (files containing `'use client'` or class components with state) in:
- `src/components/` (all subdirectories)
- `src/components/interactive/`
- `src/components/admin/`
- `src/components/performance/`
- `src/components/sections/`

```bash
grep -rl "'use client'" src/components/ | wc -l
grep -rl "'use client'" src/components/ | sort
```

## Step 2: Inventory Test Files

List all Playwright test spec files and count tests per file:

```bash
ls playwright-tests/*.spec.ts | wc -l
for f in playwright-tests/*.spec.ts; do
  count=$(grep -c 'test(' "$f" 2>/dev/null || echo 0)
  echo "$count tests: $f"
done | sort -rn
```

## Step 3: Cross-Reference Coverage

For each component found in Step 1, search the test files for its name:

```bash
for component in $(grep -rl "'use client'" src/components/ | sed 's|.*/||;s|\.tsx||'); do
  matches=$(grep -rl "$component" playwright-tests/ 2>/dev/null | wc -l)
  if [ "$matches" -eq 0 ]; then
    echo "UNTESTED: $component"
  else
    echo "TESTED ($matches files): $component"
  fi
done
```

Also check API route coverage:
```bash
for route in server/routes/*.ts; do
  name=$(basename "$route" .ts)
  matches=$(grep -rl "$name" playwright-tests/ 2>/dev/null | wc -l)
  echo "$matches test files: $name ($route)"
done
```

## Step 4: Load Previous Coverage Data

Load cache memory to compare with previous analysis. Expected structure:

```json
{
  "last_analysis": "2026-03-22",
  "total_components": 62,
  "tested_components": 35,
  "coverage_percent": 56,
  "total_test_files": 92,
  "total_tests": 400,
  "untested": ["ComponentA", "ComponentB"]
}
```

## Step 5: Create Coverage Report Issue

Create a GitHub issue with this structure:

### Title: `${{ github.workflow }} — [DATE] — [X]% coverage`

### Body:

```markdown
## Test Coverage Summary

| Metric | Current | Previous | Trend |
|--------|---------|----------|-------|
| Components (interactive) | X/Y (Z%) | prev% | ↑/↓/→ |
| Test Files | X | prev | ↑/↓/→ |
| Total Tests | X | prev | ↑/↓/→ |

## Coverage by Category

| Category | Components | Tested | Coverage |
|----------|-----------|--------|----------|
| Admin Dashboard | X | Y | Z% |
| Interactive | X | Y | Z% |
| Performance Page | X | Y | Z% |
| Global/Layout | X | Y | Z% |
| Sections | X | Y | Z% |

## Untested Components (Gaps)

[List all components with 0 test coverage, grouped by directory]

## Newly Tested (since last report)

[List components that gained test coverage since last analysis]

## Recommendations

[Top 5 components to test next, ranked by user-facing importance]
```

If coverage is 100%: use `noop` with message "Full test coverage — no gaps found."

## Step 6: Update Cache Memory

Save current analysis to cache memory for trend tracking.

## Guidelines

- Focus on interactive (client) components — server components with no state need less testing
- Prioritize user-facing features over internal utilities
- Count a component as "tested" if ANY test file references it by name
- Don't count shadcn/ui primitives (src/components/ui/) — they're third-party
- Include API route coverage as a separate section
