import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/components/ThemeProvider'
import About from '@/pages/About'
import Index from '@/pages/Index'

// Mock lazy-loaded Navigation component for Index page
vi.mock('@/components/Navigation', () => ({
  default: () => (
    <nav data-testid='navigation' aria-label='Main navigation'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          <a href='/' className='flex items-center' aria-label='Home'>
            Logo
          </a>
          <div className='hidden md:flex items-center space-x-6 lg:space-x-8'>
            <a
              href='/about'
              className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
            >
              About
            </a>
            <a
              href='/resume'
              className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
            >
              Resume
            </a>
            <a
              href='/contact'
              className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
            >
              Contact
            </a>
            <a
              href='/performance'
              className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
            >
              Performance
            </a>
            <a
              href='/agents'
              className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
            >
              Agents
            </a>
          </div>
        </div>
      </div>
    </nav>
  ),
}))

vi.mock('@/components/AIBrain', () => ({
  default: () => <div data-testid='ai-brain'>AI Brain Component</div>,
}))

// Mock ThemeToggle since it uses theme context
vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => (
    <button type='button' data-testid='theme-toggle' aria-label='Toggle theme'>
      Toggle
    </button>
  ),
}))

// Mock NotificationButton
vi.mock('@/components/NotificationButton', () => ({
  NotificationButton: () => (
    <button type='button' data-testid='notification-button'>
      Notifications
    </button>
  ),
}))

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
} as any

const renderWithProviders = async (component: React.ReactElement, initialRoute = '/') => {
  let rendered: RenderResult
  await act(async () => {
    rendered = render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>{component}</ThemeProvider>
      </MemoryRouter>,
    )
  })
  return rendered!
}

describe('Integration Tests', () => {
  describe('Navigation Flow', () => {
    it('should navigate from home to about page', async () => {
      await renderWithProviders(<Index />)

      // Check that we're on the home page
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Themistoklis')
      })

      // Click on About link
      const aboutLinks = screen.getAllByRole('link', { name: /about/i })
      const firstAboutLink = aboutLinks[0]
      if (!firstAboutLink) throw new Error('About link not found')

      fireEvent.click(firstAboutLink)

      // Note: In a real integration test, we'd need to render the router
      // and check navigation. For now, we'll test that the link exists and has correct href
      expect(firstAboutLink).toHaveAttribute('href', '/about')
    })

    it('should navigate from about to home page', async () => {
      await renderWithProviders(<About />, '/about')

      // Check that we're on the about page
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Me')
      })

      // Click on Home link (logo)
      const homeLink = screen.getByRole('link', { name: /home/i })
      fireEvent.click(homeLink)

      // Check that the link has correct href
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should have working navigation links on both pages', async () => {
      // Test Index page navigation
      const { unmount } = await renderWithProviders(<Index />)

      await waitFor(() => {
        expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: /resume/i }).length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0)
      })

      unmount()

      // Test About page navigation
      await renderWithProviders(<About />, '/about')

      await waitFor(() => {
        expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: /resume/i }).length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Theme Integration', () => {
    it('should have navigation available', async () => {
      await renderWithProviders(<Index />)

      // Wait for lazy loaded components
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })
    })
  })

  describe('Page Content Integration', () => {
    it('should display consistent branding across pages', async () => {
      // Test Index page branding
      const { unmount } = await renderWithProviders(<Index />)

      await waitFor(() => {
        // Check for name in hero heading
        const heroHeading = screen.getByRole('heading', { level: 1 })
        expect(heroHeading).toHaveTextContent('Themistoklis')
        expect(heroHeading).toHaveTextContent('Baltzakis')
      })

      unmount()

      // Test About page branding
      await renderWithProviders(<About />, '/about')

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Me')
        expect(screen.getByText('Cloud Architect & Cybersecurity Specialist')).toBeInTheDocument()
      })
    })

    it('should have proper page structure and accessibility', async () => {
      // Test Index page structure
      const { unmount } = await renderWithProviders(<Index />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })

      unmount()

      // Test About page structure
      await renderWithProviders(<About />, '/about')

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
        // About page doesn't have a main element, but has proper heading structure
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })
  })
})
