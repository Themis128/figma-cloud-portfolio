import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Navigation from '@/components/Navigation'
import { ThemeProvider } from '@/components/ThemeProvider'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <MemoryRouter>{component}</MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Navigation', () => {
  it('renders navigation with logo', () => {
    renderWithTheme(<Navigation />)

    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toBeInTheDocument()

    // Check for logo link
    const logoLink = screen.getByRole('link', { name: /home/i })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('renders all navigation links', () => {
    renderWithTheme(<Navigation />)

    const navigationItems = [
      { name: 'About', href: '/about' },
      { name: 'Resume', href: '/resume' },
      { name: 'Contact', href: '/contact' },
      { name: 'Performance', href: '/performance' },
      { name: 'Agents', href: '/agents' },
    ]

    navigationItems.forEach(({ name, href }) => {
      // There should be at least 2 links (desktop and mobile versions)
      const links = screen.getAllByRole('link', { name })
      expect(links.length).toBeGreaterThanOrEqual(2)

      // All links should have the correct href
      links.forEach((link) => {
        expect(link).toHaveAttribute('href', href)
      })
    })
  })

  it('shows mobile menu button on small screens', () => {
    renderWithTheme(<Navigation />)

    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button is clicked', () => {
    renderWithTheme(<Navigation />)

    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })

    // Menu should be closed initially
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Click to open menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Click to close menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu when navigation link is clicked', () => {
    renderWithTheme(<Navigation />)

    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    // Get all About links and click the first one (mobile version)
    const aboutLinks = screen.getAllByRole('link', { name: /about/i })
    const aboutLink = aboutLinks[1] // Mobile version
    if (!aboutLink) throw new Error('About link not found')

    // Open menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Click navigation link
    fireEvent.click(aboutLink)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('includes call-to-action button in mobile menu', () => {
    renderWithTheme(<Navigation />)

    const ctaButton = screen.getByRole('link', { name: /get in touch/i })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/contact')
  })

  it('closes mobile menu when CTA button is clicked', () => {
    renderWithTheme(<Navigation />)

    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    const ctaButton = screen.getByRole('link', { name: /get in touch/i })

    // Open menu
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Click CTA button
    fireEvent.click(ctaButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('has proper accessibility attributes', () => {
    renderWithTheme(<Navigation />)

    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toHaveAttribute('aria-label', 'Main navigation')

    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
    expect(menuButton).toHaveAttribute('aria-expanded')
  })
})
