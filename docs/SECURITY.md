# Security Documentation

This document outlines the security measures, best practices, and configurations implemented in the portfolio project.

## Security Overview

The portfolio implements a multi-layered security approach covering:

- **Input Validation & Sanitization**
- **Authentication & Authorization**
- **Data Protection**
- **Network Security**
- **Content Security**
- **Monitoring & Logging**

## Security Headers

### Amplify Configuration (CloudFront Level)

Security and caching headers are configured in `amplify.yml` under `customHeaders` because the app uses `output: "export"` (static export), which is incompatible with Next.js runtime `headers()`.

```yaml
# amplify.yml — HTML security headers
- pattern: "**/*.html"
  headers:
    - key: "Cache-Control"
      value: "public, max-age=0, must-revalidate"
    - key: "X-DNS-Prefetch-Control"
      value: "on"
    - key: "X-Content-Type-Options"
      value: "nosniff"
    - key: "Referrer-Policy"
      value: "origin-when-cross-origin"
    - key: "X-Frame-Options"
      value: "SAMEORIGIN"
    - key: "X-XSS-Protection"
      value: "1; mode=block"

# JS/CSS/images/fonts get Cache-Control + X-Content-Type-Options
# Fonts also get Access-Control-Allow-Origin: *
```

### Security Headers Explained

| Header | Purpose | Value |
|--------|---------|-------|
| **X-DNS-Prefetch-Control** | Controls DNS prefetching | `on` |
| **X-Content-Type-Options** | Prevents MIME type sniffing | `nosniff` |
| **Referrer-Policy** | Controls referrer information | `origin-when-cross-origin` |
| **X-Frame-Options** | Prevents clickjacking | `SAMEORIGIN` |
| **X-XSS-Protection** | Enables XSS filtering | `1; mode=block` |
| **Cache-Control** | Controls caching behavior | Varies by content type |

## Authentication

Authentication uses **AWS Amplify Gen 2 Cognito** for all environments. The admin dashboard requires users to be in the `admin` Cognito group.

- **`src/contexts/AuthContext.tsx`**: Uses Amplify Hub to listen for auth events (`signedIn`, `signedOut`, `tokenRefresh`) + `getCurrentUser()` on mount
- **`src/components/admin/useAdminAuth.ts`**: Wraps Amplify `signIn`/`signOut` with timeout and Cognito error code mapping. Uses `USER_PASSWORD_AUTH` flow (not SRP) because admin users are created via `admin-set-user-password`, which breaks SRP's password verifier
- **`server/middleware/requireAuth.ts`**: Validates Cognito ID tokens using `aws-jwt-verify` — extracts `sub`, `email`, and `cognito:groups` from the JWT payload

---

## Input Validation & Sanitization

### Contact Form Security

```typescript
// server/routes/contact.ts
import DOMPurify from 'isomorphic-dompurify';

function validateContactForm(data: any): ContactFormRequest {
  // Required field validation
  if (!data.name || !data.email || !data.message) {
    throw new Error('All fields are required');
  }
  
  // Email format validation
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email format');
  }
  
  // Length validation
  if (data.name.length > 100) {
    throw new Error('Name too long');
  }
  
  if (data.message.length > 10000) {
    throw new Error('Message too long');
  }
  
  // XSS sanitization
  const cleanData = {
    name: DOMPurify.sanitize(data.name),
    email: DOMPurify.sanitize(data.email),
    subject: DOMPurify.sanitize(data.subject),
    message: DOMPurify.sanitize(data.message),
  };
  
  return cleanData as ContactFormRequest;
}
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email], (err, results) => {
  // Handle results
});
```

### Command Injection Prevention

```typescript
// Avoid shell commands with user input
// ❌ Bad
exec(`rm ${userInput}`);

// ✅ Good
const path = path.resolve(userInput);
if (isValidPath(path)) {
  exec(`rm ${path}`);
}
```

## Authentication & Authorization

### reCAPTCHA v3 Integration

```typescript
// server/routes/contact.ts
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });
  
  const result = await response.json();
  
  // Require score > 0.5
  return result.success && result.score > 0.5;
}
```

### API Key Management

```typescript
// server/routes/apiKeys.ts
// Rate limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/organizations/api_keys', apiLimiter);
```

## Data Protection

### Environment Variables

