import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/components/ThemeProvider'
import { submitContactForm } from '@/lib/api'
import Contact from '@/pages/Contact'

// Mock the API
vi.mock('@/lib/api', () => ({
  submitContactForm: vi.fn(),
}))

// Mock reCAPTCHA hook
vi.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: vi.fn().mockResolvedValue('test-token'),
  }),
}))

// Mock components
vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid='navigation'>Navigation</nav>,
}))

vi.mock('@/components/CircuitBackground', () => ({
  default: () => <div data-testid='circuit-background'>Circuit Background</div>,
}))

vi.mock('@/components/AnimatedSection', () => ({
  AnimatedSection: ({ children, ...props }: any) => (
    <div data-testid='animated-section' data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/HoverAnimations', () => ({
  HoverButton: ({ children }: any) => <div data-testid='hover-button'>{children}</div>,
  HoverCard: ({ children }: any) => <div data-testid='hover-card'>{children}</div>,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{component}</ThemeProvider>
    </BrowserRouter>,
  )
}

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the contact page', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByRole('heading', { name: /contact me/i })).toBeInTheDocument()
  })

  it('displays contact form', () => {
    renderWithProviders(<Contact />)
    // Check for form element by finding the submit button and traversing up
    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton.closest('form')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('displays contact information', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText('Koropi/Athens, Greece')).toBeInTheDocument()
    expect(screen.getByText('+30 697 777 7838')).toBeInTheDocument()
    expect(screen.getByText('baltzakis.themis@gmail.com')).toBeInTheDocument()
  })

  it('displays quick actions', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText('Send Project Inquiry')).toBeInTheDocument()
    expect(screen.getByText('Connect on LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('View Portfolio')).toBeInTheDocument()
  })

  it('displays professional summary', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText('Why Work With Me?')).toBeInTheDocument()
    expect(screen.getByText('15+')).toBeInTheDocument()
    expect(screen.getByText('100+')).toBeInTheDocument()
    expect(screen.getByText('5+')).toBeInTheDocument()
  })

  it('has navigation links', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByRole('link', { name: /learn more about me/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    renderWithProviders(<Contact />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Project Inquiry' } })
    fireEvent.change(messageInput, { target: { value: 'Hello, I need help with a project.' } })

    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(subjectInput).toHaveValue('Project Inquiry')
    expect(messageInput).toHaveValue('Hello, I need help with a project.')
  })

  it('submits form successfully', async () => {
    const mockSubmitContactForm = vi.mocked(submitContactForm)
    mockSubmitContactForm.mockResolvedValue({
      success: true,
      message: 'Message sent successfully',
    })

    renderWithProviders(<Contact />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Project Inquiry' } })
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Hello, I need help with a project.' },
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    // Check loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument()

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Message sent successfully!')).toBeInTheDocument()
    })

    // Check that API was called
    expect(mockSubmitContactForm).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Project Inquiry',
      message: 'Hello, I need help with a project.',
      recaptchaToken: 'test-token',
    })
  })

  it('handles form submission error', async () => {
    const mockSubmitContactForm = vi.mocked(submitContactForm)
    mockSubmitContactForm.mockRejectedValue(new Error('Network error'))

    renderWithProviders(<Contact />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Project Inquiry' } })
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Hello, I need help with a project.' },
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for empty required fields', async () => {
    const mockSubmitContactForm = vi.mocked(submitContactForm)
    mockSubmitContactForm.mockResolvedValue({ success: false, message: 'Validation failed' })

    renderWithProviders(<Contact />)

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Valid email address is required')).toBeInTheDocument()
      expect(screen.getByText('Subject is required')).toBeInTheDocument()
      expect(screen.getByText('Message is required')).toBeInTheDocument()
    })
  })

  it('displays reCAPTCHA badge', () => {
    renderWithProviders(<Contact />)
    expect(screen.getByText('Protected by reCAPTCHA')).toBeInTheDocument()
  })
})
