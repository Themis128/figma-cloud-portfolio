/** @jsxImportSource react */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Navigation from '../client/components/Navigation'
import { ThemeProvider } from '../client/components/ThemeProvider'

const renderWithProviders = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Navigation', () => {
  it('should render navigation with logo', () => {
    renderWithProviders(<Navigation />)
    const logo = screen.getByRole('link', { name: /home/i })
    expect(logo).toBeInTheDocument()
    // Logo is an image, not text content
    const logoImg = screen.getByAltText('Themistoklis Baltzakis Logo')
    expect(logoImg).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    renderWithProviders(<Navigation />)
    const navigationItems = ['About', 'Resume', 'Contact', 'Performance', 'Agents']

    navigationItems.forEach((item) => {
      const links = screen.getAllByRole('link', { name: item })
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('should render navigation links with correct hrefs', () => {
    renderWithProviders(<Navigation />)
    const navigationItems = [
      { name: 'About', href: '/about' },
      { name: 'Resume', href: '/resume' },
      { name: 'Contact', href: '/contact' },
      { name: 'Performance', href: '/performance' },
      { name: 'Agents', href: '/agents' },
    ]

    navigationItems.forEach((item) => {
      const links = screen.getAllByRole('link', { name: item.name })
      expect(links.length).toBeGreaterThan(0)
      // Check that at least one link has the correct href
      const linkWithHref = links.find((link) => link.getAttribute('href') === item.href)
      expect(linkWithHref).toBeInTheDocument()
    })
  })

  it('should show mobile menu button on small screens', () => {
    renderWithProviders(<Navigation />)
    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' })
    expect(menuButton).toBeInTheDocument()
  })

  it('should toggle mobile menu when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navigation />)

    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' })

    // Menu should be closed initially
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Open menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Check if mobile menu is visible (simplified check)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Close menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should close mobile menu when navigation link is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navigation />)

    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' })

    // Open menu
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Click on the mobile navigation link (the one with block styling)
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    const mobileAboutLink = aboutLinks.find(
      (link) => link.className.includes('block') && link.className.includes('w-full'),
    )

    if (mobileAboutLink) {
      await user.click(mobileAboutLink)
    }

    // Menu should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render CTA button in mobile menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navigation />)

    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' })
    await user.click(menuButton)

    const ctaButton = screen.getByRole('link', { name: /get in touch/i })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveTextContent('Get In Touch')
  })

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<Navigation />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    const logo = screen.getByRole('link', { name: /home/i })
    expect(logo).toHaveAttribute('aria-label', 'Home')

    const menuButton = screen.getByRole('button', { name: 'Toggle mobile menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
