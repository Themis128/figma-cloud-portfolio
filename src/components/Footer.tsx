"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { ManageCookiesButton } from "@/components/CookieConsentBanner";

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-border/10 bg-background/50 backdrop-blur-sm"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top row: sitemap + social */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          {/* Mini sitemap */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-foreground/50"
          >
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link href="/about/" className="hover:text-cyan-400 transition-colors">
              About
            </Link>
            <Link href="/product/" className="hover:text-cyan-400 transition-colors">
              Experience
            </Link>
            <Link href="/projects/" className="hover:text-cyan-400 transition-colors">
              Projects
            </Link>
            <Link href="/contact/" className="hover:text-cyan-400 transition-colors">
              Contact
            </Link>
            <Link href="/performance/" className="hover:text-cyan-400 transition-colors">
              Performance
            </Link>
          </nav>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/baltzakis-themis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 text-foreground/40 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/Themis128"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 text-foreground/40 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href="mailto:baltzakis.themis@gmail.com"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 text-foreground/40 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/10 mb-6" />

        {/* Bottom row: copyright + legal + tech stack */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40 font-mono">
            &copy; {new Date().getFullYear()} Themistoklis Baltzakis. All rights
            reserved.
          </p>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-4 text-xs text-foreground/40 font-mono"
          >
            <Link
              href="/privacy/"
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/cookies/"
              className="hover:text-cyan-400 transition-colors"
            >
              Cookies
            </Link>
            <Link
              href="/terms/"
              className="hover:text-cyan-400 transition-colors"
            >
              Terms
            </Link>
            <ManageCookiesButton />
          </nav>

          {/* Built with */}
          <p className="text-[10px] text-foreground/25 font-mono tracking-wider">
            Built with Next.js &middot; Tailwind &middot; AWS
          </p>
        </div>
      </div>
    </footer>
  );
}
