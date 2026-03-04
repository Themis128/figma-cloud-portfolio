# MCP Configuration Template

# This file shows how to configure MCP to use environment variables instead of hardcoded tokens

# Copy this to your VS Code user settings: C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json

## SECURE CONFIGURATION (Use this)

Replace the hardcoded tokens in your mcp.json with environment variable references:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "other-service": {
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    }
  }
}
```

## INSECURE CONFIGURATION (Never use this)

❌ DO NOT hardcode tokens like this:

```json
{
  "Authorization": "Bearer ghp_xxxxxxxxxxxx",
  "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
}
```

## How to Use Environment Variables in MCP

### Option 1: System Environment Variables (Recommended)

1. Add tokens to your system environment variables
2. Restart VS Code to pick up the changes
3. MCP will automatically resolve `${VARIABLE_NAME}` references

### Option 2: Use .env File with VS Code Extension

1. Install "DotENV" VS Code extension
2. Create `.env` file in your workspace (already in .gitignore)
3. Add: `GITHUB_TOKEN=your_new_token_here`
4. Reference as `${GITHUB_TOKEN}` in mcp.json

### Option 3: Windows Environment Variables

```powershell
# Run in PowerShell as Administrator
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_new_token', 'User')
```

Then restart VS Code.

## Verification

After updating mcp.json:

1. Restart VS Code
2. Check MCP is working correctly
3. Verify no tokens are visible in the file in plain text
4. Tokens should show as `${GITHUB_TOKEN}` references

## Security Notes

- ✅ mcp.json should ONLY contain `${VARIABLE_NAME}` references
- ✅ Actual token values go in .env or system environment variables
- ✅ .env file must be in .gitignore
- ❌ Never commit mcp.json with hardcoded tokens
- ❌ Never share token values in chat, email, or documentation

---

For manual update of your mcp.json file:
Location: C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json

Find lines 251 and 262 and replace the hardcoded tokens with ${GITHUB_TOKEN}
