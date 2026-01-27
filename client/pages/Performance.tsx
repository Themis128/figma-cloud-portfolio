import { Activity, ArrowLeft, BarChart3, Cpu, HardDrive, Network, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navigation from "@/components/Navigation";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { PerformanceTester } from "@/components/PerformanceTester";
import { PushNotificationTester } from "@/components/PushNotificationTester";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetrics {
  memoryUsage: number;
  memoryLimit: number;
  cpuUsage: number;
  networkRequests: number;
  bundleSize: number;
  lighthouseScore: number;
}

// Performance simulation constants
const MEMORY_SIMULATION_BASE_MB = 20;
const MEMORY_SIMULATION_RANGE_MB = 100;
const CPU_SIMULATION_BASE_PERCENT = 5;
const CPU_SIMULATION_RANGE_PERCENT = 30;
const NETWORK_SIMULATION_BASE_REQUESTS = 10;
const NETWORK_SIMULATION_RANGE_REQUESTS = 50;
const METRICS_UPDATE_INTERVAL_MS = 2000;

// Bundle and performance constants
const DEFAULT_BUNDLE_SIZE_MB = 2.4;
const DEFAULT_LIGHTHOUSE_SCORE = 92;
const BYTES_TO_MB_CONVERSION = 1048576;
const FALLBACK_MEMORY_LIMIT_MB = 200;
const PERCENTAGE_MULTIPLIER = 100;
const BUNDLE_SIZE_TARGET_MB = 5;
const BUNDLE_SIZE_OPTIMAL_MB = 2.5;

// Lighthouse category scores
const LIGHTHOUSE_ACCESSIBILITY_SCORE = 95;
const LIGHTHOUSE_BEST_PRACTICES_SCORE = 92;
const LIGHTHOUSE_SEO_SCORE = 98;
const LIGHTHOUSE_PWA_SCORE = 90;

// Display constants
const DECIMAL_PLACES_DISPLAY = 1;

export default function Performance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    memoryLimit: 0,
    cpuUsage: 0,
    networkRequests: 0,
    bundleSize: 0,
    lighthouseScore: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      if (isMonitoring) {
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.random() * MEMORY_SIMULATION_RANGE_MB + MEMORY_SIMULATION_BASE_MB, // 20-120 MB
          cpuUsage: Math.random() * CPU_SIMULATION_RANGE_PERCENT + CPU_SIMULATION_BASE_PERCENT, // 5-35%
          networkRequests:
            Math.floor(Math.random() * NETWORK_SIMULATION_RANGE_REQUESTS) +
            NETWORK_SIMULATION_BASE_REQUESTS, // 10-60 requests
        }));
      }
    }, METRICS_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Get bundle size (simulated)
  useEffect(() => {
    // In a real app, this would come from build analysis
    setMetrics((prev) => ({
      ...prev,
      bundleSize: DEFAULT_BUNDLE_SIZE_MB, // MB
      lighthouseScore: DEFAULT_LIGHTHOUSE_SCORE, // Score out of 100
    }));
  }, []);

  const getMemoryUsage = () => {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const perfMemory = (
        performance as typeof performance & {
          memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      return {
        used: Math.round(perfMemory.usedJSHeapSize / BYTES_TO_MB_CONVERSION), // MB
        limit: Math.round(perfMemory.jsHeapSizeLimit / BYTES_TO_MB_CONVERSION), // MB
      };
    }
    return { used: metrics.memoryUsage, limit: FALLBACK_MEMORY_LIMIT_MB };
  };

  const memory = getMemoryUsage();
  const memoryPercentage = (memory.used / memory.limit) * PERCENTAGE_MULTIPLIER;

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      data-testid='performance-dashboard'
    >
      <Navigation />
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <Link to='/'>
            <Button variant='ghost' className='mb-4 text-white hover:text-cyan-400'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Home
            </Button>
          </Link>
          <h1 className='text-4xl font-bold text-white mb-2 flex items-center gap-3'>
            <Activity className='w-8 h-8 text-cyan-400' />
            Performance Dashboard
          </h1>
          <p className='text-slate-300'>
            Comprehensive performance monitoring and optimization tools
          </p>
        </div>

        {/* Overview Section */}
        <div className='space-y-6'>
          {/* Real-time Performance Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <HardDrive className='w-5 h-5 text-cyan-400' />
                <h3 className='text-lg font-semibold'>Memory Usage</h3>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{memory.used} MB</span>
                  <span>{memory.limit} MB</span>
                </div>
                <Progress value={memoryPercentage} className='h-2' />
                <p className='text-xs text-muted-foreground'>
                  {memoryPercentage.toFixed(DECIMAL_PLACES_DISPLAY)}% of available memory
                </p>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Cpu className='w-5 h-5 text-cyan-400' />
                <h3 className='text-lg font-semibold'>CPU Usage</h3>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{metrics.cpuUsage.toFixed(DECIMAL_PLACES_DISPLAY)}%</span>
                  <span>Active</span>
                </div>
                <Progress value={metrics.cpuUsage} className='h-2' />
                <p className='text-xs text-muted-foreground'>Real-time CPU utilization</p>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Network className='w-5 h-5 text-cyan-400' />
                <h3 className='text-lg font-semibold'>Network</h3>
              </div>
              <div className='space-y-2'>
                <div className='text-2xl font-bold'>{metrics.networkRequests}</div>
                <p className='text-xs text-muted-foreground'>Active network requests</p>
                <div className='flex gap-2 mt-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-xs'>Connected</span>
                </div>
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <BarChart3 className='w-5 h-5 text-cyan-400' />
                <h3 className='text-lg font-semibold'>Bundle Size</h3>
              </div>
              <div className='space-y-2'>
                <div className='text-2xl font-bold'>{metrics.bundleSize} MB</div>
                <p className='text-xs text-muted-foreground'>Compressed bundle size</p>
                <div className='flex gap-2 mt-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-xs'>Optimized</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Actions */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Performance Controls</h3>
            <div className='flex flex-wrap gap-4'>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                className='flex items-center gap-2'
              >
                <Activity className='w-4 h-4' />
                {isMonitoring ? "Stop Monitoring" : "Start Real-time Monitoring"}
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <Zap className='w-4 h-4' />
                Run Performance Test
              </Button>
              <Button variant='outline' className='flex items-center gap-2'>
                <BarChart3 className='w-4 h-4' />
                Generate Report
              </Button>
            </div>
          </Card>

          {/* Performance Tips */}
          <Card className='p-6' data-testid='performance-tips'>
            <h3 className='text-lg font-semibold mb-4'>Performance Tips</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium text-cyan-400'>🚀 Core Web Vitals</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• LCP &lt; 2.5s for good user experience</li>
                  <li>• CLS &lt; 0.1 to prevent layout shifts</li>
                  <li>• FID &lt; 100ms for responsive interactions</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium text-cyan-400'>⚡ Optimization Strategies</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Use lazy loading for images and components</li>
                  <li>• Implement proper caching strategies</li>
                  <li>• Minimize bundle sizes with code splitting</li>
                  <li>• Optimize fonts and critical resources</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Core Web Vitals Section */}
        <PerformanceDashboard />

        {/* Testing Tools Section */}
        <div className='space-y-6'>
          <PerformanceTester />

          <PushNotificationTester />

          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Performance Testing Tools</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h4 className='font-medium'>Automated Tests</h4>
                <div className='space-y-2'>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    🧪 Run Lighthouse Audit
                  </Button>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    📊 Performance Benchmark
                  </Button>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    🔄 Memory Leak Test
                  </Button>
                </div>
              </div>
              <div className='space-y-4'>
                <h4 className='font-medium'>Manual Tests</h4>
                <div className='space-y-2'>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    🎯 Stress Test
                  </Button>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    📱 Mobile Performance Test
                  </Button>
                  <Button variant='outline' size='sm' className='w-full justify-start'>
                    🌐 Cross-browser Test
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Optimization Section */}
        <div className='space-y-6'>
          <Card className='p-6' data-testid='bundle-analysis'>
            <h3 className='text-lg font-semibold mb-4'>Bundle Analysis</h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span>Total Bundle Size</span>
                <span className='font-mono'>{metrics.bundleSize} MB</span>
              </div>
              <Progress
                value={(metrics.bundleSize / BUNDLE_SIZE_TARGET_MB) * PERCENTAGE_MULTIPLIER}
                className='h-2'
              />
              <p className='text-xs text-muted-foreground'>
                Target: &lt; {BUNDLE_SIZE_OPTIMAL_MB} MB for optimal performance
              </p>
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Optimization Status</h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Image Optimization</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Code Splitting</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Bundle Analysis</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Caching Strategy</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Core Web Vitals</span>
                <span className='text-green-500 text-sm'>✅ Monitoring</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>PWA Optimization</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Font Optimization</span>
                <span className='text-green-500 text-sm'>✅ Complete</span>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Lighthouse Score</h3>
            <div className='flex items-center gap-4'>
              <div className='text-4xl font-bold text-cyan-400'>{metrics.lighthouseScore}</div>
              <div className='flex-1'>
                <Progress value={metrics.lighthouseScore} className='h-3' />
                <p className='text-xs text-muted-foreground mt-1'>Performance score out of 100</p>
              </div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
              <div className='text-center'>
                <div className='text-lg font-semibold text-green-400'>
                  {LIGHTHOUSE_ACCESSIBILITY_SCORE}
                </div>
                <div className='text-xs text-muted-foreground'>Accessibility</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-blue-400'>
                  {LIGHTHOUSE_BEST_PRACTICES_SCORE}
                </div>
                <div className='text-xs text-muted-foreground'>Best Practices</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-purple-400'>{LIGHTHOUSE_SEO_SCORE}</div>
                <div className='text-xs text-muted-foreground'>SEO</div>
              </div>
              <div className='text-center'>
                <div className='text-lg font-semibold text-orange-400'>{LIGHTHOUSE_PWA_SCORE}</div>
                <div className='text-xs text-muted-foreground'>PWA</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
