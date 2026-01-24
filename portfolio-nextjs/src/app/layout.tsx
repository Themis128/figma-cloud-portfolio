import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { DefaultStructuredData } from "@/components/StructuredData";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://baltzakis.dev"),
  title: {
    default: "Themistoklis Baltzakis - Cloud Architect & Full-Stack Developer",
    template: "%s | Themistoklis Baltzakis",
  },
  description:
    "Technical Leadership and Cloud Innovation with 15+ years of IT expertise. Specializing in Azure AD, Microsoft 365, AWS, and modern full-stack development with React, Next.js, and TypeScript.",
  keywords: [
    "Cloud Architect",
    "Full-Stack Developer",
    "React Developer",
    "Next.js",
    "TypeScript",
    "AWS",
    "Azure AD",
    "Microsoft 365",
    "Cybersecurity",
    "IT Leadership",
    "Web Development",
    "Portfolio",
  ],
  authors: [{ name: "Themistoklis Baltzakis", url: "https://baltzakis.dev" }],
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
    url: "https://baltzakis.dev",
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
    canonical: "https://baltzakis.dev",
    languages: {
      "en-US": "https://baltzakis.dev",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>
          <DefaultStructuredData />
          <AccessibilityEnhancer />
          {children}
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
