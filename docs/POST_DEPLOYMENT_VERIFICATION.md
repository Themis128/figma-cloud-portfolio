# 🚀 Post-Deployment Verification Guide

## Automated Testing

### Option 1: Linux/Mac (Bash Script)

```bash
# Make executable and run
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

### Option 2: Windows (Batch Script)

```batch
# Run directly
scripts\verify-deployment.bat
```

### Option 3: Playwright Production Smoke Tests

```bash
# Run API-level smoke tests against both production domains
pnpm exec playwright test playwright-tests/production-smoke.spec.ts
```

Tests both `www.baltzakisthemis.com` and `baltzakisthemis.com` — covers all 9 pages, API health endpoints, contact form, chat API, booking slots, HTTPS, and 404 handling. See [`TESTING.md`](./TESTING.md) for details.

---

## Manual Testing Checklist

### ✅ Frontend Tests

- [ ] **Homepage Loads**: Visit your Amplify URL
- [ ] **Navigation Works**: Click all menu items (About, Projects, Contact, Agents)
- [ ] **Responsive Design**: Test on mobile/desktop viewports
- [ ] **Dark/Light Theme**: Theme toggle works
- [ ] **PWA Features**: Install prompt appears, service worker registered

### ✅ API Endpoint Tests

Test each endpoint using your browser or tools like Postman:

#### 1. Health Check

```http
GET https://[your-url]/api/ping
Expected: {"message":"ping pong"}
```

#### 2. Contact Form

```http
POST https://[your-url]/api/contact
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "subject": "Test Subject",
  "message": "Test message",
  "recaptchaToken": "test-token"
}
Expected: Success response or validation error
```

#### 3. Analytics

```http
POST https://[your-url]/api/analytics
Body: {
  "event": "page_view",
  "timestamp": "2024-01-29T12:00:00Z",
  "url": "https://your-site.com",
  "userAgent": "Test Agent"
}
Expected: Success response
```

#### 4. Resume Download

```http
GET https://[your-url]/api/resume/download
Expected: PDF file download (may take up to 30 seconds)
```

#### 5. Push Notifications

```http
GET https://[your-url]/api/push-notifications
Expected: Method not allowed or subscription endpoint
```

#### 6. GitHub API

```http
GET https://[your-url]/api/github
Expected: Authentication required or method not allowed
```

### ✅ Performance Tests

#### Lighthouse Audit

1. Open Chrome DevTools → Lighthouse
2. Run full audit on homepage
3. **Target Scores**: Performance >90, Accessibility >90, Best Practices >90, SEO >90

#### Core Web Vitals

- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1

### ✅ Security Tests

#### HTTPS Certificate

- [ ] Site loads with `https://`
- [ ] Certificate is valid (check browser lock icon)

#### Content Security Policy

- [ ] No CSP violations in browser console
- [ ] External resources load properly

#### CORS Headers

- [ ] API requests work from different origins (if needed)

### ✅ Service Worker & PWA

#### Service Worker Registration

1. Open DevTools → Application → Service Workers
2. [ ] Service worker is registered and active
3. [ ] Status shows "activated and running"

#### Cache Storage

1. DevTools → Application → Storage → Cache Storage
2. [ ] Cache contains ~72 entries
3. [ ] Cache size ~4.4MB

#### Offline Functionality

1. Go offline in DevTools
2. [ ] Page loads from cache
3. [ ] Core functionality works offline

### ✅ Environment Variables

#### reCAPTCHA

- [ ] Contact form shows reCAPTCHA widget
- [ ] Form submission works (may show test mode message)

#### Google Analytics

- [ ] GA tracking code loads (check Network tab for gtag)
- [ ] Events are sent (check GA Real-time reports)

### ✅ Build Artifacts

#### Bundle Analysis

- [ ] Check Network tab for reasonable bundle sizes
- [ ] JavaScript bundles load without errors
- [ ] CSS loads and styles apply correctly

#### Asset Optimization

- [ ] Images load in WebP/AVIF format
- [ ] Fonts load with `display=swap`
- [ ] Static assets have proper cache headers

## Troubleshooting Failed Tests

### ❌ API Endpoints Failing

**Check Amplify Console:**

1. Go to your app → Functions
2. Check Lambda function logs
3. Verify environment variables are set
4. Check function timeouts and memory

**Common Issues:**

- Missing environment variables
- Lambda function build failures
- Timeout errors (resume function needs 300s)
- CORS configuration issues

### ❌ Frontend Not Loading

**Check Build Logs:**

1. Amplify Console → Build & Deploy → Build details
2. Look for build errors
3. Check if `dist/spa/` directory was created correctly

**Common Issues:**

- Build command failures
- Missing dependencies
- Node.js version conflicts

### ❌ Service Worker Issues

**Check Browser Console:**

1. Open DevTools → Console
2. Look for service worker registration errors
3. Check Application → Service Workers tab

**Common Issues:**

- InvalidStateError (fixed in your build)
- Conflicting service worker configurations
- HTTPS requirement for service workers

### ❌ Performance Issues

**Check Network Tab:**

1. DevTools → Network
2. Look for large assets or slow-loading resources
3. Check for uncompressed assets

**Optimization Tips:**

- Enable gzip compression (should be auto-enabled)
- Check CDN distribution
- Verify image optimization

## 📊 Success Criteria

### ✅ All Tests Pass

- Automated verification script: 12/12 tests pass
- Manual testing checklist: All items checked
- Performance benchmarks met

### ✅ User Experience

- Fast loading times (<2s)
- Responsive design works
- All interactive features functional
- PWA features working

### ✅ Monitoring Active

- CloudWatch logs accessible
- Error tracking configured
- Analytics data flowing

## 🎯 Final Verification

Once all tests pass, your deployment is **PRODUCTION READY**! 🚀

**Next Steps:**

1. Update DNS to point to Amplify URL (if using custom domain)
2. Set up monitoring alerts in CloudWatch
3. Configure backup and rollback procedures
4. Document the deployment process for future updates
