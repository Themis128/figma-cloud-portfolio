"use client";

import Link from "next/link";

import { ManageCookiesButton } from "@/components/CookieConsentBanner";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/10 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              Privacy Policy
            </Link>
            <Link
              href="/cookies/"
              className="hover:text-cyan-400 transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="/terms/"
              className="hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </Link>
            <ManageCookiesButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
