#!/bin/bash
# Token Rotation Helper Script
# Helps automate parts of the token rotation process

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Token Rotation Helper Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Backup .env
backup_file=".env.backup.$(date +%Y%m%d_%H%M%S)"
cp .env "$backup_file"
echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
echo ""

# Function to update token in .env
update_token() {
    local var_name=$1
    local new_value=$2

    if grep -q "^${var_name}=" .env; then
        # Update existing
        sed -i "s|^${var_name}=.*|${var_name}=${new_value}|" .env
        echo -e "${GREEN}✅ Updated ${var_name}${NC}"
    else
        # Add new
        echo "${var_name}=${new_value}" >> .env
        echo -e "${GREEN}✅ Added ${var_name}${NC}"
    fi
}

# GitHub Token
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}1. GitHub Token${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Steps to get new token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select required scopes (repo, read:user, etc.)"
echo "4. Copy the generated token"
echo ""
read -p "Enter new GitHub token (or press Enter to skip): " github_token
if [ ! -z "$github_token" ]; then
    update_token "GITHUB_TOKEN" "$github_token"
    update_token "GITHUB_PORTFOLIO_TOKEN" "$github_token"
    echo -e "${GREEN}✅ GitHub tokens updated${NC}"
fi
echo ""

# Sentry Token
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}2. Sentry Access Token${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Steps to get new token:"
echo "1. Go to: https://sentry.io/settings/account/api/auth-tokens/"
echo "2. Revoke old token"
echo "3. Click 'Create New Token'"
echo "4. Copy the generated token"
echo ""
read -p "Enter new Sentry token (or press Enter to skip): " sentry_token
if [ ! -z "$sentry_token" ]; then
    update_token "SENTRY_ACCESS_TOKEN" "$sentry_token"
    echo -e "${GREEN}✅ Sentry token updated${NC}"
fi
echo ""

# reCAPTCHA Keys
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}3. reCAPTCHA Keys${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Steps to get new keys:"
echo "1. Go to: https://www.google.com/recaptcha/admin"
echo "2. Delete old site or create new one"
echo "3. Copy site key and secret key"
echo ""
read -p "Enter new reCAPTCHA SITE key (or press Enter to skip): " recaptcha_site
read -p "Enter new reCAPTCHA SECRET key (or press Enter to skip): " recaptcha_secret
if [ ! -z "$recaptcha_site" ] && [ ! -z "$recaptcha_secret" ]; then
    update_token "VITE_RECAPTCHA_SITE_KEY" "$recaptcha_site"
    update_token "VITE_PUBLIC_RECAPTCHA_SITE_KEY" "$recaptcha_site"
    update_token "VITE_RECAPTCHA_SECRET_KEY" "$recaptcha_secret"
    update_token "RECAPTCHA_SECRET_KEY" "$recaptcha_secret"
    echo -e "${GREEN}✅ reCAPTCHA keys updated${NC}"
fi
echo ""

# Figma API
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}4. Figma API Credentials${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Steps to get new credentials:"
echo "1. Go to: https://www.figma.com/developers/api"
echo "2. Generate new personal access token"
echo ""
read -p "Enter new Figma API key (or press Enter to skip): " figma_key
read -p "Enter new Figma client secret (or press Enter to skip): " figma_secret
if [ ! -z "$figma_key" ]; then
    update_token "FIGMA_API_KEY" "$figma_key"
fi
if [ ! -z "$figma_secret" ]; then
    update_token "FIGMA_CLIENT_SECRET" "$figma_secret"
fi
if [ ! -z "$figma_key" ] || [ ! -z "$figma_secret" ]; then
    echo -e "${GREEN}✅ Figma credentials updated${NC}"
fi
echo ""

# Codacy Tokens
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}5. Codacy API Tokens${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Steps to get new tokens:"
echo "1. Go to: https://app.codacy.com/account/apiTokens"
echo "2. Revoke old tokens"
echo "3. Generate new API token"
echo "4. Get project token from project settings"
echo ""
read -p "Enter new Codacy API token (or press Enter to skip): " codacy_api
read -p "Enter new Codacy project token (or press Enter to skip): " codacy_project
if [ ! -z "$codacy_api" ]; then
    update_token "CODACY_API_TOKEN" "$codacy_api"
fi
if [ ! -z "$codacy_project" ]; then
    update_token "CODACY_PROJECT_TOKEN" "$codacy_project"
fi
if [ ! -z "$codacy_api" ] || [ ! -z "$codacy_project" ]; then
    echo -e "${GREEN}✅ Codacy tokens updated${NC}"
fi
echo ""

# MCP Configuration Reminder
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}6. MCP Configuration${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update your MCP configuration${NC}"
echo ""
echo "File location:"
echo "  C:\\Users\\baltz\\AppData\\Roaming\\Code - Insiders\\User\\mcp.json"
echo ""
echo "Replace hardcoded tokens with:"
echo "  \"Authorization\": \"Bearer \${GITHUB_TOKEN}\""
echo "  \"GITHUB_TOKEN\": \"\${GITHUB_TOKEN}\""
echo ""
echo "See MCP_SECURE_CONFIG.md for detailed instructions"
echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Token Rotation Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Tokens updated in .env file${NC}"
echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
echo ""
echo "Next steps:"
echo "1. ✏️  Update mcp.json to use environment variables"
echo "2. 🔄 Restart VS Code"
echo "3. ✅ Test all integrations"
echo "4. 📋 Check off items in TOKEN_ROTATION_CHECKLIST.md"
echo ""
echo "Run verification:"
echo "  ./scripts/verify-security.sh"
echo ""
