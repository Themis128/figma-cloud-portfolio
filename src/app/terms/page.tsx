import { ArrowUp, FileText, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for baltzakisthemis.com — the rules governing your use of this website and its services.",
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

export default function TermsOfServicePage() {
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
                  <FileText className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wider">
                  Terms of Service
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                Please read these Terms of Service carefully before using{" "}
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
            {/* 1. Acceptance */}
            <SectionCard id="acceptance" title="1. Acceptance of Terms">
              <p>
                By accessing or using this website, you agree to be bound by
                these Terms of Service and our{" "}
                <Link
                  href="/privacy/"
                  className="text-cyan-400 hover:underline"
                >
                  Privacy Policy
                </Link>
                . If you do not agree to these terms, please do not use the
                website.
              </p>
            </SectionCard>

            {/* 2. Description of Services */}
            <SectionCard id="services" title="2. Description of Services" delay={0.15}>
              <p>
                This website provides the following services, all offered by
                Themistoklis Baltzakis:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  <span className="text-foreground">Portfolio</span> &mdash;
                  showcase of professional experience, projects, and
                  certifications.
                </li>
                <li>
                  <span className="text-foreground">Contact Form</span> &mdash;
                  a way to send enquiries directly via the website.
                </li>
                <li>
                  <span className="text-foreground">Booking System</span>{" "}
                  &mdash; schedule consultations through the integrated Cal.com
                  calendar.
                </li>
                <li>
                  <span className="text-foreground">AI Chat</span> &mdash; an
                  experimental conversational assistant powered by HuggingFace
                  AI models.
                </li>
              </ul>
            </SectionCard>

            {/* 3. User Responsibilities */}
            <SectionCard id="responsibilities" title="3. User Responsibilities" delay={0.1}>
              <p>When using this website, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  Provide accurate and truthful information in forms and
                  bookings.
                </li>
                <li>
                  Not attempt to gain unauthorised access to the website, its
                  servers, or any connected systems.
                </li>
                <li>
                  Not use automated tools (bots, scrapers) to extract content
                  without prior written permission.
                </li>
                <li>
                  Not transmit malicious code, spam, or any content that
                  violates applicable laws.
                </li>
                <li>
                  Respect the intellectual property rights of the website owner
                  and third parties.
                </li>
              </ul>
            </SectionCard>

            {/* 4. Intellectual Property */}
            <SectionCard id="intellectual-property" title="4. Intellectual Property" delay={0.15}>
              <p>
                All content on this website &mdash; including but not limited to
                text, images, graphics, code, design elements, and the
                underlying software &mdash; is the intellectual property of
                Themistoklis Baltzakis unless otherwise stated.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative
                works from any content on this website without prior written
                permission, except as permitted by applicable law (e.g., fair
                use for personal, non-commercial purposes).
              </p>
              <p>
                Third-party trademarks, logos, and service marks displayed on
                the website are the property of their respective owners.
              </p>
            </SectionCard>

            {/* 5. Disclaimer of Warranties */}
            <SectionCard id="disclaimer" title="5. Disclaimer of Warranties" delay={0.1}>
              <p>
                This website and its services are provided{" "}
                <span className="text-foreground font-semibold">
                  &quot;as is&quot;
                </span>{" "}
                and{" "}
                <span className="text-foreground font-semibold">
                  &quot;as available&quot;
                </span>{" "}
                without warranties of any kind, whether express or implied,
                including but not limited to implied warranties of
                merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
              <p>
                We do not warrant that the website will be uninterrupted,
                error-free, secure, or free of viruses or other harmful
                components. Use of this website is at your own risk.
              </p>
            </SectionCard>

            {/* 6. Limitation of Liability */}
            <SectionCard id="liability" title="6. Limitation of Liability" delay={0.15}>
              <p>
                To the maximum extent permitted by applicable law, Themistoklis
                Baltzakis shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or
                related to your use of this website, including but not limited
                to loss of data, loss of profits, or business interruption.
              </p>
              <p>
                Our total liability for any claim arising from your use of the
                website shall not exceed the amount you paid (if any) to access
                the services.
              </p>
            </SectionCard>

            {/* 7. AI Chat Disclaimer */}
            <SectionCard id="ai-chat" title="7. AI Chat Disclaimer" delay={0.1}>
              <p>
                The AI Chat feature is an{" "}
                <span className="text-foreground font-semibold">
                  experimental tool
                </span>{" "}
                provided for informational and demonstration purposes only.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  AI-generated responses{" "}
                  <span className="text-foreground">
                    do not constitute professional advice
                  </span>{" "}
                  (legal, financial, security, or otherwise).
                </li>
                <li>
                  Responses may be inaccurate, incomplete, or outdated. Always
                  verify information independently.
                </li>
                <li>
                  Messages are sent to the HuggingFace API for processing and
                  are not permanently stored on our servers.
                </li>
                <li>
                  Do not share sensitive personal information, passwords, or
                  confidential data in the chat.
                </li>
              </ul>
            </SectionCard>

            {/* 8. Booking Terms */}
            <SectionCard id="booking" title="8. Booking Terms" delay={0.15}>
              <p>
                Consultation bookings are facilitated through{" "}
                <a
                  href="https://cal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  Cal.com
                </a>{" "}
                and are subject to the following terms:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
                <li>
                  By booking, you provide your name, email, and timezone to
                  Cal.com, which is subject to their{" "}
                  <a
                    href="https://cal.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://cal.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Terms of Service
                  </a>
                  .
                </li>
                <li>
                  Cancellations and rescheduling should be done through the
                  confirmation email or the Cal.com booking link at least 24
                  hours before the scheduled time.
                </li>
                <li>
                  We reserve the right to cancel or reschedule bookings at our
                  discretion.
                </li>
              </ul>
            </SectionCard>

            {/* 9. Privacy */}
            <SectionCard id="privacy" title="9. Privacy" delay={0.1}>
              <p>
                Your use of this website is also governed by our{" "}
                <Link
                  href="/privacy/"
                  className="text-cyan-400 hover:underline"
                >
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your personal
                data. Please review it carefully.
              </p>
            </SectionCard>

            {/* 10. Governing Law */}
            <SectionCard id="governing-law" title="10. Governing Law" delay={0.15}>
              <p>
                These Terms of Service shall be governed by and construed in
                accordance with the laws of the{" "}
                <span className="text-foreground">Hellenic Republic (Greece)</span>{" "}
                and applicable European Union regulations.
              </p>
              <p>
                Any disputes arising from or related to these terms shall be
                subject to the exclusive jurisdiction of the courts of Athens,
                Greece, without prejudice to any mandatory consumer protection
                rights under your local law.
              </p>
            </SectionCard>

            {/* 11. Changes to Terms */}
            <SectionCard id="changes" title="11. Changes to These Terms" delay={0.1}>
              <p>
                We reserve the right to modify these Terms of Service at any
                time. Changes will be posted on this page with an updated
                &quot;Last updated&quot; date. Your continued use of the website
                after any changes constitutes acceptance of the revised terms.
              </p>
              <p>
                We encourage you to review this page periodically for any
                updates.
              </p>
            </SectionCard>

            {/* 12. Contact */}
            <SectionCard id="contact" title="12. Contact" delay={0.15}>
              <p>
                If you have any questions about these Terms of Service, please
                contact:
              </p>
              <div className="bg-background/50 rounded-lg p-4 border border-border/10 font-mono text-sm mt-2">
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
