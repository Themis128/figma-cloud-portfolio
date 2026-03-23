# Deployment Guide

This document provides comprehensive deployment instructions for the portfolio project across different environments and platforms.

## Deployment Overview

The portfolio uses a **static export** architecture with **S3 + CloudFront** for frontend hosting, **AWS Lambda** for backend API functionality, and **AWS Amplify Gen 2** for auth + data (Cognito + AppSync + DynamoDB).

### Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   S3 Static      │    │   Lambda        │
│   CDN           │    │   Assets         │    │   API           │
│                 │    │                  │    │                 │
│ • Edge Caching  │◄──►│ • HTML, CSS, JS  │    │ • Express API   │
│ • SSL/TLS       │    │ • Images, Fonts  │    │ • reCAPTCHA     │
│ • WAF           │    │ • PWA Files      │    │ • Email (SES)   │
│ • Custom Domain │    │ • Fallback HTML  │    │ • Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌──────────────────┐  ┌────────────┐  ┌────────────────┐
    │   Amplify Gen 2  │  │  Route 53  │  │  CloudFormation│
    │   Backend        │  │  DNS       │  │                │
    │                  │  │            │  │  • CDK Stacks  │
    │ • Cognito Auth   │  │ • Domain   │  │  • Backend     │
    │ • AppSync GQL    │  │ • SSL      │  │    resources   │
    │ • DynamoDB       │  │ • Health   │  │                │
    └──────────────────┘  └────────────┘  └────────────────┘
```

> **Note**: Amplify Hosting's build system cannot handle the Next.js 16 build within its memory limits (OOM at "Collecting build traces"). Frontend deployment bypasses Amplify Hosting entirely — using direct S3 sync + CloudFront invalidation instead.

## Prerequisites

### AWS Account Setup

1. **Create AWS Account** (if not already done)
2. **Configure IAM User** with required permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:*",
           "cloudfront:*",
           "lambda:*",
           "iam:*",
           "route53:*",
           "acm:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Install AWS CLI** and configure credentials:
   ```bash
   aws configure
   # Enter Access Key ID, Secret Access Key, Region, Output Format
   ```

### Required Services

- **Amazon S3** - Static file hosting
- **Amazon CloudFront** - CDN and SSL termination
- **AWS Lambda** - Serverless API backend
- **Amazon Route 53** - DNS management (optional)
- **AWS Certificate Manager** - SSL certificates (optional)

## Environment Setup

### Environment Variables

#### Production Environment (.env.production)

```env
# Client-side variables (bundled into JS)
NEXT_PUBLIC_SITE_URL=https://www.baltzakisthemis.com
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Server-side variables (for Lambda)
NODE_ENV=production
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SES_VERIFIED_EMAIL=your-verified-email@domain.com
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_ENVIRONMENT=production
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_CHANNEL=#personal-website
ANTHROPIC_API_KEY=your-anthropic-api-key
VAPID_PUBLIC_KEY=your-vapid-public-key          # Generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=your-vapid-private-key        # Must persist across deploys
VAPID_EMAIL=mailto:your-email@domain.com
GOOGLE_ANALYTICS_MEASUREMENT_ID=GA_MEASUREMENT_ID
GOOGLE_ANALYTICS_API_SECRET=GA_API_SECRET
```

#### Local Development (.env.local)

```env
# Use development values
NEXT_PUBLIC_SITE_URL=http://localhost:8082
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Test reCAPTCHA keys (for development)
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## Frontend Deployment (S3 + CloudFront)

### 1. Create S3 Bucket

```bash
# Create bucket (replace with your domain)
aws s3 mb s3://figma-portfolio-static

# Configure bucket for static website hosting
aws s3 website s3://figma-portfolio-static \
  --index-document index.html \
  --error-document 404.html

# Set bucket policy for public read access
aws s3api put-bucket-policy \
  --bucket figma-portfolio-static \
  --policy '{
    "Version":"2012-10-17",
    "Statement":[{
      "Sid":"PublicReadGetObject",
      "Effect":"Allow",
      "Principal":"*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::figma-portfolio-static/*"]
    }]
  }'
```

### 2. Build and Deploy Frontend

