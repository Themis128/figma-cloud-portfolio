/**
 * Netlify Function: Contact Form Handler
 * 
 * This function handles contact form submissions from the portfolio.
 * It can be extended to send emails via AWS SES, SendGrid, or other services.
 * 
 * Usage:
 * POST /.netlify/functions/contact
 * Body: { name: string, email: string, message: string }
 */

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['name', 'email', 'message'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Log the contact form submission
    console.log('Contact form submission:', {
      name,
      email,
      message: message.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
    });

    // TODO: Add your email sending logic here
    // Examples:
    // - AWS SES: Use @aws-sdk/client-ses
    // - SendGrid: Use @sendgrid/mail
    // - Mailgun: Use mailgun.js
    // - Slack: Post to a Slack webhook

    // Example: Slack notification (uncomment and configure)
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   await fetch(process.env.SLACK_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: `New contact form submission from ${name}`,
    //       blocks: [
    //         {
    //           type: 'section',
    //           text: {
    //             type: 'mrkdwn',
    //             text: `*New Contact Form Submission*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:*\n${message}`,
    //           },
    //         },
    //       ],
    //     }),
    //   });
    // }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your message! I will get back to you soon.',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Contact form error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}