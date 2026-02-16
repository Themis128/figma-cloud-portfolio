import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/components/ThemeProvider'
import Agents from '@/pages/Agents'

// Mock the components but with actual functionality to test component logic
vi.mock('@/components/CircuitBackground', () => ({
  default: () => <div data-testid='circuit-background' />,
}))

vi.mock('@/components/Navigation', () => ({
  default: () => <div data-testid='navigation' />,
}))

vi.mock('@/components/AnimatedSection', () => ({
  AnimatedSection: ({ children }: any) => <div data-testid='animated-section'>{children}</div>,
}))

// Mock components with actual event handlers to test component logic
vi.mock('@/components/agents/AgentBuilder', () => ({
  AgentBuilder: ({ onBack, onCancel, onSave }: any) => (
    <div data-testid='agent-builder'>
      <button type='button' onClick={onBack} data-testid='back-button'>
        Back
      </button>
      <button type='button' onClick={onCancel} data-testid='cancel-button'>
        Cancel
      </button>
      <button
        type='button'
        onClick={() => onSave({ name: 'Test Agent' })}
        data-testid='save-button'
      >
        Save
      </button>
    </div>
  ),
}))

vi.mock('@/components/agents/TemplateCreator', () => ({
  default: ({ onCreateTemplate, onCancel }: any) => (
    <div data-testid='template-creator'>
      <button
        type='button'
        onClick={() =>
          onCreateTemplate({
            name: 'Test Template',
            icon: '🤖',
            description: 'Test',
            category: 'Basic',
            difficulty: 'Easy',
            estimatedTime: '5 min',
            features: ['test'],
            tags: ['test'],
            workflow: { nodes: [], connections: [] },
          })
        }
        data-testid='create-button'
      >
        Create
      </button>
      <button type='button' onClick={onCancel} data-testid='cancel-button'>
        Cancel
      </button>
    </div>
  ),
}))

vi.mock('@/components/agents/TemplateSelector', () => ({
  default: ({ onSelectTemplate, onCloneTemplate, onCreateTemplate }: any) => (
    <div data-testid='template-selector'>
      <button
        type='button'
        onClick={() =>
          onSelectTemplate({
            name: 'Basic Chatbot',
            icon: '🤖',
            description: 'Test',
            category: 'Basic',
            difficulty: 'Easy',
            estimatedTime: '5 min',
            features: ['test'],
            tags: ['test'],
            workflow: { nodes: [], connections: [] },
          })
        }
        data-testid='select-template'
      >
        Select Template
      </button>
      <button
        type='button'
        onClick={() =>
          onCloneTemplate({
            name: 'Cloned Template',
            icon: '🤖',
            description: 'Test',
            category: 'Basic',
            difficulty: 'Easy',
            estimatedTime: '5 min',
            features: ['test'],
            tags: ['test'],
            workflow: { nodes: [], connections: [] },
          })
        }
        data-testid='clone-template'
      >
        Clone Template
      </button>
      <button type='button' onClick={onCreateTemplate} data-testid='create-new'>
        Create New
      </button>
    </div>
  ),
}))

vi.mock('@/components/agents/WorkflowBuilder', () => ({
  default: ({ nodes, connections, readonly }: any) => (
    <div data-testid='workflow-builder'>
      Workflow with {nodes?.length || 0} nodes and {connections?.length || 0} connections
      {readonly ? ' (readonly)' : ''}
    </div>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid='arrow-left-icon' />,
  Bot: () => <div data-testid='bot-icon' />,
  Sparkles: () => <div data-testid='sparkles-icon' />,
  Zap: () => <div data-testid='zap-icon' />,
  BarChart3: () => <div data-testid='bar-chart-icon' />,
  BookOpen: () => <div data-testid='book-open-icon' />,
  Play: () => <div data-testid='play-icon' />,
  Users: () => <div data-testid='users-icon' />,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{component}</ThemeProvider>
    </BrowserRouter>,
  )
}

describe('Agents Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the agents page header', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByText('AI Agent Builder')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Create intelligent AI agents using pre-built templates or start from scratch. Build, configure, and deploy agents for various tasks and workflows.',
      ),
    ).toBeInTheDocument()
  })

  it('renders navigation and circuit background components', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByTestId('circuit-background')).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByText('Back to Home')).toBeInTheDocument()
  })

  it('starts in select mode by default', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
    expect(screen.queryByTestId('template-creator')).not.toBeInTheDocument()
    expect(screen.queryByTestId('agent-builder')).not.toBeInTheDocument()
  })

  it('switches to create mode when create new is clicked', async () => {
    renderWithProviders(<Agents />)

    const createButton = screen.getByTestId('create-new')
    fireEvent.click(createButton)

    // Wait for state update and re-render
    await waitFor(() => {
      expect(screen.getByTestId('template-creator')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('template-selector')).not.toBeInTheDocument()
  })

  it('handles template creation and switches to configure mode', async () => {
    renderWithProviders(<Agents />)

    // Switch to create mode
    const createButton = screen.getByTestId('create-new')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('template-creator')).toBeInTheDocument()
    })

    // Create template
    const createTemplateButton = screen.getByTestId('create-button')
    fireEvent.click(createTemplateButton)

    // Should switch to configure mode and show template details
    await waitFor(() => {
      expect(screen.getByTestId('template-title')).toBeInTheDocument()
    })
  })

  it('handles template selection and switches to configure mode', async () => {
    renderWithProviders(<Agents />)

    const selectButton = screen.getByTestId('select-template')
    fireEvent.click(selectButton)

    await waitFor(() => {
      expect(screen.getByTestId('template-title')).toBeInTheDocument()
    })
  })

  it('handles template cloning and switches to configure mode', async () => {
    renderWithProviders(<Agents />)

    const cloneButton = screen.getByTestId('clone-template')
    fireEvent.click(cloneButton)

    await waitFor(() => {
      expect(screen.getByTestId('template-title')).toBeInTheDocument()
    })
  })

  it('displays template selector in select mode', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    renderWithProviders(<Agents />)

    // Check main container has background gradient
    const container = screen.getByText('AI Agent Builder').closest('.min-h-screen')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('relative', 'z-10', 'min-h-screen')
  })

  it('renders icons correctly', () => {
    renderWithProviders(<Agents />)

    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('bot-icon')).toBeInTheDocument()
    // Agents page uses Sparkles in header and the showcase toggle button
    expect(screen.getAllByTestId('sparkles-icon')).toHaveLength(2)
  })

  it('includes animated sections', () => {
    renderWithProviders(<Agents />)

    const animatedSections = screen.getAllByTestId('animated-section')
    // Header, showcase toggle, and main selector each use AnimatedSection
    expect(animatedSections).toHaveLength(3)
  })

  it('shows breadcrumb navigation when not in select mode', async () => {
    renderWithProviders(<Agents />)

    // Initially should not show breadcrumb
    expect(screen.queryByText('Template Selection')).not.toBeInTheDocument()

    // Switch to create mode
    const createButton = screen.getByTestId('create-new')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Template Selection')).toBeInTheDocument()
    })
  })

  it('handles back to select navigation', async () => {
    renderWithProviders(<Agents />)

    // Switch to create mode
    const createButton = screen.getByTestId('create-new')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Template Selection')).toBeInTheDocument()
    })

    // Click back to select
    const backButton = screen.getByText('Template Selection')
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByTestId('template-selector')).toBeInTheDocument()
    })
  })
})
