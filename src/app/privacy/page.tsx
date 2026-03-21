import { ArrowUp, Mail, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for baltzakisthemis.com — how we collect, use, and protect your personal data under GDPR and CCPA.",
};

function SectionCard({
  id,
  title,
  children,
  delay = 0.1,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-border/20">
        <h2
          id={id}
          className="text-xl md:text-2xl font-bold text-foreground mb-4 uppercase tracking-[0.15em]"
        >
          {title}
        </h2>
        <div className="text-muted-foreground space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 mb-12 md:mb-20">
            <div className="space-y-3 md:space-y-4">
              <AnimatedSection delay={0.1}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wider">
                  Privacy Policy
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                This Privacy Policy explains how we collect, use, disclose, and
                protect your personal data when you visit{" "}
                <span className="text-cyan-400 font-mono">
                  baltzakisthemis.com
                </span>
                .
              </p>
              <p className="text-sm text-muted-foreground/70 font-mono mt-2">
                Effective date: March 2026 &middot; Last updated: March 2026
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 1. Data Controller */}
            <SectionCard id="data-controller" title="1. Data Controller">
              <p>The data controller for this website is:</p>
              <div className="bg-background/50 rounded-lg p-4 border border-border/10 font-mono text-sm">
                <p className="text-foreground">Themistoklis Baltzakis</p>
                <p>IT Network Engineer</p>
                <p>Athens, Greece</p>
                <p className="mt-2">
                  <Mail className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                  <a
                    href="mailto:tbaltzakis@cloudless.gr"
                    className="text-cyan-400 hover:underline"
                  >
                    tbaltzakis@cloudless.gr
                  </a>
                </p>
              </div>
            </SectionCard>

            {/* 2. Legal Bases */}
            <SectionCard id="legal-bases" title="2. Legal Bases for Processing" delay={0.15}>
              <p>
                We process your personal data under the following legal bases as
                defined by the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="text-cyan-400 font-semibold">Consent</span>{" "}
                  &mdash; Analytics and marketing cookies (Google Analytics 4).
                  You can withdraw consent at any time via the cookie banner or
                  browser settings.
                </li>
                <li>
                  <span className="text-cyan-400 font-semibold">
                    Legitimate Interest
                  </span>{" "}
                  &mdash; Security monitoring, error tracking (Sentry), spam
                  prevention (reCAPTCHA), and performance optimization.
                </li>
                <li>
                  <span className="text-cyan-400 font-semibold">
                    Contractual Necessity
                  </span>{" "}
                  &mdash; Processing data required to fulfil booking requests
                  (Cal.com) and respond to contact form submissions.
                </li>
              </ul>
            </SectionCard>

            {/* 3. Data We Collect */}
            <SectionCard id="data-collected" title="3. Data We Collect" delay={0.2}>
              <h3 className="text-foreground font-semibold text-lg mt-2">
                3.1 Contact Form
              </h3>
              <p>
                When you submit the contact form, we collect your{" "}
                <span className="text-foreground">name</span>,{" "}
                <span className="text-foreground">email address</span>, and{" "}
                <span className="text-foreground">message</span>. This data is
                sent to AWS Lambda and forwarded via Amazon SES to our email.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.2 Booking System
              </h3>
              <p>
                When you book a consultation, we collect your{" "}
                <span className="text-foreground">name</span>,{" "}
                <span className="text-foreground">email address</span>, and{" "}
                <span className="text-foreground">timezone</span> via the
                Cal.com scheduling API.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.3 Analytics (Google Analytics 4)
              </h3>
              <p>
                With your consent, we use GA4 to collect anonymised usage data
                including page views, scroll depth, engagement time, and
                outbound link clicks. GA4 sets cookies such as{" "}
                <code className="font-mono text-cyan-400">_ga</code>,{" "}
                <code className="font-mono text-cyan-400">_ga_*</code>, and{" "}
                <code className="font-mono text-cyan-400">_gid</code>.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.4 Error Tracking (Sentry)
              </h3>
              <p>
                We use Sentry for error tracking, session replay (10% sampling
                rate), and performance traces to identify and fix issues. Sentry
                may collect browser metadata, error stack traces, and anonymised
                session data.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.5 Spam Prevention (reCAPTCHA v3)
              </h3>
              <p>
                The contact form is protected by Google reCAPTCHA v3, which
                analyses user behaviour to prevent spam. reCAPTCHA may set its
                own cookies and collect device/browser data.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.6 AI Chat
              </h3>
              <p>
                Messages you send in the AI chat are forwarded to the HuggingFace
                API for processing. Messages are not permanently stored on our
                servers and are cleared when the session ends.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.7 Push Notifications
              </h3>
              <p>
                If you opt in to push notifications, we store your subscription
                endpoint URL and encryption keys (VAPID) on our server to
                deliver notifications.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.8 Authentication
              </h3>
              <p>
                AWS Cognito is used for admin-only access. No visitor
                authentication data is collected.
              </p>

              <h3 className="text-foreground font-semibold text-lg mt-4">
                3.9 Functional Data
              </h3>
              <p>
                We store a sidebar state cookie (7 days) and theme preferences
                in localStorage for a better browsing experience. These are
                strictly functional and do not track you.
              </p>
            </SectionCard>

            {/* 4. Third-Party Recipients */}
            <SectionCard id="third-parties" title="4. Third-Party Recipients" delay={0.15}>
              <p>
                We share data with the following third parties, solely for the
                purposes described above:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 pr-4 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                        Provider
                      </th>
                      <th className="text-left py-2 pr-4 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                        Purpose
                      </th>
                      <th className="text-left py-2 text-cyan-400 font-mono uppercase tracking-wider text-xs">
                        Privacy Policy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    <tr>
                      <td className="py-3 pr-4 text-foreground">Google (GA4, reCAPTCHA)</td>
                      <td className="py-3 pr-4">Analytics, spam prevention</td>
                      <td className="py-3">
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          policies.google.com/privacy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-foreground">Sentry</td>
                      <td className="py-3 pr-4">Error tracking, performance</td>
                      <td className="py-3">
                        <a
                          href="https://sentry.io/privacy/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          sentry.io/privacy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-foreground">Amazon Web Services</td>
                      <td className="py-3 pr-4">Hosting, email delivery, serverless functions</td>
                      <td className="py-3">
                        <a
                          href="https://aws.amazon.com/privacy/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          aws.amazon.com/privacy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-foreground">Cal.com</td>
                      <td className="py-3 pr-4">Booking and scheduling</td>
                      <td className="py-3">
                        <a
                          href="https://cal.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          cal.com/privacy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-foreground">HuggingFace</td>
                      <td className="py-3 pr-4">AI chat processing</td>
                      <td className="py-3">
                        <a
                          href="https://huggingface.co/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          huggingface.co/privacy
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* 5. Data Retention */}
            <SectionCard id="data-retention" title="5. Data Retention" delay={0.1}>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="text-foreground">Contact form submissions</span>:
                  retained in our email inbox until manually deleted.
                </li>
                <li>
                  <span className="text-foreground">Booking data</span>: retained
                  by Cal.com per their retention policy; we retain booking
                  confirmations in email.
                </li>
                <li>
                  <span className="text-foreground">Analytics data (GA4)</span>:
                  retained for 14 months (Google default), then automatically
                  deleted.
                </li>
                <li>
                  <span className="text-foreground">Sentry data</span>: retained
                  for 90 days, then automatically purged.
                </li>
                <li>
                  <span className="text-foreground">AI chat messages</span>: not
                  permanently stored; cleared at end of session.
                </li>
                <li>
                  <span className="text-foreground">Push notification subscriptions</span>:
                  retained until you unsubscribe or the subscription expires.
                </li>
                <li>
                  <span className="text-foreground">Cookies</span>: see our{" "}
                  <Link
                    href="/cookies/"
                    className="text-cyan-400 hover:underline"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for specific retention periods.
                </li>
              </ul>
            </SectionCard>

            {/* 6. Your Rights (GDPR) */}
            <SectionCard id="gdpr-rights" title="6. Your Rights Under GDPR" delay={0.15}>
              <p>
                If you are located in the European Economic Area (EEA), you have
                the following rights under the GDPR:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  <span className="text-foreground">Right of Access</span> &mdash;
                  request a copy of the personal data we hold about you.
                </li>
                <li>
                  <span className="text-foreground">Right to Rectification</span>{" "}
                  &mdash; request correction of inaccurate or incomplete data.
                </li>
                <li>
                  <span className="text-foreground">Right to Erasure</span>{" "}
                  &mdash; request deletion of your personal data.
                </li>
                <li>
                  <span className="text-foreground">Right to Data Portability</span>{" "}
                  &mdash; receive your data in a structured, machine-readable
                  format.
                </li>
                <li>
                  <span className="text-foreground">Right to Object</span> &mdash;
                  object to processing based on legitimate interest.
                </li>
                <li>
                  <span className="text-foreground">Right to Withdraw Consent</span>{" "}
                  &mdash; withdraw your consent at any time without affecting the
                  lawfulness of prior processing.
                </li>
              </ul>
              <p className="mt-4">
                You also have the right to lodge a complaint with the{" "}
                <a
                  href="https://www.dpa.gr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  Hellenic Data Protection Authority
                </a>{" "}
                or your local supervisory authority.
              </p>
            </SectionCard>

            {/* 7. Your Rights (CCPA/CPRA) */}
            <SectionCard id="ccpa-rights" title="7. Your Rights Under CCPA/CPRA" delay={0.1}>
              <p>
                If you are a California resident, you have the following rights
                under the California Consumer Privacy Act (CCPA) and the
                California Privacy Rights Act (CPRA):
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  <span className="text-foreground">Right to Know</span> &mdash;
                  request disclosure of the categories and specific pieces of
                  personal information we have collected about you.
                </li>
                <li>
                  <span className="text-foreground">Right to Delete</span> &mdash;
                  request deletion of your personal information.
                </li>
                <li>
                  <span className="text-foreground">Right to Opt-Out</span> &mdash;
                  opt out of the &quot;sale&quot; or &quot;sharing&quot; of your
                  personal information. We do not sell personal information.
                </li>
                <li>
                  <span className="text-foreground">Right to Non-Discrimination</span>{" "}
                  &mdash; we will not discriminate against you for exercising
                  your privacy rights.
                </li>
              </ul>
            </SectionCard>

            {/* 8. How to Exercise Your Rights */}
            <SectionCard id="exercise-rights" title="8. How to Exercise Your Rights" delay={0.15}>
              <p>
                To exercise any of the rights described above, please contact us
                at:
              </p>
              <p className="mt-2">
                <Mail className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                <a
                  href="mailto:tbaltzakis@cloudless.gr"
                  className="text-cyan-400 hover:underline font-mono"
                >
                  tbaltzakis@cloudless.gr
                </a>
              </p>
              <p className="mt-2">
                We will respond to your request within 30 days. We may need to
                verify your identity before processing your request.
              </p>
            </SectionCard>

            {/* 9. Cookies */}
            <SectionCard id="cookies" title="9. Cookies" delay={0.1}>
              <p>
                This website uses cookies and similar technologies. For detailed
                information about the cookies we use, their purposes, and how to
                manage them, please see our{" "}
                <Link
                  href="/cookies/"
                  className="text-cyan-400 hover:underline"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </SectionCard>

            {/* 10. International Data Transfers */}
            <SectionCard id="data-transfers" title="10. International Data Transfers" delay={0.15}>
              <p>
                Some of our third-party service providers are based in the
                United States, including Amazon Web Services, Google, Sentry, and
                HuggingFace. When your data is transferred outside the EEA, we
                rely on:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  The EU-US Data Privacy Framework (where applicable)
                </li>
                <li>
                  Standard Contractual Clauses (SCCs) approved by the European
                  Commission
                </li>
                <li>
                  The provider&apos;s own data protection commitments and
                  certifications
                </li>
              </ul>
            </SectionCard>

            {/* 11. Children's Privacy */}
            <SectionCard id="children" title="11. Children's Privacy" delay={0.1}>
              <p>
                This website is not directed at children under the age of 16. We
                do not knowingly collect personal data from children. If you
                believe we have inadvertently collected data from a child, please
                contact us at{" "}
                <a
                  href="mailto:tbaltzakis@cloudless.gr"
                  className="text-cyan-400 hover:underline font-mono"
                >
                  tbaltzakis@cloudless.gr
                </a>{" "}
                and we will promptly delete the data.
              </p>
            </SectionCard>

            {/* 12. Updates */}
            <SectionCard id="updates" title="12. Updates to This Policy" delay={0.15}>
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or applicable laws. The updated policy
                will be posted on this page with a revised &quot;Last
                updated&quot; date. We encourage you to review this page
                periodically.
              </p>
            </SectionCard>

            {/* 13. Contact */}
            <SectionCard id="contact" title="13. Contact" delay={0.1}>
              <p>
                If you have any questions or concerns about this Privacy Policy,
                please contact:
              </p>
              <div className="bg-background/50 rounded-lg p-4 border border-border/10 font-mono text-sm mt-2">
                <p className="text-foreground">Themistoklis Baltzakis</p>
                <p>
                  <a
                    href="mailto:tbaltzakis@cloudless.gr"
                    className="text-cyan-400 hover:underline"
                  >
                    tbaltzakis@cloudless.gr
                  </a>
                </p>
              </div>
            </SectionCard>

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
