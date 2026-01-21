import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster as Sonner } from 'sonner'
import ErrorBoundary from '@/components/ErrorBoundary'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { PWAInstallButton } from '@/components/PWAInstallButton'
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification'
import { PageSkeleton } from '@/components/Skeleton'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

// Import Index directly (no lazy loading for main page)
import Index from './pages/Index'

// Lazy load other pages for code splitting
const About = lazy(() => import('./pages/About'))
const Product = lazy(() => import('./pages/Product'))
const Contact = lazy(() => import('./pages/Contact'))
const Performance = lazy(() => import('./pages/Performance'))
const Resume = lazy(() => import('./pages/Resume'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading component for Suspense fallback
const PageLoader = () => <PageSkeleton />

const queryClient = new QueryClient()

const App = () => {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.RECAPTCHA_SITE_KEY

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey || ''}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PWAInstallButton />
              <PWAUpdateNotification />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <GoogleAnalytics />
                <PerformanceMonitor />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GoogleReCaptchaProvider>
  )
}

export default App
