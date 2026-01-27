"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { HoverButton } from "@/components/HoverAnimations";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: "About", href: "/about" },
    { name: "Resume", href: "/resume" },
    { name: "Contact", href: "/contact" },
    { name: "Performance", href: "/performance" },
    { name: "Agents", href: "/agents" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className='relative z-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <Link
            href='/'
            className='text-foreground font-bold text-xl md:text-2xl tracking-wider hover:text-cyan-400 transition-colors'
            aria-label='Home'
          >
            TB
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6 lg:space-x-8'>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-cyan-400 ${
                  isActive(item.href)
                    ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                    : "text-foreground/80"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden p-2 rounded-md text-foreground hover:text-cyan-400 hover:bg-foreground/10 transition-colors'
            aria-label='Toggle menu'
            aria-expanded={isOpen}
          >
            {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className='container mx-auto px-4 py-4 space-y-3'>
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* CTA Button */}
          <div className='pt-2'>
            <HoverButton>
              <Link
                href='/contact'
                onClick={() => setIsOpen(false)}
                className='w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-foreground rounded-lg transition-all duration-300 text-center font-medium block'
              >
                Get In Touch
              </Link>
            </HoverButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
