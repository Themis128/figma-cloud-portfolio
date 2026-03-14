"use client";

import { Check, Copy, ExternalLink, Radio, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "Not configured";

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="font-mono text-[10px] sm:text-[11px] bg-black/60 p-2.5 sm:p-3 rounded border border-border/10 text-foreground/70 overflow-x-auto whitespace-pre wrap-break-word">
      {code}
    </pre>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/80 mb-3">
      {children}
    </h3>
  );
}

function ConfigItem({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="font-mono text-xs text-cyan-400">{title}</span>
        {value && (
          <span className="font-mono text-[10px] text-foreground/40 break-all">
            {value}
          </span>
        )}
      </div>
      <p className="text-xs text-foreground/50 leading-relaxed">{children}</p>
    </div>
  );
}

interface SessionInfo {
  pageViews: number;
  timeOnPage: string;
  referrer: string;
  entryPage: string;
}

export default function GoogleAnalyticsExplainer() {
  const [gaActive, setGaActive] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  useEffect(() => {
    setGaActive(typeof window.gtag === "function");

    // Gather real-time session info from browser APIs
    const entries = performance.getEntriesByType("navigation");
    const navEntry = entries[0] as PerformanceNavigationTiming | undefined;

    const elapsed = Math.round((Date.now() - performance.timeOrigin) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    setSessionInfo({
      pageViews: performance.getEntriesByType("navigation").length,
      timeOnPage: `${minutes}m ${seconds}s`,
      referrer: document.referrer || "Direct",
      entryPage: navEntry?.name
        ? new URL(navEntry.name).pathname
        : window.location.pathname,
    });

    // Update time on page every 10 seconds
    const interval = setInterval(() => {
      const e = Math.round((Date.now() - performance.timeOrigin) / 1000);
      const m = Math.floor(e / 60);
      const s = e % 60;
      setSessionInfo((prev) =>
        prev ? { ...prev, timeOnPage: `${m}m ${s}s` } : prev,
      );
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  function copyId() {
    void navigator.clipboard.writeText(GA_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Live Session Card */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <p className="text-[10px] uppercase tracking-wider text-green-400 font-mono">
            Live Session
          </p>
        </div>
        {sessionInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: "Time on Page", value: sessionInfo.timeOnPage },
              { label: "Entry Page", value: sessionInfo.entryPage },
              { label: "Referrer", value: sessionInfo.referrer },
              { label: "Page Views", value: String(sessionInfo.pageViews) },
            ].map((item) => (
              <div
                key={item.label}
                className="p-2.5 sm:p-3 rounded-lg bg-background/30 border border-border/10"
              >
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                  {item.label}
                </p>
                <p className="text-xs font-mono text-foreground/80 truncate mt-1">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Card 1: Measurement ID */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 sm:p-6">
        <SectionHeading>Measurement ID</SectionHeading>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
          <span className="font-mono text-sm sm:text-lg text-cyan-400 break-all">
            {GA_ID}
          </span>
          <button
            onClick={copyId}
            className="p-1.5 rounded hover:bg-foreground/5 text-foreground/40 hover:text-cyan-400 transition-colors"
            title="Copy ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {gaActive !== null && (
            <Badge
              variant="outline"
              className={
                gaActive
                  ? "border-green-500/40 text-green-400 text-[10px]"
                  : "border-red-500/40 text-red-400 text-[10px]"
              }
            >
              {gaActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
                  Active
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Not Detected
                </>
              )}
            </Badge>
          )}
        </div>
        <p className="text-xs text-foreground/40">
          Loaded via{" "}
          <code className="font-mono text-foreground/60">
            NEXT_PUBLIC_GA_ID
          </code>{" "}
          environment variable. The GA script uses the{" "}
          <code className="font-mono text-foreground/60">
            afterInteractive
          </code>{" "}
          strategy so it loads after the page becomes interactive.
        </p>
      </Card>

      {/* Card 2: Configuration Details */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 sm:p-6 space-y-4 sm:space-y-5">
        <SectionHeading>Configuration</SectionHeading>

        <ConfigItem title="page_path" value="tracking">
          Every client-side route change calls{" "}
          <code className="font-mono text-foreground/60">
            gtag(&apos;config&apos;, GA_ID, {"{"} page_path {"}"})
          </code>{" "}
          via Next.js{" "}
          <code className="font-mono text-foreground/60">usePathname()</code>{" "}
          and{" "}
          <code className="font-mono text-foreground/60">
            useSearchParams()
          </code>{" "}
          hooks inside a{" "}
          <code className="font-mono text-foreground/60">&lt;Suspense&gt;</code>{" "}
          boundary. This captures page view events on every navigation,
          including client-side transitions that don&apos;t trigger full page
          loads.
        </ConfigItem>

        <div className="border-t border-border/10" />

        <ConfigItem title="anonymize_ip" value="true">
          IP anonymization is enabled in the gtag config. Google truncates the
          last octet of IPv4 addresses (e.g., 192.168.1.
          <span className="text-red-400 line-through">123</span> &rarr;
          192.168.1.0) and the last 80 bits of IPv6 addresses before storage.
          This is a GDPR-friendly default that reduces personally identifiable
          information in analytics data.
        </ConfigItem>

        <div className="border-t border-border/10" />

        <ConfigItem title="cookie_flags" value="'SameSite=None;Secure'">
          GA cookies are configured with{" "}
          <code className="font-mono text-foreground/60">SameSite=None</code>{" "}
          and{" "}
          <code className="font-mono text-foreground/60">Secure</code> flags.
          The <strong>Secure</strong> flag ensures cookies are only sent over
          HTTPS connections. <strong>SameSite=None</strong> allows the cookies to
          work in cross-origin contexts — required by modern browsers for
          third-party tracking cookies.
        </ConfigItem>
      </Card>

      {/* Card 3: Event Helpers */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 sm:p-6 space-y-4 sm:space-y-5">
        <SectionHeading>Event Helpers</SectionHeading>

        <div className="space-y-3">
          <ConfigItem title="trackEvent" value="(action, category, label?, value?)" >
            Fires a custom GA4 event. Use this for tracking user interactions
            like link clicks, form submissions, chatbot messages, and resume
            downloads.
          </ConfigItem>
          <CodeBlock
            code={`trackEvent("click", "Navigation", "About Page");
trackEvent("submit", "Contact Form", "Success", 1);

// Under the hood:
gtag("event", action, {
  event_category: category,
  event_label: label,
  value: value,
});`}
          />
        </div>

        <div className="border-t border-border/10" />

        <div className="space-y-3">
          <ConfigItem
            title="trackConversion"
            value="(conversionId, label?)"
          >
            Fires a conversion event for high-value actions. Use this when a
            contact form is submitted or a booking is completed — actions that
            represent measurable business outcomes.
          </ConfigItem>
          <CodeBlock
            code={`trackConversion("contact_form_submit");
trackConversion("booking_completed", "cal_booking");

// Under the hood:
gtag("event", "conversion", {
  send_to: \`\${GA_ID}/\${label || conversionId}\`,
});`}
          />
        </div>
      </Card>

      {/* Card 4: Implementation Reference */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 sm:p-6">
        <SectionHeading>Implementation Reference</SectionHeading>
        <div className="space-y-2 text-xs text-foreground/50 font-mono">
          <p>
            Source:{" "}
            <span className="text-cyan-400">
              src/components/GoogleAnalytics.tsx
            </span>
          </p>
          <p>
            Scripts loaded:{" "}
            <span className="text-foreground/60">
              afterInteractive strategy (Next.js Script)
            </span>
          </p>
          <p>
            Route tracking:{" "}
            <span className="text-foreground/60">
              usePathname() + useSearchParams() in Suspense
            </span>
          </p>
          <p>
            Null guard:{" "}
            <span className="text-foreground/60">
              Returns null if NEXT_PUBLIC_GA_ID is unset
            </span>
          </p>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open GA4 Dashboard
            </a>
          </Button>
          <p className="text-[10px] text-foreground/30 mt-2">
            Real-time reports, user acquisition, engagement metrics. Requires
            Google account access for this property.
          </p>
        </div>
      </Card>
    </div>
  );
}
