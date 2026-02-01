param()

$ErrorActionPreference = "Continue"

Write-Host "[*] Setting up external tools (Windows)..." -ForegroundColor Cyan

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Get-AvailablePackageManager {
    if (Test-CommandExists "winget") { return "winget" }
    if (Test-CommandExists "choco") { return "choco" }
    if (Test-CommandExists "scoop") { return "scoop" }
    return $null
}

# Check Node.js
if (-not (Test-CommandExists "node")) {
    Write-Host "[!] ERROR: Node.js is required but not found." -ForegroundColor Red
    exit 1
}

# Check pnpm
if (-not (Test-CommandExists "pnpm")) {
    Write-Host "[!] ERROR: pnpm is required but not found." -ForegroundColor Red
    exit 1
}

$pm = Get-AvailablePackageManager

if ($null -eq $pm) {
    Write-Host "[!] WARNING: No package manager found (winget/choco/scoop)." -ForegroundColor Yellow
    Write-Host "    Install tools manually:" -ForegroundColor Yellow
    Write-Host "    - gitleaks: https://github.com/gitleaks/gitleaks/releases" -ForegroundColor Yellow
    Write-Host "    - AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    Write-Host "    - Python: https://www.python.org/" -ForegroundColor Yellow
}
else {
    Write-Host "[+] Using $pm to install tools..." -ForegroundColor Cyan
    
    if (-not (Test-CommandExists "gitleaks")) {
        Write-Host "    Installing gitleaks..." -ForegroundColor Yellow
        switch ($pm) {
            "winget" { winget install --id Gitleaks.Gitleaks -e --accept-source-agreements 2>&1 | Out-Null }
            "choco" { choco install gitleaks -y 2>&1 | Out-Null }
            "scoop" { scoop install gitleaks 2>&1 | Out-Null }
        }
    }
    else {
        Write-Host "    [OK] gitleaks already installed" -ForegroundColor Green
    }
    
    if (-not (Test-CommandExists "aws")) {
        Write-Host "    Installing AWS CLI..." -ForegroundColor Yellow
        switch ($pm) {
            "winget" { winget install --id Amazon.AWSCLI -e --accept-source-agreements 2>&1 | Out-Null }
            "choco" { choco install awscli -y 2>&1 | Out-Null }
            "scoop" { scoop install aws 2>&1 | Out-Null }
        }
    }
    else {
        Write-Host "    [OK] AWS CLI already installed" -ForegroundColor Green
    }
    
    if (-not (Test-CommandExists "python")) {
        Write-Host "    Installing Python..." -ForegroundColor Yellow
        switch ($pm) {
            "winget" { winget install --id Python.Python.3.11 -e --accept-source-agreements 2>&1 | Out-Null }
            "choco" { choco install python -y 2>&1 | Out-Null }
            "scoop" { scoop install python 2>&1 | Out-Null }
        }
    }
    else {
        Write-Host "    [OK] Python already installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[*] Installing Playwright browsers..." -ForegroundColor Cyan
pnpm exec playwright install

Write-Host ""
Write-Host "[+] Tool setup complete!" -ForegroundColor Green



