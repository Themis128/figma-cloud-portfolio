# 🔐 AWS Secrets Manager Integration Guide

**Last Updated**: 2026-02-01
**Purpose**: Centralized secrets storage for production deployments

---

## 📋 Overview

This project uses AWS Secrets Manager to securely store and retrieve sensitive configuration values in production environments. This approach eliminates the need to store secrets in environment variables or configuration files.

### Benefits

- ✅ **Centralized Storage**: All secrets in one secure location
- ✅ **Automatic Rotation**: Built-in secret rotation capabilities
- ✅ **Audit Logging**: Track all secret access via CloudTrail
- ✅ **Encryption**: Secrets encrypted at rest with AWS KMS
- ✅ **Access Control**: Fine-grained IAM permissions
- ✅ **Versioning**: Automatic version management

---

## 🚀 Quick Start

### 1. Install AWS CLI

```bash
# Windows (using winget)
winget install Amazon.AWSCLI

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. Configure AWS Credentials

```bash
aws configure
```

Enter your credentials:

- **AWS Access Key ID**: From IAM console
- **AWS Secret Access Key**: From IAM console
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### 3. Create the Secret

```bash
# Create secret with all required values
aws secretsmanager create-secret \
  --name portfolio/env \
  --description "Portfolio application environment variables" \
  --secret-string file://secrets.json \
  --region us-east-1
```

**secrets.json** (template):

```json
{
  "NODE_ENV": "production",
  "VITE_FIREBASE_API_KEY": "your_firebase_api_key",
  "VITE_FIREBASE_AUTH_DOMAIN": "your_project.firebaseapp.com",
  "VITE_FIREBASE_PROJECT_ID": "your_project_id",
  "VITE_FIREBASE_STORAGE_BUCKET": "your_project.appspot.com",
  "VITE_FIREBASE_MESSAGING_SENDER_ID": "your_sender_id",
  "VITE_FIREBASE_APP_ID": "your_app_id",
  "VITE_FIREBASE_VAPID_KEY": "your_vapid_key",
  "VITE_RECAPTCHA_SITE_KEY": "your_recaptcha_site_key",
  "RECAPTCHA_SECRET_KEY": "your_recaptcha_secret_key",
  "VITE_GOOGLE_ANALYTICS_ID": "G-XXXXXXXXXX",
  "GITHUB_TOKEN": "ghp_your_github_token",
  "VITE_ANTHROPIC_API_KEY": "sk-ant-your_anthropic_key",
  "VITE_SENTRY_DSN": "https://your_key@sentry.io/project_id",
  "SENTRY_DSN": "https://your_key@sentry.io/project_id",
  "CODACY_API_TOKEN": "your_codacy_api_token",
  "CODACY_PROJECT_TOKEN": "your_codacy_project_token"
}
```

### 4. Set Environment Variables

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, or PowerShell profile)
export AWS_SECRETS_MANAGER_ID=portfolio/env
export AWS_REGION=us-east-1
```

**Windows PowerShell**:

```powershell
$env:AWS_SECRETS_MANAGER_ID = "portfolio/env"
$env:AWS_REGION = "us-east-1"
```

### 5. Run Application

```bash
# Secrets are automatically loaded
pnpm dev
pnpm build
```

The `scripts/run-with-secrets.js` wrapper automatically fetches secrets from AWS Secrets Manager and injects them into the environment before running commands.

---

## 🔧 Configuration

### How It Works

1. **package.json Scripts**: Wrapped with `run-with-secrets.js`

   ```json
   {
     "dev": "node scripts/run-with-secrets.js vite --port 3001",
     "build": "node scripts/run-with-secrets.js run-s build:resume build:client build:server"
   }
   ```

2. **run-with-secrets.js**: Platform-agnostic secrets loader
   - Windows: Calls `scripts/load-secrets.ps1`
   - Unix/Linux/macOS: Calls `scripts/load-secrets.sh`

3. **load-secrets.ps1 / load-secrets.sh**: AWS SDK integration
   - Fetches secrets from AWS Secrets Manager
   - Injects into environment
   - Executes wrapped command

### Required Environment Variables

Only these two variables need to be set locally:

```env
AWS_SECRETS_MANAGER_ID=portfolio/env
AWS_REGION=us-east-1
```

All other secrets are fetched from AWS Secrets Manager automatically.

---

## 📚 AWS Secrets Manager Operations

### Create a Secret