```bash
# Build for production
pnpm build

# Sync files to S3
aws s3 sync out/ s3://figma-portfolio-static --delete

# Set cache headers for static assets
aws s3 sync out/ s3://figma-portfolio-static \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "sw.js" \
  --exclude "workbox-*.js"

# Set cache headers for HTML files
aws s3 sync out/ s3://figma-portfolio-static \
  --delete \
  --cache-control "no-cache, no-store, must-revalidate" \
  --include "*.html"
```

### 3. Create CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name figma-portfolio-static.s3.amazonaws.com \
  --default-root-object index.html \
  --default-cache-behavior TargetOriginId=figma-portfolio-static,ViewerProtocolPolicy=redirect-to-https,ForwardedValues={QueryString=false,Cookies={Forward=all}} \
  --comment "Portfolio Frontend" \
  --enabled true \
  --price-class PriceClass_100 \
  --viewer-certificate "ACMCertificateArn=arn:aws:acm:us-east-1:account:certificate/xxxx-xxxx-xxxx,SSLSupportMethod=SNI-only"
```

### 4. Configure Custom Domain (Optional)

```bash
# Create SSL certificate in ACM (us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name baltzakisthemis.com \
  --validation-method DNS \
  --region us-east-1

# Update CloudFront to use custom domain and SSL certificate
aws cloudfront update-distribution \
  --id E134SCTR0QGQKJ \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json:**
```json
{
  "CallerReference": "portfolio-frontend",
  "Aliases": {
    "Quantity": 1,
    "Items": ["baltzakisthemis.com"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "figma-portfolio-static",
      "DomainName": "figma-portfolio-static.s3.amazonaws.com",
      "S3OriginConfig": {}
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "figma-portfolio-static",
    "ViewerProtocolPolicy": "redirect-to-https",
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "all" }
    }
  },
  "Comment": "Portfolio Frontend",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:account:certificate/xxxx-xxxx-xxxx",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "PriceClass": "PriceClass_100"
}
```

## Backend Deployment (AWS Lambda)

### 1. Create Lambda Function

```bash
# Build and deploy Lambda
npx esbuild server/lambda.ts \
  --bundle --platform=node --target=node20 --format=esm \
  --outfile=/tmp/lambda-build/index.mjs \
  --external:@aws-sdk/* \
  --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

cd /tmp/lambda-build && zip -j lambda.zip index.mjs

aws lambda update-function-code \
  --function-name figma-portfolio-api \
  --zip-file fileb:///tmp/lambda-build/lambda.zip \
  --region us-east-1
```

#### IAM Policy Requirements

The Lambda execution role (`newsletter-lambda-role`) needs:

| Permission | Resource | Purpose |
|---|---|---|
| `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream` | `arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-haiku-*`, `arn:aws:bedrock:us-east-1:<account>:inference-profile/us.anthropic.claude-3-5-haiku-*` | AI chat (cross-region inference profile) |
| `ses:SendEmail`, `ses:SendRawEmail` | `*` | Contact form emails |
| `s3:GetObject`, `s3:PutObject` | `arn:aws:s3:::figma-portfolio-static/_data/*` | Push notification subscription storage |

#### Push Notification Subscription Storage

Subscriptions are persisted as a JSON file on S3 at `s3://figma-portfolio-static/_data/push-subscriptions.json`. The Lambda loads from S3 on first request and caches in memory, writing back on mutations. This survives cold starts and redeploys.

### 2. Configure Environment Variables

```bash
# Update environment variables
aws lambda update-function-configuration \
  --function-name figma-portfolio-api \
  --environment Variables="{
    \"NODE_ENV\":\"production\",
    \"RECAPTCHA_SECRET_KEY\":\"your-secret-key\",
    \"SES_VERIFIED_EMAIL\":\"your-email@domain.com\",
    \"SENTRY_DSN\":\"https://your-sentry-dsn@sentry.io/project\",
    \"SLACK_WEBHOOK_URL\":\"https://hooks.slack.com/services/your/webhook/url\",
    \"ANTHROPIC_API_KEY\":\"your-anthropic-key\",
    \"VAPID_PUBLIC_KEY\":\"your-vapid-public-key\",
    \"VAPID_PRIVATE_KEY\":\"your-vapid-private-key\",
    \"VAPID_EMAIL\":\"mailto:your-email@domain.com\",
    \"GOOGLE_ANALYTICS_MEASUREMENT_ID\":\"GA_MEASUREMENT_ID\",
    \"GOOGLE_ANALYTICS_API_SECRET\":\"GA_API_SECRET\",
    \"GITHUB_TOKEN\":\"ghp_your_fine_grained_pat\",
    \"GITHUB_USERNAME\":\"Themis128\"
  }"
```

