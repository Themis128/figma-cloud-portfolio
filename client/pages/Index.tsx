import Navigation from "@/components/Navigation";
import CircuitBackground from "@/components/CircuitBackground";
import AIBrain from "@/components/AIBrain";
import { Twitter, Instagram, Facebook } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden">
      {/* Circuit background */}
      <CircuitBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8 lg:space-y-12">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="block text-white/70 uppercase tracking-[0.2em] mb-2 text-4xl md:text-5xl lg:text-6xl">
                    Artificial
                  </span>
                  <span className="block text-white uppercase tracking-wider">
                    Intelligence
                  </span>
                </h1>
              </div>

              <button className="group relative px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-white/90 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium">
                <span className="relative z-10">Learn more</span>
                <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300 rounded-md" />
              </button>

              {/* Social media icons */}
              <div className="flex items-center gap-6 pt-8">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-cyan-400 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right side - AI Brain visualization */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <AIBrain />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
