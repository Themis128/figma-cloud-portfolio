# API Keys API

This document describes the API Keys endpoints implemented in the portfolio application.

## Authentication

All API Keys endpoints require Cognito authentication. Requests must include a valid Cognito ID token in the `Authorization` header:

```
Authorization: Bearer <cognito-id-token>
```

The admin dashboard's API Health Dashboard automatically includes this header when checking the API Keys endpoint (endpoints marked `requiresAuth: true` in `ApiHealthDashboard.tsx`).

**401 Unauthorized**: Returned when the `Authorization` header is missing or contains an invalid/expired token.

## Endpoints

### GET /api/organizations/api_keys/{api_key_id}

Get details of a specific API key.

**Path Parameters:**
- `api_key_id` (string): ID of the API key

**Response:**
```json
{
  "id": "ak_1234567890",
  "created_at": "2024-01-15T10:30:00Z",
  "created_by": {
    "id": "user_123",
    "type": "user"
  },
  "name": "Development API Key",
  "partial_key_hint": "ak_1234",
  "status": "active",
  "type": "api_key",
  "workspace_id": "ws_123"
}
```

### POST /api/organizations/api_keys/{api_key_id}

Update an API key.

**Path Parameters:**
- `api_key_id` (string): ID of the API key

**Body Parameters:**
- `name` (optional, string): Name of the API key
- `status` (optional, enum): Status of the API key - "active", "inactive", or "archived"

**Example Request:**
```json
{
  "name": "Updated Development Key",
  "status": "archived"
}
```

**Response:**
Returns the updated API key object.

### GET /api/organizations/api_keys

List all API keys.

**Response:**
```json
[
  {
    "id": "ak_1234567890",
    "created_at": "2024-01-15T10:30:00Z",
    "created_by": {
      "id": "user_123",
      "type": "user"
    },
    "name": "Development API Key",
    "partial_key_hint": "ak_1234",
    "status": "active",
    "type": "api_key",
    "workspace_id": "ws_123"
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Name must be a non-empty string if provided"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "API key with ID {api_key_id} not found"
  }
}
```

## Usage Examples

### Using the client-side API

```typescript
import { updateAPIKey } from '@/lib/api';

// Update API key name
await updateAPIKey('ak_1234567890', {
  name: 'Updated Development Key'
});

// Update API key status
await updateAPIKey('ak_1234567890', {
  status: 'archived'
});

// Update both name and status
await updateAPIKey('ak_1234567890', {
  name: 'Fully Updated Key',
  status: 'inactive'
});
```

### Using fetch directly

```javascript
// Update API key
fetch('/api/organizations/api_keys/ak_1234567890', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Key',
    status: 'active'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Implementation Details

- The API is implemented using Express.js in the `/server` directory
- Routes are defined in `/server/routes/apiKeys.ts`
- The server runs on port 3001
- API keys are stored in memory for demonstration purposes
- Proper validation is implemented for all input parameters
- Comprehensive error handling with meaningful error messages
- Unit tests are available in `/server/tests/apiKeys.test.ts`

## Slack Integration

The API includes automatic Slack notifications when API keys are updated. Notifications are sent to the `#personal-website` channel with:

- **Channel**: `#personal-website`
- **Webhook URL**: Configured via environment
- **Notification Format**: Rich attachments with API key details
- **Trigger**: Only when actual changes are made (name or status updates)

### Notification Features

- **Smart Notifications**: Only sends notifications when changes occur
- **Rich Attachments**: Includes API key ID, name, status, and workspace
- **Change Tracking**: Shows before/after values for updated fields
- **Error Handling**: Gracefully handles Slack API failures without affecting API response

### Example Slack Message

```
API Key "Updated Development Key" has been updated:
• Name: "Development API Key" → "Updated Development Key"
• Status: active → archived
```

### Configuration

The Slack integration uses:
- Webhook URL: `https://hooks.slack.com/services/your/webhook/url`
- Channel: `#personal-website`
- Bot Name: `API Key Manager`
- Icon: `:key:`
