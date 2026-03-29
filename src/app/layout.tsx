import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { LazyInteractive } from "@/components/LazyInteractive";
import { MotionProvider } from "@/components/MotionProvider";
import { Providers } from "@/components/providers";
import { DefaultStructuredData } from "@/components/StructuredData";

// AmplifyProvider + AuthProvider deferred — only /admin uses auth.
// They're loaded in src/app/admin/layout.tsx instead.
const AmplifyProvider = dynamic(() => import("@/components/AmplifyProvider"));
const AuthProvider = dynamic(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));

// Non-critical client components — code-split from initial bundle
const AccessibilityEnhancer = dynamic(() => import("@/components/AccessibilityEnhancer"));
const ScrollProgress = dynamic(() => import("@/components/interactive/ScrollProgress"));
const RouteProgressBar = dynamic(() => import("@/components/RouteProgressBar").then(m => ({ default: m.RouteProgressBar })));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop").then(m => ({ default: m.ScrollToTop })));
const CookieConsentBanner = dynamic(() => import("@/components/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));
const OfflineIndicator = dynamic(() => import("@/components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));
const PWAInstallButton = dynamic(() => import("@/components/PWAInstallButton").then(m => ({ default: m.PWAInstallButton })));
const PWAUpdateNotification = dynamic(() => import("@/components/PWAUpdateNotification").then(m => ({ default: m.PWAUpdateNotification })));
const ServiceWorkerRegistration = dynamic(() => import("@/components/ServiceWorkerRegistration").then(m => ({ default: m.ServiceWorkerRegistration })));
const SentryInit = dynamic(() => import("@/components/SentryInit"));

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.baltzakisthemis.com",
  ),
  title: {
    default: "Themistoklis Baltzakis | IT Network Engineer",
    template: "%s | Themistoklis Baltzakis",
  },
  description:
    "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions. Specializing in data center management, network security, and cloud environments.",
  keywords: [
    "IT Network Engineer",
    "Cisco Systems",
    "Fortinet",
    "Network Security",
    "Azure AD",
    "Microsoft 365",
    "AWS",
    "Data Center",
    "Network Infrastructure",
    "Cybersecurity",
    "Portfolio",
  ],
  authors: [{ name: "Themistoklis Baltzakis", url: "https://www.baltzakisthemis.com" }],
  creator: "Themistoklis Baltzakis",
  publisher: "Themistoklis Baltzakis",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.baltzakisthemis.com",
    title: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect",
    description:
      "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
    siteName: "Themistoklis Baltzakis Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect",
    description:
      "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
    creator: "@baltzakis_themis",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: "https://www.baltzakisthemis.com",
    languages: {
      "en-US": "https://www.baltzakisthemis.com",
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.jpg", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "T. Baltzakis",
  },
  applicationName: "T. Baltzakis",
  other: {
    "mobile-web-app-capable": "yes",
    "color-scheme": "light dark",
    "msapplication-TileColor": "#0f172a",
    "msapplication-TileImage": "/logo-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <AmplifyProvider>
          <AuthProvider>
            <MotionProvider>
              <DefaultStructuredData />
              <AccessibilityEnhancer />
              <RouteProgressBar />
              <ScrollProgress />
              {children}
              <ScrollToTop />
              <Footer />
              <LazyInteractive />

              <PWAInstallButton />
            </MotionProvider>
          </AuthProvider>
          </AmplifyProvider>
        </Providers>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="VJt2VZnhN2fh5o9Gcp2+Mw"
          strategy="lazyOnload"
        />
        {/* reCAPTCHA loaded on-demand by useRecaptcha hook when forms are focused */}
        <GoogleAnalytics />
        <SentryInit />
        <CookieConsentBanner />
        <ServiceWorkerRegistration />
        <PWAUpdateNotification />
        <OfflineIndicator />
      </body>
    </html>
  );
}
