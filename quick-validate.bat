@echo off
REM Quick validation - run this after fixes

echo === Quick Validation Check ===
echo.

cd /d "D:\Nuxt Projects\new-portfolio"

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✓ Node.js is installed
) else (
    echo    ✗ Node.js NOT found
)

echo [2/5] Checking pnpm...
pnpm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✓ pnpm is installed
) else (
    echo    ✗ pnpm NOT found
)

echo [3/5] Checking node_modules...
if exist "node_modules" (
    echo    ✓ node_modules exists
) else (
    echo    ✗ node_modules MISSING - Run: pnpm install
    goto :end
)

echo [4/5] Quick type check...
pnpm typecheck >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✓ No TypeScript errors
) else (
    echo    ✗ TypeScript errors found
)

echo [5/5] Testing dev server start...
echo    Starting dev server for 5 seconds...
start /B pnpm dev >nul 2>&1
timeout /t 5 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
echo    ✓ Dev server can start

:end
echo.
echo === Validation Complete ===
echo.
echo Next steps:
echo   1. Start dev server: pnpm dev
echo   2. Open http://localhost:8081
echo   3. Check VS Code Problems panel (Ctrl+Shift+M)
echo.
pause
