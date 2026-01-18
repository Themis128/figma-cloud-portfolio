import Navigation from "@/components/Navigation";
import CircuitBackground from "@/components/CircuitBackground";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
              About
            </h1>
            <p className="text-white/70 text-lg">
              This page is ready to be customized with your content.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-white/90 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
