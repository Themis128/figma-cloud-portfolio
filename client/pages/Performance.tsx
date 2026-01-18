import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Performance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 text-white hover:text-cyan-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Performance Dashboard</h1>
          <p className="text-slate-300">
            Monitor Core Web Vitals and performance metrics in real-time
          </p>
        </div>

        <div className="space-y-6">
          <PerformanceDashboard />

          <PushNotificationTester />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • <strong>LCP</strong>: Ensure your largest content element loads quickly
                </li>
                <li>
                  • <strong>CLS</strong>: Avoid layout shifts by reserving space for dynamic content
                </li>
                <li>
                  • <strong>FCP</strong>: Optimize above-the-fold content loading
                </li>
                <li>
                  • <strong>TTFB</strong>: Improve server response times
                </li>
                <li>• Use lazy loading for images and components</li>
                <li>• Implement proper caching strategies</li>
                <li>• Minimize bundle sizes with code splitting</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Optimization Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Image Optimization</span>
                  <span className="text-green-500 text-sm">✅ Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Code Splitting</span>
                  <span className="text-green-500 text-sm">✅ Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bundle Analysis</span>
                  <span className="text-green-500 text-sm">✅ Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Caching Strategy</span>
                  <span className="text-green-500 text-sm">✅ Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Core Web Vitals</span>
                  <span className="text-green-500 text-sm">✅ Monitoring</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
