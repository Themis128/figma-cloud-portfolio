'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, useState } from 'react'
import { Toaster as Sonner } from 'sonner'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Query client timing constants
  const STALE_TIME_MINUTES = 1
  const GC_TIME_MINUTES = 5
  const MS_PER_SECOND = 1000
  const SECONDS_PER_MINUTE = 60

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND, // 1 minute
            gcTime: GC_TIME_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange={false}
          storageKey='portfolio-theme'
        >
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster />
            <Sonner
              position='bottom-right'
              toastOptions={{
                classNames: {
                  toast:
                    'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                  description: 'group-[.toast]:text-muted-foreground',
                  actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                  cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
