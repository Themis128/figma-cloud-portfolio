"use client";

import { Github, Linkedin, Mail, Terminal } from "lucide-react";
import Link from "next/link";
import { ManageCookiesButton } from "@/components/CookieConsentBanner";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/product/", label: "Experience" },
  { href: "/projects/", label: "Projects" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
  { href: "/performance/", label: "Performance" },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/baltzakis-themis",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/Themis128",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "mailto:baltzakis.themis@gmail.com",
    label: "Email",
    icon: Mail,
  },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy/", label: "Privacy" },
  { href: "/cookies/", label: "Cookies" },
  { href: "/terms/", label: "Terms" },
] as const;

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-cyan-400/10 bg-background/60 backdrop-blur-md"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
    >
      {/* Cyan accent line at top */}
      <div className="h-px bg-linear-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-foreground/80">
                Themis Baltzakis
              </span>
            </div>
            <p className="text-xs text-foreground/40 leading-relaxed max-w-xs">
              Cloud Architect & Cybersecurity Specialist building secure,
              scalable infrastructure and modern web applications.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/20 text-foreground/40 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all duration-200"
                  aria-label={link.label}
                >
                  <link.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/60 mb-3">
              Navigation
            </h3>
            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-2 gap-x-4 gap-y-1.5"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-mono text-foreground/45 hover:text-cyan-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/60 mb-3">
              Legal
            </h3>
            <nav aria-label="Legal" className="space-y-1.5">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-xs font-mono text-foreground/45 hover:text-cyan-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-1">
                <ManageCookiesButton />
              </div>
            </nav>
          </div>
        </div>

        {/* Divider with circuit node accent */}
        <div className="relative mb-6">
          <div className="h-px bg-border/10" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex items-center gap-1.5">
            <span className="block h-1.5 w-1.5 rounded-full bg-cyan-400/30" />
            <span className="block h-1 w-6 rounded-full bg-cyan-400/20" />
            <span className="block h-1.5 w-1.5 rounded-full bg-cyan-400/30" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-foreground/35 font-mono">
            &copy; {new Date().getFullYear()} Themistoklis Baltzakis
          </p>
          <p className="text-[10px] text-foreground/20 font-mono tracking-wider">
            Next.js &middot; Tailwind &middot; AWS &middot; TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
