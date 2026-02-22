# 🚀 Netlify Deployment Guide

This comprehensive guide covers deploying the Baltzakis Portfolio to Netlify, including setup, configuration, CI/CD, and troubleshooting.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Deployment Methods](#deployment-methods)
4. [Configuration](#configuration)
5. [Environment Variables](#environment-variables)
6. [Custom Domain Setup](#custom-domain-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Netlify Functions](#netlify-functions)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Analytics](#monitoring--analytics)
11. [Troubleshooting](#troubleshooting)
12. [Migration from AWS Amplify](#migration-from-aws-amplify)

---

## Prerequisites

Before deploying to Netlify, ensure you have:

- **Node.js**: Version 20.x or higher
- **PNPM**: Package manager (`npm install -g pnpm`)
- **Git**: Version control system
- **GitHub Account**: Repository access for CI/CD integration
- **Netlify Account**: Free tier available at [netlify.com](https://www.netlify.com/)

### Local Verification

```bash
# Install dependencies
pnpm install

# Build the application locally
pnpm run build:client

# Verify build output
ls -la dist/spa

# Test production build locally (optional)
npx serve dist/spa
```

---

## Quick Start

### Option 1: Deploy via Netlify CLI (Recommended for first-time setup)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Deploy to production
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to GitHub
2. Log in to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings (auto-detected from `netlify.toml`)
6. Click "Deploy site"

---

## Deployment Methods

### Method 1: Git Integration (Recommended)

This is the **recommended approach** for continuous deployment.

#### Step 1: Push to GitHub

```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

#### Step 2: Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"** as your Git provider
4. Authorize Netlify to access your repositories
5. Select your repository: `Themis128/figma-cloud-portfolio`

#### Step 3: Configure Build Settings

Netlify will auto-detect settings from `netlify.toml`. Verify:

| Setting | Value |
|---------|-------|
| Build Command | `pnpm run build:client` |
| Publish Directory | `dist/spa` |
| Node Version | 20 |

#### Step 4: Deploy

Click **"Deploy site"** and wait for the build to complete.

### Method 2: Drag & Drop (Quick Testing)

For quick testing without Git integration:

```bash
# Build locally
pnpm run build:client

# Drag the dist/spa folder to:
# https://app.netlify.com/drop
```

### Method 3: Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize project
netlify init

# Preview deployment
netlify deploy

# Production deployment
netlify deploy --prod
```

### Method 4: Netlify Dev (Local Development)

```bash
# Run Netlify Dev for local testing with Netlify features
netlify dev

# This provides:
# - Local function emulation
# - Redirect/proxy support
# - Environment variables from Netlify
```

---

## Configuration

### netlify.toml Overview

The `netlify.toml` file in the project root contains all deployment configuration:

```toml
[build]
  command = "pnpm run build:client"
  publish = "dist/spa"
  functions = "netlify/functions"
  environment = { NODE_VERSION = "20" }
```

### Key Configuration Sections

#### Build Settings

```toml
[build]
  command = "pnpm run build:client"
  publish = "dist/spa"
```

#### Deploy Contexts

```toml
[context.production]
  environment = { NODE_ENV = "production", VITE_APP_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "production", VITE_APP_ENV = "staging" }
```

#### SPA Routing

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Security Headers

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### Redirects Configuration

Add custom redirects in `netlify.toml`:

```toml
# API proxy example
[[redirects]]
  from = "/api/*"
  to = "https://your-api.example.com/api/:splat"
  status = 200
  force = true

# Custom redirect
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

---

## Environment Variables

### Setting Environment Variables

#### Via Netlify Dashboard

1. Go to **Site Settings** → **Environment Variables**
2. Click **"Add a variable"**
3. Enter key-value pairs

#### Via Netlify CLI

```bash
# Set a variable
netlify env:set VITE_GOOGLE_ANALYTICS_ID "G-XXXXXXXXXX"

# Import from .env file
netlify env:import .env

# List all variables
netlify env:list
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_VERSION` | Node.js version | Yes (default: 20) |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics ID | Optional |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Optional |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Optional |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Optional |
| `VITE_SENTRY_DSN` | Sentry error tracking | Optional |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | Optional |

### Environment Variable Contexts

Set different values for different environments:

```toml
[context.production.environment]
  VITE_APP_ENV = "production"

[context.deploy-preview.environment]
  VITE_APP_ENV = "staging"
```

### Secrets Management

For sensitive values, use Netlify's encrypted environment variables:

1. Go to **Site Settings** → **Environment Variables**
2. Values are encrypted at rest
3. Never commit secrets to Git

---

## Custom Domain Setup

### Step 1: Add Custom Domain

1. Go to **Site Settings** → **Domain Management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `baltzakis.dev`)

### Step 2: Configure DNS

#### Option A: Using Netlify DNS (Recommended)

1. Go to **Domains** → **Add or register domain**
2. Update your domain's nameservers to Netlify's:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`

#### Option B: Using External DNS

Add the following records to your DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | `@` | Netlify's load balancer IP |
| CNAME | `www` | `your-site.netlify.app` |

### Step 3: Enable HTTPS

- SSL certificates are automatically provisioned
- Certificates auto-renew before expiration
- Force HTTPS in **Site Settings** → **HTTPS**

### Step 4: Configure Redirects

```toml
# Redirect www to non-www
[[redirects]]
  from = "https://www.baltzakis.dev/*"
  to = "https://baltzakis.dev/:splat"
  status = 301
  force = true
```

---

## CI/CD Pipeline

### Automatic Deployments

Netlify automatically deploys on:

| Trigger | Branch | Environment |
|---------|--------|-------------|
| Push to main | `main` | Production |
| Pull Request | Any | Deploy Preview |
| Branch deploy | Any branch | Branch Deploy |

### Build Hooks

Trigger deployments via webhook:

1. Go to **Site Settings** → **Build & Deploy** → **Build Hooks**
2. Create a build hook
3. Use the URL to trigger deployments:

```bash
# Trigger deployment via curl
curl -X POST "https://api.netlify.com/build_hooks/YOUR_HOOK_ID"
```

### GitHub Integration

Netlify integrates with GitHub for:

- **Deploy Previews**: Automatic preview URLs for PRs
- **Commit Status**: Build status shown in GitHub
- **Branch Deploys**: Deploy branches to unique URLs

### Netlify Configuration in GitHub

This project includes a pre-configured GitHub Actions workflow at `.github/workflows/deploy-netlify.yml`.

#### Workflow Features

- **Automatic Deployments**: Triggers on push to `main`/`master` branch
- **Deploy Previews**: Creates preview URLs for pull requests
- **Manual Deployments**: Supports manual workflow dispatch
- **Concurrency Control**: Cancels in-progress deployments for the same branch

#### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Netlify site ID (API ID) |
| `NETLIFY_SITE_NAME` | Netlify site name (optional, for PR comments) |

#### How to Get Netlify Credentials

1. **Netlify Auth Token**:
   - Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
   - Click "New access token"
   - Copy the token

2. **Netlify Site ID**:
   - Go to Site Settings → General → Site details
   - Copy the "API ID" value

#### Manual Deployment

Trigger manual deployments via GitHub UI or CLI:

```bash
# Using GitHub CLI
gh workflow run deploy-netlify.yml -f environment=production

# For preview deployment
gh workflow run deploy-netlify.yml -f environment=preview
```

#### Full Workflow File

```yaml
# See .github/workflows/deploy-netlify.yml for the complete workflow
```

---

## Netlify Functions

### Overview

Netlify Functions provide serverless backend capabilities. Create functions in `netlify/functions/`.

### Creating a Function

```javascript
// netlify/functions/contact.js
export async function handler(event, context) {
  const body = JSON.parse(event.body);
  
  // Process contact form
  // ...
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success" }),
  };
}
```

### Function Configuration

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[functions."contact"]
  memory = 256
  timeout = 10
```

### Calling Functions

```javascript
// From frontend
const response = await fetch('/.netlify/functions/contact', {
  method: 'POST',
  body: JSON.stringify(formData),
});
```

### Contact Form Function Example

```javascript
// netlify/functions/contact.js
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);
    
    const command = new SendEmailCommand({
      Source: process.env.SES_VERIFIED_EMAIL,
      Destination: {
        ToAddresses: [process.env.SES_VERIFIED_EMAIL],
      },
      Message: {
        Subject: { Data: `Contact from ${name}` },
        Body: {
          Text: { Data: `From: ${email}\n\n${message}` },
        },
      },
    });

    await ses.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
```

---

## Performance Optimization

### Asset Optimization

Netlify automatically provides:

- **Asset Optimization**: Minification, bundling
- **Image CDN**: On-the-fly image optimization
- **Code Splitting**: Via Vite build

### Cache Strategy

Configured in `netlify.toml`:

| Asset Type | Cache Duration | Strategy |
|------------|---------------|----------|
| HTML | 0 seconds | Always fresh |
| JS/CSS | 1 year | Immutable |
| Images | 30 days | Immutable |
| Fonts | 1 year | Immutable |

### Lighthouse Plugin

Add Lighthouse auditing:

```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  
  [plugins.inputs]
    output_path = "lighthouse-reports"
```

### Bundle Analysis

```bash
# Analyze bundle size locally
pnpm run build:analyze
```

---

## Monitoring & Analytics

### Netlify Analytics

Enable in **Site Settings** → **Analytics**:

- Page views
- Top pages
- Bandwidth usage
- 404 errors

### Google Analytics Integration

Set in environment variables:

```bash
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Sentry Error Tracking

```bash
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Build Notifications

Configure in **Site Settings** → **Build & Deploy** → **Deploy notifications**:

- Email notifications
- Slack integration
- Webhook notifications

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build logs in Netlify Dashboard
# Common causes:
# - Missing dependencies
# - Node version mismatch
# - Memory limits exceeded
```

**Solution**: Verify `netlify.toml` and environment variables.

#### Routing Issues (404 on Refresh)

**Cause**: SPA routing not configured.

**Solution**: Verify redirect in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Environment Variables Not Available

**Cause**: Vite requires `VITE_` prefix for client-side variables.

**Solution**: Prefix variables with `VITE_`:

```bash
VITE_API_KEY=xxx  # Available in client
API_KEY=xxx       # Only in build
```

#### CORS Errors

**Solution**: Add proper headers:

```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

#### Large Bundle Size

**Solution**: Enable code splitting and analyze:

```bash
pnpm run build:analyze
```

### Debug Mode

```bash
# Run Netlify Dev with debug output
DEBUG=* netlify dev
```

### Build Logs

Access detailed build logs:

1. Go to **Deploys** tab
2. Click on a deploy
3. View full build log

---

## Migration from AWS Amplify

If migrating from AWS Amplify, follow these steps:

### Step 1: Prepare Configuration

```bash
# Create netlify.toml (already done)
# Verify build works locally
pnpm run build:client
```

### Step 2: Export Environment Variables

From AWS Amplify Console:

1. Go to **App Settings** → **Environment Variables**
2. Copy all variables to Netlify

### Step 3: Update API Endpoints

If using Amplify functions:

1. Create equivalent Netlify Functions
2. Or keep Amplify functions and update CORS
3. Update frontend API endpoints

### Step 4: Configure Custom Domain

1. Remove domain from Amplify
2. Add to Netlify (automatic SSL)
3. Update DNS records

### Step 5: Redirect Configuration

Amplify `amplify.yml` → Netlify `netlify.toml`:

```yaml
# Amplify (YAML)
customHeaders:
  - pattern: "**/*.js"
    headers:
      - key: "Cache-Control"
        value: "public, max-age=31536000"
```

```toml
# Netlify (TOML)
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

---

## Quick Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `netlify login` | Login to Netlify |
| `netlify init` | Initialize project |
| `netlify deploy` | Deploy draft |
| `netlify deploy --prod` | Deploy to production |
| `netlify dev` | Local development server |
| `netlify env:list` | List environment variables |
| `netlify env:set KEY VALUE` | Set environment variable |
| `netlify open` | Open site in browser |

### PNPM Scripts (Project-Specific)

| Command | Description |
|---------|-------------|
| `pnpm netlify:dev` | Run Netlify Dev server locally |
| `pnpm netlify:deploy` | Deploy to production |
| `pnpm netlify:deploy:preview` | Create a preview deployment |
| `pnpm netlify:build` | Build for Netlify deployment |

### File Structure

```
project/
├── netlify.toml          # Netlify configuration
├── netlify/
│   └── functions/        # Serverless functions
│       └── contact.js
├── dist/
│   └── spa/              # Build output (published)
└── public/               # Static assets
```

### Deploy Checklist

- [ ] Local build successful (`pnpm run build:client`)
- [ ] Tests passing (`pnpm test`)
- [ ] `netlify.toml` configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] First deployment successful
- [ ] Application tested in production

---

## Support Resources

- **Netlify Documentation**: https://docs.netlify.com/
- **Netlify CLI**: https://cli.netlify.com/
- **Community Forum**: https://answers.netlify.com/
- **Status Page**: https://www.netlifystatus.com/

---

**Your portfolio is now ready for Netlify deployment! 🌟**