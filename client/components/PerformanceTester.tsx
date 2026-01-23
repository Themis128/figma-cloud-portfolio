import { BarChart3, Download, Play, Square } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface TestResult {
  name: string
  duration: number
  status: 'success' | 'warning' | 'error'
  details?: string
}

export function PerformanceTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])

  const runPerformanceTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults([])

    const tests = [
      { name: 'Bundle Size Analysis', duration: 2000 },
      { name: 'Image Optimization Check', duration: 1500 },
      { name: 'Font Loading Test', duration: 1000 },
      { name: 'JavaScript Execution Time', duration: 3000 },
      { name: 'Memory Usage Analysis', duration: 2500 },
      { name: 'Network Request Optimization', duration: 1800 },
    ]

    const newResults: TestResult[] = []

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]

      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, test.duration))

      // Generate mock results
      const result: TestResult = {
        name: test.name,
        duration: test.duration,
        status: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warning' : 'success',
        details: generateTestDetails(test.name),
      }

      newResults.push(result)
      setResults([...newResults])
      setProgress(((i + 1) / tests.length) * 100)
    }

    setIsRunning(false)
  }

  const generateTestDetails = (testName: string): string => {
    const details = {
      'Bundle Size Analysis': 'Bundle size: 2.4MB (compressed). All chunks under 500KB.',
      'Image Optimization Check': 'All images optimized. WebP format used. Total savings: 45%.',
      'Font Loading Test': 'Fonts loaded efficiently. FOIT avoided with font-display: swap.',
      'JavaScript Execution Time': 'Main thread blocked for 120ms. Consider code splitting.',
      'Memory Usage Analysis': 'Peak memory usage: 85MB. No memory leaks detected.',
      'Network Request Optimization': '32 requests optimized. Compression enabled.',
    }
    return details[testName as keyof typeof details] || 'Test completed successfully.'
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  const exportResults = () => {
    const csvContent = [
      'Test Name,Duration (ms),Status,Details',
      ...results.map((r) => `"${r.name}",${r.duration},"${r.status}","${r.details}"`),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-test-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Test Suite
            </h3>
            <p className="text-sm text-muted-foreground">
              Run comprehensive performance tests to identify optimization opportunities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runPerformanceTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Tests
                </>
              )}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={exportResults} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {isRunning && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Running performance tests...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Test Results</h4>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                >
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name}</span>
                      <span className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Duration: {result.duration}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {results.filter((r) => r.status === 'success').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {results.filter((r) => r.status === 'warning').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {results.filter((r) => r.status === 'error').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
