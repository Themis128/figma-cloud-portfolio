import { Globe, Linkedin, Mail } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { AnimatedSection } from '@/components/AnimatedSection'
import Navigation from '@/components/Navigation'

// Lazy load heavy components
const AIBrain = lazy(() => import('@/components/AIBrain'))
const CircuitBackground = lazy(() => import('@/components/CircuitBackground'))
const HoverButton = lazy(() =>
  import('@/components/HoverAnimations').then((module) => ({
    default: module.HoverButton,
  })),
)
const HoverIcon = lazy(() =>
  import('@/components/HoverAnimations').then((module) => ({
    default: module.HoverIcon,
  })),
)

// Loading component for heavy components
const ComponentLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
  </div>
)

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden">
      {/* Circuit background */}
      <Suspense fallback={<ComponentLoader />}>
        <CircuitBackground />
      </Suspense>

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <div id="main-content" className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Left side - Text content */}
            <AnimatedSection className="space-y-6 md:space-y-8 lg:space-y-12">
              <div className="space-y-3 md:space-y-4">
                <AnimatedSection delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="block text-white/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 md:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                      Themistoklis
                    </span>
                    <span className="block text-white uppercase tracking-wider leading-tight">
                      Baltzakis
                    </span>
                  </h1>
                </AnimatedSection>
                <AnimatedSection delay={0.2}>
                  <p className="text-cyan-400 text-base sm:text-lg md:text-xl font-semibold tracking-wide">
                    Cloud Architect & Cybersecurity Specialist
                  </p>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-3 md:mb-4" />
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                    Technical Leadership and Cloud Innovation with 15+ years of IT expertise,
                    specializing in Azure AD, Microsoft 365, and multi-cloud environments.
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={0.4} className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Suspense fallback={<ComponentLoader />}>
                  <HoverButton>
                    <a
                      href="/about"
                      className="group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-white/90 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center"
                    >
                      <span className="relative z-10">Learn More</span>
                      <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300 rounded-md" />
                    </a>
                  </HoverButton>
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <HoverButton>
                    <a
                      href="/resume.pdf"
                      download="Themistoklis_Baltzakis_Resume.pdf"
                      className="group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-white/30 hover:border-white/60 text-white/80 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-white/10 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center"
                    >
                      <span className="relative z-10">Download Resume</span>
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-md" />
                    </a>
                  </HoverButton>
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <HoverButton>
                    <a
                      href="/contact"
                      className="group relative px-6 sm:px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center"
                    >
                      <span className="relative z-10">Get In Touch</span>
                    </a>
                  </HoverButton>
                </Suspense>
              </AnimatedSection>

              {/* Social media icons */}
              <AnimatedSection
                delay={0.5}
                className="flex items-center justify-center sm:justify-start gap-4 md:gap-6 pt-6 md:pt-8"
              >
                <Suspense fallback={<ComponentLoader />}>
                  <HoverIcon>
                    <a
                      href="https://www.linkedin.com/in/baltzakis-themis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </HoverIcon>
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <HoverIcon>
                    <a
                      href="mailto:baltzakis.themis@gmail.com"
                      className="text-white/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Email"
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </HoverIcon>
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <HoverIcon>
                    <a
                      href="https://www.baltzakisthemis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Portfolio"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </HoverIcon>
                </Suspense>
              </AnimatedSection>
            </AnimatedSection>

            {/* Right side - AI Brain visualization */}
            <AnimatedSection
              delay={0.3}
              direction="left"
              className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
            >
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <Suspense fallback={<ComponentLoader />}>
                  <AIBrain />
                </Suspense>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
