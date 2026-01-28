import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));

const About = lazy(() => import("./pages/About"));
const Agents = lazy(() => import("./pages/Agents"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Performance = lazy(() => import("./pages/Performance"));
const Product = lazy(() => import("./pages/Product"));
const Projects = lazy(() => import("./pages/Projects"));
const Resume = lazy(() => import("./pages/Resume"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  // Initialize performance monitoring globally
  usePerformanceMonitoring();

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme='dark' storageKey='portfolio-theme'>
        <BrowserRouter>
          <GoogleAnalytics />
          <Suspense fallback={<div>Loading...</div>}>
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
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
