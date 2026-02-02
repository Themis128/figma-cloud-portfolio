import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Settings from '@/pages/Settings'

// Mock the theme provider
const mockSetTheme = vi.fn()
const mockTheme = 'dark'

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock RealtimeTest component
vi.mock('@/components/RealtimeTest', () => ({
  RealtimeTest: () => <div data-testid='realtime-test'>Realtime Test Component</div>,
}))

// Mock Navigation component
vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid='navigation'>Navigation</nav>,
}))

// Mock AnimatedSection component
vi.mock('@/components/AnimatedSection', () => ({
  AnimatedSection: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid={`animated-section${delay ? `-${delay}` : ''}`}>{children}</div>
  ),
}))

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
})

// Mock service worker API
const mockServiceWorker = {
  ready: vi.fn().mockResolvedValue({
    waiting: null,
    update: vi.fn().mockResolvedValue(undefined),
    installing: null,
  }),
  controller: {},
}

Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: mockServiceWorker,
})

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all settings sections', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Real-time Features (Beta)')).toBeInTheDocument()
  })

  it('renders navigation and back button', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('navigates back when back button is clicked', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  describe('Theme Settings', () => {
    it('displays current theme selection', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const darkRadio = screen.getByLabelText('Dark')
      expect(darkRadio).toBeChecked()
    })

    it('calls setTheme when theme is changed', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const lightRadio = screen.getByLabelText('Light')
      fireEvent.click(lightRadio)

      expect(mockSetTheme).toHaveBeenCalledWith('light')

      const systemRadio = screen.getByLabelText('System')
      fireEvent.click(systemRadio)

      expect(mockSetTheme).toHaveBeenCalledWith('system')
    })

    it('toggles animations switch', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const animationsSwitch = screen.getByRole('switch', { name: /animations/i })
      expect(animationsSwitch).toBeChecked()

      fireEvent.click(animationsSwitch)
      expect(animationsSwitch).not.toBeChecked()
    })

    it('toggles reduced motion switch', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const reducedMotionSwitch = screen.getByRole('switch', { name: /reduced motion/i })
      expect(reducedMotionSwitch).not.toBeChecked()

      fireEvent.click(reducedMotionSwitch)
      expect(reducedMotionSwitch).toBeChecked()
    })
  })

  describe('Notification Settings', () => {
    it('toggles push notifications switch', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const notificationsSwitch = screen.getByRole('switch', { name: /push notifications/i })
      expect(notificationsSwitch).toBeChecked()

      fireEvent.click(notificationsSwitch)
      expect(notificationsSwitch).not.toBeChecked()
    })
  })

  describe('Privacy Settings', () => {
    it('renders analytics switch', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(
        screen.getByText('Help improve the app by sharing anonymous usage data'),
      ).toBeInTheDocument()
    })

    it('renders data management buttons', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Clear Cache')).toBeInTheDocument()
    })
  })

  describe('About Section', () => {
    it('displays version information', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('1.0.0')).toBeInTheDocument()
      expect(screen.getByText('Build')).toBeInTheDocument()
      expect(screen.getByText('2024.01.19')).toBeInTheDocument()
      expect(screen.getByText('Framework')).toBeInTheDocument()
      expect(screen.getByText('React + Vite')).toBeInTheDocument()
      expect(screen.getByText('PWA')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('opens changelog in new tab when view changelog is clicked', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const changelogButton = screen.getByText('View Changelog')
      fireEvent.click(changelogButton)

      expect(mockOpen).toHaveBeenCalledWith(
        'https://github.com/Themis128/figma-cloud-portfolio/releases',
        '_blank',
      )
    })
  })

  describe('Update Checking', () => {
    const UPDATE_CHECK_TIMEOUT = 5000

    it('shows check for updates button initially', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      expect(screen.getByText('Check for Updates')).toBeInTheDocument()
    })

    it.skip(
      'handles update checking with service worker available',
      async () => {
        // Mock service worker with no waiting worker
        mockServiceWorker.ready.mockResolvedValueOnce({
          waiting: null,
          update: vi.fn().mockImplementation(() => Promise.resolve()),
          installing: null,
        })

        render(
          <MemoryRouter>
            <Settings />
          </MemoryRouter>,
        )

        const checkButton = screen.getByText('Check for Updates')
        fireEvent.click(checkButton)

        expect(screen.getByText('Checking...')).toBeInTheDocument()

        // Wait for the async operation with a shorter timeout
        await waitFor(
          () => {
            expect(screen.getByText("You're running the latest version.")).toBeInTheDocument()
          },
          { timeout: 3000 },
        )
      },
      UPDATE_CHECK_TIMEOUT,
    )

    it.skip(
      'handles update checking with available update',
      async () => {
        // Mock service worker with waiting worker
        mockServiceWorker.ready.mockResolvedValueOnce({
          waiting: {},
          update: vi.fn().mockImplementation(() => Promise.resolve()),
          installing: null,
        })

        render(
          <MemoryRouter>
            <Settings />
          </MemoryRouter>,
        )

        const checkButton = screen.getByText('Check for Updates')
        fireEvent.click(checkButton)

        await waitFor(
          () => {
            expect(
              screen.getByText('A new version is available! Refresh to update.'),
            ).toBeInTheDocument()
          },
          { timeout: 3000 },
        )
      },
      UPDATE_CHECK_TIMEOUT,
    )

    it.skip(
      'handles update checking with installing worker',
      async () => {
        // Mock service worker with installing worker
        mockServiceWorker.ready.mockResolvedValueOnce({
          waiting: null,
          update: vi.fn().mockImplementation(() => Promise.resolve()),
          installing: {},
        })

        render(
          <MemoryRouter>
            <Settings />
          </MemoryRouter>,
        )

        const checkButton = screen.getByText('Check for Updates')
        fireEvent.click(checkButton)

        await waitFor(
          () => {
            expect(screen.getByText('Downloading update...')).toBeInTheDocument()
          },
          { timeout: 3000 },
        )
      },
      UPDATE_CHECK_TIMEOUT,
    )

    it.skip(
      'handles update checking error',
      async () => {
        // Mock service worker update to throw error
        mockServiceWorker.ready.mockRejectedValueOnce(new Error('Network error'))

        render(
          <MemoryRouter>
            <Settings />
          </MemoryRouter>,
        )

        const checkButton = screen.getByText('Check for Updates')
        fireEvent.click(checkButton)

        await waitFor(
          () => {
            expect(
              screen.getByText('Failed to check for updates. Please try again.'),
            ).toBeInTheDocument()
          },
          { timeout: 3000 },
        )
      },
      UPDATE_CHECK_TIMEOUT,
    )

    it.skip(
      'handles update checking without service worker',
      async () => {
        // Mock navigator without service worker
        Object.defineProperty(navigator, 'serviceWorker', {
          writable: true,
          value: undefined,
        })

        render(
          <MemoryRouter>
            <Settings />
          </MemoryRouter>,
        )

        const checkButton = screen.getByText('Check for Updates')
        fireEvent.click(checkButton)

        await waitFor(
          () => {
            expect(screen.getByText("You're running the latest version.")).toBeInTheDocument()
          },
          { timeout: 3000 },
        )

        // Restore service worker mock
        Object.defineProperty(navigator, 'serviceWorker', {
          writable: true,
          value: mockServiceWorker,
        })
      },
      UPDATE_CHECK_TIMEOUT,
    )

    it('disables check button while checking', () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      const checkButton = screen.getByText('Check for Updates')
      fireEvent.click(checkButton)

      expect(checkButton).toBeDisabled()
    })
  })

  describe('Real-time Features', () => {
    it('renders realtime test component', () => {
      vi.useRealTimers()
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('realtime-test')).toBeInTheDocument()
      vi.useFakeTimers()
    })
  })
})
