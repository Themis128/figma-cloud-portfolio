import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-testid="skeleton"
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]',
        className,
      )}
      style={{
        animation: 'shimmer 2s infinite linear',
      }}
    />
  )
}

// Predefined skeleton components for common use cases
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4 w-full', className)} />
  }

  return (
    <div data-testid="skeleton-text" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full', // Last line is shorter
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      data-testid="skeleton-card"
      className={cn('rounded-lg border border-slate-700 p-6', className)}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={3} />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  return (
    <Skeleton
      data-testid="skeleton-avatar"
      className={cn('rounded-full', sizeClasses[size], className)}
    />
  )
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton data-testid="skeleton-button" className={cn('h-10 w-24', className)} />
}

// Page-level skeleton loaders
export function PageSkeleton() {
  return (
    <div
      data-testid="page-skeleton"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <SkeletonText lines={2} className="max-w-2xl mx-auto" />
          </div>

          {/* Content skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add shimmer animation to global CSS if not already present
export const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`
