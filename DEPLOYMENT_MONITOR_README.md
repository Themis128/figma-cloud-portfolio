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
