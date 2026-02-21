# Contact Form Setup Guide

## Overview
The contact form sends:
- **Confirmation email** to users via AWS SES (from your verified email)
- **Notification** to you via Slack webhook with all form details

## Quick Setup

Run the interactive setup script:
```bash
pnpm setup:ses
```

Or manually verify your configuration:
```bash
pnpm setup:contact
```

## Prerequisites

### 1. AWS SES Setup

#### Verify Email Domain
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to **Verified identities**
3. Click **Create identity**
4. Select **Domain** and enter `cloudless.com`
5. Follow DNS verification steps (add TXT/CNAME records to your domain)

#### Create IAM User for SES
1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Create new user: `portfolio-ses-user`
3. Attach policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```
4. Create access key and save credentials

#### Move Out of SES Sandbox (Production)
- By default, SES is in sandbox mode (can only send to verified emails)
- Request production access: SES Console → Account dashboard → Request production access
- Fill out the form explaining your use case

### 2. Slack Webhook Setup

1. Go to [Slack API](https://api.slack.com/messaging/webhooks)
2. Click **Create your Slack app**
3. Choose **From scratch**
4. Name: `Portfolio Contact Form`
5. Select your workspace
6. Navigate to **Incoming Webhooks**
7. Activate webhooks
8. Click **Add New Webhook to Workspace**
9. Select channel (e.g., `#contact-forms`)
10. Copy the webhook URL

## Environment Configuration

### Local Development (.env)
```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### AWS Amplify (Production)
1. Go to Amplify Console → Your App → Environment variables
2. Add the same variables as above
3. Redeploy the application

## Installation

```bash
# Install dependencies
pnpm install

# Test locally
pnpm dev:all
```

## Testing

### Test Email Sending (Sandbox Mode)
If in SES sandbox, verify test recipient emails:
1. SES Console → Verified identities → Create identity
2. Select **Email address**
3. Enter your test email
4. Verify via email link
5. Submit contact form with verified email

### Test Slack Notification
1. Submit contact form
2. Check your Slack channel for notification
3. Verify all fields are present

## Troubleshooting

### Email Not Sending
- Check AWS credentials are correct
- Verify `noreply@cloudless.com` domain is verified in SES
- Check CloudWatch Logs for SES errors
- If in sandbox, verify recipient email address

### Slack Not Working
- Verify webhook URL is correct
- Check webhook is active in Slack app settings
- Test webhook with curl:
```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test message"}' \
YOUR_WEBHOOK_URL
```

### Form Submission Fails
- Check browser console for errors
- Verify reCAPTCHA is configured
- Check server logs for validation errors

## Email Template Customization

Edit `server/routes/contact.ts` to customize the confirmation email HTML.

## Security Notes

- Never commit `.env` file
- Rotate AWS credentials regularly
- Use least-privilege IAM policies
- Monitor SES sending limits and bounce rates
- Keep Slack webhook URL secret
