@echo off
REM Script to serve the visual progress dashboard with proper CORS support
REM This allows the dashboard to access test result files

echo 🎭 Starting Visual Progress Dashboard Server...
echo 📊 Dashboard will be available at: http://localhost:8080/visual-progress.html
echo 🔧 Test results will be accessible at: http://localhost:8080/test-results/
echo.
echo Press Ctrl+C to stop the server
echo.

REM Check if http-server is installed
where http-server >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing http-server globally...
    npm install -g http-server
)

REM Start the server
cd "%~dp0playwright-tests" || exit /b 1
http-server . -p 8080 -c-1 --cors