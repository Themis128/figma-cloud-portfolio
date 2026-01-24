# GitHub API Authentication Fix

## Problem Description

The deployment monitor is experiencing GitHub API authentication issues with 403 Forbidden responses when trying to access:
- `api.github.com/repos/Themis128/figma-cloud-portfolio/actions/workflows`
- `api.github.com/repos/Themis128/figma-cloud-portfolio/actions/workflows/deploy-production.yml/runs?per_page=1`

## Root Cause

GitHub API requires authentication for accessing repository data, especially for:
1. Private repositories
2. Rate-limited requests
3. Actions/workflow data access

## Solution

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Set token name: `deployment-monitor-token`
4. Set expiration: 90 days or custom
5. Select scopes:
   - `repo` (Full control of private repositories)
   - `actions` (Access to GitHub Actions)
   - `read:org` (Read org and team membership)
6. Generate token and save it securely

### 2. Update Deployment Monitor Code

The deployment monitor needs to be updated to include authentication headers:

```javascript
// Before (causing 403 errors)
const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`);

// After (with authentication)
const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});
```

### 3. Environment Variable Setup

Create a `.env` file in the project root:

```bash
# GitHub API Authentication
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_OWNER=Themis128
GITHUB_REPO=figma-cloud-portfolio
```

### 4. Token Management in HTML/JavaScript

For client-side deployment monitors, implement secure token handling:

```html
<!-- Add token input field -->
<div class="token-setup">
  <label for="githubToken">GitHub Token:</label>
  <input type="password" id="githubToken" placeholder="Enter GitHub Personal Access Token">
  <button onclick="saveToken()">Save Token</button>
</div>

<script>
function saveToken() {
  const token = document.getElementById('githubToken').value;
  if (token) {
    localStorage.setItem('github_token', token);
    alert('Token saved! Reloading...');
    location.reload();
  }
}

function getAuthToken() {
  return localStorage.getItem('github_token') || '';
}

// Use token in API calls
async function fetchWorkflowData() {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  const response = await fetch(url, { headers });
  // Handle response...
}
</script>
```

### 5. Enhanced Error Handling

Update the deployment monitor to handle authentication errors gracefully:

```javascript
async function fetchWorkflowData() {
  try {
    const token = getAuthToken();
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (response.status === 401) {
      throw new Error('GitHub authentication required. Please provide a valid token.');
    } else if (response.status === 403) {
      throw new Error('GitHub API access forbidden. Check token permissions.');
    } else if (response.status === 404) {
      throw new Error('Repository or workflow not found. Check repository visibility.');
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workflow data:', error);
    showAuthError(error.message);
    return null;
  }
}
```

### 6. Token Validation

Add token validation functionality:

```javascript
async function validateToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return { valid: true, username: userData.login };
    } else {
      return { valid: false, error: 'Invalid token' };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### 7. Deployment Monitor UI Updates

Add authentication UI to the deployment monitor:

```html
<div id="auth-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <h3>GitHub Authentication Required</h3>
    <p>To access deployment data, please provide a GitHub Personal Access Token.</p>
    <div class="form-group">
      <label for="githubToken">GitHub Token:</label>
      <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
      <small>Get a token from <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings</a></small>
    </div>
    <div class="form-actions">
      <button onclick="saveToken()">Save Token</button>
      <button onclick="closeAuthModal()">Cancel</button>
    </div>
  </div>
</div>

<script>
function checkAuthStatus() {
  const token = getAuthToken();
  if (!token) {
    showAuthModal();
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').style.display = 'block';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}
</script>
```

### 8. CSS for Authentication UI

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #334155;
  max-width: 500px;
  width: 90%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 14px;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.form-actions button {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.form-actions button:first-child {
  background: #3b82f6;
  color: white;
}

.form-actions button:last-child {
  background: #334155;
  color: #e2e8f0;
}
```

### 9. Implementation Steps

1. **Create GitHub Token**: Follow steps in section 1
2. **Update Deployment Monitor**: Add authentication code from sections 4-8
3. **Test Authentication**: Verify token works with GitHub API
4. **Deploy Updated Monitor**: Update the deployment monitor with authentication

### 10. Security Considerations

- **Never commit tokens**: Keep tokens in environment variables or localStorage
- **Use HTTPS**: Always use HTTPS for API calls
- **Token expiration**: Handle token expiration gracefully
- **Scope minimization**: Only request necessary GitHub API scopes
- **Input validation**: Validate token format before use

### 11. Troubleshooting

**Common Issues:**
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Token lacks required permissions
- **404 Not Found**: Repository is private or doesn't exist
- **Rate Limiting**: Too many requests without authentication

**Solutions:**
- Regenerate token if expired
- Add required scopes to token
- Verify repository visibility and name
- Implement request throttling

This fix will resolve the GitHub API authentication issues and allow the deployment monitor to access workflow data properly.