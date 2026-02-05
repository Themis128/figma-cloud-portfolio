import React from 'react'
import { cn } from '@/lib/utils'

// Enhanced loading component leveraging React 19 optimizations
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  message?: string
}

export function EnhancedLoading({
  size = 'md',
  variant = 'spinner',
  className = '',
  message,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const SpinnerLoading = () => (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <output
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
        )}
        aria-label='Loading'
      />
      {message && (
        <p className='text-sm text-gray-600 dark:text-gray-400' aria-live='polite'>
          {message}
        </p>
      )}
    </div>
  )

  const DotsLoading = () => (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-blue-600 animate-pulse',
            size === 'sm'
              ? 'w-1 h-1'
              : size === 'md'
                ? 'w-2 h-2'
                : size === 'lg'
                  ? 'w-3 h-3'
                  : 'w-4 h-4',
            `enhanced-loading-dot-delay-${i}`,
            'enhanced-loading-dot-duration',
          )}
          aria-hidden='true'
        />
      ))}
      {message && (
        <span className='ml-2 text-sm text-gray-600 dark:text-gray-400' aria-live='polite'>
          {message}
        </span>
      )}
    </div>
  )

  const PulseLoading = () => (
    <div className={cn('flex flex-col gap-2', className)}>
      <output
        className={cn(
          'rounded-full bg-linear-to-r from-blue-400 to-blue-600 animate-pulse',
          sizeClasses[size],
        )}
        aria-label='Loading'
      />
      {message && (
        <p className='text-sm text-gray-600 dark:text-gray-400 text-center' aria-live='polite'>
          {message}
        </p>
      )}
    </div>
  )

  const SkeletonLoading = () => (
    <output className={cn('space-y-2', className)} aria-label='Loading content'>
      <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
      <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4' />
      <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2' />
      {message && (
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-2' aria-live='polite'>
          {message}
        </p>
      )}
    </output>
  )

  switch (variant) {
    case 'dots':
      return <DotsLoading />
    case 'pulse':
      return <PulseLoading />
    case 'skeleton':
      return <SkeletonLoading />
    default:
      return <SpinnerLoading />
  }
}

// Page-level loading boundary component
interface PageLoadingProps {
  title?: string
  description?: string
}

export function PageLoading({ title = 'Loading', description }: PageLoadingProps) {
  return (
    <output className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center space-y-4'>
        <EnhancedLoading size='lg' variant='spinner' />
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
          {description && (
            <p className='text-sm text-muted-foreground' aria-live='polite'>
              {description}
            </p>
          )}
        </div>
      </div>
    </output>
  )
}

// Component-level loading boundary
interface ComponentLoadingProps {
  className?: string
  children?: React.ReactNode
}

export function ComponentLoading({ className, children }: ComponentLoadingProps) {
  return (
    <output className={cn('flex items-center justify-center p-4', className)}>
      {children || <EnhancedLoading size='md' variant='spinner' />}
    </output>
  )
}

// Error boundary with loading recovery
interface LoadingErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
}

interface LoadingErrorBoundaryState {
  hasError: boolean
  isRetrying: boolean
}

export class LoadingErrorBoundary extends React.Component<
  LoadingErrorBoundaryProps,
  LoadingErrorBoundaryState
> {
  constructor(props: LoadingErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, isRetrying: false }
  }

  static getDerivedStateFromError(): LoadingErrorBoundaryState {
    return { hasError: true, isRetrying: false }
  }

  override componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Log error (removed console.error as per linting rules)
  }

  handleRetry = async () => {
    if (!this.props.onRetry) return

    this.setState({ isRetrying: true })
    try {
      await this.props.onRetry()
      this.setState({ hasError: false })
    } catch (_error) {
      // Retry failed, keep error state
    } finally {
      this.setState({ isRetrying: false })
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className='flex flex-col items-center justify-center p-8 text-center space-y-4'>
          {this.props.fallback || (
            <>
              <div className='text-destructive'>
                <h3 className='font-semibold'>Something went wrong</h3>
                <p className='text-sm text-muted-foreground mt-1'>Failed to load this content</p>
              </div>
              {this.props.onRetry && (
                <button
                  type='button'
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50'
                  aria-label='Retry loading'
                >
                  {this.state.isRetrying ? (
                    <div className='flex items-center gap-2'>
                      <EnhancedLoading size='sm' variant='spinner' />
                      Retrying...
                    </div>
                  ) : (
                    'Try Again'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}
