# Git History Cleanup Script (PowerShell)
# This script removes sensitive .env files from git history
# WARNING: This rewrites git history and requires force push

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Git History Cleanup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will remove .env files from git history." -ForegroundColor Yellow
Write-Host "⚠️  WARNING: This rewrites git history!" -ForegroundColor Red
Write-Host ""

# Check if repository is clean
$status = git status --porcelain
if ($status) {
    Write-Host "❌ Error: Working directory is not clean. Commit or stash changes first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

$currentBranch = git branch --show-current
$remote = git remote get-url origin 2>$null
if (-not $remote) { $remote = "No remote configured" }

Write-Host "Current branch: $currentBranch" -ForegroundColor White
Write-Host "Repository: $remote" -ForegroundColor White
Write-Host ""

# Confirm with user
$confirm = Read-Host "Do you want to proceed with history cleanup? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📋 Step 1: Creating backup branch..." -ForegroundColor Cyan
$backupBranch = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "✅ Backup branch created: $backupBranch" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 2: Removing .env from git history..." -ForegroundColor Cyan

# Using git filter-branch
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch .env" `
  --prune-empty --tag-name-filter cat -- --all

Write-Host "✅ .env removed from history" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 3: Cleaning up refs..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "✅ Repository cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 4: Verification..." -ForegroundColor Cyan
$envInHistory = git log --all --full-history --pretty=format:"%H" -- .env
if ($envInHistory) {
    Write-Host "⚠️  Warning: .env still found in history. You may need to use BFG Repo Cleaner." -ForegroundColor Yellow
} else {
    Write-Host "✅ .env successfully removed from history" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify the changes: git log --all -- .env" -ForegroundColor White
Write-Host "2. Push to remote (FORCE): git push --force --all" -ForegroundColor White
Write-Host "3. Push tags (FORCE): git push --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Notify all collaborators to re-clone the repository!" -ForegroundColor Red
Write-Host "   Old clones will have divergent history." -ForegroundColor White
Write-Host ""
Write-Host "To restore from backup if needed:" -ForegroundColor Yellow
Write-Host "   git reset --hard $backupBranch" -ForegroundColor White
Write-Host ""
