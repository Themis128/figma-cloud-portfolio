import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

interface PerformanceDashboardProps {
  className?: string
  compact?: boolean
}

export function PerformanceDashboard({ className, compact = false }: PerformanceDashboardProps) {
  const { isSupported, performanceScore, formattedMetrics } = usePerformanceMonitoring()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-sm text-muted-foreground">
          Performance monitoring not supported in this browser
        </div>
      </Card>
    )
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good':
        return 'bg-green-500'
      case 'needs-improvement':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getScoreText = (score: string) => {
    switch (score) {
      case 'good':
        return 'Good'
      case 'needs-improvement':
        return 'Needs Improvement'
      case 'poor':
        return 'Poor'
      default:
        return 'Unknown'
    }
  }

  if (compact) {
    return (
      <Card
        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
        onClick={() => { setIsExpanded(!isExpanded); }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceScore)}`} />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getScoreText(performanceScore)}
          </Badge>
        </div>
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {Object.entries(formattedMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Performance Dashboard</h3>
          <Badge className={`${getScoreColor(performanceScore)} text-white`}>
            {getScoreText(performanceScore)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formattedMetrics).map(([key, value]) => {
            const isMeasured = value !== 'Not measured'
            const numericValue = isMeasured ? parseFloat(value.replace(/[^\d.]/g, '')) : 0

            // Define thresholds for progress bars
            let maxValue = 100
            let progressValue = 0

            if (key.includes('LCP')) {
              maxValue = 4000 // 4s
              progressValue = Math.min((numericValue / maxValue) * 100, 100)
            } else if (key.includes('CLS')) {
              maxValue = 0.25 // 0.25
              progressValue = Math.min((numericValue / maxValue) * 100, 100)
            } else if (key.includes('FCP') || key.includes('TTFB')) {
              maxValue = 2000 // 2s
              progressValue = Math.min((numericValue / maxValue) * 100, 100)
            }

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{key}</span>
                  <span className="text-sm font-mono text-muted-foreground">{value}</span>
                </div>
                {isMeasured && <Progress value={progressValue} className="h-2" />}
              </div>
            )
          })}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Core Web Vitals:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>LCP</strong> (Largest Contentful Paint): Should be &lt; 2.5s
            </li>
            <li>
              <strong>CLS</strong> (Cumulative Layout Shift): Should be &lt; 0.1
            </li>
            <li>
              <strong>FCP</strong> (First Contentful Paint): Should be &lt; 1.8s
            </li>
            <li>
              <strong>TTFB</strong> (Time to First Byte): Should be &lt; 800ms
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