```typescript
// .env.example
# Client-side variables (bundled into JS)
NEXT_PUBLIC_SITE_URL=https://baltzakis.dev
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Server-side variables (for Express dev server)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
ANTHROPIC_API_KEY=your-anthropic-api-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

### Secrets Management

- **Never commit secrets** to the repository
- Use AWS Secrets Manager for production secrets
- Use `.env` files for local development
- Validate required environment variables on startup

```typescript
// server/env.ts
function validateEnvVars() {
  const required = [
    'RECAPTCHA_SECRET_KEY',
    'SLACK_WEBHOOK_URL',
    'ANTHROPIC_API_KEY',
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

## Network Security

### CORS Configuration

```typescript
// server/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://baltzakis.dev'] 
    : ['http://localhost:8082'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### HTTPS Enforcement

```typescript
// next.config.ts
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Content Security Policy

### CSP Headers

```typescript
// next.config.ts
headers: [
  {
    source: "/(.*)",
    headers: [
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'none'; object-src 'none';"
      }
    ]
  }
]
```

### CSP Directives Explained

| Directive | Purpose | Value |
|-----------|---------|-------|
| **default-src** | Default policy for all resources | `'self'` |
| **script-src** | JavaScript sources | `'self' 'unsafe-inline' 'unsafe-eval'` |
| **style-src** | CSS sources | `'self' 'unsafe-inline'` |
| **img-src** | Image sources | `'self' data: https:` |
| **font-src** | Font sources | `'self' https:` |
| **connect-src** | AJAX/fetch sources | `'self' https:` |
| **frame-src** | iframe sources | `'none'` |
| **object-src** | Plugin sources | `'none'` |

## Error Handling

### Secure Error Responses

```typescript
// server/routes/contact.ts
app.post('/api/contact', async (req, res) => {
  try {
    const result = await processContactForm(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Contact form error:', error);
    
    // Don't expose internal error details to client
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process contact form' 
    });
  }
});
```

### Sentry Integration

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  // Filter sensitive data
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});
```

## Automated Security Scanning (Snyk)

The project uses [Snyk](https://snyk.io/) for continuous security scanning across three dimensions:

### Scan Types

| Scan | Command | What It Checks |
|------|---------|----------------|
| **Dependency Scan** | `snyk test --severity-threshold=high --all-projects` | Known CVEs in npm dependencies via `pnpm-lock.yaml` |
| **Code Scan (SAST)** | `snyk code test --exclude=playwright-tests,scripts/test-*` | Static analysis of source code for security anti-patterns |
| **IaC Scan** | `snyk iac test` | Misconfigurations in `amplify.yml` and infrastructure files |

### When Scans Run

- **Weekly** (Monday 6am UTC) — scheduled full scan
- **On PRs** to `production` or `main` — all 3 scan types
- **On push** to `production` — all 3 scan types + `snyk monitor` (updates Snyk dashboard)
- **Pre-deploy** — `deploy.yml` runs `snyk test --severity-threshold=critical` as a **blocking** deployment gate (critical vulnerabilities fail the deploy)

### Configuration

- **`.snyk`** — Policy file with exclude rules for non-production code (`playwright-tests/`, `scripts/test-*`)
- **`.github/workflows/snyk-security.yml`** — Workflow with pinned CLI version
- **GitHub Secrets**: `SNYK_TOKEN`, `SNYK_ORG`
- **Snyk Dashboard**: Results are uploaded via `snyk monitor` on production pushes

### Rate Limiting

The chat endpoint (`server/routes/chat.ts`) implements in-memory rate limiting:
- **Window**: 60 seconds per IP
- **Limit**: 15 requests per window
- **Cleanup**: Stale entries cleared every 5 minutes
- **Response**: HTTP 429 when limit exceeded

## Security Testing

### E2E Security Tests

```typescript
// playwright-tests/security-headers.spec.ts — API security header validation
// playwright-tests/security.spec.ts — XSS prevention, input sanitization
// playwright-tests/snyk-security-fixes.spec.ts — Snyk fix verification (rate limiting, X-Powered-By, type validation)
```

### OWASP Top 10 Coverage

| OWASP Risk | Implementation | Status |
|------------|----------------|--------|
| **A01: Broken Access Control** | API rate limiting (chat endpoint), CORS, Cognito auth | ✅ Implemented |
| **A02: Cryptographic Failures** | HTTPS, secure headers, cookie Secure attribute | ✅ Implemented |
| **A03: Injection** | Input type validation on all API endpoints, DOMPurify | ✅ Implemented |
| **A04: Insecure Design** | Security by design principles | ✅ Implemented |
| **A05: Security Misconfiguration** | Security headers, X-Powered-By disabled, `.snyk` policy | ✅ Implemented |
| **A06: Vulnerable Components** | Snyk dependency scanning (weekly + PR + pre-deploy) | ✅ Implemented |
| **A07: Authentication Failures** | reCAPTCHA, rate limiting, Cognito auth | ✅ Implemented |
| **A08: Software Integrity** | Snyk SAST + dependency scanning, pinned CI versions | ✅ Implemented |
| **A09: Logging Failures** | Sentry integration | ✅ Implemented |
| **A10: Server-Side Request Forgery** | Service worker same-origin validation (`public/sw.js`) | ✅ Implemented |

## Security Monitoring

### Error Tracking

```typescript
// lib/analytics.ts
export function trackSecurityEvent(event: string, details: any) {
  // Send to security monitoring service
  console.warn(`Security event: ${event}`, details);
  
  // Optional: Send to external service
  if (process.env.SECURITY_WEBHOOK_URL) {
    fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ event, details }),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Rate Limiting

