#!/usr/bin/env bash
set -euo pipefail

# Add logging functionality
log_info() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

log_warn() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >&2
}

log_error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
}

log_debug() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG] $1"
}

# Input validation function
validate_command() {
  local command="$1"
  shift
  local args=("$@")
  
  # Dangerous patterns that could indicate injection
  local dangerous_patterns=(
    '[;&|`$(){}[\]\\]'  # Shell metacharacters
    '^\s*rm\s+'        # Dangerous commands
    '^\s*del\s+'       # Dangerous commands
    '^\s*format\s+'    # Dangerous commands
    '^\s*shutdown\s+'  # Dangerous commands
    '^\s*poweroff\s+'  # Dangerous commands
    '^\s*reboot\s+'    # Dangerous commands
  )
  
  # Validate command
  if [[ -z "$command" ]] || [[ ! "$command" =~ ^[a-zA-Z0-9/_\-\.]+$ ]]; then
    log_error "Invalid command provided: $command"
    return 1
  fi
  
  # Check for dangerous patterns in command
  for pattern in "${dangerous_patterns[@]}"; do
    if [[ "$command" =~ $pattern ]]; then
      log_error "Command contains dangerous patterns: $command"
      return 1
    fi
  done
  
  # Validate arguments
  for arg in "${args[@]}"; do
    if [[ -z "$arg" ]]; then
      log_error "Invalid argument type: $arg"
      return 1
    fi
    
    # Check for dangerous patterns in arguments
    for pattern in "${dangerous_patterns[@]}"; do
      if [[ "$arg" =~ $pattern ]]; then
        log_error "Argument contains dangerous patterns: $arg"
        return 1
      fi
    done
  done
  
  return 0
}

# Sanitize string for safe use
sanitize_string() {
  local str="$1"
  # Remove or escape dangerous characters
  echo "$str" | sed 's/[;&|`$(){}[\]\\]//g' | tr -s ' ' | xargs
}

SECRET_ID="${AWS_SECRETS_MANAGER_ID:-${AWS_SECRETS_ID:-}}"
REGION="${AWS_REGION:-}"
OUTPUT_ENV_FILE=""
COMMAND=""
COMMAND_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --secret-id)
      SECRET_ID="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --write-env)
      OUTPUT_ENV_FILE="$2"
      shift 2
      ;;
    --command)
      COMMAND="$2"
      shift 2
      ;;
    --)
      shift
      COMMAND_ARGS=("$@")
      break
      ;;
    *)
      log_error "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$SECRET_ID" ]]; then
  log_error "AWS_SECRETS_MANAGER_ID is not set."
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  log_error "AWS CLI not found. Install and configure it before running."
  exit 1
fi

log_info "Attempting to load secrets from AWS Secrets Manager..."

aws_args=(secretsmanager get-secret-value --secret-id "$SECRET_ID" --query SecretString --output text)
if [[ -n "$REGION" ]]; then
  aws_args+=(--region "$REGION")
fi

secret_json=$(aws "${aws_args[@]}" 2>/dev/null)
if [[ -z "$secret_json" ]]; then
  log_warn "AWS Secrets Manager returned empty response, falling back to .env file"
  use_aws=false
else
  log_info "Secrets loaded from AWS Secrets Manager"
  export SECRET_JSON="$secret_json"
  use_aws=true
fi

# Fallback to .env file if AWS is not available or failed
if [[ "$use_aws" != "true" ]]; then
  if [[ -f ".env" ]]; then
    log_info "Loading secrets from local .env file..."
    
    while IFS='=' read -r key value; do
      if [[ -n "$key" ]] && [[ ! "$key" =~ ^# ]]; then
        # Remove quotes if present
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        export "$key=$value"
      fi
    done < ".env"
    
    log_info "Secrets loaded from .env file"
  else
    log_warn "No .env file found at .env"
    log_info "Continuing without loading secrets..."
  fi
fi

# Process environment variables for output file
if [[ -n "$OUTPUT_ENV_FILE" ]] && [[ "$use_aws" == "true" ]]; then
  log_info "Writing environment variables to $OUTPUT_ENV_FILE"
  python3 - <<'PY' > "$OUTPUT_ENV_FILE"
import json
import os
import sys

secret_json = os.environ.get("SECRET_JSON")
if secret_json:
    obj = json.loads(secret_json)
    for key, value in obj.items():
        value = str(value).replace("\r", "").replace("\n", "\\n")
        sys.stdout.write(f"{key}={value}\n")
PY
fi

# Load environment variables from AWS secrets
if [[ "$use_aws" == "true" ]]; then
  while IFS='=' read -r key value; do
    if [[ -n "$key" ]]; then
      export "$key=$value"
    fi
  done < <(python3 - <<'PY'
import json
import os
import sys

secret_json = os.environ.get("SECRET_JSON")
if secret_json:
    obj = json.loads(secret_json)
    for key, value in obj.items():
        value = str(value).replace("\r", "").replace("\n", "\\n")
        sys.stdout.write(f"{key}={value}\n")
PY
)
fi

# Execute command if provided
if [[ -n "$COMMAND" ]]; then
  # Validate command before execution
  if ! validate_command "$COMMAND" "${COMMAND_ARGS[@]}"; then
    log_error "Command validation failed. Aborting execution."
    exit 1
  fi
  
  log_info "Executing command: $COMMAND with ${#COMMAND_ARGS[@]} arguments"
  
  # Execute command with proper argument passing
  if ! "$COMMAND" "${COMMAND_ARGS[@]}"; then
    log_error "Command execution failed with exit code $?"
    exit 1
  fi
  
  log_info "Command completed successfully"
fi
