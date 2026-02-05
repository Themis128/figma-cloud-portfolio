import type React from 'react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

// Constants
const RANDOM_ID_LENGTH = 9
const RANDOM_ID_START_INDEX = 2
const ANNOUNCEMENT_DURATION_MS = 1000

// Accessibility enhancement hook leveraging React 19 features
export function useAccessibilityEnhancements() {
  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyNavigation = (event: KeyboardEvent) => {
      // Improved focus management with React 19 automatic batching
      if (event.key === 'Tab') {
        // Ensure focus is visible
        document.body.classList.add('keyboard-navigation')
      }

      if (event.key === 'Escape') {
        // Close modals/dropdowns on ESC
        const activeElement = document.activeElement as HTMLElement
        if (activeElement?.closest('[role="dialog"], [role="menu"]')) {
          activeElement.blur()
        }
      }
    }

    const handleMouseUsage = () => {
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyNavigation)
    document.addEventListener('mousedown', handleMouseUsage)

    return () => {
      document.removeEventListener('keydown', handleKeyNavigation)
      document.removeEventListener('mousedown', handleMouseUsage)
    }
  }, [])

  // Announce content changes to screen readers
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('class', 'sr-only')
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, ANNOUNCEMENT_DURATION_MS)
  }

  return { announceToScreenReader }
}

// Accessible button component with enhanced features
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function AccessibleButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  className,
  children,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:transform active:scale-95'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    ghost:
      'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  }

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      aria-describedby={isLoading ? `${props.id}-loading` : undefined}
      {...props}
    >
      {isLoading && (
        <>
          <div
            className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'
            aria-hidden='true'
          />
          <span className='sr-only' id={`${props.id}-loading`}>
            {loadingText}
          </span>
        </>
      )}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
    </button>
  )
}

// Enhanced form input with accessibility features
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showLabel?: boolean
}

export function AccessibleInput({
  label,
  error,
  helperText,
  showLabel = true,
  className,
  id,
  ...props
}: AccessibleInputProps) {
  const inputId =
    id || `input-${Math.random().toString(36).substr(RANDOM_ID_START_INDEX, RANDOM_ID_LENGTH)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined

  return (
    <div className='space-y-1'>
      <label
        htmlFor={inputId}
        className={cn(
          'block text-sm font-medium text-gray-700 dark:text-gray-300',
          !showLabel && 'sr-only',
        )}
      >
        {label}
        {props.required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      <input
        id={inputId}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600',
          'dark:bg-gray-800 dark:text-gray-100',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...props}
      />

      {helperText && (
        <p id={helperId} className='text-xs text-gray-500 dark:text-gray-400'>
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className='text-xs text-red-600 dark:text-red-400' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}

// Skip navigation component for better keyboard accessibility
export function SkipNavigation() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#footer', text: 'Skip to footer' },
  ]

  return (
    <div className='sr-only focus-within:not-sr-only'>
      <div className='fixed top-0 left-0 z-50 flex gap-2 p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
        {skipLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200'
          >
            {link.text}
          </a>
        ))}
      </div>
    </div>
  )
}

// Accessible modal/dialog component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}: AccessibleModalProps) {
  const { announceToScreenReader } = useAccessibilityEnhancements()

  useEffect(() => {
    if (!isOpen) return

    // Announce modal opening
    announceToScreenReader(`Modal opened: ${title}`)

    // Focus trap and escape key handling
    const focusableElements =
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    const modal = document.querySelector('[role="dialog"]') as HTMLElement
    if (!modal) return

    const focusableContent = modal.querySelectorAll(focusableElements) as NodeListOf<HTMLElement>
    const firstFocusableElement = focusableContent[0]
    const lastFocusableElement = focusableContent[focusableContent.length - 1]

    // Focus first element
    firstFocusableElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
        return
      }

      if (e.key === 'Tab') {
        handleTabNavigation(e, firstFocusableElement, lastFocusableElement)
      }
    }

    const handleTabNavigation = (
      e: KeyboardEvent,
      first: HTMLElement | undefined,
      last: HTMLElement | undefined,
    ) => {
      const activeElement = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (activeElement === first) {
          last?.focus()
          e.preventDefault()
        }
      } else {
        if (activeElement === last) {
          first?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      announceToScreenReader('Modal closed')
    }
  }, [isOpen, onClose, closeOnEscape, title, announceToScreenReader])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm'
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden='true'
      />

      {/* Modal content */}
      <div className='relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-screen overflow-y-auto'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 id='modal-title' className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h2>
          <AccessibleButton
            variant='ghost'
            size='sm'
            onClick={onClose}
            aria-label='Close modal'
            className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            <span aria-hidden='true'>&times;</span>
          </AccessibleButton>
        </div>

        <div className='p-4'>{children}</div>
      </div>
    </div>
  )
}
