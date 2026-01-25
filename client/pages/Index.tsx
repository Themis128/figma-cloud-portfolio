// Import components directly instead of lazy loading for now

import { Activity } from "@/components/Activity";
import AIBrain from "@/components/AIBrain";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverButton, HoverIcon } from "@/components/HoverAnimations";
import { Interactive3DDemo, useSampleProjects } from "@/components/Interactive3DDemo";
import Navigation from "@/components/Navigation";
import { Globe as GlobeIcon, Linkedin, Mail } from "lucide-react";

export default function Index() {
  const sampleProjects = useSampleProjects();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden'>
      {/* Circuit background */}
      <CircuitBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main id='main-content' className='relative z-10 min-h-screen flex items-center'>
        <div className='container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20'>
          <div className='grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center'>
            {/* Left side - Text content */}
            <section
              className='space-y-6 md:space-y-8 lg:space-y-12'
              aria-labelledby='hero-heading'
            >
              <div className='space-y-3 md:space-y-4'>
                <AnimatedSection delay={0.1}>
                  <h1
                    id='hero-heading'
                    className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight'
                  >
                    <span className='block text-foreground/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 md:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl'>
                      Themistoklis
                    </span>
                    <span className='block text-foreground uppercase tracking-wider leading-tight'>
                      Baltzakis
                    </span>
                  </h1>
                </AnimatedSection>
                <AnimatedSection delay={0.2}>
                  <p className='text-cyan-400 text-base sm:text-lg md:text-xl font-semibold tracking-wide'>
                    Cloud Architect & Cybersecurity Specialist
                  </p>
                  <div className='w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-3 md:mb-4' />
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <p className='text-foreground/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl'>
                    Technical Leadership and Cloud Innovation with 15+ years of IT expertise,
                    specializing in Azure AD, Microsoft 365, and multi-cloud environments.
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={0.4} className='flex flex-col sm:flex-row gap-3 md:gap-4'>
                <HoverButton>
                  <a
                    href='/about'
                    className='group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-foreground/90 hover:text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center'
                  >
                    <span className='relative z-10'>Learn More</span>
                    <div className='absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300 rounded-md' />
                  </a>
                </HoverButton>
                <HoverButton>
                  <a
                    href='/resume'
                    className='group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-border/30 hover:border-border/60 text-foreground/80 hover:text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-foreground/10 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center'
                  >
                    <span className='relative z-10'>Build Resume</span>
                    <div className='absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 rounded-md' />
                  </a>
                </HoverButton>
                <HoverButton>
                  <a
                    href='/contact'
                    className='group relative px-6 sm:px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-[44px] flex items-center justify-center'
                  >
                    <span className='relative z-10'>Get In Touch</span>
                  </a>
                </HoverButton>
              </AnimatedSection>

              {/* Social media icons */}
              <AnimatedSection
                delay={0.5}
                className='flex items-center justify-center sm:justify-start gap-4 md:gap-6 pt-6 md:pt-8'
              >
                <HoverIcon>
                  <a
                    href='https://www.linkedin.com/in/baltzakis-themis'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center'
                    aria-label='LinkedIn'
                  >
                    <Linkedin className='w-4 h-4 sm:w-5 sm:h-5' />
                  </a>
                </HoverIcon>
                <HoverIcon>
                  <a
                    href='mailto:baltzakis.themis@gmail.com'
                    className='text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center'
                    aria-label='Email'
                  >
                    <Mail className='w-4 h-4 sm:w-5 sm:h-5' />
                  </a>
                </HoverIcon>
                <HoverIcon>
                  <a
                    href='https://www.baltzakisthemis.com'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center'
                    aria-label='Portfolio'
                  >
                    <GlobeIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                  </a>
                </HoverIcon>
              </AnimatedSection>
            </section>

            {/* Right side - AI Brain visualization */}
            <section
              className='relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0'
              aria-label='Interactive AI visualization'
            >
              <Activity trigger='viewport' delay={200}>
                <div className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'>
                  <AIBrain />
                </div>
              </Activity>
            </section>
          </div>

          {/* 3D Interactive Projects Demo */}
          <div className='mt-16 md:mt-20'>
            <section className='space-y-6 md:space-y-8' aria-labelledby='projects-heading'>
              <div className='text-center space-y-4'>
                <h2
                  id='projects-heading'
                  className='text-2xl sm:text-3xl md:text-4xl font-bold text-foreground'
                >
                  Interactive 3D Portfolio
                </h2>
                <p className='text-foreground/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto'>
                  Explore my projects through an immersive 3D experience. Click and drag to
                  navigate, scroll to zoom, and hover over spheres to learn more about each project.
                </p>
              </div>

              <div className='relative'>
                <Activity trigger='viewport' delay={300}>
                  <Interactive3DDemo
                    projects={sampleProjects}
                    className='w-full'
                    onProjectClick={(_projectId) => {
                      // Could navigate to project details or open modal
                    }}
                  />
                </Activity>

                {/* Fallback content for testing - always present */}
                <div className='sr-only' data-testid='3d-fallback-content'>
                  WebGL 3D canvas rendering for interactive project visualization
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
