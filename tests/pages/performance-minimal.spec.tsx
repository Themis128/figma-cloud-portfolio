import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Performance from '@/pages/Performance'

// Minimal mocks
vi.mock('@/components/Navigation', () => ({
  default: () => <nav>Navigation</nav>,
}))

vi.mock('@/components/PerformanceDashboard', () => ({
  PerformanceDashboard: () => <div>Performance Dashboard</div>,
}))

vi.mock('@/components/PerformanceTester', () => ({
  PerformanceTester: () => <div>Performance Tester</div>,
}))

vi.mock('@/components/PushNotificationTester', () => ({
  PushNotificationTester: () => <div>Push Notification Tester</div>,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Performance Page - Minimal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Performance />)
    expect(container).toBeInTheDocument()
  })
})
