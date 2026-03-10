import { CheckCircle2 } from "lucide-react";

interface OptimizationItem {
  icon: string;
  title: string;
  detail: string;
  tag: string;
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

export function OptimizationChecklist() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          What Makes This Site Fast
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Every performance decision, explained
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPTIMIZATIONS.map((item) => (
          <div
            key={item.title}
            className="flex gap-4 p-4 rounded-lg border border-border/20 bg-card/30 hover:border-cyan-400/20 hover:bg-card/50 transition-all duration-300 group"
          >
            {/* Icon */}
            <div className="text-xl shrink-0 mt-0.5" aria-hidden>
              {item.icon}
            </div>

            {/* Content */}
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
    </div>
  );
}
