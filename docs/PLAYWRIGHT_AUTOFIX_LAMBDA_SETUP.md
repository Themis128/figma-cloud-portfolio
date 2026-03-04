# Playwright AI Autofix Lambda Integration

## Steps to Complete

1. **Deploy Lambda Function**
   - Ensure `playwright-autofix` Lambda is deployed via AWS Amplify or SAM.
   - Confirm endpoint (e.g., `https://<your-api-id>.execute-api.<region>.amazonaws.com/autofix`) is live.

2. **Set Environment Variables**
   - Add endpoint to `.env` or AWS Secrets Manager:
     - `PLAYWRIGHT_AUTOFIX_ENDPOINT=https://<your-api-id>.execute-api.<region>.amazonaws.com/autofix`
   - For CI/CD, update GitHub Actions/Amplify env vars.

3. **Update Playwright Config**
   - Ensure `playwright.config.ts` references the endpoint:
     - `process.env.PLAYWRIGHT_AUTOFIX_ENDPOINT`
   - Confirm reporter config uses Lambda endpoint.

4. **Test Integration**
   - Run Playwright tests with autofix enabled:
     - `pnpm test:e2e:autofix`
   - Check console and `playwright-report/autofix-report.json` for AI suggestions.

5. **Document Integration**
   - Update `docs/PLAYWRIGHT_CONFIG_README.md` and `docs/INTEGRATIONS.md` with Lambda setup, endpoint usage, and troubleshooting.

## Optional

- Add monitoring/logging for Lambda invocations.
- Set IAM permissions for secure Lambda access.
- Add health check endpoint for Lambda.

---

**Status:** Lambda function, config, and reporter are ready. Complete deployment, env setup, and documentation for full integration.
