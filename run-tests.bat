@echo off
echo 🚀 Running Playwright Tests...
echo.

REM Set environment variable to skip web server auto-start
set PLAYWRIGHT_SKIP_WEBSERVER=true

REM Run the tests
npx playwright test --config playwright.config.ts --timeout 30000 --max-failures 5 --workers 2

echo.
echo ✅ Test execution completed.
pause