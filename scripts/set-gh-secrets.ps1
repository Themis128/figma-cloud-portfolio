<#
PowerShell helper to set repository secrets using gh CLI.
Usage (PowerShell):
  $env:AWS_ACCESS_KEY_ID = 'xxx'; $env:AWS_SECRET_ACCESS_KEY = 'yyy'; pwsh ./scripts/set-gh-secrets.ps1
If a variable is missing, the script will prompt you.
#>

param()

function Prompt-IfMissing($name) {
  # Use .NET API for dynamic environment-variable lookup to avoid parser errors
  $envVal = [System.Environment]::GetEnvironmentVariable($name)
  if ([string]::IsNullOrEmpty($envVal)) {
    $val = Read-Host -Prompt "Enter value for $name"
    return $val
  }
  return $envVal
}

# Determine repository (owner/repo). Prefer gh repo view, validate, fallback to env:GITHUB_REPOSITORY, else prompt.
$repo = $null
try {
  $repo = (& gh repo view --json nameWithOwner -q .nameWithOwner) 2>$null
} catch {
  $repo = $null
}
if ([string]::IsNullOrEmpty($repo) -or -not ($repo -match '^[^/]+/[^/]+$')) {
  $envRepo = [System.Environment]::GetEnvironmentVariable('GITHUB_REPOSITORY')
  if (-not [string]::IsNullOrEmpty($envRepo) -and $envRepo -match '^[^/]+/[^/]+$') {
    $repo = $envRepo
  } else {
    $repo = Read-Host -Prompt 'Enter repository (owner/repo)'
    if ($repo -notmatch '^[^/]+/[^/]+$') {
      Write-Error 'Repository must be in owner/repo format'
      exit 1
    }
  }
}

$AWS_ACCESS_KEY_ID = Prompt-IfMissing 'AWS_ACCESS_KEY_ID'
$AWS_SECRET_ACCESS_KEY = Prompt-IfMissing 'AWS_SECRET_ACCESS_KEY'
$AMPLIFY_APP_ID = Prompt-IfMissing 'AMPLIFY_APP_ID'
$AMPLIFY_BRANCH = Prompt-IfMissing 'AMPLIFY_BRANCH'
$AWS_REGION = $env:AWS_REGION -or 'us-east-1'
$DEPLOY_TO_GHPAGES = $env:DEPLOY_TO_GHPAGES -or 'false'

Write-Host "Setting secrets on $repo..."
$AWS_ACCESS_KEY_ID | gh secret set AWS_ACCESS_KEY_ID -R $repo --body -
$AWS_SECRET_ACCESS_KEY | gh secret set AWS_SECRET_ACCESS_KEY -R $repo --body -
$AWS_REGION | gh secret set AWS_REGION -R $repo --body -
$AMPLIFY_APP_ID | gh secret set AMPLIFY_APP_ID -R $repo --body -
$AMPLIFY_BRANCH | gh secret set AMPLIFY_BRANCH -R $repo --body -
$DEPLOY_TO_GHPAGES | gh secret set DEPLOY_TO_GHPAGES -R $repo --body -

if ($env:DOCKER_USERNAME -and $env:DOCKER_PASSWORD) {
  $env:DOCKER_USERNAME | gh secret set DOCKER_USERNAME -R $repo --body -
  $env:DOCKER_PASSWORD | gh secret set DOCKER_PASSWORD -R $repo --body -
}

Write-Host 'Secrets set successfully. Verify in repository -> Settings -> Secrets & variables -> Actions.'