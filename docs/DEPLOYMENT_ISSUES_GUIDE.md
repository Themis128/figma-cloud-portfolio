# 🚨 Deployment Issue Prevention & Resolution Guide

## Critical Issues to Address Before/After Deployment

### 1. ⚠️ MISSING AWS SECRETS (Most Critical)

**Status**: Must be configured in GitHub repository settings
**Required Secrets**:

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AMPLIFY_PRODUCTION_APP_ID` - Your Amplify app ID

**How to Check**:

1. Go to GitHub → Your Repository → Settings → Secrets and variables → Actions
2. Verify all 4 secrets are present and not expired

**How to Fix**:

```bash
# Use the setup script (requires GitHub token)
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh Themis128/figma-cloud-portfolio YOUR_GITHUB_TOKEN
```

### 2. ⚠️ AMPLIFY APP NOT CONNECTED

**Status**: Must be verified in AWS Amplify Console
**Required Configuration**:

- Repository: `Themis128/figma-cloud-portfolio`
- Branch: `production`
- Build settings: Auto-detected from `amplify.yml`

**How to Check**:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Find your app (should show connected repository)
3. Verify production branch is connected
4. Check if auto-deployment is enabled

**How to Fix**:

- If not connected: Click "New app" → "Host web app" → Connect GitHub repository
- If wrong branch: Update branch settings to use `production`

### 3. ⚠️ ENVIRONMENT VARIABLES (Critical for Functionality)

**Status**: Must be set in AWS Amplify Console (NOT GitHub secrets)

**Required Variables** (based on actual code usage):

```bash
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
VITE_GOOGLE_ANALYTICS_ID=G-FT79QM66D3
```

**Optional Variables** (for additional features):

```bash
VITE_AI_PROVIDER=ollama
VITE_AI_MODEL=llama2
VITE_OLLAMA_BASE_URL=http://localhost:11434/v1
VITE_SENTRY_DSN=your_sentry_dsn
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

**How to Check**:

1. AWS Amplify Console → Your App → Environment variables
2. Verify required variables are set
3. Mark `RECAPTCHA_SECRET_KEY` as "Secret"

**How to Fix**:

- Add missing variables in Amplify Console
- Test contact form and analytics after deployment

### 4. ⚠️ LAMBDA FUNCTION TIMEOUTS

**Status**: Resume function has 300s timeout (5 minutes)
**Configuration**:

- Resume function: 300s timeout, 2048MB memory
- Other functions: 30s timeout, 512MB memory

**Potential Issues**:

- PDF generation may timeout if Puppeteer hangs
- Large resume data may cause memory issues

**How to Monitor**:

- Check CloudWatch logs after deployment
- Monitor Lambda function duration metrics

**How to Fix**:

- Increase timeout if needed (max 900s for Lambda)
- Optimize PDF generation code
- Add error handling for timeouts

## 🔍 Deployment Verification Steps

### Immediate Post-Deployment Checks

1. **Build Status**: Check Amplify Console for successful build
2. **Environment Variables**: Verify they're applied in build logs
3. **Lambda Functions**: Check if all 9 functions deployed
4. **Frontend**: Verify app loads without errors

### Functional Testing

1. **API Endpoints** (use verification script):

   ```bash
   ./scripts/verify-deployment.sh
   ```

2. **Manual Testing**:
   - Homepage loads
   - Contact form works (reCAPTCHA)
   - Resume download (PDF generation)
   - Navigation works
   - PWA features (service worker)

3. **Performance Testing**:
   - Lighthouse audit >90 scores
   - Core Web Vitals within limits

## 🚨 Common Failure Scenarios & Solutions

### Scenario 1: Build Fails with "Access Denied"

**Cause**: Missing AWS credentials or insufficient permissions
**Solution**: Verify GitHub secrets are correct and AWS user has Amplify permissions

### Scenario 2: Lambda Functions Not Deployed

**Cause**: amplify.yml syntax error or missing function files
**Solution**: Check Amplify build logs and verify function directories exist

### Scenario 3: Environment Variables Not Working

**Cause**: Variables set in GitHub secrets instead of Amplify Console
**Solution**: Move VITE_ variables to Amplify Console environment variables

### Scenario 4: Contact Form reCAPTCHA Fails

**Cause**: Wrong reCAPTCHA keys or missing RECAPTCHA_SECRET_KEY
**Solution**: Verify keys match and secret key is marked as "Secret"

### Scenario 5: Resume PDF Times Out

**Cause**: Puppeteer hangs or Lambda timeout too short
**Solution**: Check CloudWatch logs, increase timeout if needed

## 📊 Monitoring & Alerts

### Set Up Monitoring

1. **CloudWatch**: Auto-enabled with Amplify
2. **Lambda Metrics**: Monitor duration, errors, throttles
3. **Custom Dashboards**: Create for key metrics

### Alert Configuration

- Lambda errors > 5%
- Function duration > 80% of timeout
- 5xx errors > 1%

## 🎯 Success Criteria

✅ **Deployment Success**:

- Build completes without errors
- All Lambda functions deployed
- Frontend loads correctly
- API endpoints respond (200/405 as expected)
- Contact form works with reCAPTCHA
- Resume PDF generates successfully
- PWA features functional
- Performance scores >90

## 📞 Emergency Contacts & Support

- **AWS Amplify Docs**: <https://docs.amplify.aws/>
- **GitHub Actions**: Check repository Actions tab
- **CloudWatch Logs**: Monitor Lambda function logs
- **Build Logs**: Detailed error messages in Amplify Console

---

**Remember**: Most deployment failures are due to missing environment variables or AWS permissions. Double-check these first!
