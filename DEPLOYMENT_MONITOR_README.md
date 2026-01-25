# Deployment Monitor

A real-time monitoring dashboard for GitHub Actions deployments with AWS Amplify integration.

## Features

- **Real-time Monitoring**: Live updates of deployment status and phases
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **GitHub Integration**: Connect with personal access tokens for private repositories
- **Workflow Filtering**: Filter by deployment type (all, deploy, CI)
- **Log Management**: Search, filter, and export deployment logs
- **Token Validation**: Validate GitHub tokens before saving
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. **Local Development**: Run a local HTTP server to avoid CORS issues:

   ```bash
   cd /path/to/project
   python -m http.server 8080
   ```

2. **Open in Browser**: Navigate to `http://localhost:8080/deployment-monitor.html`

   Alternatively, run the project's Express server which exposes a safer proxy for GitHub API calls:

   ```bash
   # start backend server (recommended when using private repos)
   pnpm exec tsx server/dev-server.ts

   # serve static files in production build
   pnpm build && node dist/server/node-build.mjs
   ```

## GitHub Token Setup

For private repositories or increased API limits:

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens/new?scopes=repo&description=Deployment+Monitor)
2. Create a token with `repo` scope
3. Enter the token in the dashboard and click "Validate"
4. Click "Save Token" to store it locally

## Usage

- **Start Monitoring**: Click "Start Monitoring" to begin real-time updates
- **Theme Toggle**: Click the moon/sun icon in the header
- **Workflow Filter**: Use the dropdown to filter by workflow type
- **Log Controls**: Search logs, filter by level, or export to file
- **Token Management**: Save/clear GitHub tokens as needed

## API Integration

The monitor connects to:

- GitHub Actions API for workflow and job data
- Repository: `baltzakis/new-portfolio` (configurable)
- Refresh interval: 15 seconds (configurable)

### Server-side proxy and tokens

- The monitor now uses a server-side proxy at `/api/github/*` to call the GitHub API.
- For private repos, set a server env var `GITHUB_TOKEN` (recommended) so tokens are not required from the browser:

```bash
export GITHUB_TOKEN=ghp_... # on Windows PowerShell: $env:GITHUB_TOKEN='ghp_...'
```

- If you prefer local token usage from the UI, the monitor will forward a locally-saved token to the proxy **without exposing it publicly**.

### Proxy caching & rate limits

- Server caches GitHub responses when `GITHUB_TOKEN` is present to reduce API calls. Configure with env vars:
  - `GITHUB_CACHE_TTL_SECONDS` (default 15)
  - `GITHUB_CACHE_MAX_ENTRIES` (default 200)

- Simple per-IP rate limiting protects the proxy. Configure with env vars:
  - `GITHUB_RATE_LIMIT_WINDOW_MS` (default 60000)
  - `GITHUB_RATE_LIMIT_MAX` (default 120)

Logs for cache hits/misses and evictions are written to the server console.

## Troubleshooting

- **CORS Errors**: Always run through a local HTTP server
- **No Data**: Check if repository has workflows and runs
- **Token Issues**: Ensure token has `repo` scope and is valid
- **Rate Limits**: GitHub API has rate limits; token increases limits

## Configuration

Edit the JavaScript class to customize:

- Repository URL
- Refresh interval
- API endpoints
- UI styling
