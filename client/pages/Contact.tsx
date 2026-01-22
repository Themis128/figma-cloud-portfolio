import { AnimatedSection } from '@/components/AnimatedSection'
import CircuitBackground from '@/components/CircuitBackground'
import { HoverButton, HoverCard } from '@/components/HoverAnimations'
import Navigation from '@/components/Navigation'
import { submitContactForm } from '@/lib/api'
import { Globe, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Link } from 'react-router-dom'

export default function Contact() {
  const { executeRecaptcha } = useGoogleReCaptcha()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Disable button immediately when form is submitted
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Check if reCAPTCHA is available (skip in test environments)
      let recaptchaToken = 'test-token'

      if (executeRecaptcha) {
        try {
          // Execute reCAPTCHA
          recaptchaToken = await executeRecaptcha('contact_form_submit')
        } catch (recaptchaError) {
          console.warn(
            'reCAPTCHA execution failed, using test token:',
            recaptchaError,
          )
          // Continue with test token for development/testing
        }
      } else {
        console.warn('reCAPTCHA not loaded, using test token')
      }

      const response = await submitContactForm({
        ...formData,
        recaptchaToken,
      })

      if (response.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        // Keep success state for a moment before re-enabling
        setTimeout(() => {
          setIsSubmitting(false)
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setSubmitStatus('error')
        console.error('Form submission failed:', response.message)
        // Keep button disabled for a short time to show error feedback
        setTimeout(() => setIsSubmitting(false), 2000)
      }
    } catch (error) {
      setSubmitStatus('error')
      console.error('Form submission error:', error)
      // Keep button disabled for a short time to show error feedback
      setTimeout(() => setIsSubmitting(false), 2000)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <AnimatedSection className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
                Contact Me
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 mx-auto rounded-full" />
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
                Let's connect and discuss how we can work together on your next
                cloud, cybersecurity, or digital transformation project.
              </p>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection
              delay={0.1}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 mb-12 md:mb-16"
            >
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg">
                  <Send className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Send a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-white/80 font-medium mb-2 text-sm md:text-base"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm md:text-base min-h-[44px]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-white/80 font-medium mb-2 text-sm md:text-base"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm md:text-base min-h-[44px]"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-white/80 font-medium mb-2 text-sm md:text-base"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm md:text-base min-h-[44px]"
                    placeholder="Project inquiry, consultation, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-white/80 font-medium mb-2 text-sm md:text-base"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none text-sm md:text-base min-h-[120px]"
                    placeholder="Tell me about your project, requirements, or how I can help you..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-white/60 text-sm">* Required fields</p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-cyan-400 hover:bg-cyan-500 disabled:bg-cyan-400/50 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium min-h-[44px] text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                {/* reCAPTCHA Badge */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2 text-foreground/60 text-xs">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-label="Security shield icon"
                    >
                      <title>Security Shield</title>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span>Protected by reCAPTCHA</span>
                  </div>
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 font-medium">
                      Message sent successfully!
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 font-medium">
                      ❌ Failed to send message. Please try again or contact me
                      directly via email.
                    </p>
                  </div>
                )}
              </form>
            </AnimatedSection>

            {/* Contact Information */}
            <AnimatedSection
              delay={0.15}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16"
            >
              {/* Contact Details */}
              <div className="space-y-6 md:space-y-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 md:mb-8">
                  Get In Touch
                </h2>

                <div className="space-y-3 md:space-y-4">
                  <HoverCard>
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                      <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium mb-1 text-sm md:text-base">
                          Location
                        </div>
                        <div className="text-white/70 text-sm md:text-base">
                          Koropi/Athens, Greece
                        </div>
                        <div className="text-white/60 text-xs md:text-sm">
                          Athens Metropolitan Area
                        </div>
                      </div>
                    </div>
                  </HoverCard>

                  <HoverCard>
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                      <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                        <Phone className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium mb-1 text-sm md:text-base">
                          Mobile
                        </div>
                        <div className="text-white/70 text-sm md:text-base">
                          +30 697 777 7838
                        </div>
                      </div>
                    </div>
                  </HoverCard>

                  <HoverCard>
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                      <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium mb-1 text-sm md:text-base">
                          Email
                        </div>
                        <a
                          href="mailto:baltzakis.themis@gmail.com"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-base break-all"
                        >
                          baltzakis.themis@gmail.com
                        </a>
                      </div>
                    </div>
                  </HoverCard>

                  <HoverCard>
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                      <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                        <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium mb-1 text-sm md:text-base">
                          LinkedIn
                        </div>
                        <a
                          href="https://www.linkedin.com/in/baltzakis-themis"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-base break-all"
                        >
                          linkedin.com/in/baltzakis-themis
                        </a>
                      </div>
                    </div>
                  </HoverCard>

                  <HoverCard>
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                      <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                        <Globe className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium mb-1 text-sm md:text-base">
                          Portfolio
                        </div>
                        <a
                          href="https://www.baltzakisthemis.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-base break-all"
                        >
                          baltzakisthemis.com
                        </a>
                      </div>
                    </div>
                  </HoverCard>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6 md:space-y-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 md:mb-8">
                  Quick Actions
                </h2>

                <div className="space-y-3 md:space-y-4">
                  <HoverCard>
                    <a
                      href="mailto:baltzakis.themis@gmail.com?subject=Project Inquiry"
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 group-hover:text-cyan-300 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium text-sm md:text-base">
                          Send Project Inquiry
                        </div>
                        <div className="text-white/60 text-xs md:text-sm">
                          Discuss your project requirements
                        </div>
                      </div>
                    </a>
                  </HoverCard>

                  <HoverCard>
                    <a
                      href="https://www.linkedin.com/in/baltzakis-themis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
                    >
                      <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 group-hover:text-cyan-300 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium text-sm md:text-base">
                          Connect on LinkedIn
                        </div>
                        <div className="text-white/60 text-xs md:text-sm">
                          View my professional network
                        </div>
                      </div>
                    </a>
                  </HoverCard>

                  <HoverCard>
                    <a
                      href="https://www.baltzakisthemis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
                    >
                      <Globe className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 group-hover:text-cyan-300 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium text-sm md:text-base">
                          View Portfolio
                        </div>
                        <div className="text-white/60 text-xs md:text-sm">
                          Explore my work and projects
                        </div>
                      </div>
                    </a>
                  </HoverCard>
                </div>
              </div>
            </AnimatedSection>

            {/* Professional Summary */}
            <AnimatedSection
              delay={0.25}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg">
                  <Send className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Why Work With Me?
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <HoverCard>
                  <div className="text-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      15+
                    </div>
                    <div className="text-white/80 font-medium">
                      Years of IT Experience
                    </div>
                  </div>
                </HoverCard>
                <HoverCard>
                  <div className="text-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      100+
                    </div>
                    <div className="text-white/80 font-medium">
                      Projects Delivered
                    </div>
                  </div>
                </HoverCard>
                <HoverCard>
                  <div className="text-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      5+
                    </div>
                    <div className="text-white/80 font-medium">
                      Industry Certifications
                    </div>
                  </div>
                </HoverCard>
              </div>
              <div className="text-white/70 text-center leading-relaxed">
                <p>
                  Specializing in cloud architecture, cybersecurity, and digital
                  transformation with a proven track record of delivering
                  scalable, resilient solutions that drive business outcomes.
                </p>
              </div>
            </AnimatedSection>

            {/* Call to Action */}
            <AnimatedSection
              delay={0.35}
              className="text-center mt-12 md:mt-16"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <HoverButton>
                  <Link
                    to="/about"
                    className="inline-block px-6 sm:px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-white/90 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px]"
                  >
                    Learn More About Me
                  </Link>
                </HoverButton>
                <HoverButton>
                  <Link
                    to="/"
                    className="inline-block px-6 sm:px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px]"
                  >
                    Back to Home
                  </Link>
                </HoverButton>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
