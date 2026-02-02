import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('@/components/Logo', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
}))

vi.mock('@/components/NotificationButton', () => ({
  NotificationButton: () => <div data-testid='notification-button'>Notification</div>,
}))

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid='theme-toggle'>Theme Toggle</div>,
}))

vi.mock('@/components/HoverAnimations', () => ({
  HoverButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='hover-button'>{children}</div>
  ),
}))

vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid='menu-icon'>Menu</div>,
  X: () => <div data-testid='x-icon'>X</div>,
}))

import Navigation from '@/components/Navigation'

describe('Navigation Component Test', () => {
  it('renders navigation component', () => {
    render(<Navigation />)
    expect(screen.getAllByText('About')).toHaveLength(2) // One in desktop nav, one in mobile menu
  })
})
