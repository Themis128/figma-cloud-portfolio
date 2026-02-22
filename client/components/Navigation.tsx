import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { HoverButton } from '@/components/HoverAnimations'
import { Logo } from '@/components/Logo'
import { NotificationButton } from '@/components/NotificationButton'
// Removed unused ThemeToggle import
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  // Separate dropdown state for desktop and mobile
  const [projectsDropdownOpenDesktop, setProjectsDropdownOpenDesktop] = useState(false)
  const [projectsDropdownOpenMobile, setProjectsDropdownOpenMobile] = useState(false)

  const navigationItems = [
    { name: 'About', href: '/about' },
    {
      name: 'Projects',
      href: '/projects',
      dropdown: [
        { name: 'Web Apps', href: '/projects/web-apps' },
        { name: 'Mobile Apps', href: '/projects/mobile-apps' },
        { name: 'AI/ML', href: '/projects/ai-ml' },
      ],
    },
    { name: 'Resume', href: '/resume' },
    { name: 'Performance', href: '/performance' },
    { name: 'Agents', href: '/agents' },
    { name: 'Product', href: '/product' },
    { name: 'Contact', href: '/contact' },
    { name: 'Settings', href: '/settings' },
  ]

  // Keyboard handler for desktop dropdown
  const handleProjectsDropdownKeyDesktop = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') setProjectsDropdownOpenDesktop(false)
    if (e.key === 'ArrowDown') setProjectsDropdownOpenDesktop(true)
    if (e.key === 'ArrowUp') setProjectsDropdownOpenDesktop(false)
  }

  return (
    <nav className='relative z-50' aria-label='Main navigation'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <Link
            to='/'
            className='flex items-center hover:opacity-80 transition-opacity'
            aria-label='Home'
            tabIndex={0}
          >
            <Logo size='md' />
          </Link>
          {/* Theme Toggle Button (desktop) */}
          <ThemeToggleButton aria-label='Toggle theme' data-testid='theme-toggle-desktop' />
          {/* Desktop Navigation */}
          <ul className='hidden md:flex items-center space-x-6 lg:space-x-8'>
            {navigationItems.map((item) =>
              item.dropdown ? (
                <li key={item.name} role='none' className='relative'>
                  <button
                    type='button'
                    role='menuitem'
                    aria-haspopup='true'
                    aria-expanded={projectsDropdownOpenDesktop}
                    aria-controls='projects-dropdown-menu'
                    className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400'
                    tabIndex={0}
                    onClick={() => setProjectsDropdownOpenDesktop((open) => !open)}
                    onKeyDown={handleProjectsDropdownKeyDesktop}
                  >
                    {item.name}
                    <span className='sr-only'>Open projects submenu</span>
                  </button>
                  {projectsDropdownOpenDesktop && (
                    <ul
                      id='projects-dropdown-menu'
                      className='absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10'
                    >
                      {item.dropdown.map((sub) => (
                        <li key={sub.name} role='none'>
                          <Link
                            to={sub.href}
                            role='menuitem'
                            tabIndex={0}
                            className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900 focus:bg-cyan-100 dark:focus:bg-cyan-800 rounded'
                            onClick={() => setProjectsDropdownOpenDesktop(false)}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.name} role='none'>
                  <Link
                    to={item.href}
                    className='text-sm font-medium transition-colors duration-300 hover:text-cyan-400 text-white/80 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400'
                    role='menuitem'
                    tabIndex={0}
                  >
                    {item.name}
                  </Link>
                </li>
              ),
            )}
          </ul>
          {/* Notification Button */}
          <div className='hidden md:flex items-center space-x-2'>
            <NotificationButton />
          </div>
          {/* Mobile menu button */}
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden p-2 rounded-md text-white hover:text-cyan-400 hover:bg-white/10 transition-colors'
            aria-label='Toggle mobile menu'
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-controls='mobile-menu'
          >
            {isOpen ? (
              <X className='w-6 h-6' aria-hidden='true' />
            ) : (
              <Menu className='w-6 h-6' aria-hidden='true' />
            )}
            <span className='sr-only'>Menu</span>
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div
        id='mobile-menu'
        data-testid='mobile-menu'
        className={`md:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        role='menu'
        aria-label='Mobile navigation'
      >
        <div className='container mx-auto px-4 py-4 space-y-3'>
          {/* Theme Toggle Button for Mobile */}
          <div className='flex justify-end mb-2'>
            <ThemeToggleButton aria-label='Toggle theme' data-testid='theme-toggle-mobile' />
          </div>
          {navigationItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className='mb-2'>
                <button
                  type='button'
                  className='block w-full text-left px-4 py-3 rounded-lg transition-colors text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                  aria-haspopup='true'
                  aria-expanded={projectsDropdownOpenMobile}
                  aria-controls='mobile-projects-dropdown-menu'
                  onClick={() => setProjectsDropdownOpenMobile((open) => !open)}
                >
                  {item.name}
                  <span className='sr-only'>Open projects submenu</span>
                </button>
                {projectsDropdownOpenMobile && (
                  <ul
                    id='mobile-projects-dropdown-menu'
                    className='ml-4 mt-1 bg-white/20 rounded-lg'
                  >
                    {item.dropdown.map((sub) => (
                      <li key={sub.name} role='none'>
                        <Link
                          to={sub.href}
                          role='menuitem'
                          tabIndex={0}
                          className='block px-4 py-2 text-sm text-white/80 hover:bg-cyan-400 hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400'
                          onClick={() => {
                            setProjectsDropdownOpenMobile(false)
                            setIsOpen(false)
                          }}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className='block w-full text-left px-4 py-3 rounded-lg transition-colors text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400'
                role='menuitem'
                tabIndex={0}
              >
                {item.name}
              </Link>
            ),
          )}
          {/* Notification Button for Mobile */}
          <div className='px-4 py-2'>
            <NotificationButton data-testid='mobile-notification-button' />
          </div>
          {/* CTA Button */}
          <div className='pt-2'>
            <HoverButton>
              <Link
                to='/contact'
                onClick={() => setIsOpen(false)}
                className='w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-lg transition-all duration-300 text-center font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400'
                role='menuitem'
                tabIndex={0}
              >
                Get In Touch
              </Link>
            </HoverButton>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
