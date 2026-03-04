# Sentry Lambda Integration

This document describes the Sentry integration for AWS Lambda functions in this project.

## Overview

All Lambda functions in `amplify/functions/` are integrated with Sentry for comprehensive error tracking, performance monitoring, and debugging capabilities.

## Architecture

```
amplify/functions/
├── shared/
│   └── sentry.ts          # Shared Sentry configuration and utilities
├── contact/
│   └── index.ts           # Contact form handler with Sentry
├── demo/
│   └── index.ts           # Demo function with Sentry
├── ping/
│   └── index.ts           # Health check with Sentry
├── playwright-autofix/
│   └── index.ts           # AI autofix with Sentry
├── push-notifications/
│   └── index.ts           # Push notifications with Sentry
└── resume/
    └── index.ts           # Resume PDF generator with Sentry
```

## Configuration

### Environment Variables

The following environment variables are required for Sentry integration:

| Variable                      | Description                                  | Required                                 |
| ----------------------------- | -------------------------------------------- | ---------------------------------------- |
| `SENTRY_DSN`                  | Sentry Data Source Name                      | Yes                                      |
| `SENTRY_ENVIRONMENT`          | Environment name (e.g., production, staging) | No (defaults to Lambda function name)    |
| `SENTRY_RELEASE`              | Release version for tracking                 | No (defaults to Lambda function version) |
| `SENTRY_TRACES_SAMPLE_RATE`   | Performance tracing sample rate (0.0-1.0)    | No (defaults to 1.0)                     |
| `SENTRY_PROFILES_SAMPLE_RATE` | Profiling sample rate (0.0-1.0)              | No (defaults to 1.0)                     |

### Setting Environment Variables

#### AWS Lambda Console

1. Go to AWS Lambda Console
2. Select your function
3. Navigate to Configuration > Environment variables
4. Add the Sentry environment variables

#### AWS SAM/CloudFormation

```yaml
Environment:
  Variables:
    SENTRY_DSN: https://your-dsn@sentry.io/project-id
    SENTRY_ENVIRONMENT: production
```

#### AWS Amplify Gen 2

Set environment variables in the Amplify Console or via CLI:

```bash
amplify env add SENTRY_DSN your-dsn-value
```

## Shared Sentry Module

The `shared/sentry.ts` module provides centralized Sentry configuration and helper functions:

### Initialization

```typescript
import { initSentry } from "../shared/sentry";

// Initialize Sentry on cold start
initSentry();
```

### Available Functions

| Function                                         | Description                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `initSentry()`                                   | Initialize Sentry (called automatically on import if SENTRY_DSN is set) |
| `wrapHandler(handler)`                           | Wrap a Lambda handler with automatic error capture                      |
| `captureException(error, context?)`              | Manually capture an exception                                           |
| `captureMessage(message, level)`                 | Capture a message (info, warning, error, fatal)                         |
| `addBreadcrumb(category, message, level, data?)` | Add a breadcrumb for tracing                                            |
| `setUser(user)`                                  | Set user context                                                        |
| `setTag(key, value)`                             | Set a tag for filtering                                                 |
| `setContext(key, context)`                       | Set extra context                                                       |
| `startTransaction(name, op)`                     | Start a performance transaction                                         |
| `flush(timeout?)`                                | Flush events before Lambda terminates                                   |

## Usage Examples

### Basic Function with Sentry

```typescript
import type { Handler } from "aws-lambda";
import {
  initSentry,
  captureException,
  addBreadcrumb,
  setTag,
  flush,
} from "../shared/sentry";

// Initialize Sentry on cold start
initSentry();

export const handler: Handler = async (event) => {
  // Set function context
  setTag("function", "my-function");
  setTag("http_method", event.httpMethod || "unknown");

  addBreadcrumb("request", "Handler invoked", "info");

  try {
    // Your logic here
    const result = await processData(event);

    // Flush before returning
    await flush();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error("Unknown error"),
      {
        operation: "process-data",
      },
    );

    await flush();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
```

### Using wrapHandler for Automatic Error Capture

```typescript
import { wrapHandler } from "../shared/sentry";

const myHandler = async (event) => {
  // Your logic here
  // Errors are automatically captured by Sentry
};

export const handler = wrapHandler(myHandler);
```

### Performance Monitoring

```typescript
import { startTransaction, addBreadcrumb, flush } from "../shared/sentry";

export const handler = async (event) => {
  const transaction = startTransaction("my-operation", "function");

  addBreadcrumb("step1", "Starting step 1", "info");
  await step1();

  addBreadcrumb("step2", "Starting step 2", "info");
  await step2();

  transaction.finish();
  await flush();

  return { statusCode: 200, body: "Success" };
};
```

## Security Features

The shared Sentry module includes automatic filtering of sensitive data:

### Filtered Headers

- `authorization`
- `x-api-key`
- `x-relay-secret`
- `cookie`

### Filtered Environment Variables

- `SENTRY_DSN`
- `GITHUB_TOKEN`
- `RECAPTCHA_SECRET_KEY`
- `DATABASE_URL`
- `RELAY_SECRET`

## Best Practices

1. **Always call `flush()` before returning** - Ensures events are sent before Lambda freezes
2. **Initialize Sentry on cold start** - Call `initSentry()` at module level
3. **Use tags for filtering** - Set tags like `function`, `http_method` for easier debugging
4. **Add breadcrumbs for tracing** - Track the flow of execution through your function
5. **Capture context** - Use `setContext()` to add relevant data for debugging
6. **Don't log sensitive data** - Avoid passing PII or secrets to Sentry

## Monitoring in Sentry Dashboard

### Viewing Lambda Errors

1. Navigate to Sentry Dashboard
2. Filter by `server_name` (Lambda function name)
3. Use tags to filter by function, HTTP method, etc.

### Performance Monitoring

1. Navigate to Performance tab
2. View transactions by function name
3. Analyze slow requests and bottlenecks

### Release Tracking

Releases are automatically tracked using Lambda function versions:

- View issues by release
- Track deployment impact
- Compare performance across releases

## Troubleshooting

### Sentry Not Receiving Events

1. **Check SENTRY_DSN** - Ensure it's set correctly in environment variables
2. **Check Lambda logs** - Look for `[Sentry]` initialization messages
3. **Verify flush()** - Ensure `flush()` is called before the handler returns
4. **Check network** - Lambda needs outbound HTTPS to `sentry.io`

### High Latency

1. **Reduce sample rates** - Set `SENTRY_TRACES_SAMPLE_RATE` to lower value
2. **Reduce flush timeout** - Call `flush(1000)` instead of default 2000ms
3. **Batch operations** - Reduce number of Sentry calls in hot paths

### Missing Context

1. **Check tag/context calls** - Ensure they're called before errors occur
2. **Verify timing** - Context must be set before `captureException()`

## Related Documentation

- [Sentry AWS Lambda Documentation](https://docs.sentry.io/platforms/node/guides/aws-lambda/)
- [Sentry Node SDK Reference](https://docs.sentry.io/platforms/node/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## Changelog

### 2026-02-22

- Initial Sentry integration for all Lambda functions
- Created shared Sentry module with centralized configuration
- Added performance monitoring and breadcrumb tracking
- Implemented automatic sensitive data filtering
