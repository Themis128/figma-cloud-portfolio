import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster as Sonner } from 'sonner'
import AccessibilityEnhancer from '@/components/AccessibilityEnhancer'
import AIAssistant from '@/components/AIAssistant'
import ErrorBoundary from '@/components/ErrorBoundary'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { PageLoader } from '@/components/LoadingAnimations'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import PerformanceOptimizer from '@/components/PerformanceOptimizer'
import { PWAInstallButton } from '@/components/PWAInstallButton'
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification'
import ResourcePreloader from '@/components/ResourcePreloader'
import { PersonStructuredData, WebsiteStructuredData } from '@/components/StructuredData'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useViewTransition } from '@/components/ViewTransitionWrapper'
import VoiceCommandButton from '@/components/VoiceCommandButton'
import Index from './pages/Index'

// Initialize View Transition styles
const initViewTransitionStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      /* View Transition animations */
      ::view-transition-old(root) {
        animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      ::view-transition-new(root) {
        animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      ::view-transition-old(root) {
        animation-name: fade-out;
      }

      ::view-transition-new(root) {
        animation-name: fade-in;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      /* Smooth page transitions */
      .page-enter {
        animation: slide-up 300ms ease-out;
      }

      .page-exit {
        animation: slide-down 300ms ease-in;
      }

      @keyframes slide-up {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slide-down {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
  }
}

// Initialize styles on component mount
initViewTransitionStyles()

// Import Index directly (no lazy loading for main page)
import Projects from './pages/Projects'

// Lazy load other pages for code splitting with preloading
const About = lazy(() => import('./pages/About'))
const Product = lazy(() => import('./pages/Product'))
const Contact = lazy(() => import('./pages/Contact'))
const Performance = lazy(() => import('./pages/Performance'))
const Resume = lazy(() => import('./pages/Resume'))
const Settings = lazy(() => import('./pages/Settings'))
const Agents = lazy(() => import('./pages/Agents'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Preload critical pages on idle
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload critical pages after initial render
    import('./pages/About')
    import('./pages/Contact')
    import('./pages/Resume')
  })
}

// Route transition wrapper component
const RouteTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { triggerTransition } = useViewTransition()

  React.useEffect(() => {
    // Trigger view transition on route change
    triggerTransition(() => {
      // The actual route change happens through React Router
    })
  }, [triggerTransition])

  return <>{children}</>
}

const queryClient = new QueryClient()

const App = () => {
  const recaptchaKey = import.meta.env['VITE_RECAPTCHA_SITE_KEY'] || import.meta.env['RECAPTCHA_SITE_KEY']
  const hasRecaptcha = recaptchaKey && recaptchaKey.trim() !== ''

  const AppContent = () => (
    <ResourcePreloader>
      <PerformanceOptimizer>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <TooltipProvider>
                {/* Global Structured Data */}
                <PersonStructuredData />
                <WebsiteStructuredData />

                <Toaster />
                <Sonner />
                <PWAInstallButton />
                <PWAUpdateNotification />
                <VoiceCommandButton />
                <AIAssistant />
                <AccessibilityEnhancer />
                <BrowserRouter basename='/'>
                  <GoogleAnalytics />
                  <PerformanceMonitor />
                  <Suspense fallback={<PageLoader />}>
                    <RouteTransitionWrapper>
                      <Routes>
                        <Route path='/' element={<Index />} />
                        <Route path='/about' element={<About />} />
                        <Route path='/product' element={<Product />} />
                        <Route path='/contact' element={<Contact />} />
                        <Route path='/performance' element={<Performance />} />
                        <Route path='/resume' element={<Resume />} />
                        <Route path='/settings' element={<Settings />} />
                        <Route path='/agents' element={<Agents />} />
                        <Route path='/projects' element={<Projects />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path='*' element={<NotFound />} />
                      </Routes>
                    </RouteTransitionWrapper>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </PerformanceOptimizer>
    </ResourcePreloader>
  )

  return hasRecaptcha ? (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <AppContent />
    </GoogleReCaptchaProvider>
  ) : (
    <AppContent />
  )
}

export default App
