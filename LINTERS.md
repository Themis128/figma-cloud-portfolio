# Linter & Code Quality Configuration

This project uses **Biome** as the primary linter and formatter, replacing ESLint and Prettier for better performance and unified configuration.

## 🚀 Quick Commands

```bash
# All-in-one checks
pnpm check          # Run typecheck + lint + format check
pnpm check:fix      # Run typecheck + auto-fix lint + format

# Individual tools
pnpm lint           # Check for linting issues
pnpm lint:fix       # Auto-fix linting issues
pnpm lint:unsafe    # Auto-fix with unsafe transformations
pnpm format         # Check formatting
pnpm format:fix     # Auto-fix formatting
pnpm typecheck      # TypeScript type checking
```

## 🛠️ Tools Overview

### 1. Biome (Primary Linter & Formatter)
**Fast, comprehensive, zero-config alternative to ESLint + Prettier**

**Configuration**: `biome.json`

**Features**:
- ✅ **Accessibility (a11y)**: Alt text, ARIA roles, keyboard navigation
- ✅ **Security**: XSS prevention, eval detection
- ✅ **Correctness**: Unused variables/imports, React hooks rules
- ✅ **Style**: Const usage, template literals, array shorthand
- ✅ **Complexity**: Cognitive complexity limits (max 15), simplified logic
- ✅ **Performance**: Spread accumulation, delete operator detection
- ✅ **Suspicious**: Explicit any, console statements, double equals

**Key Rules**:
```javascript
{
  "noUnusedImports": "error",        // Remove unused imports
  "noExplicitAny": "warn",            // Avoid 'any' type
  "noConsole": "warn",                // Remove console.log in production
  "useConst": "error",                // Prefer const over let
  "noMagicNumbers": "warn",           // Use named constants
  "noDoubleEquals": "error",          // Use === instead of ==
  "useExhaustiveDependencies": "warn" // React useEffect dependencies
}
```

**Special Overrides**:
- **Scripts** (`scripts/**/*.{js,ts}`): Console allowed, no complexity limits
- **Tests** (`playwright-tests/**/*.ts`): Console allowed, any allowed, no magic numbers
- **Server** (`server/**/*.ts`): Console allowed, no magic numbers

### 2. TypeScript Compiler (Type Checker)
**Strict type checking for type safety**

**Configuration**: `tsconfig.json`

**Strict Options Enabled**:
- ✅ `strict: true` - Enable all strict type-checking options
- ✅ `noUnusedLocals: true` - Detect unused local variables
- ✅ `noUnusedParameters: true` - Detect unused parameters
- ✅ `noFallthroughCasesInSwitch: true` - Prevent switch fallthrough
- ✅ `noImplicitReturns: true` - Require return in all code paths
- ✅ `noUncheckedIndexedAccess: true` - Add undefined to indexed access
- ✅ `allowUnreachableCode: false` - Error on unreachable code
- ✅ `allowUnusedLabels: false` - Error on unused labels

**Path Aliases**:
```typescript
"@/*"       -> "./client/*"     // React components, pages
"@shared/*" -> "./shared/*"     // TypeScript interfaces
```

### 3. cspell (Spell Checker)
**Catch typos in code and comments**

**Configuration**: `cspell.json`

**Custom Dictionary**: Project-specific terms (Baltzakis, Vite, Vitest, Radix, etc.)
**Flag Words**: Common typos (hte, teh, recieve, seperate)
**Ignore Patterns**: Hex colors, memory addresses

### 4. ~~ESLint~~ ~~Prettier~~ (DEPRECATED)
**Replaced by Biome for better performance**

If you need ESLint/Prettier for legacy tooling:
1. Rename `.eslintrc.js.backup` to `.eslintrc.js`
2. Rename `.prettierrc.backup` to `.prettierrc`
3. Install dependencies: `pnpm add -D eslint prettier`

**Note**: Biome is 20x faster and handles both linting + formatting.

## 📋 Pre-Commit Checklist

Before committing code:

```bash
# 1. Check everything
pnpm check

# 2. Auto-fix issues
pnpm check:fix

# 3. Run tests (optional)
pnpm test

# 4. Type check
pnpm typecheck
```

## 🎯 CI/CD Integration

GitHub Actions automatically runs:
1. `pnpm typecheck` - TypeScript type checking
2. `pnpm lint` - Biome linting
3. `pnpm format:check` - Biome formatting check
4. `pnpm test` - Unit tests
5. `pnpm test:e2e:ci` - E2E tests

## 🔧 IDE Integration

### VS Code
**Recommended Extensions**:
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) - Official Biome extension
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) - Spell checking

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

## 📊 Complexity Metrics

**Cognitive Complexity Limit**: 15 (Warning threshold)

Functions exceeding this limit should be refactored into smaller, more maintainable pieces.

**Example**:
```typescript
// ❌ Too complex (cognitive complexity > 15)
function processData(data: unknown[]) {
  if (data) {
    for (const item of data) {
      if (item.valid) {
        if (item.type === 'a') {
          // ... nested logic
        } else if (item.type === 'b') {
          // ... more nested logic
        }
      }
    }
  }
}

// ✅ Better (split into smaller functions)
function processData(data: unknown[]) {
  if (!data) return
  data.filter(isValid).forEach(processItem)
}
```

## 🚨 Common Issues & Fixes

### Issue: "Unused variable '_'"
**Fix**: Use `_` prefix for intentionally unused variables
```typescript
// ❌ Biome warning
const [count, setCount] = useState(0) // 'count' is unused

// ✅ No warning
const [_count, setCount] = useState(0)
```

### Issue: "Magic number detected"
**Fix**: Extract to named constant
```typescript
// ❌ Magic number
setTimeout(callback, 3000)

// ✅ Named constant
const DELAY_MS = 3000
setTimeout(callback, DELAY_MS)
```

### Issue: "React Hook useEffect has missing dependencies"
**Fix**: Add dependencies or use `// biome-ignore` with reason
```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchData(userId)
}, [])

// ✅ Include dependency
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ Or suppress with reason
// biome-ignore lint/correctness/useExhaustiveDependencies: Run once on mount
useEffect(() => {
  fetchData(userId)
}, [])
```

## 📝 Suppressing Rules

When you need to suppress a rule (use sparingly):

```typescript
// Suppress next line
// biome-ignore lint/suspicious/noExplicitAny: External API uses any
const data: any = await externalApi()

// Suppress block
/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Legacy code */
function complexLegacyFunction() {
  // ... complex logic
}
```

## 🎓 Best Practices

1. **Fix warnings early**: Don't let lint warnings accumulate
2. **Use type safety**: Avoid `any`, use `unknown` + type guards
3. **Name magic numbers**: Extract hardcoded values to constants
4. **Limit complexity**: Keep functions simple (cognitive complexity < 15)
5. **Clean imports**: Remove unused imports immediately
6. **Accessibility**: Follow a11y rules (alt text, ARIA roles)

## 📚 Additional Resources

- [Biome Documentation](https://biomejs.dev/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/)
- [React Hooks Rules](https://react.dev/reference/react/hooks#rules-of-hooks)
