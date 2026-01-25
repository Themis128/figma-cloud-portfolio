import ErrorBoundary from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/LoadingAnimations";
import ResourcePreloader from "@/components/ResourcePreloader";
import { PersonStructuredData, WebsiteStructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ViewTransitionWrapper from "@/components/ViewTransitionWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "sonner";
import Index from "./pages/Index";

const logger = {
  info: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
};

// Initialize View Transition styles
const initViewTransitionStyles = () => {
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    try {
      // Check if View Transition API is supported
      const isViewTransitionSupported = "viewTransition" in document;

      const style = document.createElement("style");
      style.textContent = `
        /* View Transition animations - only if supported */
        ${
          isViewTransitionSupported
            ? `
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
        `
            : ""
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
      `;
      document.head.appendChild(style);
    } catch (error) {
      logger.warn("Failed to initialize View Transition styles:", error);
    }
  }
};

// Initialize styles on component mount
initViewTransitionStyles();

// Import Index directly (no lazy loading for main page)
import Projects from "./pages/Projects";

// Lazy load other pages for code splitting with preloading
const About = lazy(() => import("./pages/About"));
const Product = lazy(() => import("./pages/Product"));
const Contact = lazy(() => import("./pages/Contact"));
const Performance = lazy(() => import("./pages/Performance"));
const Resume = lazy(() => import("./pages/Resume"));
const Settings = lazy(() => import("./pages/Settings"));
const Agents = lazy(() => import("./pages/Agents"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load non-essential components for better initial performance
const AccessibilityEnhancer = lazy(() => import("@/components/AccessibilityEnhancer"));
const AIAssistant = lazy(() => import("@/components/AIAssistant"));
const GoogleAnalytics = lazy(() => import("@/components/GoogleAnalytics"));
const PerformanceMonitor = lazy(() =>
  import("@/components/PerformanceMonitor").then((module) => ({
    default: module.PerformanceMonitor,
  })),
);
const PerformanceOptimizer = lazy(() => import("@/components/PerformanceOptimizer"));
const PWAInstallButton = lazy(() =>
  import("@/components/PWAInstallButton").then((module) => ({ default: module.PWAInstallButton })),
);
const PWAUpdateNotification = lazy(() =>
  import("@/components/PWAUpdateNotification").then((module) => ({
    default: module.PWAUpdateNotification,
  })),
);
const VoiceCommandButton = lazy(() => import("@/components/VoiceCommandButton"));
const NotificationButton = lazy(() =>
  import("@/components/NotificationButton").then((module) => ({
    default: module.NotificationButton,
  })),
);

// Component to lazy load non-essential components after initial render
const LazyLoadedComponents: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load components after initial render and a short delay
    const LAZY_LOAD_DELAY = 100;
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, LAZY_LOAD_DELAY); // Small delay to prioritize initial page render

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Toaster />
      <Sonner />
      <PWAInstallButton />
      <PWAUpdateNotification />
      <VoiceCommandButton />
      <AIAssistant />
      <AccessibilityEnhancer />
      <NotificationButton />
    </Suspense>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const recaptchaKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.RECAPTCHA_SITE_KEY;
  const hasRecaptcha = recaptchaKey && recaptchaKey.trim() !== "";

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

                <LazyLoadedComponents />
                <BrowserRouter basename='/'>
                  <GoogleAnalytics />
                  <PerformanceMonitor />
                  <Suspense fallback={<PageLoader />}>
                    <ViewTransitionWrapper>
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
                    </ViewTransitionWrapper>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </PerformanceOptimizer>
    </ResourcePreloader>
  );

  return hasRecaptcha ? (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <AppContent />
    </GoogleReCaptchaProvider>
  ) : (
    <AppContent />
  );
};

export default App;
