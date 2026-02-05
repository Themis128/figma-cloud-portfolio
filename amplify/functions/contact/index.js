"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }
  try {
    const { name, email, subject, message, recaptchaToken } = JSON.parse(
      event.body || "{}",
    );
    // Basic validation
    if (!name || !email || !subject || !message || !recaptchaToken) {
      const response = {
        success: false,
        message: "All fields are required",
      };
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }
    // Input sanitization and length limits
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSubject = subject.trim();
    const sanitizedMessage = message.trim();
    // Length validation
    if (
      sanitizedName.length > 100 ||
      sanitizedSubject.length > 200 ||
      sanitizedMessage.length > 10000
    ) {
      const response = {
        success: false,
        message: "Input exceeds maximum length limits.",
      };
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
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
    ];
    const allInputs = [
      sanitizedName,
      sanitizedEmail,
      sanitizedSubject,
      sanitizedMessage,
    ].join(" ");
    for (const pattern of dangerousPatterns) {
      if (pattern.test(allInputs)) {
        console.warn("Potentially malicious input detected:", {
          name: sanitizedName,
          email: sanitizedEmail,
          subject: sanitizedSubject,
        });
        const response = {
          success: false,
          message: "Invalid input detected. Please check your submission.",
        };
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        };
      }
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      const response = {
        success: false,
        message: "Invalid email format",
      };
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }
    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      const response = {
        success: false,
        message: "Server configuration error. Please try again later.",
      };
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: recaptchaToken,
        }),
      },
    );
    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success) {
      console.error("reCAPTCHA verification failed:", recaptchaData);
      const response = {
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      };
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }
    // Check reCAPTCHA score (for v3)
    if (recaptchaData.score !== undefined && recaptchaData.score < 0.5) {
      console.error("reCAPTCHA score too low:", recaptchaData.score);
      const response = {
        success: false,
        message: "Suspicious activity detected. Please try again.",
      };
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }
    // Simulate processing delay (like sending email)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // In a real application, you would send an email here
    // For now, we'll just log the contact form submission
    console.log("Contact form submission:", {
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      recaptchaScore: recaptchaData.score,
      timestamp: new Date().toISOString(),
    });
    const response = {
      success: true,
      message:
        "Message sent successfully! I'll get back to you within 24 hours.",
    };
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Contact form error:", error);
    const response = {
      success: false,
      message:
        "Failed to send message. Please try again or contact me directly via email.",
    };
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    };
  }
};
exports.handler = handler;
