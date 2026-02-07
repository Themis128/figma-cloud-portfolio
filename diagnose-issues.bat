@echo off
echo === Portfolio Diagnostics ===
echo.

cd /d "D:\Nuxt Projects\new-portfolio"

echo 1. Checking Node.js and pnpm versions...
node --version
pnpm --version
echo.

echo 2. Checking for node_modules...
if exist "node_modules" (
    echo [OK] node_modules exists
) else (
    echo [ERROR] node_modules MISSING - Run: pnpm install
)
echo.

echo 3. Running TypeScript type check...
pnpm typecheck > typecheck-errors.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] TypeScript check passed
) else (
    echo [ERROR] TypeScript errors found - see typecheck-errors.txt
)
echo.

echo 4. Running linter...
pnpm lint > lint-errors.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Lint check passed
) else (
    echo [WARN] Lint issues found - see lint-errors.txt
)
echo.

echo 5. Checking for outdated dependencies...
pnpm outdated > outdated-deps.txt 2>&1
echo Check outdated-deps.txt for details
echo.

echo 6. Testing build...
pnpm build:no-secrets > build-errors.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Build succeeded
) else (
    echo [ERROR] Build failed - see build-errors.txt
)
echo.

echo === Diagnostics Complete ===
echo.
echo Check these files for details:
echo   - typecheck-errors.txt
echo   - lint-errors.txt
echo   - outdated-deps.txt
echo   - build-errors.txt
echo.
pause
