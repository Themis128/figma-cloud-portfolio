// Import components directly instead of lazy loading for now

import {
  Briefcase,
  Code,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  Mail,
  Shield,
  User,
} from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'

const AIBrain = lazy(() => import('@/components/AIBrain'))
const Navigation = lazy(() => import('@/components/Navigation'))

import { AnimatedSection } from '@/components/AnimatedSection'
import CircuitBackground from '@/components/CircuitBackground'
import { HoverButton, HoverIcon } from '@/components/HoverAnimations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function Index() {
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${contactForm.firstName} ${contactForm.lastName}`.trim(),
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      })
      if (res.ok) {
        setContactStatus('success')
        setContactForm({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      } else {
        setContactStatus('error')
      }
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div
      data-testid='index-page'
      className='min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden'
    >
      <CircuitBackground />

      <Suspense fallback={<div className='h-16 md:h-20 bg-slate-900/80 backdrop-blur-sm'></div>}>
        <Navigation />
      </Suspense>

      {/* Skip to main content link */}
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-cyan-300'
      >
        Skip to main content
      </a>

      <main id='main-content' className='relative z-10 container mx-auto px-4 py-16'>
        {/* Hero Section */}
        <section aria-labelledby='hero-heading' className='mb-20'>
          <div className='grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]'>
            {/* Hero Content */}
            <AnimatedSection className='space-y-8'>
              <div className='space-y-4'>
                <h1
                  id='hero-heading'
                  className='text-4xl md:text-6xl lg:text-7xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'
                >
                  Themistoklis
                  <br />
                  Baltzakis
                </h1>

                <div
                  className='w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-400 rounded-full'
                  aria-hidden='true'
                />

                <h2 className='text-xl md:text-2xl lg:text-3xl text-slate-300 font-light'>
                  Cloud Architect & Cybersecurity Specialist
                </h2>

                <p className='text-lg text-slate-400 max-w-lg leading-relaxed'>
                  Passionate about designing secure, scalable cloud solutions and protecting digital
                  assets in an increasingly complex threat landscape. Expert in AWS, Azure, and
                  modern DevSecOps practices.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <HoverButton>
                  <Link to='/about'>
                    <Button
                      size='lg'
                      className='bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl'
                      aria-describedby='learn-more-desc'
                    >
                      <User className='w-5 h-5 mr-2' aria-hidden='true' />
                      Learn More
                    </Button>
                  </Link>
                </HoverButton>

                <HoverButton>
                  <Link to='/resume'>
                    <Button
                      variant='outline'
                      size='lg'
                      className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold px-8 py-3 rounded-lg transition-all duration-300'
                      aria-describedby='build-resume-desc'
                    >
                      <FileText className='w-5 h-5 mr-2' aria-hidden='true' />
                      Build Resume
                    </Button>
                  </Link>
                </HoverButton>

                <HoverButton>
                  <Link to='/contact'>
                    <Button
                      variant='outline'
                      size='lg'
                      className='border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 font-semibold px-8 py-3 rounded-lg transition-all duration-300'
                      aria-describedby='contact-desc'
                    >
                      <Mail className='w-5 h-5 mr-2' aria-hidden='true' />
                      Get In Touch
                    </Button>
                  </Link>
                </HoverButton>
              </div>

              {/* Hidden descriptions for screen readers */}
              <div className='sr-only'>
                <div id='learn-more-desc'>
                  Navigate to the about section to learn more about my background and expertise
                </div>
                <div id='build-resume-desc'>
                  Generate a customized resume based on your requirements
                </div>
                <div id='contact-desc'>Open the contact form to send me a message</div>
              </div>

              {/* Social Links */}
              <div className='flex gap-6 pt-4'>
                <HoverIcon>
                  <a
                    href='https://linkedin.com/in/themistoklis-baltzakis'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-400 hover:text-cyan-400 transition-colors duration-300'
                    aria-label='Visit my LinkedIn profile'
                  >
                    <Linkedin className='w-6 h-6' aria-hidden='true' />
                  </a>
                </HoverIcon>

                <HoverIcon>
                  <a
                    href='https://github.com/themistoklis'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-400 hover:text-cyan-400 transition-colors duration-300'
                    aria-label='Visit my GitHub profile'
                  >
                    <Github className='w-6 h-6' aria-hidden='true' />
                  </a>
                </HoverIcon>

                <HoverIcon>
                  <a
                    href='mailto:tbaltzakis@cloudless.gr'
                    className='text-slate-400 hover:text-cyan-400 transition-colors duration-300'
                    aria-label='Send me an email'
                  >
                    <Mail className='w-6 h-6' aria-hidden='true' />
                  </a>
                </HoverIcon>

                <HoverIcon>
                  <a
                    href='https://themistoklis.dev'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-slate-400 hover:text-cyan-400 transition-colors duration-300'
                    aria-label='Visit my portfolio website'
                  >
                    <ExternalLink className='w-6 h-6' aria-hidden='true' />
                  </a>
                </HoverIcon>
              </div>
            </AnimatedSection>

            {/* AI Brain Visualization */}
            <AnimatedSection delay={0.2} className='flex justify-center lg:justify-end'>
              <div className='w-full max-w-md lg:max-w-lg'>
                <Suspense
                  fallback={
                    <div className='w-full h-64 bg-slate-800/30 rounded-lg animate-pulse flex items-center justify-center text-slate-400'>
                      Loading AI Brain...
                    </div>
                  }
                >
                  <AIBrain />
                </Suspense>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* About Section */}
        <section id='about' aria-labelledby='about-heading' className='mb-20'>
          <AnimatedSection>
            <div className='text-center mb-12'>
              <h2 id='about-heading' className='text-3xl md:text-4xl font-bold text-white mb-4'>
                About Me
              </h2>
              <p className='text-lg text-slate-400 max-w-2xl mx-auto'>
                Dedicated to bridging the gap between technology and business objectives through
                innovative cloud solutions.
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              <Card className='bg-slate-800/50 border-slate-700'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-cyan-400'>
                    <Code className='w-5 h-5' aria-hidden='true' />
                    Cloud Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-300'>
                    Designing scalable, secure cloud infrastructures using AWS, Azure, and GCP best
                    practices.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='bg-slate-800/50 border-slate-700'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-cyan-400'>
                    <Shield className='w-5 h-5' aria-hidden='true' />
                    Cybersecurity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-300'>
                    Implementing comprehensive security measures and DevSecOps practices to protect
                    digital assets.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='bg-slate-800/50 border-slate-700'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-cyan-400'>
                    <Briefcase className='w-5 h-5' aria-hidden='true' />
                    Consulting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-300'>
                    Providing strategic guidance and technical expertise to organizations adopting
                    cloud technologies.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </section>

        {/* Services Section */}
        <section id='services' aria-labelledby='services-heading' className='mb-20'>
          <AnimatedSection>
            <div className='text-center mb-12'>
              <h2 id='services-heading' className='text-3xl md:text-4xl font-bold text-white mb-4'>
                Services
              </h2>
              <p className='text-lg text-slate-400 max-w-2xl mx-auto'>
                Comprehensive cloud and security solutions tailored to your business needs.
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              <article className='bg-slate-800/30 border border-slate-700 rounded-lg p-6'>
                <h3 className='text-xl font-semibold text-cyan-400 mb-3'>Cloud Migration</h3>
                <p className='text-slate-300 mb-4'>
                  Seamless migration of applications and data to cloud platforms with minimal
                  downtime.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900'
                >
                  Learn More
                </Button>
              </article>

              <article className='bg-slate-800/30 border border-slate-700 rounded-lg p-6'>
                <h3 className='text-xl font-semibold text-cyan-400 mb-3'>Security Assessment</h3>
                <p className='text-slate-300 mb-4'>
                  Comprehensive security audits and vulnerability assessments for your
                  infrastructure.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900'
                >
                  Learn More
                </Button>
              </article>

              <article className='bg-slate-800/30 border border-slate-700 rounded-lg p-6'>
                <h3 className='text-xl font-semibold text-cyan-400 mb-3'>
                  DevSecOps Implementation
                </h3>
                <p className='text-slate-300 mb-4'>
                  Integration of security practices into your development pipeline for continuous
                  protection.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900'
                >
                  Learn More
                </Button>
              </article>
            </div>
          </AnimatedSection>
        </section>

        {/* Contact Section */}
        <section id='contact' aria-labelledby='contact-heading' className='mb-20'>
          <AnimatedSection>
            <div className='text-center mb-12'>
              <h2 id='contact-heading' className='text-3xl md:text-4xl font-bold text-white mb-4'>
                Get In Touch
              </h2>
              <p className='text-lg text-slate-400 max-w-2xl mx-auto'>
                Ready to discuss your cloud architecture or security needs? Let's connect.
              </p>
            </div>

            <div className='max-w-2xl mx-auto'>
              <Card className='bg-slate-800/50 border-slate-700'>
                <CardHeader>
                  <CardTitle className='text-cyan-400'>Contact Form</CardTitle>
                  <CardDescription className='text-slate-300'>
                    Send me a message and I'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contactStatus === 'success' ? (
                    <div className='text-center py-8'>
                      <p className='text-green-400 text-lg font-medium mb-2'>✅ Message sent!</p>
                      <p className='text-slate-400'>I'll get back to you within 24 hours.</p>
                    </div>
                  ) : (
                    <form className='space-y-6' aria-labelledby='contact-heading' onSubmit={handleContactSubmit}>
                      <div className='grid md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='firstName'
                            className='block text-sm font-medium text-slate-300 mb-2'
                          >
                            First Name
                          </label>
                          <Input
                            id='firstName'
                            type='text'
                            placeholder='John'
                            value={contactForm.firstName}
                            onChange={(e) => setContactForm(f => ({ ...f, firstName: e.target.value }))}
                            className='bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor='lastName'
                            className='block text-sm font-medium text-slate-300 mb-2'
                          >
                            Last Name
                          </label>
                          <Input
                            id='lastName'
                            type='text'
                            placeholder='Doe'
                            value={contactForm.lastName}
                            onChange={(e) => setContactForm(f => ({ ...f, lastName: e.target.value }))}
                            className='bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor='email'
                          className='block text-sm font-medium text-slate-300 mb-2'
                        >
                          Email Address
                        </label>
                        <Input
                          id='email'
                          type='email'
                          placeholder='your.email@domain.com'
                          value={contactForm.email}
                          onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                          className='bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='subject'
                          className='block text-sm font-medium text-slate-300 mb-2'
                        >
                          Subject
                        </label>
                        <Input
                          id='subject'
                          type='text'
                          placeholder='Project inquiry'
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(f => ({ ...f, subject: e.target.value }))}
                          className='bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='message'
                          className='block text-sm font-medium text-slate-300 mb-2'
                        >
                          Message
                        </label>
                        <Textarea
                          id='message'
                          placeholder='Tell me about your project...'
                          rows={5}
                          value={contactForm.message}
                          onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                          className='bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          required
                        />
                      </div>

                      {contactStatus === 'error' && (
                        <p className='text-red-400 text-sm'>Failed to send. Please try the <Link to='/contact' className='underline'>contact page</Link> or email me directly.</p>
                      )}

                      <Button
                        type='submit'
                        disabled={contactStatus === 'sending'}
                        className='w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-60'
                      >
                        {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </section>
      </main>

      <footer className='relative z-10 bg-slate-900/50 border-t border-slate-700'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center text-slate-400'>
            <p>&copy; {new Date().getFullYear()} Themistoklis Baltzakis. All rights reserved.</p>
            <div className='flex justify-center gap-6 mt-4'>
              <a
                href='https://linkedin.com/in/themistoklis-baltzakis'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-cyan-400 transition-colors'
                aria-label='LinkedIn'
              >
                LinkedIn
              </a>
              <a
                href='https://github.com/themistoklis'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-cyan-400 transition-colors'
                aria-label='GitHub'
              >
                GitHub
              </a>
              <a
                href='mailto:tbaltzakis@cloudless.gr'
                className='hover:text-cyan-400 transition-colors'
                aria-label='Email'
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
