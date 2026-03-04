interface StackItem {
  name: string;
  role: string;
  icon: string;
  reason: string;
  impact: string;
}

const STACK: StackItem[] = [
  {
    name: "Next.js 15",
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
    name: "AWS Amplify",
    role: "Deployment",
    icon: "☁️",
    reason:
      "Global edge CDN distributes assets to 300+ locations worldwide, serving every visitor from the closest node.",
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

export function TechStackRationale() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          Built for Performance
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Every technology choice has a performance rationale
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STACK.map((item) => (
          <div
            key={item.name}
            className="p-5 rounded-lg border border-border/20 bg-card/30 hover:border-cyan-400/25 hover:bg-card/50 transition-all duration-300 group"
          >
            {/* Header */}
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

            {/* Reason */}
            <p className="text-xs text-foreground/50 leading-relaxed mb-4">
              {item.reason}
            </p>

            {/* Impact pill */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="text-[11px] font-mono text-cyan-400/70">
                {item.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
