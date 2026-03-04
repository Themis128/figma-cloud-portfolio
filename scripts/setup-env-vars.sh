#!/bin/bash

# Secure Secrets Management Setup Script for WSL2
# This script helps set up environment variables for the portfolio project

# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Function to add environment variable if not exists
add_env_var() {
    local var_name=$1
    local var_value=$2
    local description=$3

    if grep -q "^$var_name=" .env; then
        echo "✓ $var_name already exists"
    else
        echo "Adding $var_name ($description)"
        echo "# $description" >> .env
        echo "$var_name=$var_value" >> .env
    fi
}

# Function to get user input for sensitive variables
get_secret_input() {
    local var_name=$1
    local description=$2

    read -p "Enter $description: " -s var_value
    echo
    add_env_var "$var_name" "$var_value" "$description"
}

# Main setup
echo "Secure Secrets Management Setup"
echo "================================="

# Check if we're in interactive mode
if [ "$1" = "-i" ] || [ "$1" = "-interactive" ]; then
    INTERACTIVE=true
else
    INTERACTIVE=false
fi

# Add non-sensitive variables
add_env_var "NEXT_PUBLIC_BUILDER_API_KEY" "475c93ad34b44a158f366f967d5e8b2d" "Builder.io API Key"
add_env_var "NEXT_PUBLIC_SITE_URL" "https://baltzakis.dev" "Site URL"
add_env_var "PLAYWRIGHT_BASE_URL" "http://localhost:8082" "Playwright Base URL"

# Add sensitive variables with interactive input
if [ "$INTERACTIVE" = true ]; then
    echo "Please enter your sensitive credentials:"
    
    get_secret_input "VITE_API_URL" "API URL"
    get_secret_input "VITE_RECAPTCHA_SITE_KEY" "reCAPTCHA Site Key"
    get_secret_input "DATABASE_URL" "Database URL"
    get_secret_input "AWS_ACCESS_KEY_ID" "AWS Access Key ID"
    get_secret_input "AWS_SECRET_ACCESS_KEY" "AWS Secret Access Key"
    get_secret_input "VITE_FIREBASE_API_KEY" "Firebase API Key"
    get_secret_input "VITE_FIREBASE_PROJECT_ID" "Firebase Project ID"
    get_secret_input "VITE_FIREBASE_VAPID_KEY" "Firebase VAPID Key"
    get_secret_input "VITE_OPENAI_API_KEY" "OpenAI API Key"
    get_secret_input "VITE_GOOGLE_ANALYTICS_ID" "Google Analytics ID"
    get_secret_input "VITE_SENTRY_DSN" "Sentry DSN"
    get_secret_input "GITHUB_TOKEN" "GitHub Token"
    get_secret_input "FIGMA_API_KEY" "Figma API Key"
    get_secret_input "AWS_REGION" "AWS Region"
else
    echo "Skipping sensitive inputs. You can add them manually to .env file."
fi

# Add placeholder comments for sensitive variables
echo "" >> .env
echo "# Sensitive variables - add your own values" >> .env
echo "# VITE_API_URL=your_api_url" >> .env
echo "# VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key" >> .env
echo "# DATABASE_URL=your_database_url" >> .env
echo "# AWS_ACCESS_KEY_ID=your_aws_key" >> .env
echo "# AWS_SECRET_ACCESS_KEY=your_aws_secret" >> .env
echo "# VITE_FIREBASE_API_KEY=your_firebase_key" >> .env
echo "# VITE_FIREBASE_PROJECT_ID=your_firebase_project" >> .env
echo "# VITE_FIREBASE_VAPID_KEY=your_firebase_vapid" >> .env
echo "# VITE_OPENAI_API_KEY=your_openai_key" >> .env
echo "# VITE_GOOGLE_ANALYTICS_ID=your_ga_id" >> .env
echo "# VITE_SENTRY_DSN=your_sentry_dsn" >> .env
echo "# GITHUB_TOKEN=your_github_token" >> .env
echo "# FIGMA_API_KEY=your_figma_key" >> .env
echo "# AWS_REGION=your_aws_region" >> .env

echo ""
echo "Setup complete! Your .env file has been updated."
echo "Run 'source .env' to load variables into current shell"
echo "Or restart your terminal to apply changes"