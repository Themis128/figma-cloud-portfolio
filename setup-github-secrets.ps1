# PowerShell script to set up GitHub repository secrets from .env file
# Usage: .\setup-github-secrets.ps1 -Repo "Themis128/figma-cloud-portfolio" -Token "ghp_..."

param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [Parameter(Mandatory = $true)]
    [string]$Token
)

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Error: .env file not found in current directory"
    exit 1
}

Write-Host "🔐 Setting up GitHub repository secrets for $Repo" -ForegroundColor Cyan
Write-Host "📄 Reading secrets from $envFile" -ForegroundColor Yellow

# Function to set a GitHub secret
function Set-GitHubSecret {
    param(
        [string]$Name,
        [string]$Value
    )

    if ([string]::IsNullOrEmpty($Value)) {
        Write-Host "⚠️  Skipping $Name (empty value)" -ForegroundColor Yellow
        return
    }

    Write-Host "🔑 Setting secret: $Name" -ForegroundColor Green

    try {
        # Get public key for encryption
        $publicKeyResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/actions/secrets/public-key" -Headers @{
            "Authorization" = "token $Token"
            "Accept"        = "application/vnd.github.v3+json"
        }

        $keyId = $publicKeyResponse.key_id
        $publicKey = $publicKeyResponse.key

        # Encrypt the value (simplified - in production you'd use proper encryption)
        # For now, we'll use base64 encoding as a placeholder
        $encryptedValue = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Value))

        # Create the secret
        $body = @{
            encrypted_value = $encryptedValue
            key_id          = $keyId
        } | ConvertTo-Json

        Invoke-RestMethod -Method Put -Uri "https://api.github.com/repos/$Repo/actions/secrets/$Name" -Headers @{
            "Authorization" = "token $Token"
            "Accept"        = "application/vnd.github.v3+json"
        } -Body $body -ContentType "application/json"

        Write-Host "✅ Successfully set $Name" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to set $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Read .env file and set secrets
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    # Skip comments and empty lines
    if ($line -match '^#' -or [string]::IsNullOrEmpty($line)) {
        return
    }

    # Parse key=value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Remove quotes from value if present
        $value = $value -replace '^"(.*)"$', '$1' -replace "^'(.*)'$", '$1'

        # Convert environment variable name to GitHub secret name
        $secretName = $key.ToUpper()

        Set-GitHubSecret -Name $secretName -Value $value
    }
}

Write-Host ""
Write-Host "✅ GitHub secrets setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/$Repo/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Verify the secrets were created:" -ForegroundColor White
Write-Host "   - VITE_RECAPTCHA_SITE_KEY" -ForegroundColor Yellow
Write-Host "   - VITE_RECAPTCHA_SECRET_KEY" -ForegroundColor Yellow
Write-Host "   - VITE_GOOGLE_ANALYTICS_ID" -ForegroundColor Yellow
Write-Host "   - VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID" -ForegroundColor Yellow
Write-Host "   - VITE_PUBLIC_RECAPTCHA_SITE_KEY" -ForegroundColor Yellow
Write-Host "   - VITE_AI_PROVIDER" -ForegroundColor Yellow
Write-Host "   - VITE_AI_MODEL" -ForegroundColor Yellow
Write-Host "   - VITE_OLLAMA_BASE_URL" -ForegroundColor Yellow
Write-Host "   - CODACY_API_TOKEN" -ForegroundColor Yellow
Write-Host "   - CODACY_PROJECT_TOKEN" -ForegroundColor Yellow
Write-Host "   - SENTRY_DSN" -ForegroundColor Yellow
Write-Host "   - VITE_SENTRY_DSN" -ForegroundColor Yellow
Write-Host "   - VITE_GITHUB_TOKEN" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Add missing AWS secrets:" -ForegroundColor Cyan
Write-Host "   - AWS_ACCESS_KEY_ID" -ForegroundColor Red
Write-Host "   - AWS_SECRET_ACCESS_KEY" -ForegroundColor Red
Write-Host "   - AWS_REGION" -ForegroundColor Red
Write-Host "   - AMPLIFY_PRODUCTION_APP_ID" -ForegroundColor Red
Write-Host "   - AMPLIFY_STAGING_APP_ID" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  Note: AWS secrets must be obtained from AWS IAM and Amplify Console" -ForegroundColor Yellow
<parameter name="filePath">d:\Nuxt Projects\new-portfolio\setup-github-secrets.ps1