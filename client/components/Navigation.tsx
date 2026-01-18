import { useState } from "react";
import { Link } from "react-router-dom";
import { PWAInstallButton } from "./PWAInstallButton";

export default function Navigation() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 lg:px-20 py-4 md:py-6">
			<div className="flex items-center justify-between max-w-[1400px] mx-auto">
				<Link
					to="/"
					className="flex items-center gap-2 md:gap-3 group"
					onClick={closeMobileMenu}
				>
					<div className="relative">
						<img
							src="/logo.png"
							alt="Themistoklis Baltzakis Logo"
							className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20"
							onError={(e) => {
								// Fallback to initials if logo fails to load
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
								const fallback = target.parentElement?.querySelector(
									".logo-fallback",
								) as HTMLElement;
								if (fallback) fallback.style.display = "flex";
							}}
						/>
						<div className="logo-fallback w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20 hidden">
							<div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-sm" />
						</div>
					</div>
					<span className="text-white/90 font-semibold text-xs md:text-sm tracking-wider uppercase hidden lg:block">
						Themistoklis Baltzakis
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
						Experience
					</Link>
					<Link
						to="/contact"
						className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase"
					>
						Contact
					</Link>
				</div>

				<div className="flex items-center gap-2">
					<div className="hidden md:block">
						<PWAInstallButton />
					</div>
					<button
						type="button"
						className="md:hidden text-white/90 hover:text-cyan-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
						onClick={toggleMobileMenu}
						aria-label="Toggle mobile menu"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Menu</title>
							{isMobileMenuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`md:hidden absolute top-full left-0 right-0 bg-navy-900/95 backdrop-blur-md border-t border-white/10 transition-all duration-300 ${
					isMobileMenuOpen
						? "opacity-100 visible translate-y-0"
						: "opacity-0 invisible -translate-y-4"
				}`}
			>
				<div className="px-4 sm:px-6 py-4 md:py-6 space-y-2 md:space-y-4">
					<Link
						to="/"
						className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center"
						onClick={closeMobileMenu}
					>
						Home
					</Link>
					<Link
						to="/about"
						className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center"
						onClick={closeMobileMenu}
					>
						About
					</Link>
					<Link
						to="/product"
						className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center"
						onClick={closeMobileMenu}
					>
						Experience
					</Link>
					<Link
						to="/contact"
						className="text-white/90 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide uppercase py-3 px-2 min-h-[44px] flex items-center"
						onClick={closeMobileMenu}
					>
						Contact
					</Link>
					<div className="pt-2 border-t border-white/10">
						<PWAInstallButton />
					</div>
				</div>
			</div>
		</nav>
	);
}
