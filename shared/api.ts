/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string
}

/**
 * Contact form submission request
 */
export interface ContactFormRequest {
  name: string
  email: string
  subject: string
  message: string
  recaptchaToken: string
}

/**
 * Contact form submission response
 */
export interface ContactFormResponse {
  success: boolean
  message: string
}

/**
 * Resume data structure for PDF generation
 */
export interface ResumeData {
  name: string
  title: string
  contact: {
    email?: string
    linkedin?: string
    website?: string
  }
  summary: string
  competencies: Record<string, string[]>
  experience: Array<{
    title: string
    company: string
    date: string
    achievements: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    date: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: string
  }>
}
