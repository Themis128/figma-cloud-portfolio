# Playwright Environment Variables Guide

This document outlines all the environment variables used by the Playwright configuration system and their purposes.

## Core Environment Variables

### Required Variables

- `NODE_ENV` - Environment type (development, production, test, etc.)
  - Used for determining timeout strategies and worker allocation
  - Default: 'development'

### Optional Variables

- `PLAYWRIGHT_BASE_URL` - Base URL for test navigation
  - Default: 'http://localhost:8082'
  - Used in development and isolated environments
  - Should be set to production URL in CI

- `PLAYWRIGHT_SKIP_WEBSERVER` - Skip service health checks
  - Values: 'true' or 'false'
  - Default: 'false'
  - Set to 'true' when web servers are configured to auto-start

- `PLAYWRIGHT_START_SERVERS` - Force start web servers
  - Values: 'true' or 'false'
  - Default: 'false'
  - Set to 'true' to override auto-start detection

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
  - Values: 'true' or 'false'
  - Default: 'false'
  - Shows detailed configuration information

- `FAST_WITH_RETRIES` - Enable retries in fast mode
  - Values: 'true' or 'false'
  - Default: 'false'
  - Overrides fast mode's retry setting

### Test Filtering

- `TEST_GREP` - Filter tests by name
  - Values: test name pattern
  - Default: undefined
  - Example: '@smoke' to run only smoke tests

## Environment-Specific Variables

### Development Environment

- `PLAYWRIGHT_BASE_URL` - Should point to development server
- `PLAYWRIGHT_SKIP_WEBSERVER` - Often set to 'true' for local development

### CI Environment

- `PLAYWRIGHT_BASE_URL` - Should point to production or staging URL
- `PLAYWRIGHT_WORKERS` - May need adjustment based on CI resources
- `CI` - Set by CI systems to enable CI-specific optimizations

### Fast Environment

- `PLAYWRIGHT_WORKERS` - May need increase for faster testing
- `FAST_WITH_RETRIES` - Set to 'true' for more reliable fast testing

### Isolated Environment

- `PLAYWRIGHT_WORKERS` - Always 1 (cannot be overridden)
- `PLAYWRIGHT_BASE_URL` - Should point to specific test instance

## Best Practices

1. **Development**: Use default settings, set `PLAYWRIGHT_BASE_URL` to your dev server
2. **CI**: Set `PLAYWRIGHT_BASE_URL` to production/staging URL, adjust `PLAYWRIGHT_WORKERS` based on CI resources
3. **Fast Testing**: Use `FAST_WITH_RETRIES=true` for more reliable quick tests
4. **Debugging**: Use `DEBUG_PLAYWRIGHT_CONFIG=true` to see configuration details

## Common Issues

### Service Not Available

If you see "Service at http://localhost:8082 is not available" errors:

- Check if your development server is running
- Set `PLAYWRIGHT_SKIP_WEBSERVER=true` if using auto-starting servers
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
