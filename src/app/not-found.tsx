import type { Metadata } from "next";
import Link from "next/link";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "404 | Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-4 space-y-8">
          <div aria-hidden="true">
            <span className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-white/10 select-none leading-none block">
              404
            </span>
          </div>

          <div className="space-y-4 -mt-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Page Not Found
            </h1>
            <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider"
          >
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
