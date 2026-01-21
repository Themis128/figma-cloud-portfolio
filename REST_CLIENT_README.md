# REST Client Setup for Development

This guide explains how to set up and use the REST Client extension for testing your portfolio's API endpoints during development.

## Installation

1. Install the **REST Client** extension by Huachao Mao in VS Code
2. The extension will automatically detect `.http` files

## Configuration

The REST Client is configured through:

- `.vscode/settings.json` - Environment variables and settings
- `api-tests.http` - Your API test requests

## Usage

### Basic Workflow

1. **Start your development servers:**

   ```bash
   pnpm run dev:all
   ```

2. **Open `api-tests.http`** in VS Code

3. **Click "Send Request"** above any request you want to test

4. **View responses** in the response panel that opens

### Environment Variables

The configuration supports multiple environments:

- **development** (default): `http://localhost:3000`
- **production**: Configure your production URL
- **staging**: Configure your staging URL

### Available Endpoints

#### Health Checks

- `GET /api/ping` - Server health check
- `GET /api/demo` - Server information

#### Contact Form

- `POST /api/contact` - Submit contact form with reCAPTCHA

#### Resume Download

- `GET /api/resume/download` - Download PDF from markdown file
- `POST /api/resume/download` - Download PDF with custom data

#### Push Notifications

- `GET /api/push-notifications?action=vapid-public-key` - Get VAPID key
- `POST /api/push-notifications` - Register subscription
- `PUT /api/push-notifications` - Send notification
- `DELETE /api/push-notifications` - Remove subscription

## Features

### Request Features

- **Variables**: Use `{{variableName}}` for dynamic values
- **Environments**: Switch between dev/staging/production
- **Authentication**: Support for various auth methods
- **File Uploads**: Send files with requests
- **Custom Headers**: Add any headers needed

### Response Features

- **Syntax Highlighting**: JSON, XML, HTML responses
- **Save Responses**: Save responses to files
- **Response History**: View previous responses
- **Pretty Print**: Formatted response display

## Tips

### Testing Strategies

1. **Start with Health Checks** - Verify server is running
2. **Test Happy Paths** - Valid requests first
3. **Test Error Cases** - Invalid data, missing fields, etc.
4. **Test Edge Cases** - Large payloads, special characters

### Debugging

- Check the **REST Client** output panel for detailed logs
- Use the **Network** tab in browser dev tools for comparison
- Compare with your Playwright tests for consistency

### Best Practices

1. **Keep Tests Organized** - Group related requests with comments
2. **Use Descriptive Names** - Clear request names help navigation
3. **Test All Methods** - GET, POST, PUT, DELETE as applicable
4. **Document Edge Cases** - Include tests for error conditions

## Troubleshooting

### Common Issues

1. **"Connection refused"** - Make sure dev server is running
2. **"Variable not found"** - Check environment configuration
3. **"Invalid JSON"** - Validate request body syntax
4. **CORS errors** - Check server CORS configuration

### Debug Steps

1. Verify server is running: `curl http://localhost:3000/api/ping`
2. Check VS Code REST Client settings
3. Validate JSON syntax in requests
4. Check server logs for errors

## Integration with Development Workflow

REST Client complements your existing testing setup:

- **Playwright**: Comprehensive E2E and API testing
- **REST Client**: Quick API debugging and manual testing
- **Vitest**: Unit testing
- **Manual Testing**: Browser-based testing

Use REST Client for:

- Rapid API testing during development
- Debugging specific endpoints
- Testing complex request payloads
- Documentation and examples

## Keyboard Shortcuts

- `Ctrl+Alt+R` (Windows/Linux): Send Request
- `Ctrl+Alt+C` (Windows/Linux): Cancel Request
- `Ctrl+Alt+E` (Windows/Linux): Switch Environment
