param (
  [string]$SecretId = $env:AWS_SECRETS_MANAGER_ID,
  [string]$Region = $env:AWS_REGION,
  [string]$OutputEnvFile = "",
  [string]$Command = "",
  [string[]]$CommandArgs = @()
)

$ErrorActionPreference = "Stop"

# Ensure CommandArgs is initialized
if (-not $CommandArgs) {
  $CommandArgs = @()
}

# Set default region if not provided (secret is in eu-central-1)
if (-not $Region) {
  $Region = "eu-central-1"
}

# Check if AWS Secrets Manager should be used
$useAWS = $false
if ($SecretId -and (Get-Command aws -ErrorAction SilentlyContinue)) {
  # Test if AWS credentials are available
  try {
    $testResult = aws sts get-caller-identity --region $Region 2>$null
    if ($LASTEXITCODE -eq 0) {
      $useAWS = $true
    }
  } catch {
    Write-Host "AWS credentials not available in PowerShell" -ForegroundColor Yellow
  }
}

if ($useAWS) {
  Write-Host "Attempting to load secrets from AWS Secrets Manager..." -ForegroundColor Cyan
  Write-Host "Region: $Region, SecretId: $SecretId" -ForegroundColor Cyan

  try {
    $secretJson = aws secretsmanager get-secret-value --secret-id $SecretId --region $Region --query SecretString --output text 2>&1

    if ($LASTEXITCODE -eq 0 -and $secretJson) {
      Write-Host "Secrets loaded from AWS Secrets Manager" -ForegroundColor Green

      $secretObject = $secretJson | ConvertFrom-Json

      if ($OutputEnvFile) {
        $lines = @()
        foreach ($prop in $secretObject.PSObject.Properties) {
          $name = $prop.Name
          $value = [string]$prop.Value
          $normalized = $value -replace "`r", "" -replace "`n", "\\n"
          $lines += "$name=$normalized"
        }
        $lines | Set-Content -Path $OutputEnvFile -Encoding UTF8
      }

      foreach ($prop in $secretObject.PSObject.Properties) {
        $name = $prop.Name
        $value = [string]$prop.Value
        Set-Item -Path "Env:$name" -Value $value
      }
    } else {
      Write-Host "AWS Secrets Manager returned empty response" -ForegroundColor Yellow
      $useAWS = $false
    }
  }
  catch {
    Write-Host "Failed to load from AWS Secrets Manager: $_" -ForegroundColor Yellow
    $useAWS = $false
  }
}

# Fallback to .env file if AWS is not available or failed
if (-not $useAWS) {
  Write-Host "Loading secrets from local .env file..." -ForegroundColor Cyan

  $envFile = ".env"
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        $value = $value -replace '^["'']|["'']$', ''
        Set-Item -Path "Env:$name" -Value $value
      }
    }
    Write-Host "Secrets loaded from .env file" -ForegroundColor Green
  } else {
    Write-Host "No .env file found at $envFile" -ForegroundColor Yellow
  }
}

if ($Command) {
  Write-Host "Executing command: $Command" -ForegroundColor Green
  try {
    # For vite command, use npx to ensure proper execution
    if ($Command -eq "vite") {
      & npx vite @CommandArgs
    } else {
      & $Command @CommandArgs
    }
    exit $LASTEXITCODE
  }
  catch {
    Write-Host "Command execution failed: $_" -ForegroundColor Red
    exit 1
  }
}
