import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from '@/pages/About'
import { render } from '../renderWithProviders'

describe('About Page', () => {
  it('renders the about page', () => {
    render(<About />)

    // Check for the main heading instead of main element
    expect(screen.getByRole('heading', { name: /about me/i, level: 1 })).toBeInTheDocument()
  })

  it('displays about content', () => {
    render(<About />)

    // Check for about section content
    expect(screen.getByText('Cloud Architect & Cybersecurity Specialist')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /professional summary/i })).toBeInTheDocument()
  })

  it('includes personal information', () => {
    render(<About />)

    // Check for personal details section - use getAllByText and check length
    const expertiseTexts = screen.getAllByText(/15\+ years of IT expertise/i)
    expect(expertiseTexts.length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: /top skills/i })).toBeInTheDocument()
  })
})
