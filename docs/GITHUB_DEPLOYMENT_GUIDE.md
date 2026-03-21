# GitHub Deployment & Secrets Configuration Guide

This guide covers:

1. Setting up GitHub Secrets for CI/CD
2. Configuring AWS Amplify integration
3. Testing secrets in GitHub Actions
4. Token rotation procedures
5. Endpoint protection

## Part 1: GitHub Secrets Setup

### Step 1: Add Secrets to GitHub Repository

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add the following:

| Secret Name             | Value                         | Source                                         |
| ----------------------- | ----------------------------- | ---------------------------------------------- |
| `CODACY_ACCOUNT_TOKEN`  | Your Codacy API token         | https://app.codacy.com/organizations           |
| `GITHUB_TOKEN`          | GitHub Personal Access Token  | https://github.com/settings/tokens             |
| `FIGMA_API_KEY`         | Figma API key                 | https://www.figma.com/developers/api#get-files |
| `AWS_ACCESS_KEY_ID`     | AWS credential                | AWS Console → IAM                              |
| `AWS_SECRET_ACCESS_KEY` | AWS credential                | AWS Console → IAM                              |
| `AWS_REGION`            | Region (e.g., `eu-central-1`) | Your AWS region                                |

### Important Security Notes:

- **NEVER paste secrets in Pull Requests or Issues**
- Secrets are encrypted and only available in Actions workflows
- Use `$${{ secrets.SECRET_NAME }}$$ in workflows
- Rotate tokens every 90 days (see Token Rotation section)

---

## Part 2: AWS Amplify Integration

### Prerequisites:

- AWS Amplify CLI installed: `npm install -g @aws-amplify/cli`
- AWS credentials configured locally

### Step 1: Store Secrets in AWS Secrets Manager

Each secret should be stored with consistent naming:

```bash
# Create/update secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name production/codacy \
  --secret-string '{"CODACY_ACCOUNT_TOKEN":"your-token"}' \
  --region eu-central-1

aws secretsmanager create-secret \
  --name production/github \
  --secret-string '{"GITHUB_TOKEN":"your-token"}' \
  --region eu-central-1

aws secretsmanager create-secret \
  --name production/figma \
  --secret-string '{"FIGMA_API_KEY":"your-key","FIGMA_CLIENT_SECRET":"your-secret"}' \
  --region eu-central-1
```

### Step 2: Configure In Amplify

Update `amplify/backend.ts` or use the console to add environment variables:

```bash
# In Amplify Console
Environment Variables (Build/Deployment Phase):
  AWS_SECRETS_MANAGER_ID=production/codacy
  AWS_REGION=eu-central-1
```

### Step 3: Update amplify.yml

Your `amplify.yml` should have:

```yaml
version: 1

frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - pnpm install
        - bash scripts/load-secrets.sh --write-env .env.production
    build:
      commands:
        - echo "Building application..."
        - pnpm run build
    postBuild:
      commands:
        - echo "Build complete"
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - "node_modules/**/*"
```

**Key points:**

- `load-secrets.sh --write-env .env.production` injects secrets from AWS Secrets Manager
- Secrets are available during build phase
- Artifacts copied from `dist/` (combined frontend + server)

---

## Part 3: GitHub Actions CI/CD

### Example Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Amplify

on:
  push:
    branches:
      - production
  pull_request:
    branches:
      - production

env:
  AWS_REGION: eu-central-1

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Enable corepack
        run: corepack enable

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint code
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Format check
        run: pnpm format:check

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Enable corepack
        run: corepack enable

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run security audit
        run: pnpm audit --audit-level=moderate

  build:
    needs: [quality-checks, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Enable corepack
        run: corepack enable

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build with secrets
        env:
          CODACY_ACCOUNT_TOKEN: ${{ secrets.CODACY_ACCOUNT_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          FIGMA_API_KEY: ${{ secrets.FIGMA_API_KEY }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          export AWS_SECRETS_MANAGER_ID="production/codacy"
          export AWS_REGION="eu-central-1"
          pnpm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/production'
    steps:
      - uses: actions/checkout@v6

      - name: Deploy to AWS Amplify
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          npm install -g @aws-amplify/cli
          amplify deploy --yes --region eu-central-1
```

---

## Part 4: Token Rotation Procedure

### Rotation Schedule

- **Codacy Token**: Every 90 days
- **GitHub Token**: Every 180 days
- **AWS Credentials**: Every 90 days
- **Figma API Key**: Every 180 days

### Step-by-Step Rotation

#### 1. Generate New Token

```bash
# Example: Codacy
# Go to: https://app.codacy.com/organizations
# Click Settings → API Tokens → Generate Token
# Copy new token
```

