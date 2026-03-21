import { ArrowUp, Cookie } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import { ManageCookiesButton } from "@/components/ManageCookiesButton";
import Navigation from "@/components/Navigation";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy for baltzakisthemis.com — what cookies we use, why, and how to manage your preferences.",
  alternates: { canonical: `${SITE_URL}/cookies/` },
};

function CookieTable({
  category,
  description,
  cookies,
}: {
  category: string;
  description: string;
  cookies: {
    name: string;
    purpose: string;
    duration: string;
    type: string;
  }[];
}) {
  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-lg p-6 border border-border/20">
      <h3 className="text-lg font-bold text-foreground mb-1 uppercase tracking-[0.15em]">
        {category}
      </h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 pr-3 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                Cookie
              </th>
              <th className="text-left py-2 pr-3 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                Purpose
              </th>
              <th className="text-left py-2 pr-3 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                Duration
              </th>
              <th className="text-left py-2 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {cookies.map((cookie) => (
              <tr key={cookie.name}>
                <td className="py-3 pr-3 text-foreground font-mono text-xs">
                  {cookie.name}
                </td>
                <td className="py-3 pr-3 text-muted-foreground">
                  {cookie.purpose}
                </td>
                <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">
                  {cookie.duration}
                </td>
                <td className="py-3 text-muted-foreground text-xs">
                  {cookie.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Cookie Policy", url: `${SITE_URL}/cookies/` },
        ]}
      />
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 mb-12 md:mb-20">
            <div className="space-y-3 md:space-y-4">
              <AnimatedSection delay={0.1}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Cookie className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wider">
                  Cookie Policy
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                This Cookie Policy explains what cookies are, how we use them on{" "}
                <span className="text-cyan-400 font-mono">
                  baltzakisthemis.com
                </span>
                , and how you can manage your preferences.
              </p>
              <p className="text-sm text-muted-foreground/70 font-mono mt-2">
                Effective date: March 2026 &middot; Last updated: March 2026
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* What Are Cookies */}
            <AnimatedSection delay={0.1}>
              <div className="bg-card/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-border/20">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 uppercase tracking-[0.15em]">
                  1. What Are Cookies
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Cookies are small text files stored on your device by your
                    web browser when you visit a website. They help the site
                    remember your preferences, understand how you use the site,
                    and improve your experience. Some cookies are essential for
                    the site to function, while others help us analyse traffic
                    or remember your settings.
                  </p>
                  <p>
                    We also use similar technologies such as{" "}
                    <span className="text-foreground">localStorage</span> for
                    storing preferences locally on your device.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Cookie Categories */}
            <AnimatedSection delay={0.15}>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 uppercase tracking-[0.15em]">
                2. Cookies We Use
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <CookieTable
                category="Essential Cookies"
                description="Required for the website to function. These cannot be disabled."
                cookies={[
                  {
                    name: "sidebar:state",
                    purpose: "Remembers sidebar open/closed state",
                    duration: "7 days",
                    type: "Cookie",
                  },
                  {
                    name: "CSRF tokens",
                    purpose: "Protects form submissions from cross-site request forgery",
                    duration: "Session",
                    type: "Cookie",
                  },
                ]}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <CookieTable
                category="Analytics Cookies"
                description="Help us understand how visitors interact with the website. Set only with your consent."
                cookies={[
                  {
                    name: "_ga",
                    purpose: "Google Analytics: distinguishes unique users",
                    duration: "2 years",
                    type: "Cookie",
                  },
                  {
                    name: "_ga_*",
                    purpose: "Google Analytics: maintains session state",
                    duration: "2 years",
                    type: "Cookie",
                  },
                  {
                    name: "_gid",
                    purpose: "Google Analytics: distinguishes users (short-lived)",
                    duration: "24 hours",
                    type: "Cookie",
                  },
                ]}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <CookieTable
                category="Functional Cookies"
                description="Enhance your experience by remembering your preferences. Stored locally on your device."
                cookies={[
                  {
                    name: "notification-prompt-dismissed",
                    purpose: "Remembers if you dismissed the notification prompt",
                    duration: "7 days",
                    type: "localStorage",
                  },
                  {
                    name: "push-subscription",
                    purpose: "Stores push notification subscription state",
                    duration: "Persistent",
                    type: "localStorage",
                  },
                  {
                    name: "theme",
                    purpose: "Stores your preferred colour theme",
                    duration: "Persistent",
                    type: "localStorage",
                  },
                ]}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <CookieTable
                category="Third-Party Cookies"
                description="Set by external services integrated into the website."
                cookies={[
                  {
                    name: "reCAPTCHA cookies",
                    purpose: "Google reCAPTCHA v3: spam prevention on contact form",
                    duration: "6 months",
                    type: "Cookie",
                  },
                  {
                    name: "Sentry session cookies",
                    purpose: "Error tracking and session replay identification",
                    duration: "Session",
                    type: "Cookie",
                  },
                ]}
              />
            </AnimatedSection>

            {/* Managing Cookies */}
            <AnimatedSection delay={0.1}>
              <div className="bg-card/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-border/20">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 uppercase tracking-[0.15em]">
                  3. How to Manage Cookies
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    You can manage your cookie preferences in several ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                      <span className="text-foreground">Consent Banner</span>{" "}
                      &mdash; When you first visit, our cookie consent banner
                      allows you to accept or decline non-essential cookies. You
                      can update your preferences at any time by clicking the
                      button below.
                    </li>
                    <li>
                      <span className="text-foreground">Browser Settings</span>{" "}
                      &mdash; Most browsers allow you to block or delete cookies
                      via their settings. Note that blocking essential cookies
                      may affect site functionality.
                    </li>
                    <li>
                      <span className="text-foreground">
                        Google Analytics Opt-Out
                      </span>{" "}
                      &mdash; Install the{" "}
                      <a
                        href="https://tools.google.com/dlpage/gaoptout"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        Google Analytics Opt-Out Browser Add-On
                      </a>
                      .
                    </li>
                  </ul>

                  <div className="pt-4">
                    <ManageCookiesButton />
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Privacy Policy Link */}
            <AnimatedSection delay={0.15}>
              <div className="bg-card/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-border/20">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 uppercase tracking-[0.15em]">
                  4. More Information
                </h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    For more information about how we collect and process your
                    personal data, please read our{" "}
                    <Link
                      href="/privacy/"
                      className="text-cyan-400 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <p>
                    If you have questions about our use of cookies, contact us at{" "}
                    <a
                      href="mailto:tbaltzakis@cloudless.gr"
                      className="text-cyan-400 hover:underline font-mono"
                    >
                      tbaltzakis@cloudless.gr
                    </a>
                    .
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Back to top */}
            <AnimatedSection delay={0.1}>
              <div className="flex justify-center gap-6 pt-8 pb-12">
                <a
                  href="#main-content"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm uppercase tracking-wider"
                >
                  <ArrowUp className="w-4 h-4" />
                  Back to top
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm uppercase tracking-wider"
                >
                  Home
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}
