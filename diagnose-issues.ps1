# Portfolio Diagnostics Script
# Run this in PowerShell to diagnose all issues

Write-Host "=== Portfolio Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "D:\Nuxt Projects\new-portfolio"

Write-Host "1. Checking Node.js and pnpm versions..." -ForegroundColor Yellow
node --version
pnpm --version
Write-Host ""

Write-Host "2. Checking for missing dependencies..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    Write-Host "node_modules exists" -ForegroundColor Green
} else {
    Write-Host "node_modules MISSING - Run: pnpm install" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. Running TypeScript type check..." -ForegroundColor Yellow
pnpm typecheck 2>&1 | Tee-Object -FilePath ".\typecheck-errors.txt"
Write-Host ""

Write-Host "4. Running linter..." -ForegroundColor Yellow
pnpm lint 2>&1 | Tee-Object -FilePath ".\lint-errors.txt"
Write-Host ""

Write-Host "5. Checking for outdated dependencies..." -ForegroundColor Yellow
pnpm outdated 2>&1 | Tee-Object -FilePath ".\outdated-deps.txt"
Write-Host ""

Write-Host "6. Checking build configuration..." -ForegroundColor Yellow
if (Test-Path ".\vite.config.ts") {
    Write-Host "vite.config.ts exists" -ForegroundColor Green
} else {
    Write-Host "vite.config.ts MISSING" -ForegroundColor Red
}
if (Test-Path ".\tsconfig.json") {
    Write-Host "tsconfig.json exists" -ForegroundColor Green
} else {
    Write-Host "tsconfig.json MISSING" -ForegroundColor Red
}
Write-Host ""

Write-Host "7. Testing build (dry run)..." -ForegroundColor Yellow
pnpm build:no-secrets 2>&1 | Tee-Object -FilePath ".\build-errors.txt"
Write-Host ""

Write-Host "=== Diagnostics Complete ===" -ForegroundColor Cyan
Write-Host "Check the following files for details:" -ForegroundColor Yellow
Write-Host "  - typecheck-errors.txt" -ForegroundColor White
Write-Host "  - lint-errors.txt" -ForegroundColor White
Write-Host "  - outdated-deps.txt" -ForegroundColor White
Write-Host "  - build-errors.txt" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
