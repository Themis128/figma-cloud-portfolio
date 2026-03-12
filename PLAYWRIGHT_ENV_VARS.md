# Playwright Environment Variables Guide

This document outlines all the environment variables used by the Playwright configuration system and their purposes.

## Core Environment Variables

### Required Variables

- `NODE_ENV` - Environment type (development, production, test, etc.)
  - Used for determining timeout strategies and worker allocation
  - Default: 'development'

### Optional Variables

- `PLAYWRIGHT_BASE_URL` - Base URL for test navigation
  - Default: `http://localhost:3000`
  - Used in all local environments
  - Should be set to production URL in CI (e.g. `https://www.baltzakisthemis.com`)

- `PLAYWRIGHT_SKIP_WEBSERVER` - Skip automatic web server startup entirely
  - Values: `true` or `false`
  - Default: `false`
  - Set to `true` only when pointing at a remote/production URL where no local server should be started

- `PLAYWRIGHT_START_SERVERS` - Force service health check even when webServer is configured
  - Values: `true` or `false`
  - Default: `false`

- `PLAYWRIGHT_WORKERS` - Override worker count
  - Values: positive integer
  - Default: Calculated based on CPU cores and environment
  - Development: 75% of CPU cores (max 4)
  - CI: 50% of CPU cores (max 4)
  - Fast: 100% of CPU cores (max 8)
  - Isolated: 1 worker

- `PLAYWRIGHT_BASELINE_MEMORY` - Memory baseline for performance monitoring
  - Set automatically during setup
  - Used for memory usage tracking

- `PLAYWRIGHT_BASELINE_CPU` - CPU baseline for performance monitoring
  - Set automatically during setup
  - Used for CPU usage tracking

- `PLAYWRIGHT_SETUP_TIME` - Setup duration for performance monitoring
  - Set automatically during setup
  - Used for setup time tracking

- `PLAYWRIGHT_SETUP_TIMESTAMP` - Setup timestamp for performance monitoring
  - Set automatically during setup
  - Used for timestamp tracking

## Advanced Configuration

### Debug and Logging

- `DEBUG_PLAYWRIGHT_CONFIG` - Enable debug logging for configuration
  - Values: `true` or `false`
  - Default: `false`
  - Shows detailed configuration information

- `FAST_WITH_RETRIES` - Enable retries in fast mode
  - Values: `true` or `false`
  - Default: `false`
  - Overrides fast mode's retry setting

### Test Filtering

- `TEST_GREP` - Filter tests by name
  - Values: test name pattern
  - Default: undefined
  - Example: `@smoke` to run only smoke tests

## Web Server Behaviour

The test suite automatically starts a static file server (`npx serve out -l 3000`) before tests begin if no server is already listening on port 3000. This requires a pre-built `out/` directory:

```bash
pnpm build        # generates out/
pnpm test:e2e     # starts serve, runs all tests, stops serve
```

If a server is already running on port 3000 (e.g. `pnpm dev` or an existing `serve` process), Playwright reuses it automatically (`reuseExistingServer: true`).

To skip server management entirely (e.g. running against production):

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=https://www.baltzakisthemis.com pnpm test:e2e
```

## Environment-Specific Variables

### Development Environment

- `PLAYWRIGHT_BASE_URL` — defaults to `http://localhost:3000`
- No extra setup needed; `pnpm build` then `pnpm test:e2e` is the standard flow

### CI Environment

- `PLAYWRIGHT_BASE_URL` — set to production or staging URL if running smoke tests against live site
- `PLAYWRIGHT_SKIP_WEBSERVER=true` — set when pointing at a live URL
- `CI=true` — set automatically by GitHub Actions; enables CI-specific timeouts and `forbidOnly`

### Fast Environment

- `PLAYWRIGHT_WORKERS` — may need increase for faster testing
- `FAST_WITH_RETRIES=true` — for more reliable quick tests

### Isolated Environment

- `PLAYWRIGHT_WORKERS` — always 1 (cannot be overridden)
- `PLAYWRIGHT_BASE_URL` — should point to specific test instance

## Best Practices

1. **Development**: Run `pnpm build` first, then `pnpm test:e2e` — the server starts automatically
2. **CI against local build**: Same as development; ensure `out/` is built in a prior step
3. **CI against live site**: Set `PLAYWRIGHT_SKIP_WEBSERVER=true` and `PLAYWRIGHT_BASE_URL` to the live URL
4. **Fast Testing**: Use `pnpm test:e2e:fast` with `FAST_WITH_RETRIES=true`
5. **Debugging**: Use `DEBUG_PLAYWRIGHT_CONFIG=true` to see configuration details

## Common Issues

### Service Not Available

If you see "Service at http://localhost:3000 is not available" errors:

- Run `pnpm build` to generate the `out/` directory
- Check that no other process is blocking port 3000
- Verify `PLAYWRIGHT_BASE_URL` points to the correct server

### Timeout Issues

If tests are timing out:

- Check your server response times
- Increase timeout values in the configuration
- Use `DEBUG_PLAYWRIGHT_CONFIG=true` to see current timeout settings

### Resource Contention

If you see resource issues:

- Reduce `PLAYWRIGHT_WORKERS` in CI environments
- Use `FAST_WITH_RETRIES=false` for faster but less reliable tests
- Monitor memory usage with `PLAYWRIGHT_BASELINE_MEMORY`

## Validation

Run the configuration validation script to check for issues:

```bash
npx tsx playwright.config.validation.ts
```

This will output:

- Configuration score (0-10)
- Any issues found
- Recommendations for improvement
- Environment variable usage analysis
