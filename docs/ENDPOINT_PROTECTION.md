# Endpoint Protection & Security Hardening Guide

Comprehensive guide for protecting your API endpoints and application infrastructure.

---

## Quick Implementation Checklist

- [ ] Enable HTTPS/TLS (AWS Amplify automatic)
- [ ] Configure CORS appropriately
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set security headers
- [ ] Enable AWS WAF
- [ ] Configure logging & monitoring
- [ ] Set up DDoS protection
- [ ] Implement authentication/authorization
- [ ] Regular security audits

---

## Part 1: HTTPS/TLS Enforcement

### AWS Amplify (Automatic)

AWS Amplify provides free SSL/TLS through AWS Certificate Manager:

- ✅ Automatic certificate provisioning
- ✅ Auto-renewal
- ✅ HTTPS by default

### Enforce HTTPS Only

**In amplify.yml:**

```yaml
redirects:
  - source: "http://<yourdomain.com>/<*>"
    target: "https://<yourdomain.com>/<*>"
    status: 301
```

**In server/index.ts:**

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https"
  ) {
    return res.redirect(301, `https://${req.header("host")}${req.url}`);
  }
  next();
});

// Strict Transport Security Header
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  next();
});
```

---

## Part 2: CORS (Cross-Origin Resource Sharing)

### Secure CORS Configuration

**server/index.ts:**

```typescript
import cors from "cors";
import { parse } from "url";

const getAllowedOrigins = () => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return [
      "http://localhost:3001",
      "http://localhost:8081",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:8081",
    ];
  }

  const production = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://api.yourdomain.com",
  ];

  // Allow additional origins from environment
  const customOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  return [...production, ...customOrigins];
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed from ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Codacy-Account",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page-Number"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

**Environment configuration (.env):**

```env
# Local development
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:8081

# Production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Part 3: Rate Limiting

### Basic Rate Limiting

**server/middleware/rateLimiter.ts:**

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "redis";

// Create Redis client for persistent rate limiting
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// Global rate limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:global:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === "/health";
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy (AWS Amplify)
    return req.get("x-forwarded-for") || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Stricter limit for auth endpoints: 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:auth:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful attempts
  message: "Too many login attempts",
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoint limiter: 10 requests per minute per endpoint
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:api:",
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "API rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form limiter: 1 per hour per IP
export const contactFormLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "rl:contact:",
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1,
  message: "Please wait before sending another message",
  standardHeaders: true,
  legacyHeaders: false,
});
```

**server/index.ts (apply limiters):**

```typescript
import {
  globalLimiter,
  authLimiter,
  apiLimiter,
  contactFormLimiter,
} from "./middleware/rateLimiter";

// Apply global limiter to all routes
app.use(globalLimiter);

// Apply auth limiter to auth routes
app.post("/api/auth/login", authLimiter, handleLogin);
app.post("/api/auth/register", authLimiter, handleRegister);

// Apply API limiter to endpoints
app.get("/api/projects", apiLimiter, getProjects);
app.post("/api/contact", contactFormLimiter, submitContactForm);
```

---

## Part 4: Input Validation & Sanitization

**server/middleware/validation.ts:**

```typescript
import { z, ZodError } from "zod";

// Reusable schemas
export const emailSchema = z.string().email().toLowerCase();
export const nameSchema = z.string().min(2).max(100).trim();
export const messageSchema = z.string().min(10).max(5000).trim();

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(3).max(200).trim(),
  message: messageSchema,
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: "Invalid phone number",
    }),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Sanitization middleware
export const sanitizeInputs = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      // Remove HTML/script tags
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {} as any);
    }

    return obj;
  };

  req.body = sanitize(req.body);
  next();
};
```

**Usage in routes:**

```typescript
import {
  validateRequest,
  contactFormSchema,
  sanitizeInputs,
} from "./middleware/validation";

app.post(
  "/api/contact",
  sanitizeInputs,
  validateRequest(contactFormSchema),
  contactFormLimiter,
  async (req, res) => {
    // req.body is validated and sanitized
    const { name, email, message } = req.body;
    // Process safely...
  },
);
```

---

## Part 5: Security Headers

**server/middleware/securityHeaders.ts:**

```typescript
import { Response, NextFunction, Request } from "express";

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Strict Transport Security
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.github.com https://api.figma.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Clickjacking protection
  res.setHeader("X-Frame-Options", "DENY");

  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    "Permissions-Policy",
    ["geolocation=()", "microphone=()", "camera=()", "payment=()"].join(", "),
  );

  // Remove server header
  res.removeHeader("Server");
  res.removeHeader("X-Powered-By");

  next();
};
```

**Apply in server/index.ts:**

```typescript
import { securityHeaders } from "./middleware/securityHeaders";

app.use(securityHeaders);
```

---

## Part 6: AWS WAF (Web Application Firewall)

