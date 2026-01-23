import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { NotificationButton } from './NotificationButton'
import { OptimizedImage } from './OptimizedImage'
import { PWAInstallButton } from './PWAInstallButton'
import { ThemeToggle } from './ThemeToggle'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [closeMobileMenu])

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Focus management for mobile menu
      setTimeout(() => {
        mobileMenuRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen, closeMobileMenu])

  // Trap focus in mobile menu when open
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements?.[0] as HTMLElement
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-500 text-white px-4 py-2 rounded-md z-50 font-medium"
      >
        Skip to main content
      </a>

      <nav
        className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 lg:px-20 py-4 md:py-6"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={closeMobileMenu}>
            <div className="relative">
              <OptimizedImage
                src="/logo.jpg"
                alt="Themistoklis Baltzakis Logo"
                width={40}
                height={40}
                sizes="(max-width: 768px) 32px, 40px"
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20"
                priority={true}
                fallbackSrc="/logo.jpg"
              />
              <div className="logo-fallback w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20 hidden">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-sm" />
              </div>
            </div>
            <span className="text-foreground/90 font-semibold text-xs md:text-sm tracking-wider uppercase hidden lg:block">
              Themistoklis Baltzakis
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <Link
              to="/"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="Home"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="About"
            >
              About
            </Link>
            <Link
              to="/product"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="Experience"
            >
              Experience
            </Link>
            <Link
              to="/resume"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="Resume"
            >
              Resume
            </Link>
            <Link
              to="/contact"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="Contact"
            >
              Contact
            </Link>
            <Link
              to="/settings"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="Settings"
            >
              Settings
            </Link>
            <Link
              to="/agents"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1"
              aria-label="AI Agents"
            >
              Agents
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <NotificationButton />
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>
            <button
              type="button"
              className="md:hidden text-foreground/90 hover:text-cyan-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              data-testid="mobile-menu-toggle"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Menu</title>
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={`md:hidden absolute top-full left-0 right-0 bg-popover/95 backdrop-blur-md border-t border-border transition-all duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 visible translate-y-0'
              : 'opacity-0 invisible -translate-y-4'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          tabIndex={-1}
        >
          <div className="px-4 sm:px-6 py-4 md:py-6 space-y-2 md:space-y-4">
            <h2 className="sr-only">Navigation Menu</h2>
            <Link
              to="/"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="Home"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="About"
            >
              About
            </Link>
            <Link
              to="/product"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="Experience"
            >
              Experience
            </Link>
            <Link
              to="/resume"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="Resume"
            >
              Resume
            </Link>
            <Link
              to="/contact"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="Contact"
            >
              Contact
            </Link>
            <Link
              to="/settings"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="Settings"
            >
              Settings
            </Link>
            <Link
              to="/agents"
              className="text-foreground/90 hover:text-cyan-400 focus:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-background rounded-md"
              onClick={closeMobileMenu}
              aria-label="AI Agents"
            >
              Agents
            </Link>
            <div className="pt-2 border-t border-border flex gap-2">
              <ThemeToggle />
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
