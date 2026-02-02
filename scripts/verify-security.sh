#!/bin/bash
# Security Verification Script
# Verifies that all security measures are properly implemented

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Security Verification Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

errors=0
warnings=0

# Check 1: .env in gitignore
echo -e "${CYAN}[Check 1] Verifying .env is in .gitignore...${NC}"
if grep -qx ".env" .gitignore; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ .env is NOT in .gitignore${NC}"
    ((errors++))
fi
echo ""

# Check 2: mcp.json in gitignore
echo -e "${CYAN}[Check 2] Verifying mcp.json is in .gitignore...${NC}"
if grep -q "mcp\.json" .gitignore; then
    echo -e "${GREEN}✅ mcp.json is in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  mcp.json is NOT in .gitignore${NC}"
    ((warnings++))
fi
echo ""

# Check 3: .env not committed to current branch
echo -e "${CYAN}[Check 3] Verifying .env is not tracked by git...${NC}"
if git ls-files | grep -q "^.env$"; then
    echo -e "${RED}❌ .env is tracked by git!${NC}"
    echo "   Run: git rm --cached .env"
    ((errors++))
else
    echo -e "${GREEN}✅ .env is not tracked by git${NC}"
fi
echo ""

# Check 4: .env exists
echo -e "${CYAN}[Check 4] Verifying .env file exists...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env file does not exist${NC}"
    echo "   Copy from .env.example: cp .env.example .env"
    ((warnings++))
fi
echo ""

# Check 5: .env has required variables
echo -e "${CYAN}[Check 5] Checking .env for required variables...${NC}"
if [ -f ".env" ]; then
    required_vars=("GITHUB_TOKEN" "VITE_RECAPTCHA_SITE_KEY" "VITE_RECAPTCHA_SECRET_KEY")
    missing_vars=()

    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            value=$(grep "^${var}=" .env | cut -d'=' -f2-)
            if [[ "$value" == "your_"* ]] || [ -z "$value" ]; then
                echo -e "${YELLOW}⚠️  $var is not configured${NC}"
                missing_vars+=("$var")
            fi
        else
            echo -e "${YELLOW}⚠️  $var is missing from .env${NC}"
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required variables are configured${NC}"
    else
        echo -e "${YELLOW}⚠️  ${#missing_vars[@]} variable(s) need configuration${NC}"
        ((warnings++))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no .env file)${NC}"
    ((warnings++))
fi
echo ""

# Check 6: Scan for hardcoded secrets in code
echo -e "${CYAN}[Check 6] Scanning for hardcoded secrets in code...${NC}"
secret_patterns=("ghp_" "gho_" "github_pat_" "glpat-" "xoxb-" "AKIA")
found_secrets=0

for pattern in "${secret_patterns[@]}"; do
    if git grep -i "$pattern" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v ".env" | grep -v "example" | grep -v ".md"; then
        echo -e "${RED}❌ Potential secret found: $pattern${NC}"
        ((found_secrets++))
    fi
done

if [ $found_secrets -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded secrets detected${NC}"
else
    echo -e "${RED}❌ Found $found_secrets potential secret(s)${NC}"
    ((errors++))
fi
echo ""

# Check 7: Check git history for .env
echo -e "${CYAN}[Check 7] Checking git history for .env files...${NC}"
if git log --all --full-history --pretty=format:"%H" -- .env 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠️  .env found in git history${NC}"
    echo "   Consider running: ./scripts/cleanup-git-history.sh"
    ((warnings++))
else
    echo -e "${GREEN}✅ .env not found in git history${NC}"
fi
echo ""

# Check 8: Repository visibility
echo -e "${CYAN}[Check 8] Checking repository visibility...${NC}"
visibility=$(gh repo view --json visibility -q .visibility 2>/dev/null || echo "UNKNOWN")
if [ "$visibility" = "PRIVATE" ]; then
    echo -e "${GREEN}✅ Repository is PRIVATE${NC}"
elif [ "$visibility" = "PUBLIC" ]; then
    echo -e "${RED}❌ Repository is PUBLIC - sensitive data may be exposed!${NC}"
    ((errors++))
else
    echo -e "${YELLOW}⚠️  Unable to determine repository visibility${NC}"
    ((warnings++))
fi
echo ""

# Check 9: MCP configuration (if accessible)
echo -e "${CYAN}[Check 9] Checking MCP configuration...${NC}"
mcp_file="/c/Users/baltz/AppData/Roaming/Code - Insiders/User/mcp.json"
if [ -f "$mcp_file" ]; then
    if grep -E "(ghp_|gho_|github_pat_)" "$mcp_file" > /dev/null 2>&1; then
        echo -e "${RED}❌ Hardcoded GitHub token found in mcp.json${NC}"
        echo "   Update to use: \${GITHUB_TOKEN}"
        ((errors++))
    else
        echo -e "${GREEN}✅ No hardcoded tokens detected in mcp.json${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MCP file not found (this is okay if not using MCP)${NC}"
fi
echo ""

# Check 10: Pre-commit hooks
echo -e "${CYAN}[Check 10] Checking for pre-commit hooks...${NC}"
if [ -f ".git/hooks/pre-commit" ]; then
    echo -e "${GREEN}✅ Pre-commit hook exists${NC}"
else
    echo -e "${YELLOW}⚠️  No pre-commit hook found${NC}"
    echo "   Consider adding one to prevent .env commits"
    ((warnings++))
fi
echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Verification Summary${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Passed with $warnings warning(s)${NC}"
    echo "   Review warnings above to improve security"
    exit 0
else
    echo -e "${RED}❌ Failed with $errors error(s) and $warnings warning(s)${NC}"
    echo "   Fix errors above to ensure security"
    exit 1
fi
