# MCP Servers Documentation

**Date**: 2026-02-07
**Purpose**: Document all MCP server implementations in the project
**Status**: ✅ Complete

---

## Overview

This document describes the Model Context Protocol (MCP) servers configured and used in the portfolio project. MCP servers enable AI assistants to interact with external services and tools through a standardized protocol.

---

## MCP Servers

### 1. Context7 MCP Server

**Purpose**: Documentation improvement and code context retrieval
**Package**: `@upstash/context7-mcp`

#### Features

- Documentation context retrieval
- Code snippet extraction
- URL content fetching
- Search capabilities

---

### 2. Codacy MCP Integration

**Purpose**: Code quality and security analysis
**Package**: Codacy CLI v2

#### Features

- Code analysis via SARIF format
- Security scanning with Trivy
- Code quality metrics
- Multi-tool analysis (ESLint, PMD, Semgrep, Lizard)

---

### 3. Browser Tools MCP

**Purpose**: Browser automation and testing
**Package**: `@agentdeskai/browser-tools-mcp`

#### Features

- Browser navigation
- Element interaction
- Form automation
- Screenshot capture
- Console log retrieval

---

### 4. Official Microsoft Playwright MCP

**Purpose**: Official Playwright browser automation and testing
**Package**: `@executeautomation/playwright-mcp-server`

#### Features

- ✅ Browser automation with official support
- ✅ Element location and interaction
- ✅ Screenshot and video capture
- ✅ Console log retrieval
- ✅ Network request/response inspection

---

## 🔴 AWS MCP Servers

### 5. AWS General MCP Server

**Purpose**: Full AWS resource management (S3, DynamoDB, Lambda, SES, EC2, IAM)
**Package**: `@aws/mcp-server-aws`
**Server Name**: `aws-mcp-server`

#### Fixed Configuration ✅

```json
{
  "mcpServers": {
    "aws-mcp-server": {
      "timeout": 120,
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@aws/mcp-server-aws"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      },
      "autoApprove": [
        "s3_*",
        "dynamodb_*",
        "lambda_*",
        "ses_*",
        "ec2_*",
        "iam_*"
      ]
    }
  }
}
```

#### Features

- **S3**: Bucket management, file upload/download, versioning
- **DynamoDB**: Table operations, CRUD operations
- **Lambda**: Function management, invocation, layers
- **SES**: Email sending, verification, templates
- **EC2**: Instance management, security groups
- **IAM**: User/role management, policies

#### SES-Specific Tools

- `ses_verify_email_identity` - Verify email address
- `ses_list_verified_emails` - List verified emails
- `ses_send_email` - Send email (useful for fixing SES issues)
- `ses_get_send_quota` - Check sending limits
- `ses_get_send_statistics` - Check sending statistics

---

### 6. AWS Cost Explorer MCP Server

**Purpose**: AWS cost analysis and forecasting
**Package**: `@awslabs/cost-explorer-mcp-server`
**Server Name**: `awslabs-cost-explorer-mcp`

#### Fixed Configuration ✅

```json
{
  "mcpServers": {
    "awslabs-cost-explorer-mcp": {
      "timeout": 60,
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@awslabs/cost-explorer-mcp-server"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      }
    }
  }
}
```

**Note**: Changed from `uv` to `npx` for Windows compatibility

#### Features

- Get cost forecasts
- Compare costs across periods
- Analyze cost drivers
- Get detailed cost and usage reports

---

### 7. AWS Diagram MCP Server

**Purpose**: Generate AWS architecture diagrams
**Package**: `@awslabs/aws-diagram-mcp-server`
**Server Name**: `awslabs-aws-diagram-mcp`

#### Fixed Configuration ✅

```json
{
  "mcpServers": {
    "awslabs-aws-diagram-mcp": {
      "timeout": 60,
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@awslabs/aws-diagram-mcp-server"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      }
    }
  }
}
```

**Note**: Changed from `uv` to `npx` for Windows compatibility

#### Features

- Generate AWS architecture diagrams
- Get diagram examples
- List available icons

---

### 8. AWS Cost/Pricing MCP Server

