import { act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Index from '@/pages/Index'
import { renderWithProviders } from '../test-utils'

// Mock Navigation component since it's lazy-loaded - provide proper nav role
vi.mock('@/components/Navigation', () => ({
  default: () => (
    <nav aria-label='Main navigation'>
      <a href='/about'>About</a>
      <a href='/contact'>Contact</a>
    </nav>
  ),
}))

// Mock AIBrain component since it's lazy-loaded
vi.mock('@/components/AIBrain', () => ({
  default: () => <div data-testid='ai-brain'>AI Brain Component</div>,
}))

describe('Index Page', () => {
  it('renders the main page content', async () => {
    await act(async () => {
      renderWithProviders(<Index />)
    })

    // Check for main content elements
    expect(screen.getByRole('main')).toBeInTheDocument()

    // Check for hero heading specifically (not the footer copyright)
    const heroHeading = screen.getByRole('heading', { level: 1 })
    expect(heroHeading).toHaveTextContent('Themistoklis')
    expect(heroHeading).toHaveTextContent('Baltzakis')
  })

  it('displays hero section', async () => {
    await act(async () => {
      renderWithProviders(<Index />)
    })

    // Check for hero content
    expect(screen.getByText('Cloud Architect & Cybersecurity Specialist')).toBeInTheDocument()
  })

  it('renders navigation links', async () => {
    await act(async () => {
      renderWithProviders(<Index />)
    })

    // Check for navigation - the lazy loaded component should render with nav role
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    // Check for key navigation links (may have multiple due to mobile/desktop)
    const aboutLinks = screen.getAllByRole('link', { name: /about/i })
    const contactLinks = screen.getAllByRole('link', { name: /contact/i })
    expect(aboutLinks.length).toBeGreaterThan(0)
    expect(contactLinks.length).toBeGreaterThan(0)
  })

  it('includes call-to-action buttons', async () => {
    await act(async () => {
      renderWithProviders(<Index />)
    })

    // Check for CTA buttons (may have multiple instances)
    const learnMoreButtons = screen.getAllByRole('button', {
      name: /learn more/i,
    })
    const buildResumeButtons = screen.getAllByRole('button', {
      name: /build resume/i,
    })
    const getInTouchButtons = screen.getAllByRole('button', {
      name: /get in touch/i,
    })

    expect(learnMoreButtons.length).toBeGreaterThan(0)
    expect(buildResumeButtons.length).toBeGreaterThan(0)
    expect(getInTouchButtons.length).toBeGreaterThan(0)
  })
})
