import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { NetworkOptimizer } from '@/components/NetworkOptimizer'
import { LoadingErrorBoundary, PageLoading } from '@/components/ui/enhanced-loading'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { CookieConsentBar } from '@/components/CookieConsentBar'
import { AccessibilityButton } from '@/components/ui/AccessibilityButton'
import { Suspense as ReactSuspense } from 'react'
const Navigation = lazy(() => import('@/components/Navigation'))

// Conditionally import GoogleAnalytics based on environment
let GoogleAnalytics: React.ComponentType
if (import.meta.env.MODE === 'test') {
  // Provide a simple stub for test environments
  GoogleAnalytics = () => <div data-testid='google-analytics' />
} else {
  GoogleAnalytics = lazy(() => import('@/components/GoogleAnalytics'))
}

const ThemeProvider = lazy(() =>
  import('@/components/ThemeProvider').then((module) => ({ default: module.ThemeProvider })),
)

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'))

const About = lazy(() => import('./pages/About'))
const Agents = lazy(() => import('./pages/Agents'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Performance = lazy(() => import('./pages/Performance'))
const Product = lazy(() => import('./pages/Product'))
const Projects = lazy(() => import('./pages/Projects'))
const Resume = lazy(() => import('./pages/Resume'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  // Initialize performance monitoring globally
  usePerformanceMonitoring()

  return (
    <NetworkOptimizer>
      <LoadingErrorBoundary onRetry={() => window.location.reload()}>
        <HelmetProvider>
          <ThemeProvider defaultTheme='dark' storageKey='portfolio-theme'>
            <BrowserRouter>
              {import.meta.env.MODE === 'test' ? (
                <GoogleAnalytics />
              ) : (
                <Suspense fallback={null}>
                  <GoogleAnalytics />
                </Suspense>
              )}
              {/* Global Navigation bar */}
              <ReactSuspense
                fallback={<div className='h-16 md:h-20 bg-slate-900/80 backdrop-blur-sm'></div>}
              >
                <Navigation />
              </ReactSuspense>
              <Suspense
                fallback={
                  <PageLoading
                    title='Loading Portfolio'
                    description='Preparing your experience...'
                  />
                }
              >
                <Routes>
                  <Route path='/' element={<Index />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/agents' element={<Agents />} />
                  <Route path='/contact' element={<Contact />} />
                  <Route path='/performance' element={<Performance />} />
                  <Route path='/product' element={<Product />} />
                  <Route path='/projects' element={<Projects />} />
                  <Route path='/resume' element={<Resume />} />
                  <Route path='/settings' element={<Settings />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
                <CookieConsentBar />
                <AccessibilityButton />
              </Suspense>
            </BrowserRouter>
          </ThemeProvider>
        </HelmetProvider>
      </LoadingErrorBoundary>
    </NetworkOptimizer>
  )
}

export default App
