"use client";

import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  Image,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PageSeoData {
  path: string;
  title: string | null;
  description: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  canonical: string | null;
  robots: string | null;
  structuredData: boolean;
  status: "ok" | "warn" | "error";
  issues: string[];
}

const PAGES = [
  "/",
  "/about/",
  "/product/",
  "/projects/",
  "/resume/",
  "/agents/",
  "/contact/",
  "/performance/",
  "/settings/",
  "/cookies/",
  "/privacy/",
  "/terms/",
];

function extractSeoFromHtml(html: string, path: string): PageSeoData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const title = doc.querySelector("title")?.textContent ?? null;
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
  const ogImage =
    doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null;
  const ogTitle =
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? null;
  const canonical =
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
  const robots =
    doc.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
  const structuredData =
    doc.querySelector('script[type="application/ld+json"]') !== null;

  const issues: string[] = [];
  if (!title) issues.push("Missing <title>");
  if (!description) issues.push("Missing meta description");
  if (description && description.length < 50) issues.push("Meta description too short (<50 chars)");
  if (description && description.length > 160) issues.push("Meta description too long (>160 chars)");
  if (!ogImage) issues.push("Missing og:image");
  if (!ogTitle) issues.push("Missing og:title");
  if (!canonical) issues.push("Missing canonical link");
  if (!structuredData) issues.push("No structured data (JSON-LD)");

  const status = issues.length === 0 ? "ok" : issues.length <= 2 ? "warn" : "error";

  return { path, title, description, ogImage, ogTitle, canonical, robots, structuredData, status, issues };
}

export default function SeoAudit() {
  const [pages, setPages] = useState<PageSeoData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);

  async function runAudit() {
    setScanning(true);
    setPages([]);
    setScannedCount(0);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000 * PAGES.length);

    try {
      const results = await Promise.all(
        PAGES.map(async (path) => {
          try {
            const res = await fetch(path, { cache: "no-store", signal: controller.signal });
            const html = await res.text();
            const result = extractSeoFromHtml(html, path);
            setScannedCount((c) => c + 1);
            return result;
          } catch (err) {
            setScannedCount((c) => c + 1);
            const issue = err instanceof Error && err.name === "AbortError"
              ? "Request timed out"
              : "Failed to fetch page";
            return {
              path,
              title: null,
              description: null,
              ogImage: null,
              ogTitle: null,
              canonical: null,
              robots: null,
              structuredData: false,
              status: "error" as const,
              issues: [issue],
            };
          }
        })
      );

      setPages(results);
    } finally {
      clearTimeout(timeoutId);
    }

    setScanning(false);
  }

  useEffect(() => {
    void runAudit();
  }, []);

  const okCount = pages.filter((p) => p.status === "ok").length;
  const warnCount = pages.filter((p) => p.status === "warn").length;
  const errorCount = pages.filter((p) => p.status === "error").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <div className="text-center shrink-0">
            <p className="text-xl sm:text-2xl font-mono font-bold text-foreground">
              {PAGES.length}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Pages
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-xl sm:text-2xl font-mono font-bold text-green-400">
              {okCount}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Pass
            </p>
          </div>
          {warnCount > 0 && (
            <div className="text-center shrink-0">
              <p className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">
                {warnCount}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Warn
              </p>
            </div>
          )}
          {errorCount > 0 && (
            <div className="text-center shrink-0">
              <p className="text-xl sm:text-2xl font-mono font-bold text-red-400">
                {errorCount}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Error
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {scanning && (
            <span className="text-[10px] font-mono text-foreground/30" role="status" aria-live="polite">
              Auditing {scannedCount}/{PAGES.length} pages...
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void runAudit()}
            disabled={scanning}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            {scanning ? "Scanning..." : "Re-scan"}
          </Button>
        </div>
      </div>

      {/* Page Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {pages.map((page) => (
          <Card
            key={page.path}
            className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4 hover:border-cyan-400/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    page.status === "ok"
                      ? "bg-green-400"
                      : page.status === "warn"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                />
                <span className="font-mono text-xs text-foreground/80 truncate">
                  {page.path}
                </span>
              </div>
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-foreground/5 text-foreground/30 hover:text-cyan-400 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3 h-3 text-foreground/20 shrink-0" />
              <span className="text-[10px] font-mono text-foreground/40 truncate">
                {page.title ?? "\u2014"}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2 mb-1">
              <Search className="w-3 h-3 text-foreground/20 shrink-0 mt-0.5" />
              <span className="text-[10px] font-mono text-foreground/40 line-clamp-2">
                {page.description ?? "\u2014"}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={`text-[9px] font-mono ${page.ogImage ? "border-green-500/40 text-green-400" : "border-red-500/40 text-red-400"}`}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="w-2.5 h-2.5 mr-1" />
                og:image
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] font-mono ${page.canonical ? "border-green-500/40 text-green-400" : "border-red-500/40 text-red-400"}`}
              >
                canonical
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] font-mono ${page.structuredData ? "border-green-500/40 text-green-400" : "border-foreground/20 text-foreground/30"}`}
              >
                JSON-LD
              </Badge>
              {page.robots && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono border-yellow-500/40 text-yellow-400"
                >
                  {page.robots}
                </Badge>
              )}
            </div>

            {/* Issues */}
            {page.issues.length > 0 && (
              <div className="mt-3 space-y-1">
                {page.issues.map((issue) => (
                  <div key={issue} className="flex items-center gap-1.5">
                    {page.status === "error" ? (
                      <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-foreground/40">
                      {issue}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {page.issues.length === 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-mono text-green-400">
                  All checks passed
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
