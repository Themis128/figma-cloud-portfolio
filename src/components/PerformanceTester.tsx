"use client";

import { BarChart3, Download, Play, Square } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TestResult {
  name: string;
  duration: number;
  status: "success" | "warning" | "error";
  details?: string;
}

// ---------------------------------------------------------------------------
// Real browser Performance API test functions
// ---------------------------------------------------------------------------

function runBundleSizeTest(): TestResult {
  const start = performance.now();
  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];

  const transferTotal = resources.reduce(
    (sum, r) => sum + (r.transferSize ?? 0),
    0,
  );
  const bodyTotal = resources.reduce(
    (sum, r) => sum + (r.encodedBodySize ?? 0),
    0,
  );
  const jsFiles = resources.filter((r) => r.initiatorType === "script");
  const largeChunks = jsFiles.filter(
    (r) => (r.encodedBodySize ?? 0) > 500_000,
  );

  const transferMB = (transferTotal / 1_048_576).toFixed(2);
  const savings =
    bodyTotal > 0
      ? Math.round((1 - transferTotal / bodyTotal) * 100)
      : 0;

  const status =
    transferTotal < 1_048_576
      ? "success"
      : transferTotal < 3_145_728
        ? "warning"
        : "error";

  return {
    name: "Bundle Size Analysis",
    duration: Math.round(performance.now() - start),
    status,
    details: `Transfer: ${transferMB}MB across ${resources.length} resources. ${jsFiles.length} JS files. ${savings}% compression savings. ${largeChunks.length > 0 ? `${largeChunks.length} chunk(s) over 500KB.` : "All chunks under 500KB."}`,
  };
}

function runImageOptimizationTest(): TestResult {
  const start = performance.now();
  const images = Array.from(document.querySelectorAll("img"));

  const withoutAlt = images.filter((img) => !img.alt);
  const notLazy = images.filter(
    (img) => img.loading !== "lazy" && !img.complete,
  );
  const withoutDimensions = images.filter((img) => !img.width || !img.height);
  const webpImages = images.filter(
    (img) =>
      img.currentSrc.includes(".webp") ||
      img.currentSrc.includes("fm=webp") ||
      img.currentSrc.includes("format=webp"),
  );

  const issues: string[] = [];
  if (withoutAlt.length > 0) issues.push(`${withoutAlt.length} missing alt`);
  if (notLazy.length > 0) issues.push(`${notLazy.length} not lazy-loaded`);
  if (withoutDimensions.length > 0)
    issues.push(`${withoutDimensions.length} missing dimensions`);

  const status =
    issues.length === 0 ? "success" : issues.length === 1 ? "warning" : "error";

  return {
    name: "Image Optimization Check",
    duration: Math.round(performance.now() - start),
    status,
    details: `${images.length} images found. ${webpImages.length} use WebP. ${issues.length === 0 ? "All images optimized." : `Issues: ${issues.join(", ")}.`}`,
  };
}

function runFontLoadingTest(): TestResult {
  const start = performance.now();
  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];

  const fontResources = resources.filter((r) =>
    /\.(woff2?|ttf|otf|eot)/i.test(r.name),
  );
  const slowFonts = fontResources.filter((r) => r.duration > 200);
  const preloaded = document.querySelectorAll(
    'link[rel="preload"][as="font"]',
  ).length;

  const fontFaceSet = document.fonts;
  const allFonts = Array.from(fontFaceSet);
  const loadedFonts = allFonts.filter((f) => f.status === "loaded").length;

  const status =
    slowFonts.length === 0 ? "success" : slowFonts.length <= 1 ? "warning" : "error";

  return {
    name: "Font Loading Test",
    duration: Math.round(performance.now() - start),
    status,
    details: `${loadedFonts}/${allFonts.length} fonts loaded. ${fontResources.length} font file(s) fetched. ${preloaded} preloaded. ${slowFonts.length > 0 ? `${slowFonts.length} font(s) over 200ms.` : "All fonts loaded efficiently."}`,
  };
}

