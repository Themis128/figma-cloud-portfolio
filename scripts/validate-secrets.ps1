# ============================================================================
# Secret Validation and Security Check Script
# ============================================================================
# Verifies that secrets are properly configured and securely managed
# ============================================================================

param (
	[switch]$Verbose = $false,
	[switch]$CheckHistory = $false
)

Write-Host "🔒 Starting Security Validation..." -ForegroundColor Cyan

$errors = @()
$warnings = @()
$success = @()

# ============================================================================
# 1. Check .env Files
# ============================================================================
Write-Host "`n📋 Checking .env files..." -ForegroundColor Yellow

$envFiles = @".env", ".env.local", ".env.backup.20260201_210019"
foreach ($file in $envFiles) {
	if (Test-Path $file) {
		Write-Host "  Found: $file" -ForegroundColor Gray
		
		$content = Get-Content $file -Raw
		
		# Check for hardcoded secrets (simple pattern matching)
		$secretPatterns = @(
			'ghp_[a-zA-Z0-9_]{36}',  # GitHub PAT
			'figd_[a-zA-Z0-9_]{36}',  # Figma API Key
			'sk-[a-zA-Z0-9_]{40,}',  # OpenAI key
			'sk-ant-[a-zA-Z0-9_]{36}',  # Claude key
			'AKIA[0-9A-Z]{16}',  # AWS Access Key
		)
		
		$foundSecrets = $false
		foreach ($pattern in $secretPatterns) {
			if ($content -match $pattern) {
				$foundSecrets = $true
				$warnings += "⚠️  $file contains potential hardcoded secrets (pattern: $pattern)"
				Write-Host "    ⚠️  Contains hardcoded secrets" -ForegroundColor Red
			}
		}
		
		if (-not $foundSecrets) {
			$success += "✓ $file has no hardcoded secrets"
		}
	}
}

# ============================================================================
# 2. Check .gitignore
# ============================================================================
Write-Host "`n📝 Checking .gitignore..." -ForegroundColor Yellow

if (Test-Path ".gitignore") {
	$gitignoreContent = Get-Content ".gitignore" -Raw
	
	$envPatterns = @(".env", ".env.local", ".env.backup", ".env*.backup")
	$ignoredCount = 0
	
	foreach ($pattern in $envPatterns) {
		if ($gitignoreContent -match [regex]::Escape($pattern)) {
			$ignoredCount++
		}
	}
	
	if ($ignoredCount -eq $envPatterns.Count) {
		$success += "✓ .gitignore properly excludes all .env files"
		Write-Host "  ✓ All .env files are gitignored" -ForegroundColor Green
	} else {
		$errors += "❌ .gitignore missing proper .env exclusions"
		Write-Host "  ❌ .gitignore incomplete" -ForegroundColor Red
	}
} else {
	$errors += "❌ .gitignore file not found"
}

# ============================================================================
# 3. Check Environment Variables
# ============================================================================
Write-Host "`n🔐 Checking Environment Variables..." -ForegroundColor Yellow

$requiredEnvVars = @(
	"GITHUB_TOKEN",
	"FIGMA_API_KEY",
	"VITE_FIREBASE_PROJECT_ID",
	"AWS_ACCESS_KEY_ID",
	"VITE_OPENAI_API_KEY"
)

$configuredCount = 0
foreach ($var in $requiredEnvVars) {
	$value = [Environment]::GetEnvironmentVariable($var)
	if ($value) {
		$displayValue = if ($Verbose) { $value } else { "***set***" }
		$success += "✓ $var is configured"
		Write-Host "  ✓ $var: $displayValue" -ForegroundColor Green
		$configuredCount++
	} else {
		$warnings += "⚠️  $var not found in environment variables"
		Write-Host "  ⚠️  $var: NOT SET" -ForegroundColor Yellow
	}
}

if ($configuredCount -gt 0) {
	Write-Host "  Configured: $configuredCount / $($requiredEnvVars.Count)" -ForegroundColor Cyan
}

# ============================================================================
# 4. Check PowerShell Profile
# ============================================================================
Write-Host "`n🖥️  Checking PowerShell Profile..." -ForegroundColor Yellow

