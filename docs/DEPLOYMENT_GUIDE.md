# 🚀 Local to AWS Deployment Guide

This guide provides step-by-step instructions for deploying your portfolio from local development to AWS Amplify production.

## 📋 Prerequisites

### Local Environment

- **Node.js**: Version 20.x or higher
- **PNPM**: Package manager (`npm install -g pnpm`)
- **Git**: Version control system
- **AWS CLI**: Configured with your AWS credentials

### AWS Account

- **AWS Account**: Active AWS account with billing enabled
- **IAM Permissions**: Amplify, CloudFormation, and related service permissions
- **GitHub Account**: Repository access for CI/CD integration

## 🏗️ Local Build Process

### 1. Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

### 2. Run Tests Locally

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run linting
pnpm lint
```

### 3. Build for Production

```bash
# Build the entire application
pnpm build

# This runs:
# - pnpm run build:resume (generates PDF resume)
# - pnpm run build:client (builds React app)
# - pnpm run build:server (builds Express server)
```

### 4. Test Production Build Locally

```bash
# Start production server
pnpm start

# Visit http://localhost:3000 to test
```

## ☁️ AWS Setup

### 1. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (us-east-1 recommended)
# - Default output format (json)
```

### 2. Verify AWS Configuration

```bash
# Check your AWS configuration
aws configure list

# Test AWS connection
aws sts get-caller-identity
```

## 🚀 AWS Amplify Deployment

### 🎯 Primary Method: GitHub Integration (Recommended)

This is the **recommended approach** for continuous deployment and development workflow.

#### Step 1: Prepare Your Repository

Ensure your code is committed and pushed to GitHub:

```bash
# Commit your changes
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Create Amplify App with GitHub Integration

1. **Open AWS Amplify Console**:
   - Go to: https://console.aws.amazon.com/amplify/home
   - Click **"Create app"** → **"Host web app"**

2. **Connect GitHub Repository**:
   - Choose **"GitHub"** as your repository source
   - Click **"Authorize AWS Amplify"** to connect your GitHub account
   - **Grant repository access**: Ensure AWS Amplify can access your repository
   - Select your repository: `YOUR_USERNAME/YOUR_REPO`

3. **Configure Build Settings**:
   - **App name**: `your-portfolio-name`
   - **Branch**: `main` (production) or `ai_main_ac9340bcfb26` (your current branch)
   - **Build settings**: Auto-detected from `amplify.yml` in your repository

4. **Environment Variables** (Optional):
   - Add any required environment variables in the Amplify Console

5. **Deploy**:
   - Click **"Save and deploy"**
   - AWS Amplify will clone your repository and start building

#### Step 3: Enable Automatic Deployments

Once connected, future commits will automatically trigger deployments:

- **Push to main**: Production deployment
- **Create PR**: CI testing without deployment
- **Push to develop**: Staging deployment (if configured)

### 🔄 Alternative Method: Manual ZIP Upload

For one-time deployments or testing without GitHub integration:

#### Step 1: Build Locally

```bash
# Build the application
pnpm build

# Verify build output in dist/ directory
ls -la dist/
```

#### Step 2: Create Deployment Archive

```bash
# Create ZIP file from build output
cd dist
zip -r ../portfolio-deployment.zip .
cd ..
```

#### Step 3: Deploy via AWS Console

1. **AWS Amplify Console** → **"Create app"** → **"Host web app"**
2. **Choose "Deploy without Git provider"**
3. **Upload ZIP file**: Select `portfolio-deployment.zip`
4. **Configure and deploy**

**⚠️ Note**: Manual uploads don't support automatic CI/CD. Use GitHub integration for ongoing development.

## 🔧 Configuration Files

### amplify.yml (Build Configuration)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm run build:resume
        - pnpm run build:client
  artifacts:
    baseDirectory: dist/spa
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**

# Custom headers to fix MIME type issues
customHeaders:
  - pattern: "**/*.js"
    headers:
      - key: "Content-Type"
        value: "application/javascript"
  - pattern: "**/*.mjs"
    headers:
      - key: "Content-Type"
        value: "application/javascript"
  - pattern: "**/sw.js"
    headers:
      - key: "Content-Type"
        value: "application/javascript"
      - key: "Service-Worker-Allowed"
        value: "/"

backend:
  phases:
    build:
      commands:
        - pnpm run build:server
```

