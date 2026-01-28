# 🚀 AWS Amplify Deployment Checklist

## ✅ Pre-Deployment Setup (COMPLETED)

### 1. Environment Variables (CRITICAL)

- [x] Go to AWS Amplify Console → Your App → Environment variables
- [x] Set the following required variables:
  ```
  VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
  VITE_FIREBASE_API_KEY=your_firebase_api_key (if using push notifications)
  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  VITE_FIREBASE_VAPID_KEY=your_vapid_key
  VITE_GOOGLE_ANALYTICS_ID=G-FT79QM66D3
  VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id (optional)
  ```

### 2. AWS IAM Permissions

- [ ] Ensure your AWS account has Amplify permissions
- [ ] Lambda execution permissions are configured
- [ ] CloudWatch logs permissions for monitoring

### 3. Repository Setup

- [x] Code is committed and pushed to GitHub
- [x] Branch protection rules allow Amplify deployment
- [x] Webhooks are configured for automatic deployment
- [x] Service worker registration conflict fixed

## Deployment Steps

### 1. Connect Repository

- [ ] Go to AWS Amplify Console
- [ ] Click "New app" → "Host web app"
- [ ] Select GitHub as provider
- [ ] Authorize AWS Amplify to access your GitHub account
- [ ] Select repository: `Themis128/figma-cloud-portfolio`
- [ ] Select branch: `production`

### 2. Configure Build Settings

- [x] App name: `figma-cloud-portfolio` (or your preferred name)
- [x] Build settings should auto-detect from `amplify.yml`
- [x] Environment: `Production`
- [x] Verify build commands match `amplify.yml`

### 3. Environment Variables

- [ ] Add all required environment variables
- [ ] Mark sensitive variables as "secret" if needed
- [ ] Verify variable names match your code expectations

### 4. Advanced Settings

- [x] **Custom headers**: Already configured in `amplify.yml`
- [x] **Rewrites and redirects**: Default SPA configuration
- [x] **Custom build images**: Not needed (using standard Node.js)

## Post-Deployment Verification

### 1. Frontend Deployment

- [ ] App URL is accessible: `https://[branch-name].[app-id].amplifyapp.com`
- [ ] Homepage loads without errors
- [ ] Navigation works correctly
- [ ] Static assets load (images, CSS, JS)
- [x] PWA features work (service worker, manifest) - FIXED: Service worker registration conflict resolved
- [ ] No InvalidStateError for service worker registration

### 2. API Functions Testing

- [ ] Health check: `GET /api/ping` → Should return `{"message":"pong"}`
- [ ] Contact form: Test form submission
- [ ] Resume download: Test PDF generation
- [ ] Push notifications: Test subscription (if implemented)

### 3. Performance & Security

- [ ] Lighthouse score > 90
- [ ] HTTPS certificate is valid
- [ ] CORS headers are properly set
- [ ] Content Security Policy headers
- [ ] Service worker caching works

### 4. Monitoring Setup

- [ ] CloudWatch logs are accessible
- [ ] Error tracking (Sentry) is configured
- [ ] Analytics (Google Analytics) is working
- [ ] Performance monitoring is active

## Common Issues & Solutions

### Build Failures

**Issue**: `pnpm install` fails
**Solution**: Check Node.js version compatibility, ensure `amplify.yml` has correct pnpm setup

**Issue**: Lambda function build fails
**Solution**: Check function-specific `package.json` and dependencies

### Runtime Errors

**Issue**: Lambda timeout errors
**Solution**: Increase timeout in `amplify.yml` functions section (resume function needs 300s)

**Issue**: Memory errors in Lambda
**Solution**: Increase memory allocation (resume function needs 2048MB)

**Issue**: CORS errors
**Solution**: Verify custom headers in `amplify.yml` and Lambda responses

**Issue**: Service worker registration fails with InvalidStateError
**Solution**: ✅ FIXED - Conflicting VitePWA configurations removed, now using injectManifest strategy

### Environment Issues

**Issue**: Missing environment variables
**Solution**: Add variables in Amplify Console → Environment variables

**Issue**: Wrong environment variable values
**Solution**: Check variable names match code expectations (case-sensitive)

## Rollback Plan

### Emergency Rollback

1. Go to Amplify Console → Deployments
2. Click "Rollback" on a previous successful deployment
3. Monitor the rollback process
4. Test functionality after rollback

### Gradual Rollback

1. Create a new branch from the last working commit
2. Deploy the branch to a staging environment
3. Test thoroughly before promoting to production

## Performance Optimization

### Frontend Optimizations

- [ ] Enable gzip compression (auto-enabled by Amplify)
- [ ] CDN distribution (CloudFront auto-configured)
- [ ] Image optimization (already implemented)
- [ ] Code splitting (already configured)
- [ ] Service worker caching

### Lambda Optimizations

- [ ] Provisioned concurrency for frequently used functions
- [ ] Memory optimization to reduce cold start times
- [ ] Function versioning for gradual deployments

## Security Checklist

- [ ] HTTPS enforced (auto-enabled)
- [ ] Security headers configured
- [ ] Environment variables marked as secrets
- [ ] IAM permissions follow least privilege
- [ ] API Gateway authentication (if needed)
- [ ] Rate limiting configured

## Monitoring & Alerts

### Set Up Alerts

1. **CloudWatch Alarms**:
   - Lambda errors > 5%
   - Function duration > 80% of timeout
   - 5xx errors > 1%

2. **Amplify Monitoring**:
   - Build success/failure notifications
   - Performance metrics
   - Error rates

3. **Application Monitoring**:
   - Sentry for error tracking
   - Google Analytics for user metrics
   - Custom performance monitoring

---

## 🎯 Success Criteria

✅ **Deployment successful** when:

- App loads in < 3 seconds
- All API endpoints respond correctly
- Contact form submissions work
- Resume PDF generation works
- PWA features are functional
- No console errors in production
- Lighthouse score > 90

---

**Need help?** Check the [AWS Amplify Documentation](https://docs.amplify.aws/) or review the build logs in the Amplify Console for specific error messages.
