import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { ContactFormRequest, ContactFormResponse } from '@shared/api'
import type { Request, Response } from 'express'

// reCAPTCHA response type
interface RecaptchaResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

// Constants for validation and HTTP status codes
const CONTACT_CONSTANTS = {
  HTTP_STATUS: {
    BAD_REQUEST: 400,
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
  },
  MAX_LENGTHS: {
    NAME: 100,
    SUBJECT: 200,
    MESSAGE: 10000,
  },
  PROCESSING_DELAY_MS: 2000,
  RECAPTCHA_MIN_SCORE: 0.5,
} as const

export const handleContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, recaptchaToken }: ContactFormRequest = req.body

    // Basic validation
    if (!(name && email && subject && message && recaptchaToken)) {
      const response: ContactFormResponse = {
        success: false,
        message: 'All fields are required',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // Input sanitization and length limits
    const sanitizedName = name.trim()
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedSubject = subject.trim()
    const sanitizedMessage = message.trim()

    // Length validation
    if (
      sanitizedName.length > CONTACT_CONSTANTS.MAX_LENGTHS.NAME ||
      sanitizedSubject.length > CONTACT_CONSTANTS.MAX_LENGTHS.SUBJECT ||
      sanitizedMessage.length > CONTACT_CONSTANTS.MAX_LENGTHS.MESSAGE
    ) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Input exceeds maximum length limits.',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // Enhanced XSS and injection prevention with more comprehensive patterns
    const dangerousPatterns = [
      // XSS patterns
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /<form[\s\S]*?>[\s\S]*?<\/form>/gi,
      /<input[\s\S]*?>/gi,
      /<meta[\s\S]*?>/gi,
      /<link[\s\S]*?>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:javascript/gi,

      // SQL injection patterns
      /';\s*drop\s+table/gi,
      /';\s*delete\s+from/gi,
      /';\s*update/gi,
      /union\s+select/gi,
      /insert\s+into/gi,
      /create\s+table/gi,
      /alter\s+table/gi,
      /exec\s*\(/gi,
      /execute\s*\(/gi,

      // Command injection patterns
      /\|\|/gi,
      /&&/gi,
      /`.*`/gi,
      /\$\(.*\)/gi,
      /rm\s+-rf/gi,
      /format\s+c:/gi,
      /del\s+/gi,
      /rmdir\s+/gi,

      // Path traversal patterns
      /\.\.\/\.\.\//gi,
      /\.\.\\.\.\\/gi,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,

      // NoSQL injection patterns
      /\$where/gi,
      /\$ne/gi,
      /\$in/gi,
      /\$nin/gi,
      /\$regex/gi,
    ]

    const allInputs = [sanitizedName, sanitizedEmail, sanitizedSubject, sanitizedMessage].join(' ')
    for (const pattern of dangerousPatterns) {
      if (pattern.test(allInputs)) {
        const response: ContactFormResponse = {
          success: false,
          message: 'Invalid input detected. Please check your submission.',
        }
        return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
      }
    }

    // Additional security: sanitize HTML entities
    const sanitizeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#39;')
    }

    const safeEmail = sanitizeHtml(sanitizedEmail)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(safeEmail)) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Invalid email format',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // Verify reCAPTCHA
    let recaptchaSecret = process.env['RECAPTCHA_SECRET_KEY']

    // Use test keys in development/test environment
    if (process.env['NODE_ENV'] !== 'production' || !recaptchaSecret) {
      // Google's test reCAPTCHA secret key - always validates successfully
      recaptchaSecret = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    }

    if (!recaptchaSecret) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Server configuration error. Please try again later.',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
    }

    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptchaToken,
      }),
    })

    const recaptchaData = (await recaptchaResponse.json()) as RecaptchaResponse

    if (!recaptchaData.success) {
      const response: ContactFormResponse = {
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // Check reCAPTCHA score (for v3)
    // For test keys, score might be undefined, so we allow it in development
    if (
      recaptchaData.score !== undefined &&
      recaptchaData.score < CONTACT_CONSTANTS.RECAPTCHA_MIN_SCORE
    ) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Suspicious activity detected. Please try again.',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // For test reCAPTCHA keys, score might be undefined - allow in development
    const isTestKey = recaptchaSecret === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    if (!isTestKey && process.env['NODE_ENV'] === 'production' && recaptchaData.score === undefined) {
      const response: ContactFormResponse = {
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
      }
      return res.status(CONTACT_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json(response)
    }

    // Send confirmation email via AWS SES (with graceful failure handling)
    const sendEmailGracefully = async (): Promise<void> => {
      // Check if SES is configured
      const awsAccessKeyId = process.env['AWS_ACCESS_KEY_ID']
      const awsSecretAccessKey = process.env['AWS_SECRET_ACCESS_KEY']
      const sesVerifiedEmail = process.env['SES_VERIFIED_EMAIL']

      // Skip email if SES is not properly configured
      if (!(awsAccessKeyId && awsSecretAccessKey && sesVerifiedEmail)) {
        console.warn('AWS SES not configured - skipping confirmation email')
        return
      }

      try {
        const sesClient = new SESClient({ region: process.env['AWS_REGION'] || 'us-east-1' })
        await sesClient.send(
          new SendEmailCommand({
            Source: sesVerifiedEmail,
            Destination: { ToAddresses: [sanitizedEmail] },
            Message: {
              Subject: { Data: 'Thank you for contacting me!' },
              Body: {
                Html: {
                  Data: `
                    <html>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2>Thank you for reaching out!</h2>
                        <p>Hi ${sanitizedName},</p>
                        <p>I've received your message and will get back to you within 24 hours.</p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <p><strong>Your message:</strong></p>
                          <p><strong>Subject:</strong> ${sanitizedSubject}</p>
                          <p>${sanitizedMessage}</p>
                        </div>
                        <p>Best regards,<br>Themistoklis Baltzakis</p>
                      </body>
                    </html>
                  `,
                },
              },
            },
          }),
        )
        console.log(`Confirmation email sent to ${sanitizedEmail}`)
      } catch (emailError) {
        // Graceful failure - email errors should not affect the contact form response
        console.warn(
          'SES email notification failed (non-critical):',
          emailError instanceof Error ? emailError.message : 'Unknown error',
        )
      }
    }

    // Send email asynchronously (don't await - continue with response)
    void sendEmailGracefully()

    // Send Slack notification
    const slackWebhookUrl = process.env['SLACK_WEBHOOK_URL']

    if (slackWebhookUrl) {
      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '📬 New Contact Form Submission',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '📬 New Contact Form Submission',
                },
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*Name:*\n${sanitizedName}` },
                  { type: 'mrkdwn', text: `*Email:*\n${sanitizedEmail}` },
                ],
              },
              {
                type: 'section',
                fields: [{ type: 'mrkdwn', text: `*Subject:*\n${sanitizedSubject}` }],
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Message:*\n${sanitizedMessage}`,
                },
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `Submitted at: <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|${new Date().toISOString()}>`,
                  },
                ],
              },
            ],
          }),
        })
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError)
      }
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, CONTACT_CONSTANTS.PROCESSING_DELAY_MS))

    const response: ContactFormResponse = {
      success: true,
      message: "Message sent successfully! I'll get back to you within 24 hours.",
    }

    res.status(CONTACT_CONSTANTS.HTTP_STATUS.OK).json(response)
    return
  } catch (_error) {
    const response: ContactFormResponse = {
      success: false,
      message: 'Failed to send message. Please try again or contact me directly via email.',
    }
    res.status(CONTACT_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
    return
  }
}