#### 2. Update AWS Secrets Manager

```bash
# Update the secret with new token
aws secretsmanager update-secret \
  --secret-id production/codacy \
  --secret-string '{"CODACY_ACCOUNT_TOKEN":"new-token-here"}' \
  --region eu-central-1

# Verify update
aws secretsmanager get-secret-value \
  --secret-id production/codacy \
  --region eu-central-1
```

#### 3. Update GitHub Secrets

1. Go to Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret name
3. Click **Update**
4. Paste new token value
5. Click **Update secret**

#### 4. Update Local .env (if applicable)

```bash
# PowerShell
$env:CODACY_ACCOUNT_TOKEN = 'new-token-here'
```

#### 5. Revoke Old Token

```bash
# In Codacy dashboard:
# Settings → API Tokens → Revoke [old token]
```

#### 6. Test in CI/CD

```bash
# Push test commit to verify new token works
git add .
git commit -m "test: verify token rotation"
git push origin production
```

---

## Part 5: Endpoint Protection

### 1. API Rate Limiting

Configure rate limiting in your backend (`server/index.ts`):

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

### 2. CORS Configuration

```typescript
import cors from "cors";

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["https://yourdomain.com"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### 3. Input Validation

```typescript
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

app.post("/api/contact", (req, res) => {
  const validation = contactFormSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  // Process form...
});
```

### 4. AWS WAF (Web Application Firewall)

For Amplify, enable AWS WAF rules in the console:

```bash
# Via AWS CLI
aws wafv2 create-web-acl \
  --scope CLOUDFRONT \
  --name portfolio-waf \
  --default-action Block={} \
  --rules file://waf-rules.json \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=PortfolioWAF
```

### 5. HTTPS Enforcement

AWS Amplify automatically provides HTTPS. Ensure redirects in `amplify.yml`:

```yaml
redirects:
  - source: "http://<yourdomain.com>/<*>"
    target: "https://<yourdomain.com>/<*>"
    status: 301
```

### 6. Security Headers

Add security headers in your backend:

```typescript
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
```

### 7. Environment Hardening

**Production `.env.production`:**

```env
VITE_ENVIRONMENT=production
VITE_API_URL=https://api.yourdomain.com
RECAPTCHA_ENABLED=true
LOG_LEVEL=error
DEBUG=false
```

**Development `.env`:**

```env
VITE_ENVIRONMENT=development
VITE_API_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug
```

---

## Part 6: Monitoring & Logging

### AWS CloudWatch Integration

```typescript
import CloudWatch from "aws-sdk/clients/cloudwatch";

const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      cloudwatch.putMetricData(
        {
          Namespace: "Portfolio/API",
          MetricData: [
            {
              MetricName: "ErrorCount",
              Value: 1,
              Unit: "Count",
              Timestamp: new Date(),
              Dimensions: [
                { Name: "Endpoint", Value: req.path },
                { Name: "StatusCode", Value: String(res.statusCode) },
              ],
            },
          ],
        },
        (err) => {
          if (err) console.error("CloudWatch error:", err);
        },
      );
    }
  });
  next();
});
```

---

## Checklist for Full Deployment

- [ ] GitHub Secrets configured with all required tokens
- [ ] AWS Secrets Manager created with production secrets
- [ ] `amplify.yml` updated with `load-secrets.sh` step
- [ ] GitHub Actions workflow tested (quality checks, build, deploy)
- [ ] Amplify environment variables set in console
- [ ] Token rotation schedule documented
- [ ] API rate limiting configured
- [ ] CORS rules set appropriately
- [ ] Input validation on all endpoints
- [ ] AWS WAF rules enabled
- [ ] Security headers added to responses
- [ ] Monitoring/logging configured
- [ ] Domain SSL/TLS certificate installed
- [ ] Backup tokens stored securely (not in code)
- [ ] Team members trained on secrets handling

---

## Troubleshooting

### "No secret value returned"

- **Cause**: Secret doesn't exist or credentials lack permission
- **Fix**: Verify secret exists: `aws secretsmanager describe-secret --secret-id production/codacy`

### "UnrecognizedClientException: Invalid AWS credentials"

- **Cause**: AWS credentials expired or invalid
- **Fix**: Update GitHub Secrets with fresh credentials from IAM

### "CORS error in production"

- **Cause**: Origin not whitelisted
- **Fix**: Add production domain to `ALLOWED_ORIGINS` in backend

### Secrets not loading in GitHub Actions

- **Cause**: Secret name mismatch
- **Fix**: Double-check secret names match exactly in workflow file

---

## Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/)
- [OWASP API Security](https://owasp.org/API-Security/)
