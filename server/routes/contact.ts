import type { ContactFormRequest, ContactFormResponse } from '@shared/api'
import type { RequestHandler } from 'express'

export const handleContactForm: RequestHandler = async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken }: ContactFormRequest = req.body

    // Basic validation
    if (!name || !email || !subject || !message || !recaptchaToken) {
      const response: ContactFormResponse = {
        success: false,
        message: 'All fields are required',
      }
      return res.status(400).json(response)
    }

    // Input sanitization and length limits
    const sanitizedName = name.trim()
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedSubject = subject.trim()
    const sanitizedMessage = message.trim()

    // Length validation
    if (
      sanitizedName.length > 100 ||
      sanitizedSubject.length > 200 ||
      sanitizedMessage.length > 10000
    ) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Input exceeds maximum length limits.',
      }
      return res.status(400).json(response)
    }

    // Basic XSS and injection prevention
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i,
      /<input/i,
      /<meta/i,
      /<link/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text/i,
      /data:javascript/i,
      /';\s*drop\s+table/i,
      /';\s*delete\s+from/i,
      /';\s*update/i,
      /union\s+select/i,
      /\|\|/i,
      /&&/i,
      /`.*`/i,
      /\$\(.*\)/i,
      /rm\s+-rf/i,
      /format\s+c:/i,
    ]

    const allInputs = [sanitizedName, sanitizedEmail, sanitizedSubject, sanitizedMessage].join(' ')
    for (const pattern of dangerousPatterns) {
      if (pattern.test(allInputs)) {
        console.warn('Potentially malicious input detected:', {
          name: sanitizedName,
          email: sanitizedEmail,
          subject: sanitizedSubject,
        })
        const response: ContactFormResponse = {
          success: false,
          message: 'Invalid input detected. Please check your submission.',
        }
        return res.status(400).json(response)
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      const response: ContactFormResponse = {
        success: false,
        message: 'Invalid email format',
      }
      return res.status(400).json(response)
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      const response: ContactFormResponse = {
        success: false,
        message: 'Server configuration error. Please try again later.',
      }
      return res.status(500).json(response)
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

    const recaptchaData = await recaptchaResponse.json()

    if (!recaptchaData.success) {
      console.error('reCAPTCHA verification failed:', recaptchaData)
      const response: ContactFormResponse = {
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
      }
      return res.status(400).json(response)
    }

    // Check reCAPTCHA score (for v3)
    // For test keys, score might be undefined, so we allow it in development
    if (recaptchaData.score !== undefined && recaptchaData.score < 0.5) {
      console.error('reCAPTCHA score too low:', recaptchaData.score)
      const response: ContactFormResponse = {
        success: false,
        message: 'Suspicious activity detected. Please try again.',
      }
      return res.status(400).json(response)
    }

    // For test reCAPTCHA keys, score might be undefined - allow in development
    const isTestKey = recaptchaSecret === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    if (!isTestKey && process.env.NODE_ENV === 'production' && recaptchaData.score === undefined) {
      console.error('reCAPTCHA score missing in production')
      const response: ContactFormResponse = {
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
      }
      return res.status(400).json(response)
    }

    // Simulate processing delay (like sending email)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real application, you would send an email here
    // For now, we'll just log the contact form submission
    console.log('Contact form submission:', {
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      recaptchaScore: recaptchaData.score,
      timestamp: new Date().toISOString(),
    })

    const response: ContactFormResponse = {
      success: true,
      message: "Message sent successfully! I'll get back to you within 24 hours.",
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Contact form error:', error)
    const response: ContactFormResponse = {
      success: false,
      message: 'Failed to send message. Please try again or contact me directly via email.',
    }
    res.status(500).json(response)
  }
}