```bash
# From JSON file
aws secretsmanager create-secret \
  --name portfolio/env \
  --secret-string file://secrets.json

# From command line (single value)
aws secretsmanager create-secret \
  --name portfolio/github-token \
  --secret-string "ghp_your_token_here"

# With tags
aws secretsmanager create-secret \
  --name portfolio/env \
  --secret-string file://secrets.json \
  --tags Key=Environment,Value=Production Key=Project,Value=Portfolio
```

### Retrieve a Secret

```bash
# Get secret value
aws secretsmanager get-secret-value \
  --secret-id portfolio/env \
  --query 'SecretString' \
  --output text

# Get specific key from JSON secret
aws secretsmanager get-secret-value \
  --secret-id portfolio/env \
  --query 'SecretString' \
  --output text | jq -r '.GITHUB_TOKEN'
```

### Update a Secret

```bash
# Update  from file
aws secretsmanager update-secret \
  --secret-id portfolio/env \
  --secret-string file://secrets.json

# Update single value (for simple secrets)
aws secretsmanager update-secret \
  --secret-id portfolio/github-token \
  --secret-string "ghp_new_token_here"

# Update description
aws secretsmanager update-secret \
  --secret-id portfolio/env \
  --description "Updated portfolio secrets - 2026-02-01"
```

### Rotate a Secret

```bash
# Enable automatic rotation (requires Lambda function)
aws secretsmanager rotate-secret \
  --secret-id portfolio/env \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotation-function \
  --rotation-rules AutomaticallyAfterDays=30

# Manual rotation (update to new values)
aws secretsmanager update-secret \
  --secret-id portfolio/env \
  --secret-string file://new-secrets.json
```

### Delete a Secret

```bash
# Schedule deletion (7-30 days)
aws secretsmanager delete-secret \
  --secret-id portfolio/env \
  --recovery-window-in-days 30

# Force immediate deletion (DANGEROUS)
aws secretsmanager delete-secret \
  --secret-id portfolio/env \
  --force-delete-without-recovery

# Cancel deletion
aws secretsmanager restore-secret \
  --secret-id portfolio/env
```

### List Secrets

```bash
# List all secrets
aws secretsmanager list-secrets

# Filter by name
aws secretsmanager list-secrets \
  --filters Key=name,Values=portfolio

# With tags
aws secretsmanager list-secrets \
  --filters Key=tag-key,Values=Environment
```

### Describe Secret

```bash
# Get metadata (not the secret value)
aws secretsmanager describe-secret \
  --secret-id portfolio/env
```

---

## 🔒 Security Best Practices

### IAM Permissions

