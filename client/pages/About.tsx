import { Award, Briefcase, Cloud, Cpu, GraduationCap, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AnimatedSection } from '@/components/AnimatedSection'
import CircuitBackground from '@/components/CircuitBackground'
import { HoverCard } from '@/components/HoverAnimations'
import Navigation from '@/components/Navigation'

export default function About() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden'>
      <CircuitBackground />
      <Navigation />

      <div className='relative z-10 min-h-screen'>
        <div className='container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20'>
          {/* Hero Section */}
          <AnimatedSection className='max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-20'>
            <div className='space-y-3 md:space-y-4'>
              <AnimatedSection delay={0.1}>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider'>
                  About Me
                </h1>
                <div className='w-16 sm:w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto' />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className='text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide'>
                Cloud Architect & Cybersecurity Specialist
              </p>
              <p className='text-white/80 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto'>
                Technical Leadership and Cloud Innovation with 15+ years of IT expertise,
                specializing in Azure AD, Microsoft 365, and multi-cloud environments.
              </p>
            </AnimatedSection>
          </AnimatedSection>
          {/* Main Content */}
          <div className='max-w-6xl mx-auto space-y-16'>
            {/* Summary */}
            <AnimatedSection delay={0.1}>
              <div className='bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10'>
                <h2 className='text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3'>
                  <Briefcase className='w-8 h-8 text-cyan-400' />
                  Professional Summary
                </h2>
                <div className='text-white/80 space-y-4 leading-relaxed'>
                  <p>
                    With 15+ years of IT expertise, I architect and deliver enterprise-grade cloud
                    solutions specializing in Azure AD, Microsoft 365, and multi-cloud environments.
                    My foundation combines a Computer Science degree with industry certifications
                    (AWS Cloud Practitioner, Cisco DevNet Associate) and hands-on experience across
                    network infrastructure, cybersecurity, and cloud migration strategies.
                  </p>
                  <p>
                    I excel at transforming complex technical challenges into scalable, resilient
                    systems that drive business outcomes. My approach merges technical precision
                    with strategic thinking—leveraging emerging technologies like AI/ML integration,
                    zero-trust security models, and infrastructure-as-code to build future-ready
                    solutions.
                  </p>
                  <p>
                    Beyond technical expertise, I'm passionate about technology as a catalyst for
                    positive change. During COVID-19, I supported vulnerable communities through
                    telecommunications services, then contributed to Athens International Airport's
                    critical infrastructure rebuild—enabling safe travel and economic recovery.
                    Currently completing my Master's research in data-driven agricultural
                    innovations, I'm exploring how smart technology can empower sustainable farming
                    and rural communities.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Key Focus Areas */}
            <AnimatedSection delay={0.2}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
                <HoverCard>
                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 text-center hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 group min-h-[200px] flex flex-col justify-center'>
                    <div className='inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto'>
                      <Cloud className='w-6 h-6 md:w-8 md:h-8 text-cyan-400' />
                    </div>
                    <h3 className='text-lg md:text-xl font-bold text-white mb-2 md:mb-3'>
                      Cloud Architecture
                    </h3>
                    <p className='text-white/70 text-sm leading-relaxed'>
                      Azure, AWS, Multi-cloud Migration & Infrastructure Automation
                    </p>
                  </div>
                </HoverCard>
                <HoverCard>
                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 text-center hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 group min-h-[200px] flex flex-col justify-center'>
                    <div className='inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto'>
                      <Shield className='w-6 h-6 md:w-8 md:h-8 text-cyan-400' />
                    </div>
                    <h3 className='text-lg md:text-xl font-bold text-white mb-2 md:mb-3'>
                      Cybersecurity
                    </h3>
                    <p className='text-white/70 text-sm leading-relaxed'>
                      Zero-Trust Security, Identity Management & Threat Protection
                    </p>
                  </div>
                </HoverCard>
                <HoverCard>
                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 text-center hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 group min-h-[200px] flex flex-col justify-center sm:col-span-2 lg:col-span-1'>
                    <div className='inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto'>
                      <Cpu className='w-6 h-6 md:w-8 md:h-8 text-cyan-400' />
                    </div>
                    <h3 className='text-lg md:text-xl font-bold text-white mb-2 md:mb-3'>
                      AI/ML Integration
                    </h3>
                    <p className='text-white/70 text-sm leading-relaxed'>
                      Data Analytics, Smart Automation & Digital Transformation
                    </p>
                  </div>
                </HoverCard>
              </div>
            </AnimatedSection>

            {/* Skills & Certifications */}
            <AnimatedSection delay={0.3}>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg'>
                      <Award className='w-5 h-5 text-cyan-400' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>Top Skills</h3>
                  </div>
                  <ul className='space-y-4'>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Microsoft Azure Solutions Architect Expert
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Certified Information Systems Security Professional (CISSP)
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Certified Ethical Hacker (CEH)
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        ITIL Foundation Certification
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Azure AD & Identity Management
                      </span>
                    </li>
                  </ul>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg'>
                      <GraduationCap className='w-5 h-5 text-cyan-400' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>Certifications</h3>
                  </div>
                  <ul className='space-y-4'>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Zero Trust Security Architecture
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Multi-Cloud Migration & Management
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Microsoft 365 Security Implementation
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Compliance & Risk Management
                      </span>
                    </li>
                    <li className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                      <div className='w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0' />
                      <span className='text-white/90 font-medium'>
                        Enterprise Infrastructure Design
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Languages */}
            <AnimatedSection delay={0.3}>
              <div className='bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10'>
                <h3 className='text-2xl font-bold text-white mb-6'>Languages</h3>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-white/80'>English</span>
                    <span className='text-cyan-400 font-medium'>Full Professional</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-white/80'>Greek</span>
                    <span className='text-cyan-400 font-medium'>Native/Bilingual</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Honors & Awards */}
            <AnimatedSection delay={0.4}>
              <div className='bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10'>
                <h3 className='text-2xl font-bold text-white mb-6 flex items-center gap-3'>
                  <Award className='w-8 h-8 text-cyan-400' />
                  Honors & Awards
                </h3>
                <ul className='space-y-3 text-white/80'>
                  <li className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-cyan-400 rounded-full mt-2' />
                    <div>
                      <div className='font-medium'>3rd Place – Cisco Incubator 12.0</div>
                      <div className='text-white/60 text-sm'>Customer Experience Track</div>
                    </div>
                  </li>
                  <li className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-cyan-400 rounded-full mt-2' />
                    <div>
                      <div className='font-medium'>Scholarship Recipient</div>
                      <div className='text-white/60 text-sm'>Academic Excellence</div>
                    </div>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            {/* Call to Action */}
            <AnimatedSection delay={0.5}>
              <div className='text-center mt-16'>
                <Link
                  to='/contact'
                  className='inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium'
                >
                  Get In Touch
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
