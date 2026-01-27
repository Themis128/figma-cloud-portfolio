@echo off
cd "d:\Nuxt Projects\new-portfolio"
npx playwright test playwright-tests/analytics-integration.spec.ts --config=playwright.config.temp.ts --reporter=line
pause