Create an IAM policy for your application:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:portfolio/*"
    },
    {
      "Effect": "Allow",
      "Action": ["kms:Decrypt"],
      "Resource": "arn:aws:kms:us-east-1:*:key/*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "secretsmanager.us-east-1.amazonaws.com"
        }
      }
    }
  ]
}
```

### Key Management

- **Use KMS Encryption**: Enable AWS KMS encryption for secrets
- **Separate Keys**: Use different KMS keys for different environments
- **Key Rotation**: Enable automatic key rotation

### Access Control

- **Principle of Least Privilege**: Grant minimum required permissions
- **Service-specific Credentials**: Use IAM roles for EC2/Lambda, not long-term access keys
- **MFA for Humans**: Require MFA for human access to secrets
- **Audit Logging**: Enable CloudTrail to log all secret access

### Network Security

- **VPC Endpoints**: Use VPC endpoints for private network access
- **Security Groups**: Restrict outbound access to AWS services only

---

## 🏗️ Integration with CI/CD

### GitHub Actions

Add AWS credentials as GitHub Secrets:

1. Go to: **Settings → Secrets and variables → Actions**
2. Add secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_SECRETS_MANAGER_ID`

**Workflow Example**:

```yaml
name: Deploy

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Build
        env:
          AWS_SECRETS_MANAGER_ID: ${{ secrets.AWS_SECRETS_MANAGER_ID }}
        run: pnpm build
```

### AWS Amplify

Add environment variables in Amplify Console:

1. Open Amplify Console
2. Go to: **App settings → Environment variables**
3. Add:
   - `AWS_SECRETS_MANAGER_ID` = `portfolio/env`
   - `AWS_REGION` = `us-east-1`

Amplify will use the app's IAM role to access Secrets Manager automatically.

---

## 🛠️ Troubleshooting

### Error: Access Denied

**Problem**: `An error occurred (AccessDeniedException) when calling the GetSecretValue operation`

**Solutions**:

1. Verify IAM permissions for `secretsmanager:GetSecretValue`
2. Check KMS key permissions if using custom encryption
3. Ensure correct secret name/ARN

```bash
# Check your IAM user/role permissions
aws iam get-user
aws sts get-caller-identity

# Test with GetSecretValue
aws secretsmanager get-secret-value --secret-id portfolio/env
```

### Error: Secret Not Found

**Problem**: `Secrets Manager can't find the specified secret`

**Solutions**:

1. Verify secret name is correct
2. Check you're in the correct AWS region
3. Ensure secret hasn't been deleted

```bash
# List all secrets
aws secretsmanager list-secrets

# Check specific region
aws secretsmanager list-secrets --region us-east-1
```

### Error: Malformed JSON

**Problem**: Secret value is not valid JSON

**Solutions**:

1. Validate JSON before upload: `cat secrets.json | jq .`
2. Use proper escaping for special characters
3. Ensure file encoding is UTF-8

```bash
# Validate JSON
jq . secrets.json

# Or use online validator: https://jsonlint.com/
```

### AWS CLI Not Configured

**Problem**: `Unable to locate credentials`

**Solutions**:

```bash
# Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### Slow Secret Retrieval

**Problem**: Secrets take too long to fetch

**Solutions**:

1. **Cache secrets** in application memory (refresh periodically)
2. **Use VPC endpoints** to reduce latency
3. **Reduce secret size** (split large secrets into multiple)

---

## 💰 Cost Optimization

### AWS Secrets Manager Pricing

**As of 2024**:

- **Storage**: $0.40 per secret per month
- **API Calls**: $0.050 per 10,000 API calls

### Cost Reduction Tips

1. **Minimize API Calls**: Cache secrets in memory
2. **Consolidate Secrets**: Use one JSON secret instead of multiple
3. **Clean Up Unused Secrets**: Delete secrets you no longer need
4. **Use Parameter Store for Non-Secret Config**: AWS Systems Manager Parameter Store is free for standard parameters

**Example Monthly Cost**:

- 1 secret = $0.40/month
- 100,000 API calls = $0.50
- **Total ≈ $0.90/month**

---

## 📊 Monitoring & Auditing

### CloudTrail Integration

Enable CloudTrail to audit secret access:

```bash
# Create trail
aws cloudtrail create-trail \
  --name portfolio-secrets-audit \
  --s3-bucket-name my-cloudtrail-bucket

# Start logging
aws cloudtrail start-logging \
  --name portfolio-secrets-audit
```

### CloudWatch Alarms

Set up alarms for unusual activity:

```bash
# Create alarm for unauthorized access attempts
aws cloudwatch put-metric-alarm \
  --alarm-name secrets-unauthorized-access \
  --alarm-description "Alert on unauthorized Secrets Manager access" \
  --metric-name AccessDeniedException \
  --namespace AWS/SecretsManager \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 🔄 Migration Guide

### From .env Files to Secrets Manager

1. **Export current secrets**:

   ```bash
   # Convert .env to JSON
   cat .env | grep -v '^#' | grep '=' > temp.env
   # Manual conversion to JSON or use script
   ```

2. **Create JSON secrets file**:

   ```json
   {
     "KEY_1": "value1",
     "KEY_2": "value2"
   }
   ```

3. **Upload to Secrets Manager**:

   ```bash
   aws secretsmanager create-secret \
     --name portfolio/env \
     --secret-string file://secrets.json
   ```

4. **Update application** to use Secrets Manager (already done in this project)

5. **Delete local .env file** (keep .env.example for reference)

6. **Test thoroughly** in development environment first

---

## 📚 Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [AWS CLI Secrets Manager Reference](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/)
- [Best Practices for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [AWS Secrets Manager Pricing](https://aws.amazon.com/secrets-manager/pricing/)
- [CloudTrail Logging for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/monitoring-cloudtrail.html)

---

## 🆘 Support

**AWS Support**:

- Free tier: AWS Documentation and forums
- Developer: $29/month
- Business: $100/month

**Project-specific Issues**:

- GitHub Issues: https://github.com/Themis128/figma-cloud-portfolio/issues
- See also: `SECRETS_MANAGEMENT.md` for local secrets management

---

**Last Updated**: 2026-02-01
**Maintained By**: Themistoklis Baltzakis
