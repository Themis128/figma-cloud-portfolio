import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PWAInstallButton } from '@/components/PWAInstallButton'
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification'
import { PageSkeleton } from '@/components/Skeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

// Lazy load pages for code splitting
const Index = lazy(() => import('./pages/Index'))
const About = lazy(() => import('./pages/About'))
const Product = lazy(() => import('./pages/Product'))
const Contact = lazy(() => import('./pages/Contact'))
const Performance = lazy(() => import('./pages/Performance'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading component for Suspense fallback
const PageLoader = () => <PageSkeleton />

const queryClient = new QueryClient()

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallButton />
          <PWAUpdateNotification />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/product" element={<Product />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/performance" element={<Performance />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
)

export default App
