import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MotionProvider } from "@/components/MotionProvider";
import { Providers } from "@/components/providers";
import { DefaultStructuredData } from "@/components/StructuredData";
import ChatbotWidget from "@/components/ChatbotWidget";
import CyberTerminal from "@/components/interactive/CyberTerminal";
import ScrollProgress from "@/components/interactive/ScrollProgress";
import MatrixRain from "@/components/interactive/MatrixRain";
import CursorTrail from "@/components/interactive/CursorTrail";
import CommandPalette from "@/components/CommandPalette";
import SentryInit from "@/components/SentryInit";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import Footer from "@/components/Footer";
import AmplifyProvider from "@/components/AmplifyProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAUpdateNotification } from "@/components/PWAUpdateNotification";
import { OfflineIndicator } from "@/components/OfflineIndicator";

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
    default: "Themistoklis Baltzakis - IT Network Engineer",
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
    title: "Themistoklis Baltzakis - Cloud Architect & Full-Stack Developer",
    description:
      "Technical Leadership and Cloud Innovation with 15+ years of IT expertise.",
    siteName: "Themistoklis Baltzakis Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Themistoklis Baltzakis - Cloud Architect & Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Themistoklis Baltzakis - Cloud Architect & Full-Stack Developer",
    description:
      "Technical Leadership and Cloud Innovation with 15+ years of IT expertise.",
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
  other: {
    "mobile-web-app-capable": "yes",
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
              <ScrollProgress />
              {children}
              <Footer />
              <ChatbotWidget />
              <CyberTerminal />
              <MatrixRain />
              <CursorTrail />
              <CommandPalette />
            </MotionProvider>
          </AuthProvider>
          </AmplifyProvider>
        </Providers>
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