if (Test-Path $PROFILE) {
	Write-Host "  Profile path: $PROFILE" -ForegroundColor Gray
	$profileContent = Get-Content $PROFILE -Raw
	
	if ($profileContent -match '\$env:GITHUB_TOKEN') {
		$success += "✓ PowerShell profile contains environment variable configuration"
		Write-Host "  ✓ Profile configured for secrets" -ForegroundColor Green
	} else {
		$warnings += "⚠️  PowerShell profile doesn't contain environment variable setup"
		Write-Host "  ⚠️  Profile may not have secrets configured" -ForegroundColor Yellow
		Write-Host "  💡 Run: notepad $PROFILE and add secrets" -ForegroundColor Cyan
	}
	
	# Check for hardcoded secrets in profile
	if ($profileContent -match 'ghp_[a-zA-Z0-9_]{36}') {
		$errors += "❌ PowerShell profile contains hardcoded GitHub PAT!"
		Write-Host "  ❌ HARDCODED SECRETS IN PROFILE!" -ForegroundColor Red
	}
} else {
	$warnings += "⚠️  PowerShell profile not found at $PROFILE"
	Write-Host "  ⚠️  No PowerShell profile" -ForegroundColor Yellow
	Write-Host "  💡 Create profile: New-Item -ItemType File -Path `$PROFILE -Force" -ForegroundColor Cyan
}

# ============================================================================
# 5. Check Git History (Optional)
# ============================================================================
if ($CheckHistory) {
	Write-Host "`n🔍 Scanning git history for secrets (this may take a moment)..." -ForegroundColor Yellow
	
	# Check for common secret patterns in git
	$secretPatterns = @{
		"GitHub PAT" = "ghp_[a-zA-Z0-9]{36}"
		"Figma Key" = "figd_[a-zA-Z0-9]{36}"
		"AWS Access Key" = "AKIA[0-9A-Z]{16}"
		"OpenAI Key" = "sk-[a-zA-Z0-9]{40,}"
	}
	
	foreach ($secretType in $secretPatterns.GetEnumerator()) {
		$pattern = $secretType.Value
		
		if (git log -p --all -S "$pattern" 2>$null) {
			$errors += "❌ Found $($secretType.Key) in git history"
			Write-Host "  ❌ $($secretType.Key) in history" -ForegroundColor Red
		}
	}
}

# ============================================================================
# 6. Check Staged Changes
# ============================================================================
Write-Host "`n📦 Checking staged changes..." -ForegroundColor Yellow

$stagedFiles = git diff --cached --name-only 2>$null
if ($stagedFiles) {
	foreach ($file in $stagedFiles) {
		if ($file -match '\.env') {
			$errors += "❌ $file is staged for commit (should be gitignored)"
			Write-Host "  ❌ Don't commit: $file" -ForegroundColor Red
		}
	}
} else {
	$success += "✓ No sensitive files staged for commit"
	Write-Host "  ✓ No .env files staged" -ForegroundColor Green
}

# ============================================================================
# Summary Report
# ============================================================================
Write-Host "`n" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "📊 SECURITY VALIDATION REPORT" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

if ($errors.Count -gt 0) {
	Write-Host "`n❌ ERRORS ($($errors.Count)):" -ForegroundColor Red
	foreach ($error in $errors) {
		Write-Host "  $error" -ForegroundColor Red
	}
}

if ($warnings.Count -gt 0) {
	Write-Host "`n⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
	foreach ($warning in $warnings) {
		Write-Host "  $warning" -ForegroundColor Yellow
	}
}

if ($success.Count -gt 0) {
	Write-Host "`n✅ PASSED ($($success.Count)):" -ForegroundColor Green
	foreach ($check in $success) {
		Write-Host "  $check" -ForegroundColor Green
	}
}

# ============================================================================
# Overall Status
# ============================================================================
Write-Host "`n" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
	Write-Host "🚨 SECURITY STATUS: CRITICAL" -ForegroundColor Red
	Write-Host "    Action: Fix errors immediately before committing" -ForegroundColor Red
	exit 1
} elseif ($warnings.Count -gt 0) {
	Write-Host "⚠️  SECURITY STATUS: WARNING" -ForegroundColor Yellow
	Write-Host "    Action: Review and address warnings" -ForegroundColor Yellow
	exit 0
} else {
	Write-Host "✅ SECURITY STATUS: OK" -ForegroundColor Green
	Write-Host "    Secrets are properly configured and managed" -ForegroundColor Green
	exit 0
}