### 3. Create Lambda Function URL

```bash
# Create function URL for direct HTTP access
aws lambda create-function-url-config \
  --function-name figma-portfolio-api \
  --auth-type NONE \
  --cors '{}'

# Get function URL
aws lambda get-function-url-config --function-name figma-portfolio-api
```

> **Same-origin API routing**: The frontend no longer calls the Lambda Function URL directly. All `/api/*` requests use relative paths (same-origin) and are routed through CloudFront to the Lambda origin. This eliminates CORS entirely — no preflight requests, no `Access-Control-Allow-Origin` headers needed, and no Edge Tracking Prevention issues in Safari/Brave. The `LAMBDA_API_URL` constant in `src/lib/admin-constants.ts` is retained as a fallback reference only but is not used at runtime. The Lambda Function URL still exists for CloudFront to use as an origin, but clients never call it directly.

### 4. Configure CloudFront to Route API Requests

```bash
# Update CloudFront distribution to route /api/* to Lambda
aws cloudfront update-distribution \
  --id E134SCTR0QGQKJ \
  --distribution-config file://cloudfront-with-api.json
```

**cloudfront-with-api.json:**
```json
{
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "figma-portfolio-static",
        "DomainName": "figma-portfolio-static.s3.amazonaws.com",
        "S3OriginConfig": {}
      },
      {
        "Id": "figma-portfolio-api",
        "DomainName": "oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [{
      "PathPattern": "/api/*",
      "TargetOriginId": "figma-portfolio-api",
      "ViewerProtocolPolicy": "redirect-to-https",
      "ForwardedValues": {
        "QueryString": true,
        "Cookies": { "Forward": "all" }
      }
    }]
  }
}
```

## Python Chatbot Backend Deployment

### 1. Create Python Lambda Function

```bash
# Create deployment package for Python
cd server/bot
pip install -r requirements.txt -t .

# Create zip package
zip -r ../lambda-chatbot.zip .

# Create Lambda function
aws lambda create-function \
  --function-name figma-portfolio-chatbot \
  --runtime python3.10 \
  --role arn:aws:iam::account:role/lambda-execution-role \
  --handler main:app \
  --zip-file fileb://lambda-chatbot.zip \
  --environment Variables="{HF_TOKEN=your-hf-token,PORTFOLIO_ORIGIN=https://baltzakisthemis.com}"

# Create function URL
aws lambda create-function-url-config \
  --function-name figma-portfolio-chatbot \
  --auth-type NONE \
  --cors '{"AllowOrigins":["https://baltzakisthemis.com"],"AllowMethods":["GET","POST"],"AllowHeaders":["*"]}'
```

## CI/CD Pipeline

### Deployment Workflows

The project uses two deployment mechanisms that trigger on push to `production` branch or manual dispatch:

| Workflow | File | Description |
|---|---|---|
| Deploy to Production | `.github/workflows/deploy.yml` | Standard GitHub Actions — builds, syncs to S3, invalidates CloudFront |
| Production Deployment (Agentic) | `.github/workflows/deploy-production.md` | Copilot-powered agentic workflow — same deployment + smoke tests + deployment report |

Both workflows:
1. Generate `amplify_outputs.json` from the Amplify Gen 2 backend (`ampx generate outputs`)
2. Build the Next.js static export (`pnpm build` — runs `velite build` for MDX content, then `next build`)
3. Sync `out/` to S3 (`aws s3 sync`)
4. Invalidate CloudFront cache

The agentic workflow additionally runs Playwright smoke tests and creates a GitHub discussion with the deployment report.

### Local Deploy Script

```bash
# Full deploy: build → S3 sync → CloudFront invalidation (with wait)
./scripts/deploy.sh
```

### Required GitHub Secrets

```
AWS_ACCESS_KEY_ID           # IAM user with S3 + CloudFront permissions
AWS_SECRET_ACCESS_KEY       # IAM user secret key
AMPLIFY_PRODUCTION_APP_ID   # Amplify App ID (d1zjif7pi1h3om)
COPILOT_GITHUB_TOKEN        # Fine-grained PAT for agentic workflows
```