### Environment Variables

Set these in AWS Amplify Console → App → Environment variables:

```bash
NODE_ENV=production
VITE_APP_ENV=production
# Add any other environment variables your app needs
```

## 🔄 CI/CD Pipeline

### Automatic Deployments

Once connected to GitHub, deployments happen automatically:

- **Push to `main`**: Production deployment
- **Push to `develop`**: Staging deployment (if configured)
- **Pull Requests**: CI testing without deployment

### Manual Deployments

```bash
# Trigger production deployment
gh workflow run "Deploy to Production"

# Trigger staging deployment
gh workflow run "Deploy to Staging"
```

### Rollback Deployments

```bash
# Rollback to previous version
gh workflow run rollback.yml -f environment=production

# Rollback to specific commit
gh workflow run rollback.yml -f environment=production -f target_commit=abc123
```

## 🧪 Testing Deployment

### 1. Check Build Logs

- AWS Amplify Console → Your App → Build runs
- Check for any build errors or warnings

### 2. Test Application

- Visit your Amplify domain (e.g., `https://abc123.amplifyapp.com`)
- Test all functionality:
  - ✅ Page navigation
  - ✅ Form submissions
  - ✅ PWA features
  - ✅ No JavaScript errors

### 3. Performance Testing

```bash
# Test Lighthouse scores
# Check Core Web Vitals in Chrome DevTools
# Verify mobile responsiveness
```

## 🔍 Troubleshooting

### Build Failures

```bash
# Check build logs in Amplify Console
# Common issues:
# - Missing dependencies
# - Build timeout (increase timeout in amplify.yml)
# - Environment variable issues
```

### Runtime Errors

```bash
# Check browser console for JavaScript errors
# Verify environment variables are set correctly
# Check network requests in DevTools
```

### Deployment Issues

```bash
# Verify AWS credentials have correct permissions
# Check GitHub repository access
# Ensure amplify.yml is in repository root
```

### MIME Type Issues

If you see JavaScript loading errors:

- ✅ Custom headers are configured in `amplify.yml`
- ✅ Rebuild and redeploy to apply headers
- ✅ Clear browser cache after deployment

## 📊 Monitoring & Maintenance

### Health Checks

- Set up uptime monitoring (e.g., Pingdom, UptimeRobot)
- Monitor AWS Amplify metrics in CloudWatch
- Check error rates and performance metrics

### Updates

```bash
# Update dependencies
pnpm update

# Test changes locally
pnpm build && pnpm start

# Commit and push to trigger deployment
git add .
git commit -m "Update dependencies"
git push origin main
```

### Backup Strategy

- Code is safely stored in GitHub
- AWS Amplify provides deployment history
- Consider AWS Backup for additional data protection

## 🚀 Advanced Configuration

### Custom Domain

1. **Purchase domain** (Route 53 or external provider)
2. **AWS Amplify Console** → Your App → Domain management
3. **Add custom domain** and configure DNS

### SSL Certificate

- AWS Amplify provides free SSL certificates
- Automatic renewal and management

### Environment Branches

```bash
# Create staging branch
git checkout -b develop
git push origin develop

# Configure in Amplify Console
# Add branch → Connect to develop
```

## 📞 Support

### AWS Amplify Resources

- **Documentation**: https://docs.amplify.aws/
- **Console**: https://console.aws.amazon.com/amplify/
- **Support**: AWS Support Center

### Common Issues

- **Build timeouts**: Increase build timeout in amplify.yml
- **Large builds**: Use build cache and optimize bundle size
- **Environment variables**: Ensure all required vars are set

---

## 🎯 Quick Deployment Checklist

- [ ] Local build successful (`pnpm build`)
- [ ] Tests passing (`pnpm test`)
- [ ] AWS CLI configured
- [ ] GitHub repository accessible
- [ ] Amplify app created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] First deployment successful
- [ ] Application tested in production

**Your portfolio is now deployed and ready for the world! 🌟**
