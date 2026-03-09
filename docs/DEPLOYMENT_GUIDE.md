# Deployment Guide

## Architecture

- **Frontend**: Static export (`next build` with `output: "export"`) → S3 bucket → CloudFront CDN
- **Lambda Backend**: Single AWS Lambda function (`figma-portfolio-api`) → CloudFront `/api/*` routing
- **Amplify Gen 2 Backend**: Cognito auth + AppSync GraphQL + DynamoDB (App ID: `d1zjif7pi1h3om`)
- **Domain**: `www.baltzakisthemis.com` / `baltzakisthemis.com` via CloudFront

## Prerequisites

### Local Environment

- **Node.js**: Version 22.x or higher
- **PNPM**: Package manager (`npm install -g pnpm`)
- **AWS CLI**: Configured with your AWS credentials

### AWS Resources

| Resource | Identifier |
|---|---|
| S3 bucket | `figma-portfolio-static` |
| CloudFront distribution | `E134SCTR0QGQKJ` |
| Lambda function | `figma-portfolio-api` |
| Region | `us-east-1` |

## Local Build Process

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Tests

```bash
pnpm test:e2e
pnpm lint
```

### 3. Build for Production

```bash
# Builds static HTML/CSS/JS to out/ directory
pnpm build
```

> **Note**: `output: "export"` is conditional on `NODE_ENV === "production"`. The dev server (`pnpm dev`) runs normally without static export restrictions.

### 4. Test Build Locally

```bash
# Serve the static output
npx serve out
```

## Frontend Deployment (S3 + CloudFront)

### Deploy Static Assets

```bash
# Sync build output to S3
aws s3 sync out/ s3://figma-portfolio-static --delete --region us-east-1

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E134SCTR0QGQKJ \
  --paths "/*"
```

### Verify Deployment

```bash
# Check all routes return 200
for route in "" about agents contact performance product projects resume settings; do
  echo -n "/$route: "
  curl -s -o /dev/null -w "%{http_code}" "https://baltzakisthemis.com/$route"
  echo
done
```

## Backend Deployment (Lambda)

### Lambda Configuration

| Setting | Value |
|---|---|
| Function name | `figma-portfolio-api` |
| Runtime | Node.js |
| Memory | 256 MB |
| Timeout | 15 seconds |
| Function URL | `oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws` |

### Environment Variables (14)

```bash
NODE_ENV=production
RECAPTCHA_SECRET_KEY=<real reCAPTCHA v3 secret>
SES_VERIFIED_EMAIL=noreply@cloudless.gr
SENTRY_DSN=<sentry DSN>
SENTRY_ENVIRONMENT=production
PING_MESSAGE=ping_pong
SLACK_WEBHOOK_URL=<slack webhook>
SLACK_CHANNEL=#personal-website
ANTHROPIC_API_KEY=<anthropic key>
VAPID_PUBLIC_KEY=<vapid public>
VAPID_PRIVATE_KEY=<vapid private>
VAPID_EMAIL=mailto:noreply@cloudless.gr
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-FT79QM66D3
GOOGLE_ANALYTICS_API_SECRET=<ga4 api secret>
```

### Update Lambda Environment

```bash
aws lambda update-function-configuration \
  --function-name figma-portfolio-api \
  --environment "Variables={KEY=value,...}" \
  --region us-east-1
```

### Update Lambda Code

```bash
# Package and deploy new Lambda code
zip -r lambda.zip index.js node_modules/
aws lambda update-function-code \
  --function-name figma-portfolio-api \
  --zip-file fileb://lambda.zip \
  --region us-east-1
```

### Verify Backend

```bash
# Health check
curl https://baltzakisthemis.com/api/ping

# Contact endpoint
curl -X POST https://baltzakisthemis.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'
```

## CloudFront Configuration

CloudFront distribution `E134SCTR0QGQKJ` has two cache behaviors:

| Pattern | Origin | Purpose |
|---|---|---|
| `/api/*` | Lambda Function URL | Backend API requests |
| `Default (*)` | S3 bucket | Static frontend assets |

> **Note**: No custom error responses (SPA fallback) — this ensures Lambda JSON errors pass through correctly.

## Local Development

```bash
# Terminal 1: Next.js dev server (frontend on port 8082)
pnpm dev

# Terminal 2: Express API server (backend on port 3001)
npx tsx server/index.ts
```

## Troubleshooting

### Build Failures

- Check `pnpm build` output for TypeScript errors
- Ensure `output: "export"` is compatible with your routes (no dynamic server-side routes)
- Run `pnpm typecheck` separately for detailed TS errors

### Lambda Issues

- Check CloudWatch logs: `aws logs tail /aws/lambda/figma-portfolio-api --follow`
- Verify env vars: `aws lambda get-function-configuration --function-name figma-portfolio-api --query Environment.Variables`
- Test Lambda directly: `curl https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws/api/ping`

### CloudFront Issues

- Check invalidation status: `aws cloudfront list-invalidations --distribution-id E134SCTR0QGQKJ`
- Verify S3 bucket contents: `aws s3 ls s3://figma-portfolio-static/`

## CI/CD Deployment

### Automated (GitHub Actions)

Two workflows trigger on push to `production` branch or manual dispatch:

| Workflow | File | Description |
|---|---|---|
| Deploy to Production | `.github/workflows/deploy.yml` | Standard Actions — build, S3 sync, CloudFront invalidation |
| Production Deployment (Agentic) | `.github/workflows/deploy-production.md` | Copilot-powered — deploy + smoke tests + deployment report |

Both generate `amplify_outputs.json` before building to ensure the Amplify Gen 2 backend config is included.

```bash
# Trigger manually
gh workflow run "Deploy to Production"
```

### Local Deploy Script

```bash
# Full deploy: amplify outputs → build → S3 sync → CloudFront invalidation (with wait)
./scripts/deploy.sh
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user with S3 + CloudFront permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AMPLIFY_PRODUCTION_APP_ID` | Amplify App ID (`d1zjif7pi1h3om`) |
| `COPILOT_GITHUB_TOKEN` | Fine-grained PAT for agentic workflows |

## Quick Deploy Checklist

- [ ] `npx ampx generate outputs --branch production --app-id d1zjif7pi1h3om`
- [ ] `pnpm build` succeeds
- [ ] `aws s3 sync out/ s3://figma-portfolio-static --delete`
- [ ] `aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"`
- [ ] All routes return 200
- [ ] `/api/ping` returns health check
- [ ] Contact form works end-to-end
