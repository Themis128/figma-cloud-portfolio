import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { HoverButton } from '@/components/HoverAnimations'
import { Logo } from '@/components/Logo'
import { NotificationButton } from '@/components/NotificationButton'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { name: 'About', href: '/about' },
    { name: 'Resume', href: '/resume' },
    { name: 'Contact', href: '/contact' },
    { name: 'Performance', href: '/performance' },
    { name: 'Agents', href: '/agents' },
  ]

  return (
    <nav className='relative z-50' aria-label='Main navigation'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <a
            href='/'
            className='flex items-center hover:opacity-80 transition-opacity'
            aria-label='Home'
          >
            <Logo size='md' />
          </a>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6 lg:space-x-8'>
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80'
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Theme Toggle and Notification Button */}
          <div className='hidden md:flex items-center space-x-2'>
            <ThemeToggle />
            <NotificationButton />
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden p-2 rounded-md text-white hover:text-cyan-400 hover:bg-white/10 transition-colors'
            aria-label='Toggle mobile menu'
            aria-expanded={isOpen ? 'true' : 'false'}
          >
            {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className='container mx-auto px-4 py-4 space-y-3'>
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className='block w-full text-left px-4 py-3 rounded-lg transition-colors text-white/80 hover:bg-white/10 hover:text-white'
            >
              {item.name}
            </a>
          ))}

          {/* Notification Button for Mobile */}
          <div className='px-4 py-2'>
            <NotificationButton data-testid='mobile-notification-button' />
          </div>

          {/* CTA Button */}
          <div className='pt-2'>
            <HoverButton>
              <a
                href='/contact'
                onClick={() => setIsOpen(false)}
                className='w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-lg transition-all duration-300 text-center font-medium'
              >
                Get In Touch
              </a>
            </HoverButton>
          </div>
        </div>
      </div>
    </nav>
  )
}
