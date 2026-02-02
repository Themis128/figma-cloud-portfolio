#!/bin/bash
# Git History Cleanup Script
# This script removes sensitive .env files from git history
# WARNING: This rewrites git history and requires force push

set -e

echo "======================================"
echo "Git History Cleanup Script"
echo "======================================"
echo ""
echo "This script will remove .env files from git history."
echo "⚠️  WARNING: This rewrites git history!"
echo ""

# Check if repository is clean
if [[ -n $(git status -s) ]]; then
    echo "❌ Error: Working directory is not clean. Commit or stash changes first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "Current branch: $(git branch --show-current)"
echo "Repository: $(git remote get-url origin 2>/dev/null || echo 'No remote configured')"
echo ""

# Confirm with user
read -p "Do you want to proceed with history cleanup? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
    echo "❌ Cancelled by user"
    exit 0
fi

echo ""
echo "📋 Step 1: Creating backup branch..."
backup_branch="backup-$(date +%Y%m%d-%H%M%S)"
git branch "$backup_branch"
echo "✅ Backup branch created: $backup_branch"

echo ""
echo "📋 Step 2: Removing .env from git history..."

# Method 1: Using git filter-branch (built-in)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

echo "✅ .env removed from history"

echo ""
echo "📋 Step 3: Cleaning up refs..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Repository cleaned"

echo ""
echo "📋 Step 4: Verification..."
if git log --all --full-history --pretty=format:"%H" -- .env | grep -q .; then
    echo "⚠️  Warning: .env still found in history. You may need to use BFG Repo Cleaner."
else
    echo "✅ .env successfully removed from history"
fi

echo ""
echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Verify the changes: git log --all -- .env"
echo "2. Push to remote (FORCE): git push --force --all"
echo "3. Push tags (FORCE): git push --force --tags"
echo ""
echo "⚠️  IMPORTANT: Notify all collaborators to re-clone the repository!"
echo "   Old clones will have divergent history."
echo ""
echo "To restore from backup if needed:"
echo "   git reset --hard $backup_branch"
echo ""