**Purpose**: AWS pricing information and cost analysis
**Package**: `@awslabs/aws-pricing-mcp-server`
**Server Name**: `awslabs-aws-pricing-mcp`

#### Fixed Configuration ✅

```json
{
  "mcpServers": {
    "awslabs-aws-pricing-mcp": {
      "timeout": 60,
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@awslabs/aws-pricing-mcp-server"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}",
        "AWS_PROFILE": "default"
      }
    }
  }
}
```

**Note**: Changed from `uv` to `npx` for Windows compatibility

#### Features

- Analyze CDK projects for costs
- Analyze Terraform projects for costs
- Get pricing information
- Generate cost reports

---

## ⚠️ Important: Fixed "Malformed ARN" Error

The original MCP configuration had several issues causing "Malformed ARN" errors:

### Issues Fixed

1. **Invalid server names** - Changed from GitHub-style paths to simple names
   - Before: `"github.com/awslabs/mcp/tree/main/src/cost-explorer-mcp-server"`
   - After: `"awslabs-cost-explorer-mcp"`

2. **Wrong command on Windows** - Changed from `uv` to `npx`
   - Before: `"command": "uv", "args": ["tool", "run", "--from", "..."]`
   - After: `"command": "npx", "args": ["-y", "@awslabs/..."]`

3. **Added AWS credentials** - All AWS MCP servers now require credentials
   - Added `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env vars
   - All servers now use consistent `us-east-1` region

### Why "Malformed ARN" Occurred

The error typically happens when:
- Server name contains invalid characters
- AWS CLI/SDK tries to parse the name as an ARN
- Missing or invalid AWS credentials

---

## MCP Server Security

### Secure Configuration

All MCP servers should use environment variables for sensitive data:

```json
{
  "mcpServers": {
    "aws-mcp-server": {
      "command": "npx",
      "args": ["-y", "@aws/mcp-server-aws"],
      "env": {
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}",
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

### Security Best Practices

- ✅ Never hardcode tokens in mcp.json
- ✅ Use environment variable references (`${VAR_NAME}`)
- ✅ Store sensitive values in system env or .env files
- ✅ Add .env to .gitignore
- ✅ Review mcp.json before sharing
- ⚠️ AWS MCP server auto-approves require IAM permissions review

---

## Integration with IDE

### VS Code Configuration

Location: `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json`

### Verification

After updating mcp.json:

1. Restart VS Code
2. Check MCP servers are connected
3. Test with available tools

---

## AWS SES Configuration Checklist

If you're experiencing SES issues, use these MCP tools to diagnose:

### 1. Check Verification Status

```bash
# List all verified emails
ses_list_verified_emails

# If your email isn't verified, verify it:
ses_verify_email_identity --email-address "your-email@example.com"
```

### 2. Check Sending Limits

```bash
# Get current quota
ses_get_send_quota

# Typical limits:
# - Sandbox: 200 emails/day, 1 email/second
# - Production: Higher limits (request increase)
```

### 3. Check Sending Statistics

```bash
# View delivery rates, bounces, complaints
ses_get_send_statistics
```

---

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check node_modules are installed
   - Verify port availability
   - Check error logs

2. **Authentication errors**
   - Verify environment variables
   - Check token permissions
   - Ensure tokens are not expired

3. **Connection timeouts**
   - Check network connectivity
   - Verify server is running
   - Check firewall settings

4. **AWS SES "Invalid credentials"**
   - Verify AWS credentials are set
   - Check IAM permissions for SES
   - Ensure region is correct

### AWS SES Specific Issues

| Error | Solution |
|-------|----------|
| "Email address not verified" | Verify email in SES Console |
| "Maximum sending rate exceeded" | Reduce send rate |
| "Account in sandbox mode" | Request production access |
| "Invalid credentials" | Check AWS_ACCESS_KEY_ID/SECRET |
| "Malformed ARN" | Check server name format |

---

## Environment Variables Required

For AWS MCP servers, ensure these are set:

```env
# AWS Credentials (required)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Optional: AWS Profile
AWS_PROFILE=default
```

---

**Last Updated**: 2026-02-07
**Version**: 2.1.0
