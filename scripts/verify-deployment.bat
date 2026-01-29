@echo off
REM AWS Amplify Deployment Verification Script (Windows)
REM Run this after deployment to verify all features are working

echo 🚀 AWS Amplify Deployment Verification
echo ======================================
echo.

REM Get the deployment URL from user
set /p BASE_URL="Enter your Amplify deployment URL (e.g., https://production.xxxxxx.amplifyapp.com): "

if "%BASE_URL%"=="" (
    echo ❌ No URL provided. Exiting.
    pause
    exit /b 1
)

echo 🔍 Testing deployment at: %BASE_URL%
echo.

REM Test counter
set TOTAL_TESTS=0
set PASSED_TESTS=0

:run_test
REM This function will be called for each test
goto :eof

:test_endpoint
set url=%~1
set expected_status=%~2
set description=%~3

set /a TOTAL_TESTS=%TOTAL_TESTS%+1

echo|set /p="Testing %description%... "

REM Use PowerShell for HTTP requests since curl might not be available on Windows
powershell -Command "& {try {$response = Invoke-WebRequest -Uri '%url%' -Method GET -TimeoutSec 30; $status = $response.StatusCode} catch {$status = $_.Exception.Response.StatusCode.Value__}; if ($status -eq %expected_status%) {Write-Host '✅ PASS' -ForegroundColor Green} else {Write-Host '❌ FAIL (Status:' $status ', Expected:' %expected_status% ')' -ForegroundColor Red}}" 2>nul

if %errorlevel% equ 0 (
    set /a PASSED_TESTS=%PASSED_TESTS%+1
) else (
    REM Count as failed if PowerShell returned non-zero
)

goto :eof

echo 📡 Testing API Endpoints:
echo ------------------------

call :test_endpoint "%BASE_URL%/api/ping" 200 "API Health Check"
call :test_endpoint "%BASE_URL%/api/contact" 405 "Contact API (GET)"
call :test_endpoint "%BASE_URL%/api/analytics" 405 "Analytics API (GET)"
call :test_endpoint "%BASE_URL%/api/resume/download" 200 "Resume Download"
call :test_endpoint "%BASE_URL%/api/push-notifications" 405 "Push Notifications API (GET)"
call :test_endpoint "%BASE_URL%/api/github" 401 "GitHub API (GET)"

echo.
echo 🌐 Testing Frontend Pages:
echo -------------------------

call :test_endpoint "%BASE_URL%/" 200 "Homepage"
call :test_endpoint "%BASE_URL%/about" 200 "About Page"
call :test_endpoint "%BASE_URL%/projects" 200 "Projects Page"
call :test_endpoint "%BASE_URL%/contact" 200 "Contact Page"
call :test_endpoint "%BASE_URL%/agents" 200 "AI Agents Page"

echo.
echo 📱 Testing Static Assets:
echo ------------------------

call :test_endpoint "%BASE_URL%/sw.js" 200 "Service Worker"
call :test_endpoint "%BASE_URL%/manifest.webmanifest" 200 "Web App Manifest"
call :test_endpoint "%BASE_URL%/favicon.ico" 200 "Favicon"
call :test_endpoint "%BASE_URL%/logo.svg" 200 "Logo SVG"

echo.
echo 📊 Test Results:
echo ---------------
echo Total Tests: %TOTAL_TESTS%
echo Passed: %PASSED_TESTS%
set /a FAILED_TESTS=%TOTAL_TESTS%-%PASSED_TESTS%
echo Failed: %FAILED_TESTS%

if %PASSED_TESTS% equ %TOTAL_TESTS% (
    echo 🎉 All tests passed! Deployment successful.
    exit /b 0
) else (
    echo ⚠️  Some tests failed. Check the deployment logs.
    exit /b 1
)