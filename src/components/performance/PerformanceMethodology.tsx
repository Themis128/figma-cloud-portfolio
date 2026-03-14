"use client";

import { CheckCircle2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OptimizationItem {
  icon: string;
  title: string;
  detail: string;
  tag: string;
}

interface StackItem {
  name: string;
  role: string;
  icon: string;
  reason: string;
  impact: string;
}

const OPTIMIZATIONS: OptimizationItem[] = [
  {
    icon: "▲",
    title: "Next.js Server Components",
    detail:
      "Static and data-driven content renders entirely on the server — zero client-side JavaScript shipped for those sections.",
    tag: "Framework",
  },
  {
    icon: "🖼",
    title: "Automatic Image Optimization",
    detail:
      "next/image converts all images to WebP/AVIF at build time, adds lazy loading, and reserves layout space to prevent shifts.",
    tag: "Assets",
  },
  {
    icon: "✂️",
    title: "Code Splitting & Tree Shaking",
    detail:
      "Only the JavaScript your current route actually needs is shipped. Unused imports are removed at build time automatically.",
    tag: "Bundle",
  },
  {
    icon: "☁️",
    title: "S3 + CloudFront Edge CDN",
    detail:
      "Static export deployed to S3 and distributed via CloudFront edge nodes worldwide. Your browser fetches from the nearest server — not a distant origin.",
    tag: "Infrastructure",
  },
  {
    icon: "🎨",
    title: "Zero-Runtime CSS",
    detail:
      "Tailwind CSS purges every unused utility class at build time. No CSS-in-JS runtime, no style injection lag.",
    tag: "Styling",
  },
  {
    icon: "🔤",
    title: "Font Subsetting & display:swap",
    detail:
      "Only the character sets in use are downloaded. display:swap shows text immediately in a fallback font while the custom font loads.",
    tag: "Typography",
  },
  {
    icon: "📦",
    title: "Dynamic Imports for Heavy Components",
    detail:
      "The AI assistant, chatbot, and 3D visualisations are lazy-loaded only when the user navigates to them.",
    tag: "Loading",
  },
  {
    icon: "🔒",
    title: "Security Headers via CloudFront",
    detail:
      "CSP, HSTS, and X-Frame-Options headers are configured in the deployment pipeline — security hardening with no client performance cost.",
    tag: "Security",
  },
];

const STACK: StackItem[] = [
  {
    name: "Next.js 16",
    role: "Framework",
    icon: "▲",
    reason:
      "Server Components deliver pre-rendered HTML — static content ships no JavaScript to the browser at all.",
    impact: "Cuts initial JS bundle ~40%",
  },
  {
    name: "Tailwind CSS v4",
    role: "Styling",
    icon: "💨",
    reason:
      "Purges every unused utility class at build time. No CSS-in-JS runtime cost, no style injection on load.",
    impact: "CSS bundle < 20KB",
  },
  {
    name: "Radix UI + shadcn",
    role: "Components",
    icon: "◎",
    reason:
      "Unstyled accessible primitives — no layout side effects means zero unexpected Cumulative Layout Shift.",
    impact: "CLS score: 0.000",
  },
  {
    name: "Framer Motion",
    role: "Animation",
    icon: "🌀",
    reason:
      "GPU-accelerated transforms and opacity only — animations never trigger layout recalculation or block the main thread.",
    impact: "Smooth 60fps, no jank",
  },
  {
    name: "S3 + CloudFront",
    role: "Deployment",
    icon: "☁️",
    reason:
      "Static export served from S3, distributed via CloudFront edge CDN to 600+ locations worldwide — every visitor fetches from the closest node.",
    impact: "TTFB < 100ms globally",
  },
  {
    name: "web-vitals",
    role: "Monitoring",
    icon: "📊",
    reason:
      "Real-user monitoring collects actual visitor experience — not synthetic lab scores from a single data centre.",
    impact: "Real-world measurement",
  },
];

function OptimizationsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {OPTIMIZATIONS.map((item) => (
        <div
          key={item.title}
          className="flex gap-4 p-4 rounded-lg border border-border/20 bg-card/30 hover:border-cyan-400/20 hover:bg-card/50 transition-all duration-300 group"
        >
          <div className="text-xl shrink-0 mt-0.5" aria-hidden>
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] font-mono text-foreground/30 bg-muted/30 px-1.5 py-0.5 rounded">
                {item.tag}
              </span>
            </div>
            <p className="text-xs text-foreground/50 leading-relaxed">
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StackGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {STACK.map((item) => (
        <div
          key={item.name}
          className="p-5 rounded-lg border border-border/20 bg-card/30 hover:border-cyan-400/25 hover:bg-card/50 transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] text-foreground/35 uppercase tracking-widest font-mono mb-1">
                {item.role}
              </div>
              <div className="font-bold text-foreground group-hover:text-cyan-400 transition-colors duration-300">
                {item.name}
              </div>
            </div>
            <span className="text-2xl" aria-hidden>
              {item.icon}
            </span>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed mb-4">
            {item.reason}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="text-[11px] font-mono text-cyan-400/70">
              {item.impact}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PerformanceMethodology() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2
          id="methodology-heading"
          className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground"
        >
          How It&apos;s Built
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Every performance decision, explained
        </p>
      </div>

      <Tabs defaultValue="techniques" className="w-full">
        <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 bg-card/40 border border-border/20">
          <TabsTrigger
            value="techniques"
            className="data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-400 text-xs uppercase tracking-wider font-mono"
          >
            Techniques
          </TabsTrigger>
          <TabsTrigger
            value="stack"
            className="data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-400 text-xs uppercase tracking-wider font-mono"
          >
            Tech Stack
          </TabsTrigger>
        </TabsList>
        <TabsContent value="techniques" className="mt-6">
          <OptimizationsGrid />
        </TabsContent>
        <TabsContent value="stack" className="mt-6">
          <StackGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