### Enable WAF in Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. **Settings** → **Security** → **Enable WAF**

### Configure WAF Rules via CLI

**Create WAF rules file: `waf-rules.json`:**

```json
[
  {
    "name": "RateLimitRule",
    "priority": 1,
    "statement": {
      "rateBasedStatement": {
        "limit": 2000,
        "aggregateKeyType": "IP"
      }
    },
    "action": {
      "block": {}
    },
    "visibilityConfig": {
      "sampledRequestsEnabled": true,
      "cloudWatchMetricsEnabled": true,
      "metricName": "RateLimitRule"
    }
  },
  {
    "name": "SQLInjectionRule",
    "priority": 2,
    "statement": {
      "managedRuleGroupStatement": {
        "vendorName": "AWS",
        "name": "AWSManagedRulesSQLiRuleSet"
      }
    },
    "overrideAction": {
      "none": {}
    },
    "visibilityConfig": {
      "sampledRequestsEnabled": true,
      "cloudWatchMetricsEnabled": true,
      "metricName": "SQLInjectionRule"
    }
  },
  {
    "name": "XSSRule",
    "priority": 3,
    "statement": {
      "managedRuleGroupStatement": {
        "vendorName": "AWS",
        "name": "AWSManagedRulesKnownBadInputsRuleSet"
      }
    },
    "overrideAction": {
      "none": {}
    },
    "visibilityConfig": {
      "sampledRequestsEnabled": true,
      "cloudWatchMetricsEnabled": true,
      "metricName": "XSSRule"
    }
  }
]
```

### Deploy WAF

```bash
aws wafv2 create-web-acl \
  --scope CLOUDFRONT \
  --name portfolio-waf \
  --default-action Allow={} \
  --rules file://waf-rules.json \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=PortfolioWAF \
  --region us-east-1
```

---

## Part 7: Logging & Monitoring

**server/middleware/logging.ts:**

```typescript
import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent: string;
  error?: string;
}

const logFile = path.join(
  process.cwd(),
  "logs",
  `${new Date().toISOString().split("T")[0]}.log`,
);

// Ensure logs directory exists
fs.mkdirSync(path.dirname(logFile), { recursive: true });

const writeLog = (entry: LogEntry) => {
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(logFile, line);
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "WARN" : "INFO";

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      ip: req.get("x-forwarded-for") || req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
    };

    writeLog(entry);
  });

  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "ERROR",
    path: req.path,
    method: req.method,
    statusCode: res.statusCode,
    duration: 0,
    ip: req.get("x-forwarded-for") || req.ip || "unknown",
    userAgent: req.get("user-agent") || "unknown",
    error: error.message,
  };

  writeLog(entry);
  next(error);
};
```

**CloudWatch Integration:**

```typescript
import CloudWatch from "aws-sdk/clients/cloudwatch";

const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

export const sendMetricsToCloudWatch = async (entry: LogEntry) => {
  try {
    await cloudwatch
      .putMetricData({
        Namespace: "Portfolio/API",
        MetricData: [
          {
            MetricName: "RequestDuration",
            Value: entry.duration,
            Unit: "Milliseconds",
            Timestamp: new Date(),
            Dimensions: [
              { Name: "Endpoint", Value: entry.path },
              { Name: "Method", Value: entry.method },
            ],
          },
          {
            MetricName: "StatusCode",
            Value: entry.statusCode,
            Unit: "Count",
            Timestamp: new Date(),
            Dimensions: [
              { Name: "StatusCode", Value: String(entry.statusCode) },
            ],
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error("CloudWatch error:", error);
  }
};
```

---

## Part 8: DDoS Protection

AWS Amplify includes:

- ✅ CloudFront DDoS protection (Layer 3/4)
- ✅ AWS WAF (Layer 7)

### Additional Protection

1. **Enable Shield Advanced** (optional):

   ```bash
   aws shield subscribe --subscription
   ```

2. **Configure CloudFront**:
   - Amplify automatically uses CloudFront
   - Protects against DDoS at distribution level

3. **Monitor attacks**:
   - AWS Console → CloudWatch → DDoS metrics
   - Set CloudWatch alarms for spikes

---

## Part 9: Authentication & Authorization

**server/middleware/auth.ts:**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as any;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
```

---

## Security Audit Checklist

Run monthly:

```bash
# 1. Check dependencies
pnpm audit

# 2. Check for hardcoded secrets
grep -r "secret\|token\|password" . --exclude-dir=node_modules

# 3. Run type checks
pnpm typecheck

# 4. Run linter
pnpm lint

# 5. Check security headers (via curl)
curl -I https://yourdomain.com | grep -i "security\|content-security"

# 6. Monitor CloudWatch logs
# Navigate to: AWS Console → CloudWatch → Logs

# 7. Review WAF logs
# Navigate to: AWS Console → WAF & Shield → Web ACLs
```

---

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
