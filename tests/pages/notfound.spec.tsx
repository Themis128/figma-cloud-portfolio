import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NotFound from '@/pages/NotFound'

// Mock the components
vi.mock('@/components/CircuitBackground', () => ({
  default: () => <div data-testid='circuit-background' />,
}))

vi.mock('@/components/Navigation', () => ({
  default: () => <div data-testid='navigation' />,
}))

describe('NotFound Page', () => {
  const renderNotFound = () => {
    return render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>,
    )
  }

  it('renders the 404 page', () => {
    renderNotFound()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument()
    expect(
      screen.getByText("The page you're looking for doesn't exist or has been moved."),
    ).toBeInTheDocument()
  })

  it('displays the return to home link', () => {
    renderNotFound()

    const homeLinks = screen.getAllByRole('link', { name: /return to home/i })
    const homeLink = homeLinks[0]
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders navigation component', () => {
    renderNotFound()

    const navigations = screen.getAllByTestId('navigation')
    expect(navigations[0]).toBeInTheDocument()
  })

  it('renders circuit background component', () => {
    renderNotFound()

    const circuitBackgrounds = screen.getAllByTestId('circuit-background')
    expect(circuitBackgrounds[0]).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    renderNotFound()

    // Find the outermost container with the background gradient
    const containers = screen.getAllByText('404')
    const container = containers[0].closest('.min-h-screen')
    expect(container).not.toBeNull()
    expect(container!).toBeInTheDocument()
    expect(container!).toHaveClass(
      'relative',
      'z-10',
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center',
    )
  })

  it('has accessible link with proper text', () => {
    renderNotFound()

    const links = screen.getAllByRole('link')
    const homeLink = links.find((link) => link.textContent?.includes('Return to Home'))
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveClass('inline-block', 'px-8', 'py-3')
    expect(homeLink).toHaveClass('border-2', 'border-cyan-400/60')
  })
})