The chat API (`server/routes/chat.ts`) uses an in-memory rate limiter (no external dependencies):

```typescript
// 15 requests per minute per IP, with automatic cleanup every 5 minutes
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
```

The rate limiter extracts client IP from `X-Forwarded-For` (for Lambda/CloudFront) or `req.socket.remoteAddress`.

## Security Best Practices

### 1. Dependency Management

```bash
# Snyk security scan (recommended)
snyk test --severity-threshold=high --all-projects

# Upload to Snyk dashboard for continuous monitoring
snyk monitor --all-projects --project-name=portfolio-nextjs

# pnpm built-in audit (quick check)
pnpm audit --audit-level=moderate
```

### 2. Code Review Checklist

- [ ] Input validation on all user inputs
- [ ] Output encoding for dynamic content
- [ ] Authentication for sensitive operations
- [ ] Authorization checks for data access
- [ ] Secure session management
- [ ] Proper error handling
- [ ] Security headers configured
- [ ] CSP policy implemented
- [ ] HTTPS enforced
- [ ] Secrets not committed to repository

### 3. Production Security

```typescript
// Production-specific security measures
if (process.env.NODE_ENV === 'production') {
  // Disable debug information
  app.set('env', 'production');
  
  // Enable additional security middleware
  app.use(helmet());
  
  // Log security events
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.ip} - ${req.method} ${req.path}`);
    next();
  });
}
```

## Incident Response

### Security Incident Checklist

1. **Detection**
   - Monitor logs for suspicious activity
   - Set up alerts for security events
   - Regular security scans

2. **Assessment**
   - Determine scope and impact
   - Identify affected systems
   - Assess data compromise

3. **Containment**
   - Isolate affected systems
   - Block malicious IPs
   - Disable compromised accounts

4. **Recovery**
   - Apply security patches
   - Restore from clean backups
   - Monitor for recurrence

5. **Post-Incident**
   - Document incident details
   - Update security measures
   - Conduct lessons learned review

## Security Resources

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security scanner
- [Snyk](https://snyk.io/) - Dependency vulnerability scanning
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit) - Built-in vulnerability scanner
- [Retire.js](https://retirejs.github.io/retire.js/) - JavaScript vulnerability scanner

### Documentation
- [OWASP Top 10](https://owasp.org/Top10/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [CSP Reference](https://content-security-policy.com/)

### Guidelines
- [Security Headers Guide](https://securityheaders.com/)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Input Validation Guide](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Security Compliance

### GDPR Compliance

- **Data Minimization**: Only collect necessary data
- **User Consent**: Cookie consent management
- **Right to Erasure**: Data deletion functionality
- **Data Portability**: Export user data
- **Privacy by Design**: Security built into architecture

### Privacy Policy Requirements

- Clear data collection notice
- Purpose specification
- Data retention policy
- User rights information
- Contact information for privacy concerns

## Regular Security Tasks

### Daily
- Monitor security logs
- Check for failed login attempts
- Review error reports

### Weekly
- Run security scans
- Check dependency vulnerabilities
- Review access logs

### Monthly
- Update dependencies
- Review security configurations
- Test incident response procedures

### Quarterly
- Security audit
- Penetration testing
- Policy review and updates
- Staff security training

This comprehensive security approach ensures the portfolio application maintains high security standards while providing a great user experience.