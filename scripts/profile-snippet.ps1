# ============================================================================
# PowerShell Profile Snippet for Secure Environment Variables
# ============================================================================
# 
# ADD THIS TO YOUR PowerShell PROFILE:
# 
# 1. Find/create your profile:
#    if (!(Test-Path $PROFILE)) { 
#        New-Item -ItemType File -Path $PROFILE -Force 
#    }
#    notepad $PROFILE
#
# 2. Copy the code below into your profile
# 3. Replace placeholder values with your actual secrets
# 4. Save and reload: & $PROFILE
#
# ============================================================================

# Load secrets environment variables for Portfolio Project
Write-Host "🔐 Loading Portfolio Project secrets..." -ForegroundColor Cyan

# GitHub Personal Access Tokens
# Get from: https://github.com/settings/tokens
# Scopes: repo, gist, read:user
$env:GITHUB_TOKEN = 'ghp_your_personal_access_token_here'
$env:GITHUB_MCP_TOKEN = 'ghp_your_mcp_token_here'

# Figma API Configuration
# Get from: https://www.figma.com/developers/api#authentication
$env:FIGMA_API_KEY = 'figd_your_figma_api_key_here'

# Firebase Configuration (Client-side - safe to expose)
# Get from: Firebase Console > Project Settings > General
$env:VITE_FIREBASE_API_KEY = 'AIz...your_firebase_api_key'
$env:VITE_FIREBASE_AUTH_DOMAIN = 'your-project.firebaseapp.com'
$env:VITE_FIREBASE_PROJECT_ID = 'your-project-id'
$env:VITE_FIREBASE_STORAGE_BUCKET = 'your-project.appspot.com'
$env:VITE_FIREBASE_MESSAGING_SENDER_ID = '1234567890'
$env:VITE_FIREBASE_APP_ID = '1:1234567890:web:abcdef1234567890'
$env:VITE_FIREBASE_VAPID_KEY = 'your_vapid_key_here'

# Firebase Configuration (Server-side - DO NOT STORE IN .env)
# Use secure secret manager for production
# $env:FIREBASE_PROJECT_ID = 'your-project-id'
# $env:FIREBASE_PRIVATE_KEY = 'your_private_key_json'
# $env:FIREBASE_CLIENT_EMAIL = 'service-account@your-project.iam.gserviceaccount.com'

# AWS Configuration
# Get from: AWS IAM Console > Users > Security Credentials
# Create dedicated IAM user with minimal permissions
$env:AWS_ACCESS_KEY_ID = 'AKIA...your_aws_access_key'
$env:AWS_SECRET_ACCESS_KEY = 'your_aws_secret_access_key'
$env:AWS_REGION = 'us-east-1'

# AWS Amplify App IDs
# Get from: AWS Amplify Console > Apps
$env:AMPLIFY_PRODUCTION_APP_ID = 'your_amplify_production_app_id'
$env:AMPLIFY_STAGING_APP_ID = 'your_amplify_staging_app_id'

# AI Services API Keys
# Choose one or more based on your needs

# OpenAI
# Get from: https://platform.openai.com/api-keys
$env:VITE_OPENAI_API_KEY = 'sk-your_openai_api_key'

# Anthropic Claude
# Get from: https://console.anthropic.com/
$env:VITE_ANTHROPIC_API_KEY = 'sk-ant-your_anthropic_api_key'

# Together AI
# Get from: https://api.together.xyz/settings/api-keys
$env:VITE_TOGETHER_API_KEY = 'your_together_api_key'

# Google reCAPTCHA
# Get from: https://www.google.com/recaptcha/admin
# SITE_KEY is public (safe in code)
$env:VITE_RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
# SECRET_KEY is private (never in frontend)
$env:RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'

# Google Analytics
# Get from: Google Analytics Admin > Data Streams
$env:VITE_GOOGLE_ANALYTICS_ID = 'G-XXXXXXXXXX'

# Sentry (Error Tracking & Performance Monitoring)
# Get from: https://sentry.io/ > Project Settings
$env:VITE_SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0'
$env:SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0'
$env:SENTRY_ACCESS_TOKEN = 'sntrys_your_sentry_token'
$env:SENTRY_ORG_SLUG = 'your-org-slug'

# Codacy Configuration (Code Quality)
# Get from: https://app.codacy.com/organizations
$env:CODACY_API_TOKEN = 'your_codacy_api_token'
$env:CODACY_PROJECT_TOKEN = 'your_codacy_project_token'
$env:CODACY_ORGANIZATION_PROVIDER = 'gh'
$env:CODACY_USERNAME = 'Themis128'
$env:CODACY_PROJECT_NAME = 'figma-cloud-portfolio'

# Ollama Configuration (Local AI)
# For running LLMs locally
# $env:VITE_AI_PROVIDER = 'ollama'
# $env:VITE_AI_MODEL = 'llama2'
# $env:VITE_OLLAMA_BASE_URL = 'http://localhost:11434/v1'

# Optional: Custom API URLs
$env:VITE_API_BASE_URL = 'http://localhost:3000/api'
$env:VITE_CONTACT_FORM_API_URL = 'http://localhost:3000/api/contact'

# Application Configuration
$env:VITE_APP_VERSION = '1.0.0'
$env:VITE_ENVIRONMENT = 'development'

# Server Configuration
$env:PING_MESSAGE = 'ping pong'

Write-Host "✅ Portfolio Project secrets loaded" -ForegroundColor Green

# ============================================================================
# SECURITY REMINDERS
# ============================================================================
# 
# 1. NEVER share this file or commit it to version control
# 2. Never log out secrets in console or logs
# 3. Rotate tokens if ever exposed
# 4. Use Windows Credential Manager for extra sensitive data:
#
#    # Store credential
#    $cred = Get-Credential
#    $cred.Password | ConvertFrom-SecureString | 
#        Set-Content "$env:APPDATA\Microsoft\Crypto\cred.txt"
#
#    # Retrieve credential
#    $password = Get-Content "$env:APPDATA\Microsoft\Crypto\cred.txt" | 
#        ConvertTo-SecureString
#    $cred = New-Object PSCredential('username', $password)
#
# 5. For production/CI, use:
#    - GitHub Secrets for workflows
#    - AWS Secrets Manager for deployed apps
#    - Azure Key Vault for Azure Amplify
#
# ============================================================================
