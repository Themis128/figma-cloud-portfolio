import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import Index from '@/pages/Index'

describe('Index Page', () => {
  it('renders the main page content', () => {
    renderWithProviders(<Index />)

    // Check for main content elements
    expect(screen.getByRole('main')).toBeInTheDocument()

    // Check for hero heading specifically (not the footer copyright)
    const heroHeading = screen.getByRole('heading', { level: 1 })
    expect(heroHeading).toHaveTextContent('Themistoklis')
    expect(heroHeading).toHaveTextContent('Baltzakis')
  })

  it('displays hero section', () => {
    renderWithProviders(<Index />)

    // Check for hero content
    expect(screen.getByText('Cloud Architect & Cybersecurity Specialist')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithProviders(<Index />)

    // Check for navigation
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    // Check for key navigation links (may have multiple due to mobile/desktop)
    const aboutLinks = screen.getAllByRole('link', { name: /about/i })
    const contactLinks = screen.getAllByRole('link', { name: /contact/i })
    expect(aboutLinks.length).toBeGreaterThan(0)
    expect(contactLinks.length).toBeGreaterThan(0)
  })

  it('includes call-to-action buttons', () => {
    renderWithProviders(<Index />)

    // Check for CTA buttons (may have multiple instances)
    const learnMoreButtons = screen.getAllByRole('button', { name: /learn more/i })
    const buildResumeButtons = screen.getAllByRole('button', { name: /build resume/i })
    const getInTouchButtons = screen.getAllByRole('button', { name: /get in touch/i })

    expect(learnMoreButtons.length).toBeGreaterThan(0)
    expect(buildResumeButtons.length).toBeGreaterThan(0)
    expect(getInTouchButtons.length).toBeGreaterThan(0)
  })
})
