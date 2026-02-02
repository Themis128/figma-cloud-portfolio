# ============================================================================
# Secure Environment Variables Setup Script for Portfolio Project
# ============================================================================
# This script helps set environment variables securely without storing
# sensitive data in version-controlled files
# ============================================================================

param (
	[switch]$Interactive = $false,
	[switch]$ShowHelp = $false
)

if ($ShowHelp) {
	Write-Host @"
USAGE: .\scripts\setup-env-vars.ps1 [OPTIONS]

OPTIONS:
	-Interactive    Prompt for each environment variable
	-ShowHelp       Display this help message

EXAMPLES:
	# Load from .env file (non-interactive)
	.\scripts\setup-env-vars.ps1

	# Prompt for each variable
	.\scripts\setup-env-vars.ps1 -Interactive

SECURE SECRET MANAGEMENT:
1. GitHub Personal Access Tokens (PAT)
   - Create at: https://github.com/settings/tokens
   - Scopes needed: repo, gist, read:user
   - Store in: PowerShell profile or secret manager

2. Figma API Keys
   - Create at: https://www.figma.com/developers/api#authentication
   - Store in: PowerShell profile or secret manager

3. Firebase Configuration
   - Get from: Firebase Console > Project Settings
   - Store in: PowerShell profile or secret manager

4. AWS Credentials
   - Create at: https://console.aws.amazon.com/iam/
   - Store in: AWS credentials file or secret manager
   - NEVER hardcode in source files

RECOMMENDED SETUP:
1. Create a PowerShell profile: $PROFILE
   See: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles

2. Store secrets in your PowerShell profile:
	`$env:GITHUB_TOKEN = 'your_token_here'`
	`$env:FIGMA_API_KEY = 'your_key_here'`

3. Use secret manager for production:
	- Windows: Credential Manager, Azure Key Vault
	- Cross-platform: 1Password, Bitwarden, LastPass
"@
	exit 0
}

$ErrorActionPreference = "Stop"
$envFile = ".env"

# Load environment variables from .env file
if (Test-Path $envFile) {
	Write-Host "📂 Loading environment variables from $envFile..." -ForegroundColor Cyan
	
	$content = Get-Content $envFile -Raw
	$envVars = @{}
	
	# Parse .env file
	foreach ($line in $content -split "`n") {
		$line = $line.Trim()
		
		# Skip comments and empty lines
		if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
			continue
		}
		
		# Parse KEY=VALUE
		if ($line -match "^([^=]+)=(.*)$") {
			$key = $matches[1].Trim()
			$value = $matches[2].Trim()
			
			# Remove quotes if present
			if ($value -match '^["''](.+)["'']$') {
				$value = $matches[1]
			}
			
			$envVars[$key] = $value
		}
	}
	
	# Set environment variables
	$count = 0
	foreach ($kvp in $envVars.GetEnumerator()) {
		$key = $kvp.Key
		$value = $kvp.Value
		
		# Handle variable substitution
		if ($value -match '\$\{(.+?)\}') {
			$varName = $matches[1]
			$replacementValue = [Environment]::GetEnvironmentVariable($varName)
			
			if ($null -ne $replacementValue) {
				$value = $value -replace '\$\{(.+?)\}', $replacementValue
				Write-Host "  ✓ $key (resolved from env var)" -ForegroundColor Green
			} else {
				Write-Host "  ⚠ $key (environment variable $varName not found)" -ForegroundColor Yellow
				continue
			}
		} elseif ($value.StartsWith('${')) {
			Write-Host "  ℹ $key (requires environment variable)" -ForegroundColor Cyan
			continue
		} else {
			Write-Host "  ✓ $key" -ForegroundColor Green
		}
		
		[Environment]::SetEnvironmentVariable($key, $value)
		$count++
	}
	
	Write-Host "`n✅ Loaded $count environment variables" -ForegroundColor Green
} else {
	Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
	Write-Host "Please create a .env file or run with -Interactive flag" -ForegroundColor Yellow
	exit 1
}

if ($Interactive) {
	Write-Host "`n📝 Setting additional environment variables interactively..." -ForegroundColor Cyan
	
	$secrets = @{
		"GITHUB_TOKEN" = "GitHub Personal Access Token"
		"FIGMA_API_KEY" = "Figma API Key"
		"AWS_ACCESS_KEY_ID" = "AWS Access Key ID"
		"AWS_SECRET_ACCESS_KEY" = "AWS Secret Access Key"
		"VITE_OPENAI_API_KEY" = "OpenAI API Key"
		"VITE_ANTHROPIC_API_KEY" = "Anthropic Claude API Key"
	}
	
	foreach ($secret in $secrets.GetEnumerator()) {
		$key = $secret.Key
		$description = $secret.Value
		
		$existing = [Environment]::GetEnvironmentVariable($key)
		$prompt = if ($existing) { "$description (current: ***hidden***)" } else { $description }
		
		$input = Read-Host "Enter $prompt (press Enter to skip)"
		
		if ($input) {
			[Environment]::SetEnvironmentVariable($key, $input)
			Write-Host "  ✓ $key set" -ForegroundColor Green
		}
	}
}

Write-Host "`n🔒 Security Reminders:" -ForegroundColor Cyan
Write-Host "  • Never commit .env files to version control" -ForegroundColor White
Write-Host "  • Store secrets in your PowerShell profile or secret manager" -ForegroundColor White
Write-Host "  • Rotate exposed tokens immediately" -ForegroundColor White
Write-Host "  • Use environment variables for all sensitive data" -ForegroundColor White
Write-Host "  • Backup files are excluded from git (.gitignore)" -ForegroundColor White