### Amplify Gen 2 Backend

The Amplify Gen 2 backend (Cognito + AppSync + DynamoDB) is deployed separately:

- **Production**: Deployed via `ampx pipeline-deploy` in `amplify.yml` backend phase (triggered by Amplify Hosting)
- **Development**: `pnpm amplify:dev` runs a local sandbox (`--identifier t`)
- **Client config**: `amplify_outputs.json` is generated per environment and gitignored
- **Known issue**: The AWS SDK XML parser hits an entity expansion limit after deployment. The stack deploys successfully (`CREATE_COMPLETE`) despite the error. Run `pnpm amplify:outputs:sandbox` to regenerate `amplify_outputs.json` after the error appears.
- **Delete sandbox**: Use `pnpm amplify:delete` (bypasses the broken `ampx sandbox delete` CLI via AWS CLI directly)

> **Important**: Amplify Hosting auto-build should be disabled for the frontend (it OOMs). The backend phase still runs successfully.

## Alternative Deployment Platforms

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.ts",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "server/index.ts": {
      "runtime": "nodejs22.x"
    }
  }
}
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy

# Deploy to production
netlify deploy --prod
```

**netlify.toml:**
```toml
[build]
  command = "pnpm build"
  publish = "out"

[functions]
  directory = "server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server"
  status = 200
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check frontend health
curl -I https://baltzakisthemis.com

# Check API health
curl https://baltzakisthemis.com/api/health

# Check chatbot health
curl https://baltzakisthemis.com/api/chat/health
```

### Performance Monitoring

```bash
# Check CloudFront metrics
aws cloudfront get-distribution-metrics \
  --distribution-id E134SCTR0QGQKJ \
  --metric-name Requests \
  --start-time $(date -d '1 hour ago' --iso-8601) \
  --end-time $(date --iso-8601)

# Check Lambda metrics
aws lambda get-function-metrics \
  --function-name figma-portfolio-api
```

### Log Monitoring

```bash
# View CloudFront logs
aws cloudfront get-distribution-log \
  --distribution-id E134SCTR0QGQKJ

# View Lambda logs
aws logs filter-log-events \
  --log-group-name "/aws/lambda/figma-portfolio-api" \
  --start-time $(date -d '1 hour ago' +%s)000
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - All API calls use same-origin routing via CloudFront (`/api/*` → Lambda origin), so CORS should not apply
   - If CORS errors appear, verify that `getApiOrigin()` returns `""` (empty string) and API calls use relative paths
   - The Lambda Function URL is only used as a CloudFront origin — clients should never call it directly

2. **SSL/TLS Issues**
   - Ensure SSL certificate is valid
   - Check CloudFront SSL configuration

3. **Lambda Timeout**
   - Increase timeout to 15 seconds
   - Check memory allocation (256MB recommended)

4. **S3 Access Issues**
   - Verify bucket policy allows public read
   - Check IAM permissions

### Debug Commands

```bash
# Test S3 access
aws s3 ls s3://figma-portfolio-static

# Test Lambda function
aws lambda invoke \
  --function-name figma-portfolio-api \
  --payload '{"httpMethod":"GET","path":"/api/health"}' \
  response.json

# Test CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id E134SCTR0QGQKJ \
  --paths "/*"
```

## Cost Optimization

### S3 Cost Reduction

```bash
# Enable S3 Intelligent-Tiering
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket figma-portfolio-static \
  --id "intelligent-tiering" \
  --intelligent-tiering-configuration '{
    "Id": "intelligent-tiering",
    "Status": "Enabled",
    "Filter": {},
    "Rules": [
      {
        "Name": "IntelligentTiering",
        "Status": "Enabled",
        "Days": 1
      }
    ]
  }'
```

### CloudFront Cost Optimization

- Use Price Class 100 (US, Canada, Europe)
- Enable compression
- Set appropriate cache TTLs

### Lambda Cost Optimization

- Use appropriate memory allocation
- Set timeout to minimum required
- Enable provisioned concurrency for predictable traffic

## Security Considerations

### IAM Best Practices

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::figma-portfolio-static/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    }
  ]
}
```

### Security Headers

Ensure all security headers are properly configured:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: configured appropriately

This comprehensive deployment guide ensures your portfolio is deployed securely, efficiently, and with proper monitoring in place.