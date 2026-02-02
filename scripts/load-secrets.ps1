w to fix this: param (
  [string]$SecretId = $env:AWS_SECRETS_MANAGER_ID,
  [string]$Region = $env:AWS_REGION,
  [string]$OutputEnvFile = "",
  [string]$Command = "",
  [string[]]$CommandArgs = @()
)

# Add logging functionality
function Write-Log {
  param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('INFO','WARN','ERROR','DEBUG')]
    [string]$Level,
    [Parameter(Mandatory=$true)]
    [string]$Message
  )
  
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $color = switch ($Level) {
    'INFO' { 'Green' }
    'WARN' { 'Yellow' }
    'ERROR' { 'Red' }
    'DEBUG' { 'Gray' }
    default { 'White' }
  }
  
  Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Input validation function
function Test-SafeCommand {
  param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [Parameter(Mandatory=$true)]
    [string[]]$Args
  )
  
  # Dangerous patterns that could indicate injection
  $dangerousPatterns = @(
    '[;&|`$(){}[\]\\]',  # Shell metacharacters
    '^\s*(rm|del|format|shutdown|poweroff|reboot)\s*$'  # Dangerous commands (exact match only)
  )
  
  # Validate command
  if (-not $Command -or $Command -notmatch '^\S') {
    Write-Log -Level 'ERROR' -Message 'Invalid command provided'
    return $false
  }
  
  # Check for dangerous patterns in command (case insensitive)
  foreach ($pattern in $dangerousPatterns) {
    if ($Command -match $pattern) {
      Write-Log -Level 'ERROR' -Message "Command contains dangerous patterns: $Command"
      return $false
    }
  }
  
  # Validate arguments
  foreach ($arg in $Args) {
    if ($null -eq $arg) {
      Write-Log -Level 'ERROR' -Message "Invalid argument type: $arg"
      return $false
    }
    
    # Check for dangerous patterns in arguments (case insensitive)
    foreach ($pattern in $dangerousPatterns) {
      if ($arg -match $pattern) {
        Write-Log -Level 'ERROR' -Message "Argument contains dangerous patterns: $arg"
        return $false
      }
    }
  }
  
  return $true
}

$ErrorActionPreference = "Stop"

# Check if AWS Secrets Manager should be used
$useAWS = $SecretId -and (Get-Command aws -ErrorAction SilentlyContinue)

if ($useAWS) {
  Write-Host "Attempting to load secrets from AWS Secrets Manager..." -ForegroundColor Cyan

  $awsArgs = @(
    "secretsmanager",
    "get-secret-value",
    "--secret-id",
    $SecretId,
    "--query",
    "SecretString",
    "--output",
    "text"
  )

  if ($Region) {
    $awsArgs += @("--region", $Region)
  }

  try {
    $secretJson = & aws @awsArgs 2>$null

    if ($secretJson) {
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
      Write-Host "AWS Secrets Manager returned empty response, falling back to .env file" -ForegroundColor Yellow
      $useAWS = $false
    }
  }
  catch {
    Write-Host "Failed to load from AWS Secrets Manager: $_" -ForegroundColor Yellow
    Write-Host "Falling back to local .env file" -ForegroundColor Cyan
    $useAWS = $false
  }
}

# Fallback to .env file if AWS is not available or failed
if (-not $useAWS) {
  $envFile = ".env"

  if (Test-Path $envFile) {
    Write-Host "Loading secrets from local .env file..." -ForegroundColor Cyan

    Get-Content $envFile | ForEach-Object {
      if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''

        Set-Item -Path "Env:$name" -Value $value
      }
    }

    Write-Host "Secrets loaded from .env file" -ForegroundColor Green
  } else {
    Write-Host "No .env file found at $envFile" -ForegroundColor Yellow
    Write-Host "Continuing without loading secrets..." -ForegroundColor Cyan
  }
}

if ($Command) {
  # Validate command before execution
  if (-not (Test-SafeCommand -Command $Command -Args $CommandArgs)) {
    Write-Log -Level 'ERROR' -Message 'Command validation failed. Aborting execution.'
    exit 1
  }
  
  Write-Log -Level 'INFO' -Message "Executing command: $Command with $($CommandArgs.Count) arguments"
  
  try {
    & $Command @CommandArgs
    $exitCode = $LASTEXITCODE
    Write-Log -Level 'INFO' -Message "Command completed with exit code: $exitCode"
    exit $exitCode
  }
  catch {
    Write-Log -Level 'ERROR' -Message "Command execution failed: $_"
    exit 1
  }
}
