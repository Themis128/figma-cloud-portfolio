import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all dependencies
vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid='navigation'>Navigation</nav>,
}))

vi.mock('@/components/CircuitBackground', () => ({
  default: () => <div data-testid='circuit-background'>Circuit Background</div>,
}))

vi.mock('@/lib/api', () => ({
  generateResumePDF: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children: React.ReactNode
    [key: string]: any
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

// Mock Radix UI components
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid='tabs'>{children}</div>,
  List: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tabs-list'>{children}</div>
  ),
  Trigger: ({ children }: { children: React.ReactNode }) => (
    <button type='button' data-testid='tabs-trigger'>
      {children}
    </button>
  ),
  Content: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='tabs-content'>{children}</div>
  ),
}))

vi.mock('@radix-ui/react-card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid='card'>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-header'>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-title'>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-content'>{children}</div>
  ),
}))

vi.mock('@radix-ui/react-button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type='button' data-testid='button'>
      {children}
    </button>
  ),
}))

vi.mock('lucide-react', () => ({
  Download: () => <div data-testid='download-icon'>Download</div>,
  Save: () => <div data-testid='save-icon'>Save</div>,
  Eye: () => <div data-testid='eye-icon'>Eye</div>,
  EyeOff: () => <div data-testid='eye-off-icon'>EyeOff</div>,
  Plus: () => <div data-testid='plus-icon'>Plus</div>,
  Trash2: () => <div data-testid='trash-icon'>Trash</div>,
  Home: () => <div data-testid='home-icon'>Home</div>,
  ArrowLeft: () => <div data-testid='arrow-left-icon'>ArrowLeft</div>,
  Award: () => <div data-testid='award-icon'>Award</div>,
  Briefcase: () => <div data-testid='briefcase-icon'>Briefcase</div>,
  ChevronRight: () => <div data-testid='chevron-right-icon'>ChevronRight</div>,
  FileText: () => <div data-testid='file-text-icon'>FileText</div>,
  Globe: () => <div data-testid='globe-icon'>Globe</div>,
  GraduationCap: () => <div data-testid='graduation-cap-icon'>GraduationCap</div>,
  Linkedin: () => <div data-testid='linkedin-icon'>Linkedin</div>,
  Mail: () => <div data-testid='mail-icon'>Mail</div>,
  Sparkles: () => <div data-testid='sparkles-icon'>Sparkles</div>,
  User: () => <div data-testid='user-icon'>User</div>,
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

import Resume from '@/pages/Resume'

describe('Resume Component Isolation Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders resume component with minimal setup', () => {
    render(<Resume />)
    const navigations = screen.getAllByTestId('navigation')
    expect(navigations[0]).toBeInTheDocument()
  })
})
