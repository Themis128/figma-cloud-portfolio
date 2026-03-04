# MCP Servers Documentation

**Date**: 2026-02-23
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

### 5. 21st.dev Magic MCP Server

**Purpose**: AI-powered UI component generation and logo search
**Package**: `@21st-dev/magic`
**Server Name**: `github.com/21st-dev/magic-mcp`

#### Configuration ✅

```json
{
  "mcpServers": {
    "github.com/21st-dev/magic-mcp": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    }
  }
}
```

**API Key**: Get your free API key from [21st.dev Magic Console](https://21st.dev/magic/console)

#### Available Tools

| Tool                               | Description                                             |
| ---------------------------------- | ------------------------------------------------------- |
| `21st_magic_component_builder`     | Create UI components from natural language descriptions |
| `logo_search`                      | Search and return company logos (JSX, TSX, SVG formats) |
| `21st_magic_component_inspiration` | Get component inspiration from 21st.dev library         |
| `21st_magic_component_refiner`     | Improve existing UI components                          |

#### How to Use

**Create a UI Component:**

```
/ui create a modern navigation bar with responsive design
```

**Search for Logos:**

```
/logo GitHub
/logo discord, twitter, slack
```

**Get Component Inspiration:**
Use the `21st_magic_component_inspiration` tool to browse the 21st.dev component library

**Refine Existing Components:**
Use the `21st_magic_component_refiner` tool to improve existing UI components

#### Features

- ✅ AI-powered UI component generation
- ✅ TypeScript/React component support
- ✅ SVGL logo integration
- ✅ Component inspiration from 21st.dev library
- ✅ Component refinement and improvement

#### Installation

The server is already configured in your `cline_mcp_settings.json`. To use it:

1. Restart VS Code Insiders / Cline
2. The MCP server will automatically connect
3. Use `/ui` or `/logo` commands in the chat

#### Example: Creating a Button

```
/ui create a modern button with hover effect
```

The tool will generate a polished button component that you can add to your project.

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

| Error                           | Solution                       |
| ------------------------------- | ------------------------------ |
| "Email address not verified"    | Verify email in SES Console    |
| "Maximum sending rate exceeded" | Reduce send rate               |
| "Account in sandbox mode"       | Request production access      |
| "Invalid credentials"           | Check AWS_ACCESS_KEY_ID/SECRET |
| "Malformed ARN"                 | Check server name format       |

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

**Last Updated**: 2026-02-23
**Version**: 3.0.0

---

## 🚀 Newly Added MCP Servers (from awesome-mcp-servers)

The following MCP servers have been added from the [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) collection to enhance development, testing, and documentation capabilities.

### 9. GitHub MCP Server

**Purpose**: GitHub API integration for repository management
**Package**: `@modelcontextprotocol/server-github`

#### Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

#### Features

- Repository management (create, fork, list)
- Issue and PR management
- Branch operations
- File operations (read, create, update)
- Search capabilities
- Workflow management

#### Required Environment Variable

```bash
export GITHUB_TOKEN="your-github-personal-access-token"
```

---

### 10. Filesystem MCP Server

**Purpose**: Direct filesystem access for the project
**Package**: `@modelcontextprotocol/server-filesystem`

#### Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/tbaltzakis/new-portfolio/figma-cloud-portfolio/portfolio-nextjs"
      ]
    }
  }
}
```

#### Features

- Read/write files
- Directory listing
- File search
- Create/delete operations

---

### 11. Context7 MCP Server

**Purpose**: Up-to-date documentation for LLMs
**Package**: `@upstash/context7-mcp`

#### Configuration

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### Features

- Fetch up-to-date documentation
- Code snippet retrieval
- Framework documentation (React, Next.js, etc.)
- Library documentation

---

### 12. Playwright MCP Server

**Purpose**: Browser automation and testing
**Package**: `@executeautomation/playwright-mcp-server`

#### Configuration

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

#### Features

- Browser automation
- Element interaction
- Screenshot capture
- Form filling
- Navigation control

---

### 13. Memory MCP Server

**Purpose**: Knowledge graph-based persistent memory
**Package**: `@modelcontextprotocol/server-memory`

#### Configuration

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

#### Features

- Persistent memory across sessions
- Knowledge graph storage
- Entity relationships
- Context preservation

---

### 14. Sequential Thinking MCP Server

**Purpose**: Structured problem-solving approach
**Package**: `@modelcontextprotocol/server-sequential-thinking`

#### Configuration

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

#### Features

- Step-by-step reasoning
- Problem decomposition
- Logical analysis
- Decision documentation

---

### 15. Fetch MCP Server

**Purpose**: Web content fetching and processing
**Package**: `@modelcontextprotocol/server-fetch`

#### Configuration

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

#### Features

- Fetch web content
- Convert to Markdown
- Extract structured data
- API responses

---

### 16. Puppeteer MCP Server

**Purpose**: Headless browser automation
**Package**: `@modelcontextprotocol/server-puppeteer`

#### Configuration

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

#### Features

- Headless browser control
- Web scraping
- Screenshot/PDF generation
- Form automation
- Navigation

---

## 📋 Complete MCP Configuration

The complete configuration is stored at:

```
~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Full Configuration File

```json
{
  "mcpServers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/project"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "aws-mcp": {
      "command": "npx",
      "args": ["-y", "@aws/mcp-server-aws"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
        "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

## 🔧 Environment Variables Setup

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# GitHub
export GITHUB_TOKEN="your-github-personal-access-token"

# AWS
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

---

## 🎯 Usage by AI Tool

### Cline (VS Code Extension)

- Automatically loads MCP servers from configuration
- Restart VS Code after configuration changes

### GitHub Copilot

- Uses MCP servers configured in VS Code
- Access via Copilot Chat

### Claude Desktop

- Configure in Claude Desktop settings
- Uses same MCP server packages

---

## 📚 Additional Resources

- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) - Curated list of MCP servers
- [MCP Documentation](https://modelcontextprotocol.io/) - Official documentation
- [MCP Inspector](https://glama.ai/mcp/inspector) - Test MCP servers