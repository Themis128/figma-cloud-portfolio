# reCAPTCHA v3 Integration

This document describes the implementation of Google reCAPTCHA v3 in the Baltzakis Themistoklis portfolio application.

## Overview

reCAPTCHA v3 provides invisible bot protection by analyzing user interactions and assigning a score from 0.0 to 1.0, where 1.0 indicates a high likelihood of legitimate human interaction. The implementation protects the contact form from spam and abuse.

## Architecture

### Client-Side Implementation

The client-side implementation uses the `react-google-recaptcha-v3` library to integrate reCAPTCHA v3 seamlessly into the React application.

#### Key Components

1. **GoogleReCaptchaProvider** (`client/App.tsx`)
   - Wraps the entire application to provide reCAPTCHA context
   - Uses environment variable `VITE_RECAPTCHA_SITE_KEY` for configuration
   - Loads the reCAPTCHA script automatically

2. **Contact Form Integration** (`client/pages/Contact.tsx`)
   - Uses `useGoogleReCaptcha` hook to access reCAPTCHA functionality
   - Executes reCAPTCHA validation before form submission
   - Includes error handling for reCAPTCHA failures

#### Code Example

```typescript
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

export default function Contact() {
  const { executeRecaptcha } = useGoogleReCaptcha()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!executeRecaptcha) {
      setSubmitStatus('error')
      return
    }

    // Execute reCAPTCHA
    const recaptchaToken = await executeRecaptcha('contact_form_submit')

    // Include token in form submission
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        recaptchaToken,
      }),
    })
  }
}
```

### Server-Side Implementation

The server validates reCAPTCHA tokens by calling Google's verification API.

#### Key Features

1. **Token Verification** (`server/routes/contact.ts`)
   - Validates reCAPTCHA token with Google's API
   - Checks verification success and score threshold
   - Rejects submissions with low scores (< 0.5)

2. **Error Handling**
   - Handles network failures during verification
   - Provides appropriate error messages
   - Logs verification failures for monitoring

#### Code Example

```typescript
// Verify reCAPTCHA token
const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: recaptchaToken,
  }),
})

const recaptchaData = await recaptchaResponse.json()

if (!recaptchaData.success) {
  return res.status(400).json({
    success: false,
    message: 'reCAPTCHA verification failed. Please try again.',
  })
}

// Check score threshold
if (recaptchaData.score < 0.5) {
  return res.status(400).json({
    success: false,
    message: 'Suspicious activity detected. Please try again.',
  })
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# reCAPTCHA Configuration
RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Getting reCAPTCHA Keys

1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Create a new site with reCAPTCHA v3
3. Add your domain(s)
4. Copy the Site Key and Secret Key

## API Endpoints

### POST /api/contact

Processes contact form submissions with reCAPTCHA verification.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "recaptchaToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! I'll get back to you within 24 hours."
}
```

**Error Responses:**
- `400`: Missing required fields or reCAPTCHA verification failed
- `500`: Server error

## Testing

### Playwright Tests

Comprehensive tests are available in `playwright-tests/recaptcha-analytics.spec.ts`:

- Script loading verification
- Form submission with reCAPTCHA execution
- Error handling for reCAPTCHA failures
- Server-side validation testing
- Score threshold validation
- Network error handling

### Running Tests

```bash
# Run reCAPTCHA tests
pnpm test:e2e --grep "reCAPTCHA"

# Run all integration tests
pnpm test:e2e
```

## Security Considerations

1. **Token Expiration**: reCAPTCHA tokens expire after 2 minutes
2. **Score Threshold**: Configurable score threshold (currently 0.5)
3. **Action Names**: Use descriptive action names for better analytics
4. **Rate Limiting**: Consider implementing additional rate limiting
5. **Logging**: Monitor failed verifications for potential attacks

## Monitoring and Analytics

### reCAPTCHA Console

Monitor reCAPTCHA activity in the Google reCAPTCHA Admin Console:

- Verification success rates
- Score distributions
- Traffic patterns
- Failed verification attempts

### Application Logs

Server logs include reCAPTCHA verification details:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "recaptchaScore": 0.9,
  "timestamp": "2024-01-21T09:54:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **reCAPTCHA script not loading**
   - Check network connectivity
   - Verify site key is correct
   - Check browser console for errors

2. **Verification failures**
   - Ensure secret key is correct
   - Check server network connectivity
   - Verify token hasn't expired

3. **Low scores in development**
   - Use test keys for development
   - Test keys always return score 0.9
   - Implement score override for testing

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=recaptcha:*
```

## Performance Impact

- **Client-side**: ~10KB additional JavaScript
- **Server-side**: One additional HTTP request per form submission
- **User Experience**: Invisible verification (no user interaction required)

## Best Practices

1. **Action Names**: Use specific action names for different forms
2. **Score Thresholds**: Adjust thresholds based on your security needs
3. **Fallback Handling**: Always provide fallback for reCAPTCHA failures
4. **User Feedback**: Show appropriate error messages
5. **Monitoring**: Regularly review reCAPTCHA analytics

## Migration Guide

### From reCAPTCHA v2

1. Update to reCAPTCHA v3 keys
2. Remove visible captcha widgets
3. Update client-side integration
4. Modify server-side verification
5. Update error handling logic

### From Other Captcha Solutions

1. Remove existing captcha implementation
2. Install `react-google-recaptcha-v3`
3. Add GoogleReCaptchaProvider
4. Update form submission logic
5. Implement server-side verification

## Dependencies

```json
{
  "react-google-recaptcha-v3": "^1.11.0"
}
```

## Related Documentation

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [react-google-recaptcha-v3 GitHub](https://github.com/t49tran/react-google-recaptcha-v3)
- [Playwright Testing Guide](./playwright-tests/recaptcha-analytics.spec.ts)