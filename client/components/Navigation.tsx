import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-20 py-6">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-sm" />
            </div>
          </div>
          <span className="text-white/90 font-semibold text-sm tracking-wider uppercase">
            Logotype
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <Link
            to="/"
            className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            About
          </Link>
          <Link
            to="/product"
            className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            Product
          </Link>
          <Link
            to="/contact"
            className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            Contact
          </Link>
        </div>

        <button className="md:hidden text-white/90 hover:text-cyan-400 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
