import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Projects from '@/pages/Projects'

// Constants
const _EXPECTED_CARD_COUNT = 4 // 3 stat cards + 1 for 3D demo

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='helmet'>{children}</div>
  ),
}))

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn(),
    useMemo: vi.fn(),
  }
})

// Mock the components
vi.mock('@/components/Interactive3DDemo', () => ({
  useSampleProjects: () => [
    {
      id: '1',
      title: 'Project 1',
      description: 'Description 1',
      category: 'web',
      technologies: ['React', 'TypeScript'],
      year: 2023,
      image: '/project1.jpg',
      demoUrl: 'https://demo1.com',
      githubUrl: 'https://github.com/project1',
    },
    {
      id: '2',
      title: 'Project 2',
      description: 'Description 2',
      category: 'mobile',
      technologies: ['React Native'],
      year: 2023,
      image: '/project2.jpg',
      demoUrl: 'https://demo2.com',
      githubUrl: 'https://github.com/project2',
    },
    {
      id: '3',
      title: 'Project 3',
      description: 'Description 3',
      category: 'web',
      technologies: ['Vue.js'],
      year: 2024,
      image: '/project3.jpg',
    },
  ],
  Interactive3DDemo: ({ projects, className }: { projects: any[]; className?: string }) => (
    <div data-testid='interactive-3d-demo' className={className}>
      3D Demo with {projects.length} projects
    </div>
  ),
}))

// Mock React hooks - DON'T mock core React hooks as they break rendering
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    // Don't mock useState, useMemo, useEffect, or useContext
  }
})

vi.mock('@/components/SearchableProjects', () => ({
  default: ({ projects }: { projects: any[] }) => (
    <div data-testid='searchable-projects'>Grid view with {projects.length} projects</div>
  ),
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid='card'>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-description'>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-header'>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-title'>{children}</div>
  ),
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid='tabs' data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid='tabs-list'>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode
    value: string
    className?: string
  }) => (
    <button type='button' className={className} data-testid={`tab-trigger-${value}`}>
      {children}
    </button>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Grid3X3: () => <div data-testid='grid-icon' />,
  Zap: () => <div data-testid='zap-icon' />,
}))

describe('Projects Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders the projects page header', () => {
    render(<Projects />)

    expect(screen.getByText('Projects & Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Explore my latest work and technical projects')).toBeInTheDocument()
  })

  it('displays project statistics correctly', () => {
    render(<Projects />)

    // Check total projects (3)
    const totals = screen.getAllByText('3')
    expect(totals.length).toBeGreaterThanOrEqual(1)

    // Check web apps count (2)
    const webApps = screen.getAllByText('2')
    expect(webApps.length).toBeGreaterThanOrEqual(1)

    // Check mobile apps count (1)
    const mobileApps = screen.getAllByText('1')
    expect(mobileApps.length).toBeGreaterThanOrEqual(1)

    // Check statistic labels
    const projectLabels = screen.getAllByText('Projects')
    expect(projectLabels.length).toBeGreaterThanOrEqual(1)

    const webAppLabels = screen.getAllByText('Web Apps')
    expect(webAppLabels.length).toBeGreaterThanOrEqual(1)

    const mobileAppLabels = screen.getAllByText('Mobile App')
    expect(mobileAppLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('renders tabs with correct structure', () => {
    render(<Projects />)

    const tabsElements = screen.getAllByTestId('tabs')
    expect(tabsElements[0]).toBeInTheDocument()

    const tabsListElements = screen.getAllByTestId('tabs-list')
    expect(tabsListElements[0]).toBeInTheDocument()

    const tabTriggerGridElements = screen.getAllByTestId('tab-trigger-grid')
    expect(tabTriggerGridElements[0]).toBeInTheDocument()

    const tabTrigger3DElements = screen.getAllByTestId('tab-trigger-3d')
    expect(tabTrigger3DElements[0]).toBeInTheDocument()
  })

  it('displays tab labels with icons', () => {
    render(<Projects />)

    const gridViews = screen.getAllByText('Grid View')
    expect(gridViews[0]).toBeInTheDocument()

    const demoViews = screen.getAllByText('3D Demo')
    expect(demoViews[0]).toBeInTheDocument()

    const gridIcons = screen.getAllByTestId('grid-icon')
    expect(gridIcons[0]).toBeInTheDocument()

    const zapIcons = screen.getAllByTestId('zap-icon')
    expect(zapIcons.length).toBeGreaterThanOrEqual(2) // One in tab trigger, one in card title
  })

  it('renders grid view content', () => {
    render(<Projects />)

    const gridContents = screen.getAllByTestId('tab-content-grid')
    const gridContent = gridContents[0]
    expect(gridContent).toBeInTheDocument()

    const searchableProjects = screen.getAllByTestId('searchable-projects')
    expect(searchableProjects[0]).toBeInTheDocument()

    const texts = screen.getAllByText('Grid view with 3 projects')
    expect(texts[0]).toBeInTheDocument()
  })

  it('renders 3D demo content', () => {
    render(<Projects />)

    const demoContents = screen.getAllByTestId('tab-content-3d')
    const demoContent = demoContents[0]
    expect(demoContent).toBeInTheDocument()

    const interactiveDemos = screen.getAllByTestId('interactive-3d-demo')
    expect(interactiveDemos[0]).toBeInTheDocument()

    const texts = screen.getAllByText('3D Demo with 3 projects')
    expect(texts[0]).toBeInTheDocument()
  })

  it('renders statistics cards', () => {
    render(<Projects />)

    const cards = screen.getAllByTestId('card')
    expect(cards.length).toBeGreaterThanOrEqual(3) // At least 3 stat cards
  })
})