function runJSExecutionTest(): TestResult {
  const start = performance.now();
  const nav = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;
  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];

  const jsResources = resources.filter((r) => r.initiatorType === "script");
  const totalScriptFetch = jsResources.reduce((sum, r) => sum + r.duration, 0);

  const tti = nav ? Math.round(nav.domInteractive - nav.fetchStart) : null;
  const domProcessing = nav
    ? Math.round(
        nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      )
    : null;

  const status =
    (tti ?? 0) < 3000 ? "success" : (tti ?? 0) < 7000 ? "warning" : "error";

  return {
    name: "JavaScript Execution Time",
    duration: Math.round(performance.now() - start),
    status,
    details: `${jsResources.length} scripts loaded. Total script fetch: ${Math.round(totalScriptFetch)}ms.${tti !== null ? ` Time to interactive: ${tti}ms.` : ""}${domProcessing !== null ? ` DOM processing: ${domProcessing}ms.` : ""}`,
  };
}

function runMemoryTest(): TestResult {
  const start = performance.now();
  const perfWithMemory = performance as typeof performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };

  if (!perfWithMemory.memory) {
    return {
      name: "Memory Usage Analysis",
      duration: Math.round(performance.now() - start),
      status: "success",
      details:
        "Memory API unavailable in this browser. Open in Chrome for heap profiling.",
    };
  }

  const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
    perfWithMemory.memory;
  const usedMB = (usedJSHeapSize / 1_048_576).toFixed(1);
  const totalMB = (totalJSHeapSize / 1_048_576).toFixed(1);
  const limitMB = (jsHeapSizeLimit / 1_048_576).toFixed(0);
  const usagePct = Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100);

  const status =
    usagePct < 50 ? "success" : usagePct < 80 ? "warning" : "error";

  return {
    name: "Memory Usage Analysis",
    duration: Math.round(performance.now() - start),
    status,
    details: `${usedMB}MB used / ${totalMB}MB allocated (${usagePct}% of ${limitMB}MB limit). ${status === "success" ? "Heap usage healthy." : status === "warning" ? "Elevated heap usage." : "High memory pressure."}`,
  };
}

function runNetworkTest(): TestResult {
  const start = performance.now();
  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];

  const compressed = resources.filter(
    (r) => r.encodedBodySize > 0 && r.encodedBodySize < r.decodedBodySize,
  );
  const cached = resources.filter(
    (r) => r.transferSize === 0 && r.decodedBodySize > 0,
  );
  const slow = resources.filter((r) => r.duration > 500);

  const status =
    slow.length === 0 ? "success" : slow.length <= 2 ? "warning" : "error";

  return {
    name: "Network Request Optimization",
    duration: Math.round(performance.now() - start),
    status,
    details: `${resources.length} requests total. ${compressed.length} compressed, ${cached.length} served from cache. ${slow.length > 0 ? `${slow.length} request(s) over 500ms.` : "All requests completed quickly."}`,
  };
}

const TESTS: Array<() => TestResult> = [
  runBundleSizeTest,
  runImageOptimizationTest,
  runFontLoadingTest,
  runJSExecutionTest,
  runMemoryTest,
  runNetworkTest,
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PerformanceTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  const runPerformanceTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const newResults: TestResult[] = [];

    for (let i = 0; i < TESTS.length; i++) {
      const testFn = TESTS[i];
      if (!testFn) continue;

      // Brief pause between tests so results reveal sequentially
      await new Promise((resolve) => setTimeout(resolve, 350));

      const result = testFn();
      newResults.push(result);
      setResults([...newResults]);
      setProgress(((i + 1) / TESTS.length) * 100);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  const exportResults = () => {
    const csvContent = [
      "Test Name,Duration (ms),Status,Details",
      ...results.map(
        (r) => `"${r.name}",${r.duration},"${r.status}","${r.details}"`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-test-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
              Live measurements from the browser Performance API
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
              <Button
                variant="outline"
                onClick={exportResults}
                className="flex items-center gap-2"
              >
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
              {results.map((result) => (
                <div
                  key={result.name}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                >
                  <span className="text-lg">
                    {getStatusIcon(result.status)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name}</span>
                      <span
                        className={`text-sm ${getStatusColor(result.status)}`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Measured in: {result.duration}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {results.filter((r) => r.status === "success").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {results.filter((r) => r.status === "warning").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {results.filter((r) => r.status === "error").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
